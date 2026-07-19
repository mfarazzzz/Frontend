/**
 * Gateway Homepage — fetches homepage data from the v2 Content Gateway.
 *
 * Used when USE_HOMEPAGE_BUILDER / USE_CONTENT_GATEWAY flags are enabled.
 * Falls back to legacy homepageService.ts when disabled.
 */

import { fetchHomepage, type HomepageData, type HomepageSection, type GatewayEntity } from '@/services/cms/gateway-client';
import type { CMSArticle } from '@/services/cms/types';

/**
 * Converts a GatewayEntity to CMSArticle format for backward compatibility
 * with existing frontend components (CategorySection, ArticleCard, etc.)
 */
function entityToArticle(entity: GatewayEntity): CMSArticle {
  const metadata = entity.metadata as Record<string, unknown> || {};
  return {
    id: entity.id,
    slug: entity.slug,
    title: entity.title?.hi || entity.title?.en || '',
    short_headline: (metadata.short_headline as string) || '',
    excerpt: entity.excerpt?.hi || '',
    content: entity.body?.hi || '',
    category: (entity.category as string) || (metadata.news_category as string) || '',
    categoryHindi: entity.categoryTitle?.hi || '',
    image: '', // will be resolved from featured_media_id if needed
    publishedAt: entity.published_at || '',
    published_at: entity.published_at || '',
    isBreaking: entity.is_breaking,
    isFeatured: entity.is_featured,
    isEditorsPick: entity.is_editors_pick,
    views: entity.views || 0,
    _source: 'custom-cms',
  } as unknown as CMSArticle;
}

export interface GatewayHomepageResult {
  sections: Array<{
    id: string;
    slug: string;
    title: string;
    template: string;
    articles: CMSArticle[];
    showAdAfter: boolean;
  }>;
  heroArticles: CMSArticle[];
  health: HomepageData['health'];
}

/**
 * Fetch homepage data from the v2 Gateway and transform to frontend-compatible format.
 */
export async function getGatewayHomepageData(): Promise<GatewayHomepageResult> {
  const data = await fetchHomepage('hi');

  // First section is the hero (if template='hero')
  const heroSection = data.sections.find(s => s.template === 'hero');
  const heroArticles = heroSection
    ? heroSection.items.map(entityToArticle)
    : data.sections[0]?.items.slice(0, 5).map(entityToArticle) || [];

  // Map sections to frontend format
  const sections = data.sections
    .filter(s => s.template !== 'hero') // hero is separate
    .map(section => ({
      id: section.id,
      slug: section.slug,
      title: section.title?.hi || section.slug,
      template: section.template,
      articles: section.items.map(entityToArticle),
      showAdAfter: section.show_ad_after,
    }));

  return { sections, heroArticles, health: data.health };
}

/**
 * Checks if the gateway homepage should be used (env-based flag check).
 * In production, this would check the feature_flags table via API.
 * For now, uses environment variable for simplicity.
 */
export function shouldUseGatewayHomepage(): boolean {
  return process.env.NEXT_PUBLIC_USE_HOMEPAGE_BUILDER === 'true' ||
    process.env.USE_HOMEPAGE_BUILDER === 'true';
}
