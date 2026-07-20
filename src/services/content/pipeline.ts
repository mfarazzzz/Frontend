/**
 * pipeline.ts — Homepage Generation Pipeline
 *
 * A formal, stage-based pipeline for homepage content assembly.
 * Each generation gets a correlation ID and per-stage telemetry.
 *
 * Pipeline stages:
 *   1. FETCH     — Parallel data retrieval from CMS sources
 *   2. NORMALIZE — Ensure consistent article shape across sources
 *   3. SCORE     — Assign editorial ranking score to each article
 *   4. RANK      — Sort articles within each section by score
 *   5. PIN       — Apply editor pins and breaking overrides
 *   6. DEDUP     — Remove duplicates per configurable policy
 *   7. TRIM      — Slice to final article counts
 *
 * Future stages (not yet implemented):
 *   - SPONSOR   — Insert sponsored content at configured positions
 *   - RECOMMEND — AI-powered personalization
 *   - A/B TEST  — Variant selection for layout experiments
 */

import { randomUUID } from 'crypto';
import type { CMSArticle } from '@/services/cms/types';
import type { HomepageSectionConfig } from './homepageConfig';

// ─── Correlation & Telemetry ──────────────────────────────────────────────────

export interface PipelineContext {
  /** Unique ID for this homepage generation (for log correlation) */
  correlationId: string;
  /** ISO timestamp when generation started */
  startedAt: string;
  /** Per-stage timing measurements */
  telemetry: PipelineTelemetry;
}

export interface StageTiming {
  stage: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

export interface PipelineTelemetry {
  stages: StageTiming[];
  totalDurationMs: number;
}

export interface PipelineMetrics {
  correlationId: string;
  timestamp: string;
  duration: {
    total: number;
    fetch: number;
    normalize: number;
    score: number;
    rank: number;
    pin: number;
    dedup: number;
    trim: number;
  };
  hero: {
    fetched: number;
    afterStrategy: number;
    displayed: number;
  };
  sections: Array<{
    id: string;
    category: string | null;
    fetched: number;
    afterDedup: number;
    final: number;
  }>;
  dedup: {
    heroPassRemoved: number;
    crossSectionRemoved: number;
    totalRemoved: number;
    keptInOwnCategory: number;
  };
  sidebar: {
    trending: number;
    todaysTop: number;
    mostRead: number;
  };
}

// ─── Pipeline Configuration ───────────────────────────────────────────────────

export type HeroDedupPolicy =
  | 'keep-in-own-category'   // Keep hero articles in their own category section (default)
  | 'remove-everywhere'      // Remove hero articles from ALL sections
  | 'allow-everywhere';      // Never remove hero articles (full duplication)

export type CategoryDedupPolicy =
  | 'remove-cross-section'   // An article only appears in one section (default)
  | 'allow-duplicates';      // Allow same article in multiple sections

export type SidebarDedupPolicy =
  | 'allow'                  // Sidebar can repeat articles from main content (default)
  | 'remove-hero'            // Remove hero articles from sidebar
  | 'unique-only';           // Sidebar shows only articles not in main content

export interface DedupConfig {
  heroPolicy: HeroDedupPolicy;
  categoryPolicy: CategoryDedupPolicy;
  sidebarPolicy: SidebarDedupPolicy;
}

export interface PipelineConfig {
  /** Deduplication behaviour (configurable per editorial preference) */
  dedup: DedupConfig;
  /** Number of hero articles actually rendered (primary + secondary) */
  displayedHeroCount: number;
  /** Extra articles to fetch per section as dedup buffer */
  fetchBuffer: number;
  /** Enable article scoring (future: editorial ranking engine) */
  scoringEnabled: boolean;
}

/**
 * Default pipeline configuration.
 * Matches the editorial expectation for a local news portal:
 * - Big local story appears in Hero AND its category section
 * - No repetition across unrelated sections
 * - Sidebar is free to show any content
 */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  dedup: {
    heroPolicy: 'keep-in-own-category',
    categoryPolicy: 'remove-cross-section',
    sidebarPolicy: 'allow',
  },
  displayedHeroCount: 5,
  fetchBuffer: 3,
  scoringEnabled: false,
};

// ─── Scoring (extensible) ─────────────────────────────────────────────────────

export interface ArticleScore {
  article: CMSArticle;
  score: number;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  weight: number;
  value: number;
  contribution: number;
}

