/**
 * Content Resolver — fetches content from the correct CMS based on section config.
 *
 * Each homepage section explicitly declares its preferred/fallback source.
 * The resolver handles:
 * - Source routing (which CMS to query)
 * - Parallel fetching
 * - Graceful fallback when a source fails
 * - Deduplication within a section
 * - Logging for debugging
 */

import { getAggregatedList, fetchCustomCms, fetchStrapi } from '@/services/cms/aggregator';
import { getCMSProvider } from '@/services/cms';
import type { CMSArticle, CMSEditorial } from '@/services/cms/types';
import type { HomepageSectionConfig, ContentSource } from './homepageConfig';

// ─── Logging ──────────────────────────────────────────────────────────────────

interface FetchLog {
  sectionId: string;
  source: ContentSource;
  category: string | null;
  articleCount: number;
  duplicatesRemoved: number;
  timing: number;
  cacheHit: boolean;
  error?: string;
}

const logs: FetchLog[] = [];

export function getContentLogs(): FetchLog[] {
  return [...logs];
}

export function clearContentLogs(): void {
  logs.length = 0;
}

// ─── Section Fetching ─────────────────────────────────────────────────────────

export interface SectionData {
  sectionId: string;
  articles: CMSArticle[];
  source: ContentSource;
  error?: string;
}

/**
 * Fetch content for a single homepage section based on its configuration.
 * Respects preferredSource/fallbackSource, and logs results.
 */
export async function fetchSectionContent(
  config: HomepageSectionConfig,
): Promise<SectionData> {
  const startTime = Date.now();

  if (config.contentType === 'editorials') {
    return fetchEditorialsSection(config, startTime);
  }

  try {
    const result = await fetchFromSource(config, config.preferredSource);

    if (result.length > 0) {
      const timing = Date.now() - startTime;
      logs.push({
        sectionId: config.id,
        source: config.preferredSource,
        category: config.category,
        articleCount: result.length,
        duplicatesRemoved: 0,
        timing,
        cacheHit: false,
      });

      return {
        sectionId: config.id,
        articles: result.slice(0, config.articleCount),
        source: config.preferredSource,
      };
    }

    // Preferred source returned empty — try fallback
    if (config.fallbackSource && config.fallbackSource !== config.preferredSource) {
      const fallbackResult = await fetchFromSource(config, config.fallbackSource);
      const timing = Date.now() - startTime;

      logs.push({
        sectionId: config.id,
        source: config.fallbackSource,
        category: config.category,
        articleCount: fallbackResult.length,
        duplicatesRemoved: 0,
        timing,
        cacheHit: false,
      });

      return {
        sectionId: config.id,
        articles: fallbackResult.slice(0, config.articleCount),
        source: config.fallbackSource,
      };
    }

    // No fallback or fallback also empty
    const timing = Date.now() - startTime;
    logs.push({
      sectionId: config.id,
      source: config.preferredSource,
      category: config.category,
      articleCount: 0,
      duplicatesRemoved: 0,
      timing,
      cacheHit: false,
    });

    return { sectionId: config.id, articles: [], source: config.preferredSource };
  } catch (error) {
    // Preferred source threw — try fallback
    if (config.fallbackSource && config.fallbackSource !== config.preferredSource) {
      try {
        const fallbackResult = await fetchFromSource(config, config.fallbackSource);
        const timing = Date.now() - startTime;

        logs.push({
          sectionId: config.id,
          source: config.fallbackSource,
          category: config.category,
          articleCount: fallbackResult.length,
          duplicatesRemoved: 0,
          timing,
          cacheHit: false,
          error: `Preferred source (${config.preferredSource}) failed: ${(error as Error).message}`,
        });

        return {
          sectionId: config.id,
          articles: fallbackResult.slice(0, config.articleCount),
          source: config.fallbackSource,
        };
      } catch (fallbackError) {
        const timing = Date.now() - startTime;
        logs.push({
          sectionId: config.id,
          source: config.preferredSource,
          category: config.category,
          articleCount: 0,
          duplicatesRemoved: 0,
          timing,
          cacheHit: false,
          error: `Both sources failed. Primary: ${(error as Error).message}, Fallback: ${(fallbackError as Error).message}`,
        });

        return {
          sectionId: config.id,
          articles: [],
          source: config.preferredSource,
          error: 'Both CMS sources are unavailable',
        };
      }
    }

    const timing = Date.now() - startTime;
    logs.push({
      sectionId: config.id,
      source: config.preferredSource,
      category: config.category,
      articleCount: 0,
      duplicatesRemoved: 0,
      timing,
      cacheHit: false,
      error: (error as Error).message,
    });

    return {
      sectionId: config.id,
      articles: [],
      source: config.preferredSource,
      error: (error as Error).message,
    };
  }
}

/**
 * Fetch from a specific CMS source.
 */
