/**
 * Homepage Service — orchestrates data fetching via the Homepage Pipeline.
 *
 * Pipeline stages:
 *   FETCH → NORMALIZE → SCORE → RANK → PIN → DEDUP → TRIM → RENDER
 *
 * Every generation gets:
 * - A correlation ID (for tracing user-reported issues)
 * - Per-stage telemetry (for performance monitoring)
 * - Configurable dedup policies (for editorial control)
 */

import { getHomepageSections } from './homepageConfig';
import type { HomepageSectionConfig } from './homepageConfig';
import { fetchAllHomepageSections, getContentLogs } from './contentResolver';
import type { SectionData } from './contentResolver';
import {
  createPipelineContext,
  recordStage,
  finalizeTelemetry,
  formatTelemetry,
  runDeduplication,
  scoreArticle,
  buildMetrics,
  DEFAULT_PIPELINE_CONFIG,
} from './pipeline';
import type { PipelineConfig, PipelineMetrics, PipelineContext } from './pipeline';
import { getCMSProvider } from '@/services/cms';
import { getAggregatedList } from '@/services/cms/aggregator';
import type { CMSArticle } from '@/services/cms/types';

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface HomepageData {
  /** Hero articles (latest across all categories) */
  heroArticles: CMSArticle[];
  /** Sections in display order (with their articles) */
  sections: Array<{ config: HomepageSectionConfig; data: SectionData }>;
  /** Trending articles for sidebar */
  trendingArticles: CMSArticle[];
  /** Today's top stories for sidebar */
  todaysTop: CMSArticle[];
  /** Most-read articles in last 24h for sidebar */
  mostRead24h: CMSArticle[];
  /** Pipeline generation metadata */
  _pipeline?: {
    correlationId: string;
    metrics: PipelineMetrics;
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Generate homepage data through the full pipeline.
 *
 * @param configOverride - Optional pipeline config override (for testing or A/B)
 */
export async function getHomepageData(
  configOverride?: Partial<PipelineConfig>,
): Promise<HomepageData> {
  const config: PipelineConfig = { ...DEFAULT_PIPELINE_CONFIG, ...configOverride };
  const ctx = createPipelineContext();
  const pipelineStartMs = Date.now();

  const sections = getHomepageSections();
  const provider = getCMSProvider();

  const heroConfig = sections.find((s) => s.id === 'hero');
  const categorySections = sections.filter((s) => s.id !== 'hero');

  // ─── STAGE 1: FETCH ─────────────────────────────────────────────────────────
  const fetchStart = Date.now();

  const [heroResult, sectionMap, trendingResult, todaysTopResult, mostRead24hResult] =
    await Promise.all([
      heroConfig
        ? getAggregatedList('articles', {
            pageSize: heroConfig.articleCount * 2,
            sort: 'publishedAt',
            order: 'desc',
          }).catch(() => ({ data: [] as CMSArticle[] }))
        : Promise.resolve({ data: [] as CMSArticle[] }),

      fetchAllHomepageSections(categorySections),

      getAggregatedList('articles', { pageSize: 8, sort: 'views', order: 'desc' })
        .then((r) => (r.data || []) as unknown as CMSArticle[])
        .catch(() => provider.getTrendingArticles(8).catch(() => [] as CMSArticle[])),

      provider.getBreakingNews(5).catch(() => [] as CMSArticle[]),

      provider
        .getArticles({ status: 'published', sinceHours: 24, orderBy: 'views', order: 'desc', limit: 5 })
        .then((r) => r.data)
        .catch(() => [] as CMSArticle[]),
    ]);

  recordStage(ctx, 'fetch', fetchStart);

  // ─── STAGE 2: NORMALIZE ─────────────────────────────────────────────────────
  const normalizeStart = Date.now();

  let rawHeroArticles: CMSArticle[] = (heroResult as any).data || [];
  const rawHeroCount = rawHeroArticles.length;

  // Ensure all articles have consistent date fields
  rawHeroArticles = rawHeroArticles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt || a.publishedDate || '',
    publishedDate: a.publishedDate || a.publishedAt || '',
  }));

  recordStage(ctx, 'normalize', normalizeStart);

  // ─── STAGE 3: SCORE ─────────────────────────────────────────────────────────
  const scoreStart = Date.now();

  let heroArticles: CMSArticle[];

  if (config.scoringEnabled) {
    const now = Date.now();
    const scored = rawHeroArticles.map((a) => scoreArticle(a, now));
    scored.sort((a, b) => b.score - a.score);
    heroArticles = scored.map((s) => s.article).slice(0, heroConfig?.articleCount || 8);
  } else {
    heroArticles = rawHeroArticles;
  }

  recordStage(ctx, 'score', scoreStart);

  // ─── STAGE 4: RANK (hero strategy) ─────────────────────────────────────────
  const rankStart = Date.now();

  if (!config.scoringEnabled) {
    const strategy = heroConfig?.heroStrategy || 'latest';

    if (strategy === 'featured-first') {
      const featured = heroArticles.filter((a) => a.isFeatured || a.isBreaking);
      const nonFeatured = heroArticles.filter((a) => !a.isFeatured && !a.isBreaking);
      heroArticles = [...featured, ...nonFeatured].slice(0, heroConfig?.articleCount || 8);
    } else if (strategy === 'breaking-first') {
      const breaking = heroArticles.filter((a) => a.isBreaking);
      const nonBreaking = heroArticles.filter((a) => !a.isBreaking);
      heroArticles = [...breaking, ...nonBreaking].slice(0, heroConfig?.articleCount || 8);
    } else {
      heroArticles = heroArticles.slice(0, heroConfig?.articleCount || 8);
    }
  }

  recordStage(ctx, 'rank', rankStart);

  // ─── STAGE 5: PIN (placeholder for editor pinning) ──────────────────────────
  const pinStart = Date.now();
  // Future: apply editor-pinned articles to specific positions
  // For now, this is a no-op stage that exists for pipeline completeness
  recordStage(ctx, 'pin', pinStart);

  // ─── STAGE 6: DEDUP (configurable) ─────────────────────────────────────────
  const dedupStart = Date.now();
  const sectionOrder = categorySections.map((s) => s.id);

  // Extract articles from section data
  const articleMap = new Map<string, CMSArticle[]>();
  const fetchedCounts = new Map<string, number>();
  for (const [id, data] of sectionMap) {
    articleMap.set(id, data.articles);
    fetchedCounts.set(id, data.articles.length);
  }

  const dedupResult = runDeduplication({
    heroArticles,
    sectionMap: articleMap,
    sectionConfigs: categorySections,
    sectionOrder,
    config: config.dedup,
    displayedHeroCount: config.displayedHeroCount,
  });

  recordStage(ctx, 'dedup', dedupStart);

  // ─── STAGE 7: TRIM (apply final article counts) ─────────────────────────────
  const trimStart = Date.now();

  const sectionResultsForMetrics = new Map<string, { fetched: number; afterDedup: number; final: number; category: string | null }>();

  // Rebuild section map with deduplicated + trimmed articles
  const finalSectionMap = new Map<string, SectionData>();
  for (const sectionConfig of categorySections) {
    const dedupedArticles = dedupResult.sections.get(sectionConfig.id) || [];
    const trimmed = dedupedArticles.slice(0, sectionConfig.articleCount);
    const originalData = sectionMap.get(sectionConfig.id);

    finalSectionMap.set(sectionConfig.id, {
      sectionId: sectionConfig.id,
      articles: trimmed,
      source: originalData?.source || sectionConfig.preferredSource,
      error: originalData?.error,
    });

    sectionResultsForMetrics.set(sectionConfig.id, {
      fetched: fetchedCounts.get(sectionConfig.id) || 0,
      afterDedup: dedupedArticles.length,
      final: trimmed.length,
      category: sectionConfig.category,
    });
  }

  recordStage(ctx, 'trim', trimStart);

  // ─── Finalize ───────────────────────────────────────────────────────────────
  finalizeTelemetry(ctx);

  const orderedSections = categorySections.map((cfg) => ({
    config: cfg,
    data: finalSectionMap.get(cfg.id) || { sectionId: cfg.id, articles: [], source: cfg.preferredSource },
  }));

  // Build structured metrics
  const metrics = buildMetrics(
    ctx,
    heroArticles,
    config.displayedHeroCount,
    rawHeroCount,
    sectionResultsForMetrics,
    dedupResult.stats,
    {
      trending: trendingResult.length,
      todaysTop: todaysTopResult.length,
      mostRead: mostRead24hResult.length,
    },
  );

  // ─── Logging ────────────────────────────────────────────────────────────────
  logPipelineResults(ctx, metrics, dedupResult.details);

  return {
    heroArticles,
    sections: orderedSections,
    trendingArticles: trendingResult,
    todaysTop: todaysTopResult,
    mostRead24h: mostRead24hResult,
    _pipeline: {
      correlationId: ctx.correlationId,
      metrics,
    },
  };
}

