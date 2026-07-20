/**
 * deduplication.ts — Centralized homepage deduplication service.
 *
 * Encapsulates all duplicate-removal logic for the homepage into a single,
 * testable module. Rules:
 *
 * 1. Hero articles are KEPT in their own category section.
 *    A "rampur" article in the hero still appears in the "Rampur" section.
 *
 * 2. Hero articles are REMOVED from unrelated category sections.
 *    A "rampur" article in the hero does NOT appear in the "National" section.
 *
 * 3. Cross-section: an article only appears in its first matching section.
 *    Processing order matches config order (higher priority sections first).
 *
 * This ensures:
 * - Latest local story appears in Hero AND its category (discoverability)
 * - No article repeats across unrelated sections (clean layout)
 * - Editors see predictable, explainable behaviour
 */

import type { CMSArticle } from '@/services/cms/types';
import type { HomepageSectionConfig } from './homepageConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DedupResult {
  /** Section articles after dedup */
  articles: CMSArticle[];
  /** Number of articles removed from this section */
  removedCount: number;
  /** Slugs that were removed */
  removedSlugs: string[];
}

export interface DedupLog {
  sectionId: string;
  pass: 'hero' | 'cross-section';
  removedCount: number;
  removedSlugs: string[];
  remainingCount: number;
}

// ─── Hero Deduplication ───────────────────────────────────────────────────────

/**
 * Remove hero articles from category sections, EXCEPT when the article
 * belongs to that section's own category.
 *
 * @param heroArticles - Articles displayed in the hero (already sliced to display count)
 * @param sectionArticles - Map of sectionId → articles to deduplicate
 * @param sectionConfigs - Section configs (for determining category ownership)
 * @returns Deduplicated section map + logs
 */
export function deduplicateHeroFromSections(
  heroArticles: CMSArticle[],
  sectionArticles: Map<string, CMSArticle[]>,
  sectionConfigs: HomepageSectionConfig[],
): { result: Map<string, CMSArticle[]>; logs: DedupLog[] } {
  const logs: DedupLog[] = [];

  // Build lookup: slug → category for hero articles
  const heroSlugs = new Set<string>();
  const heroSlugCategory = new Map<string, string>();
  for (const article of heroArticles) {
    if (article.slug) {
      heroSlugs.add(article.slug);
      if (article.category) {
        heroSlugCategory.set(article.slug, article.category);
      }
    }
  }

  const result = new Map<string, CMSArticle[]>();

  for (const [sectionId, articles] of sectionArticles) {
    const config = sectionConfigs.find((c) => c.id === sectionId);
    const sectionCategory = config?.category || null;
    const removedSlugs: string[] = [];

    const filtered = articles.filter((article) => {
      if (!article.slug || !heroSlugs.has(article.slug)) return true;

      // Key rule: keep if article belongs to this section's category
      const articleCat = heroSlugCategory.get(article.slug) || article.category;
      if (sectionCategory && articleCat === sectionCategory) return true;

      // Remove from unrelated section
      removedSlugs.push(article.slug);
      return false;
    });

    result.set(sectionId, filtered);
    logs.push({
      sectionId,
      pass: 'hero',
      removedCount: removedSlugs.length,
      removedSlugs,
      remainingCount: filtered.length,
    });
  }

  return { result, logs };
}

// ─── Cross-Section Deduplication ──────────────────────────────────────────────

/**
 * Prevent the same article from appearing in multiple category sections.
 * First section (by order) wins.
 *
 * @param sectionArticles - Map of sectionId → articles (after hero dedup)
 * @param sectionOrder - Processing order (matches config display order)
 * @returns Deduplicated map + logs
 */
export function deduplicateAcrossSections(
  sectionArticles: Map<string, CMSArticle[]>,
  sectionOrder: string[],
): { result: Map<string, CMSArticle[]>; logs: DedupLog[] } {
  const logs: DedupLog[] = [];
  const seenSlugs = new Set<string>();
  const result = new Map<string, CMSArticle[]>();

  for (const sectionId of sectionOrder) {
    const articles = sectionArticles.get(sectionId);
    if (!articles) continue;

    const removedSlugs: string[] = [];
    const unique = articles.filter((article) => {
      if (!article.slug) return true;
      if (seenSlugs.has(article.slug)) {
        removedSlugs.push(article.slug);
        return false;
      }
      seenSlugs.add(article.slug);
      return true;
    });

    result.set(sectionId, unique);
    logs.push({
      sectionId,
      pass: 'cross-section',
      removedCount: removedSlugs.length,
      removedSlugs,
      remainingCount: unique.length,
    });
  }

  return { result, logs };
}

// ─── Combined Pipeline ────────────────────────────────────────────────────────

export interface FullDedupInput {
  heroArticles: CMSArticle[];
  displayedHeroCount: number;
  sectionMap: Map<string, { articles: CMSArticle[]; [key: string]: any }>;
  sectionConfigs: HomepageSectionConfig[];
  sectionOrder: string[];
}

export interface FullDedupOutput {
  /** Deduplicated section map */
  sections: Map<string, { articles: CMSArticle[]; [key: string]: any }>;
  /** All logs from both passes */
  logs: DedupLog[];
  /** Summary stats */
  stats: {
    totalRemoved: number;
    heroPassRemoved: number;
    crossSectionPassRemoved: number;
  };
}

/**
 * Run the full two-pass deduplication pipeline.
 */
export function runFullDeduplication(input: FullDedupInput): FullDedupOutput {
  const { heroArticles, displayedHeroCount, sectionMap, sectionConfigs, sectionOrder } = input;
  const displayedHero = heroArticles.slice(0, displayedHeroCount);

  // Extract articles from section data
  const articleMap = new Map<string, CMSArticle[]>();
  for (const [id, data] of sectionMap) {
    articleMap.set(id, data.articles);
  }

  // Pass 1: Hero dedup
  const { result: afterHero, logs: heroLogs } = deduplicateHeroFromSections(
    displayedHero,
    articleMap,
    sectionConfigs,
  );

  // Pass 2: Cross-section dedup
  const { result: afterCross, logs: crossLogs } = deduplicateAcrossSections(
    afterHero,
    sectionOrder,
  );

  // Rebuild section map with deduplicated articles
  const resultMap = new Map<string, { articles: CMSArticle[]; [key: string]: any }>();
  for (const [id, data] of sectionMap) {
    const dedupedArticles = afterCross.get(id) || [];
    resultMap.set(id, { ...data, articles: dedupedArticles });
  }

  const allLogs = [...heroLogs, ...crossLogs];
  const heroPassRemoved = heroLogs.reduce((sum, l) => sum + l.removedCount, 0);
  const crossSectionPassRemoved = crossLogs.reduce((sum, l) => sum + l.removedCount, 0);

  return {
    sections: resultMap,
    logs: allLogs,
    stats: {
      totalRemoved: heroPassRemoved + crossSectionPassRemoved,
      heroPassRemoved,
      crossSectionPassRemoved,
    },
  };
}
