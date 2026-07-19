/**
 * Homepage Service — orchestrates data fetching for the entire homepage.
 *
 * Single entry point that:
 * 1. Reads homepage config
 * 2. Fetches all sections in parallel
 * 3. Deduplicates across sections
 * 4. Returns structured data ready for rendering
 */

import { getHomepageSections } from './homepageConfig';
import type { HomepageSectionConfig } from './homepageConfig';
import {
  fetchAllHomepageSections,
  deduplicateAcrossSections,
  getContentLogs,
} from './contentResolver';
import type { SectionData } from './contentResolver';
import { getCMSProvider } from '@/services/cms';
import { getAggregatedList } from '@/services/cms/aggregator';
import type { CMSArticle } from '@/services/cms/types';

export interface HomepageData {
  /** Hero articles (latest across all categories) */
  heroArticles: CMSArticle[];
  /** Sections in display order (with their articles) */
  sections: Array<{
    config: HomepageSectionConfig;
    data: SectionData;
  }>;
  /** Trending articles for sidebar */
  trendingArticles: CMSArticle[];
  /** Today's top stories for sidebar */
  todaysTop: CMSArticle[];
  /** Most-read articles in last 24h for sidebar */
  mostRead24h: CMSArticle[];
  /** Debug info (only logged server-side) */
  _debug?: {
    totalFetchTime: number;
    sectionsLoaded: number;
    sectionsFailed: number;
    logs: unknown[];
  };
}

/**
 * Fetch all homepage data in a single call.
 * This is the main entry point for page.tsx.
 */
export async function getHomepageData(): Promise<HomepageData> {
  const startTime = Date.now();
  const sections = getHomepageSections();
  const provider = getCMSProvider();

  // Split hero section from category sections
  const heroConfig = sections.find((s) => s.id === 'hero');
  const categorySections = sections.filter((s) => s.id !== 'hero');

  // Parallel fetch: hero, category sections, sidebar data
  const [heroResult, sectionMap, trendingResult, todaysTopResult, mostRead24hResult] =
    await Promise.all([
      // Hero — uses hero strategy from config
      heroConfig
        ? getAggregatedList('articles', {
            pageSize: heroConfig.articleCount * 2, // Fetch extra for filtering
            sort: 'publishedAt',
            order: 'desc',
          }).catch(() => ({ data: [] as CMSArticle[] }))
        : Promise.resolve({ data: [] as CMSArticle[] }),

      // All category sections in parallel
      fetchAllHomepageSections(categorySections),

      // Sidebar: trending (most viewed) — from both CMS sources
      getAggregatedList('articles', {
        pageSize: 8,
        sort: 'views',
        order: 'desc',
      })
        .then((r) => (r.data || []) as unknown as CMSArticle[])
        .catch(() => provider.getTrendingArticles(8).catch(() => [] as CMSArticle[])),

      // Sidebar: today's top (breaking/featured)
      provider
        .getBreakingNews(5)
        .catch(() => [] as CMSArticle[]),

      // Sidebar: most-read in 24h
      provider
        .getArticles({
          status: 'published',
          sinceHours: 24,
          orderBy: 'views',
          order: 'desc',
          limit: 5,
        })
        .then((r) => r.data)
        .catch(() => [] as CMSArticle[]),
    ]);

  // Apply hero strategy
  let heroArticles = (heroResult as any).data || [];
  const strategy = heroConfig?.heroStrategy || 'latest';

  if (strategy === 'featured-first') {
    // Featured/breaking articles first, then fill with latest
    const featured = heroArticles.filter((a: CMSArticle) => a.isFeatured || a.isBreaking);
    const nonFeatured = heroArticles.filter((a: CMSArticle) => !a.isFeatured && !a.isBreaking);
    heroArticles = [...featured, ...nonFeatured].slice(0, heroConfig?.articleCount || 8);
  } else if (strategy === 'breaking-first') {
    const breaking = heroArticles.filter((a: CMSArticle) => a.isBreaking);
    const nonBreaking = heroArticles.filter((a: CMSArticle) => !a.isBreaking);
    heroArticles = [...breaking, ...nonBreaking].slice(0, heroConfig?.articleCount || 8);
  } else {
    // 'latest' or 'editor-pinned' — just take top N
    heroArticles = heroArticles.slice(0, heroConfig?.articleCount || 8);
  }

  // Deduplicate: only the DISPLAYED hero articles (first 5) should not appear in category sections.
  // We fetch 8 but only display primary (1) + secondary (4) = 5 in the hero grid.
  const displayedHeroCount = 5;
  const displayedHeroSlugs = new Set(
    heroArticles.slice(0, displayedHeroCount).map((a: CMSArticle) => a.slug).filter(Boolean),
  );

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Homepage Dedup] Hero has ${heroArticles.length} articles, displaying ${displayedHeroCount}, ${displayedHeroSlugs.size} slugs to dedup`);
  }

  // Remove only DISPLAYED hero duplicates from category sections
  for (const [sectionId, data] of sectionMap) {
    const before = data.articles.length;
    data.articles = data.articles.filter(
      (article) => !article.slug || !displayedHeroSlugs.has(article.slug),
    );
    const removed = before - data.articles.length;
    if (removed > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[Homepage Dedup] Removed ${removed} hero duplicates from "${sectionId}"`);
    }
  }

  // Cross-section deduplication (prevents same article in multiple categories)
  const sectionOrder = categorySections.map((s) => s.id);
  const dedupedMap = deduplicateAcrossSections(sectionMap, sectionOrder);

  // Build final ordered sections
  const orderedSections = categorySections.map((config) => ({
    config,
    data: dedupedMap.get(config.id) || {
      sectionId: config.id,
      articles: [],
      source: config.preferredSource,
    },
  }));

  const totalFetchTime = Date.now() - startTime;
  const sectionsLoaded = orderedSections.filter((s) => s.data.articles.length > 0).length;
  const sectionsFailed = orderedSections.filter((s) => s.data.error).length;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Homepage] Loaded in ${totalFetchTime}ms | ${sectionsLoaded} sections with content | ${sectionsFailed} failed`);
    const contentLogs = getContentLogs();
    contentLogs.forEach((log) => {
      if (log.error) {
        console.warn(`  [${log.sectionId}] ERROR: ${log.error}`);
      } else {
        console.log(`  [${log.sectionId}] ${log.source} → ${log.articleCount} articles (${log.timing}ms)`);
      }
    });
  }

  return {
    heroArticles,
    sections: orderedSections,
    trendingArticles: trendingResult,
    todaysTop: todaysTopResult,
    mostRead24h: mostRead24hResult,
    _debug:
      process.env.NODE_ENV === 'development'
        ? { totalFetchTime, sectionsLoaded, sectionsFailed, logs: getContentLogs() }
        : undefined,
  };
}