// ─── Logging ──────────────────────────────────────────────────────────────────

function logPipelineResults(
  ctx: PipelineContext,
  metrics: PipelineMetrics,
  dedupDetails: Array<{ sectionId: string; pass: string; removedSlugs: string[]; remaining: number }>,
): void {
  // Always log correlation + timing (compact, single line)
  console.log(
    `[Homepage] ID:${ctx.correlationId} | ${ctx.telemetry.totalDurationMs}ms | ` +
    `Hero:${metrics.hero.displayed} | Sections:${metrics.sections.filter((s) => s.final > 0).length} | ` +
    `Dedup:-${metrics.dedup.totalRemoved} (+${metrics.dedup.keptInOwnCategory} kept-own)`,
  );

  // Verbose logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(formatTelemetry(ctx));

    if (dedupDetails.length > 0) {
      console.log(`  [Dedup Details]`);
      for (const d of dedupDetails) {
        console.log(`    ${d.sectionId} (${d.pass}): -${d.removedSlugs.length} [${d.removedSlugs.join(', ')}] → ${d.remaining} remain`);
      }
    }

    const contentLogs = getContentLogs();
    if (contentLogs.length > 0) {
      console.log(`  [Content Resolution]`);
      for (const log of contentLogs) {
        if (log.error) {
          console.warn(`    [${log.sectionId}] ERROR: ${log.error}`);
        } else {
          console.log(`    [${log.sectionId}] ${log.source} → ${log.articleCount} articles (${log.timing}ms)`);
        }
      }
    }
  }
}