/**
 * Score an article based on editorial relevance factors.
 * Higher score = more prominent placement.
 *
 * Current factors (v1 — simple):
 *   - Freshness: newer articles score higher
 *   - Breaking: +50 points
 *   - Featured: +30 points
 *   - Editor's Pick: +20 points
 *   - Views: log-scaled bonus
 *
 * Future factors:
 *   - Editor pin priority
 *   - AI relevance score
 *   - Sponsored boost
 *   - Local relevance multiplier
 *   - Engagement velocity (views/hour)
 */
export function scoreArticle(article: CMSArticle, now: number = Date.now()): ArticleScore {
  const factors: ScoreFactor[] = [];

  // Freshness: articles within last 6h get max freshness, decays over 72h
  const pubDate = new Date(article.publishedAt || article.publishedDate || 0).getTime();
  const ageHours = Math.max(0, (now - pubDate) / 3_600_000);
  const freshnessValue = Math.max(0, 1 - ageHours / 72);
  const freshnessContribution = freshnessValue * 100;
  factors.push({ name: 'freshness', weight: 100, value: freshnessValue, contribution: freshnessContribution });

  // Breaking news bonus
  const breakingValue = article.isBreaking ? 1 : 0;
  const breakingContribution = breakingValue * 50;
  factors.push({ name: 'breaking', weight: 50, value: breakingValue, contribution: breakingContribution });

  // Featured bonus
  const featuredValue = article.isFeatured ? 1 : 0;
  const featuredContribution = featuredValue * 30;
  factors.push({ name: 'featured', weight: 30, value: featuredValue, contribution: featuredContribution });

  // Editor's pick bonus
  const pickValue = article.isEditorsPick ? 1 : 0;
  const pickContribution = pickValue * 20;
  factors.push({ name: 'editorsPick', weight: 20, value: pickValue, contribution: pickContribution });

  // Views bonus (logarithmic, capped at 20 points)
  const views = article.views || 0;
  const viewsValue = views > 0 ? Math.min(1, Math.log10(views + 1) / 4) : 0;
  const viewsContribution = viewsValue * 20;
  factors.push({ name: 'views', weight: 20, value: viewsValue, contribution: viewsContribution });

  const score = factors.reduce((sum, f) => sum + f.contribution, 0);

  return { article, score, factors };
}

// ─── Pipeline Execution ───────────────────────────────────────────────────────

/**
 * Create a new pipeline context with a unique correlation ID.
 */
export function createPipelineContext(): PipelineContext {
  return {
    correlationId: randomUUID().slice(0, 7),
    startedAt: new Date().toISOString(),
    telemetry: { stages: [], totalDurationMs: 0 },
  };
}

/**
 * Record a stage timing measurement.
 */
export function recordStage(ctx: PipelineContext, stage: string, startMs: number): void {
  const endMs = Date.now();
  ctx.telemetry.stages.push({
    stage,
    startMs,
    endMs,
    durationMs: endMs - startMs,
  });
}

/**
 * Finalize telemetry (called at the end of pipeline execution).
 */
export function finalizeTelemetry(ctx: PipelineContext): void {
  const pipelineStart = Math.min(...ctx.telemetry.stages.map((s) => s.startMs));
  const pipelineEnd = Math.max(...ctx.telemetry.stages.map((s) => s.endMs));
  ctx.telemetry.totalDurationMs = pipelineEnd - pipelineStart;
}

/**
 * Format telemetry as a log-friendly string.
 */
export function formatTelemetry(ctx: PipelineContext): string {
  const lines = [
    `[Homepage Pipeline] ID: ${ctx.correlationId} | Total: ${ctx.telemetry.totalDurationMs}ms`,
  ];
  for (const stage of ctx.telemetry.stages) {
    lines.push(`  ${stage.stage.padEnd(12)} ${stage.durationMs}ms`);
  }
  return lines.join('\n');
}

// ─── Dedup Engine (policy-driven) ─────────────────────────────────────────────

export interface DedupInput {
  heroArticles: CMSArticle[];
  sectionMap: Map<string, CMSArticle[]>;
  sectionConfigs: HomepageSectionConfig[];
  sectionOrder: string[];
  config: DedupConfig;
  displayedHeroCount: number;
}

export interface DedupOutput {
  sections: Map<string, CMSArticle[]>;
  stats: {
    heroPassRemoved: number;
    crossSectionRemoved: number;
    totalRemoved: number;
    keptInOwnCategory: number;
  };
  details: Array<{
    sectionId: string;
    pass: 'hero' | 'cross-section';
    removedSlugs: string[];
    remaining: number;
  }>;
}

/**
 * Run configurable deduplication based on policy settings.
 */