async function fetchFromSource(
  config: HomepageSectionConfig,
  source: ContentSource,
): Promise<CMSArticle[]> {
  // Fetch extra articles to compensate for post-fetch cross-section deduplication.
  const fetchExtra = config.duplicatePolicy === 'remove' ? 3 : 0;
  const fetchSize = config.articleCount + fetchExtra;

  const params: Record<string, string | number | undefined> = {
    pageSize: fetchSize,
    sort: (config.queryParams?.sort as string) || 'publishedAt',
    order: (config.queryParams?.order as string) || 'desc',
  };

  if (config.category) {
    params.category = config.category;
  }

  // Add any custom query params
  if (config.queryParams) {
    Object.entries(config.queryParams).forEach(([key, value]) => {
      if (key !== 'sort' && key !== 'order' && value !== undefined) {
        params[key] = value as string | number | undefined;
      }
    });
  }

  switch (source) {
    case 'aggregated': {
      const result = await getAggregatedList<any>('articles', params);
      return (result.data || []) as CMSArticle[];
    }
    case 'custom-cms': {
      const result = await fetchCustomCms<any>('articles', params);
      return (result.data || []) as CMSArticle[];
    }
    case 'strapi': {
      const result = await fetchStrapi<any>('articles', params);
      return (result.data || []) as CMSArticle[];
    }
    default:
      return [];
  }
}

/**
 * Fetch editorials section.
 */
async function fetchEditorialsSection(
  config: HomepageSectionConfig,
  startTime: number,
): Promise<SectionData> {
  try {
    const provider = getCMSProvider();
    const result = await provider.getEditorials({
      limit: config.articleCount,
      orderBy: 'publishedDate',
      order: 'desc',
    });

    const timing = Date.now() - startTime;
    logs.push({
      sectionId: config.id,
      source: config.preferredSource,
      category: null,
      articleCount: result.data.length,
      duplicatesRemoved: 0,
      timing,
      cacheHit: false,
    });

    // Map editorials to article-like shape for uniform rendering
    const articles: CMSArticle[] = result.data.map((editorial: CMSEditorial) => ({
      id: editorial.id,
      title: editorial.titleHindi || editorial.title,
      slug: editorial.slug,
      excerpt: editorial.excerpt,
      content: editorial.content,
      image: editorial.image,
      category: 'editorials',
      categoryHindi: 'संपादकीय',
      author: editorial.author,
      publishedAt: editorial.publishedAt || editorial.publishedDate,
      publishedDate: editorial.publishedDate,
      status: editorial.status,
      contentType: editorial.editorialType,
      isEditorsPick: editorial.isEditorsPick,
      isFeatured: editorial.isFeatured,
    }));

    return {
      sectionId: config.id,
      articles,
      source: config.preferredSource,
    };
  } catch (error) {
    const timing = Date.now() - startTime;
    logs.push({
      sectionId: config.id,
      source: config.preferredSource,
      category: null,
      articleCount: 0,
      duplicatesRemoved: 0,
      timing,
      cacheHit: false,
      error: (error as Error).message,
    });

    return {
      sectionId: config.id,
      articles: [],
      source: config.preferredSource,
      error: (error as Error).message,
    };
  }
}

// ─── Bulk Fetch (parallel) ────────────────────────────────────────────────────

/**
 * Fetch all homepage sections in parallel.
 * Returns a map of sectionId → articles.
 * Individual section failures don't crash the entire homepage.
 */
export async function fetchAllHomepageSections(
  sections: HomepageSectionConfig[],
): Promise<Map<string, SectionData>> {
  clearContentLogs();

  const results = await Promise.allSettled(
    sections.map((section) => fetchSectionContent(section)),
  );

  const sectionMap = new Map<string, SectionData>();

  results.forEach((result, index) => {
    const section = sections[index];
    if (result.status === 'fulfilled') {
      sectionMap.set(section.id, result.value);
    } else {
      // Even on unhandled rejection, produce an empty section rather than crash
      sectionMap.set(section.id, {
        sectionId: section.id,
        articles: [],
        source: section.preferredSource,
        error: result.reason?.message || 'Unknown error',
      });
    }
  });

  return sectionMap;
}

/**
 * Cross-section deduplication: remove articles that already appeared in an
 * earlier (higher-priority) section. This ensures no article repeats across
 * homepage sections unless explicitly featured.
 */
export function deduplicateAcrossSections(
  sectionMap: Map<string, SectionData>,
  sectionOrder: string[],
): Map<string, SectionData> {
  const seenSlugs = new Set<string>();
  const deduped = new Map<string, SectionData>();

  for (const sectionId of sectionOrder) {
    const data = sectionMap.get(sectionId);
    if (!data) continue;

    const uniqueArticles = data.articles.filter((article) => {
      if (!article.slug) return true;
      if (seenSlugs.has(article.slug)) return false;
      seenSlugs.add(article.slug);
      return true;
    });

    deduped.set(sectionId, {
      ...data,
      articles: uniqueArticles,
    });
  }

  return deduped;
}