export function runDeduplication(input: DedupInput): DedupOutput {
  const { heroArticles, sectionMap, sectionConfigs, sectionOrder, config, displayedHeroCount } = input;
  const displayedHero = heroArticles.slice(0, displayedHeroCount);

  let heroPassRemoved = 0;
  let keptInOwnCategory = 0;
  const details: DedupOutput['details'] = [];

  // ─── Pass 1: Hero dedup ─────────────────────────────────────────────────────
  let afterHero = new Map<string, CMSArticle[]>(sectionMap);

  if (config.heroPolicy !== 'allow-everywhere') {
    const heroSlugs = new Set(displayedHero.map((a) => a.slug).filter(Boolean));
    const heroSlugCategory = new Map<string, string>();
    for (const a of displayedHero) {
      if (a.slug && a.category) heroSlugCategory.set(a.slug, a.category);
    }

    const result = new Map<string, CMSArticle[]>();

    for (const [sectionId, articles] of afterHero) {
      const sectionConfig = sectionConfigs.find((c) => c.id === sectionId);
      const sectionCategory = sectionConfig?.category || null;
      const removedSlugs: string[] = [];

      const filtered = articles.filter((article) => {
        if (!article.slug || !heroSlugs.has(article.slug)) return true;

        if (config.heroPolicy === 'keep-in-own-category') {
          const articleCat = heroSlugCategory.get(article.slug) || article.category;
          if (sectionCategory && articleCat === sectionCategory) {
            keptInOwnCategory++;
            return true;
          }
        }
        // 'remove-everywhere' or not own category
        removedSlugs.push(article.slug);
        heroPassRemoved++;
        return false;
      });

      result.set(sectionId, filtered);
      if (removedSlugs.length > 0) {
        details.push({ sectionId, pass: 'hero', removedSlugs, remaining: filtered.length });
      }
    }
    afterHero = result;
  }

  // ─── Pass 2: Cross-section dedup ────────────────────────────────────────────
  let crossSectionRemoved = 0;
  let finalSections: Map<string, CMSArticle[]>;

  if (config.categoryPolicy === 'remove-cross-section') {
    const seenSlugs = new Set<string>();
    finalSections = new Map();

    for (const sectionId of sectionOrder) {
      const articles = afterHero.get(sectionId);
      if (!articles) continue;

      const removedSlugs: string[] = [];
      const unique = articles.filter((article) => {
        if (!article.slug) return true;
        if (seenSlugs.has(article.slug)) {
          removedSlugs.push(article.slug);
          crossSectionRemoved++;
          return false;
        }
        seenSlugs.add(article.slug);
        return true;
      });

      finalSections.set(sectionId, unique);
      if (removedSlugs.length > 0) {
        details.push({ sectionId, pass: 'cross-section', removedSlugs, remaining: unique.length });
      }
    }
  } else {
    finalSections = afterHero;
  }

  return {
    sections: finalSections,
    stats: {
      heroPassRemoved,
      crossSectionRemoved,
      totalRemoved: heroPassRemoved + crossSectionRemoved,
      keptInOwnCategory,
    },
    details,
  };
}

// ─── Build Metrics Snapshot ───────────────────────────────────────────────────

export function buildMetrics(
  ctx: PipelineContext,
  heroArticles: CMSArticle[],
  displayedHeroCount: number,
  rawHeroCount: number,
  sectionResults: Map<string, { fetched: number; afterDedup: number; final: number; category: string | null }>,
  dedupStats: DedupOutput['stats'],
  sidebar: { trending: number; todaysTop: number; mostRead: number },
): PipelineMetrics {
  const stageDuration = (name: string) =>
    ctx.telemetry.stages.find((s) => s.stage === name)?.durationMs ?? 0;

  return {
    correlationId: ctx.correlationId,
    timestamp: ctx.startedAt,
    duration: {
      total: ctx.telemetry.totalDurationMs,
      fetch: stageDuration('fetch'),
      normalize: stageDuration('normalize'),
      score: stageDuration('score'),
      rank: stageDuration('rank'),
      pin: stageDuration('pin'),
      dedup: stageDuration('dedup'),
      trim: stageDuration('trim'),
    },
    hero: {
      fetched: rawHeroCount,
      afterStrategy: heroArticles.length,
      displayed: displayedHeroCount,
    },
    sections: Array.from(sectionResults.entries()).map(([id, data]) => ({
      id,
      category: data.category,
      fetched: data.fetched,
      afterDedup: data.afterDedup,
      final: data.final,
    })),
    dedup: dedupStats,
    sidebar,
  };
}
