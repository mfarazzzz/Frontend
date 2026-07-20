/**
 * Homepage Configuration — defines sections, layout, and data sources.
 *
 * This file drives the homepage layout engine. The configuration can be:
 * 1. Defined statically here (current default)
 * 2. Overridden from CMS settings via API (future: editors control homepage)
 * 3. Loaded from environment variable (for A/B testing)
 *
 * Each section declares:
 * - what category it displays
 * - which CMS is the preferred source (with optional fallback)
 * - which visual template to use
 * - how many articles to fetch
 * - hero selection strategy
 * - duplicate policy
 *
 * ─── CONTENT OWNERSHIP & DEDUPLICATION RULES ──────────────────────────────────
 *
 * The homepage applies a two-pass deduplication strategy:
 *
 * Pass 1 — Hero vs Category Sections:
 *   Rule: An article that appears in the Hero is KEPT in its own category section.
 *         It is only removed from UNRELATED category sections.
 *   Why:  On a local news portal, the biggest Rampur story should appear in both
 *         the Hero (prominence) and the Rampur section (discoverability).
 *
 * Pass 2 — Cross-section dedup:
 *   Rule: An article can only appear in ONE category section. First section (by
 *         config order) wins.
 *   Why:  Prevents repetition when a slug appears in multiple Strapi categories.
 *
 * Section ownership table:
 *
 * | Section      | Source           | Dedup from Hero? | Notes                    |
 * |-------------|------------------|------------------|--------------------------|
 * | Hero        | All categories    | N/A (is hero)    | Featured-first strategy  |
 * | Rampur      | category=rampur   | Only unrelated   | Keeps own rampur stories |
 * | UP          | category=up       | Only unrelated   | Keeps own UP stories     |
 * | Nearby      | category=nearby   | Only unrelated   | Keeps own nearby stories |
 * | National    | category=national | Only unrelated   | Keeps own national news  |
 * | Sports      | category=sports   | Only unrelated   | Keeps own sports news    |
 * | Education   | category=education-jobs | Only unrelated |                     |
 * | International| category=international | Only unrelated |                    |
 * | Religion    | category=religion-culture | Only unrelated |                  |
 * | Editorials  | type=editorials   | N/A (different type) |                    |
 */

export type ContentSource = 'custom-cms' | 'aggregated';

export type SectionTemplate =
  | 'hero'
  | 'hero-sidebar'
  | 'featured'
  | 'grid'
  | 'compact-list'
  | 'horizontal-scroll'
  | 'carousel'
  | 'editorial-picks'
  | 'video-strip'
  | 'two-columns';

export type HeroStrategy =
  | 'latest'           // Default: newest articles
  | 'featured-first'   // Featured articles first, then latest
  | 'editor-pinned'    // Only manually pinned articles
  | 'breaking-first';  // Breaking news prioritized

export type DuplicatePolicy =
  | 'remove'           // Remove duplicates from this section
  | 'allow'            // Allow duplicates (e.g., sidebar)
  | 'pin-exempt';      // Featured/pinned items exempt from removal

export interface HomepageSectionConfig {
  id: string;
  /** Display title (Hindi) */
  title: string;
  /** Category slug to filter by (null for mixed/all) */
  category: string | null;
  /** Content type to fetch */
  contentType: 'articles' | 'editorials' | 'events';
  /** Preferred CMS source */
  preferredSource: ContentSource;
  /** Fallback CMS if preferred fails or returns empty */
  fallbackSource?: ContentSource;
  /** Number of articles to fetch */
  articleCount: number;
  /** Visual template */
  template: SectionTemplate;
  /** Link for "view all" */
  viewAllLink: string;
  /** Whether this section should be shown */
  enabled: boolean;
  /** Display order (lower = higher on page) */
  order: number;
  /** Show ad after this section */
  showAdAfter?: boolean;
  /** Custom query params */
  queryParams?: Record<string, string | number | boolean>;
  /** Hero selection strategy (only for hero sections) */
  heroStrategy?: HeroStrategy;
  /** Duplicate handling policy */
  duplicatePolicy?: DuplicatePolicy;
}

/**
 * Default homepage configuration.
 *
 * FUTURE: This will be fetched from CMS via:
 *   GET /api/public/homepage-config
 * allowing editors to reorder, add, and remove sections without code changes.
 */
export const HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  {
    id: 'hero',
    title: 'मुख्य खबरें',
    category: null,
    contentType: 'articles',
    preferredSource: 'aggregated',
    articleCount: 8,
    template: 'hero-sidebar',
    viewAllLink: '/latest',
    enabled: true,
    order: 0,
    queryParams: { sort: 'publishedAt', order: 'desc' },
    heroStrategy: 'featured-first',
    duplicatePolicy: 'pin-exempt',
  },
  {
    id: 'rampur',
    title: 'रामपुर',
    category: 'rampur',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 7,
    template: 'featured',
    viewAllLink: '/rampur',
    enabled: true,
    order: 1,
    showAdAfter: false,
    duplicatePolicy: 'remove',
  },
  {
    id: 'up',
    title: 'उत्तर प्रदेश',
    category: 'up',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 6,
    template: 'grid',
    viewAllLink: '/up',
    enabled: true,
    order: 2,
    showAdAfter: false,
    duplicatePolicy: 'remove',
  },
  {
    id: 'nearby',
    title: 'आस-पास',
    category: 'nearby',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 7,
    template: 'two-columns',
    viewAllLink: '/nearby',
    enabled: true,
    order: 3,
    showAdAfter: true,
    duplicatePolicy: 'remove',
  },
  {
    id: 'national',
    title: 'राष्ट्रीय',
    category: 'national',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 7,
    template: 'compact-list',
    viewAllLink: '/national',
    enabled: true,
    order: 4,
    showAdAfter: false,
    duplicatePolicy: 'remove',
  },
  {
    id: 'sports',
    title: 'खेल',
    category: 'sports',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 6,
    template: 'grid',
    viewAllLink: '/sports',
    enabled: true,
    order: 5,
    showAdAfter: false,
    duplicatePolicy: 'remove',
  },
  {
    id: 'education-jobs',
    title: 'शिक्षा-नौकरी',
    category: 'education-jobs',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 7,
    template: 'featured',
    viewAllLink: '/education-jobs',
    enabled: true,
    order: 6,
    showAdAfter: true,
    duplicatePolicy: 'remove',
  },
  {
    id: 'international',
    title: 'अंतर्राष्ट्रीय',
    category: 'international',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 7,
    template: 'compact-list',
    viewAllLink: '/international',
    enabled: true,
    order: 7,
    showAdAfter: false,
    duplicatePolicy: 'remove',
  },
  {
    id: 'religion-culture',
    title: 'धर्म-संस्कृति',
    category: 'religion-culture',
    contentType: 'articles',
    preferredSource: 'aggregated',
    fallbackSource: 'strapi',
    articleCount: 5,
    template: 'two-columns',
    viewAllLink: '/religion-culture',
    enabled: true,
    order: 8,
    showAdAfter: true,
    duplicatePolicy: 'remove',
  },
  {
    id: 'editorials',
    title: 'संपादकीय',
    category: null,
    contentType: 'editorials',
    preferredSource: 'custom-cms',
    fallbackSource: 'strapi',
    articleCount: 5,
    template: 'editorial-picks',
    viewAllLink: '/editorials',
    enabled: true,
    order: 9,
    duplicatePolicy: 'remove',
  },
];

/**
 * Get enabled homepage sections sorted by order.
 * In the future, this will merge static config with CMS overrides.
 */
export function getHomepageSections(): HomepageSectionConfig[] {
  return HOMEPAGE_SECTIONS
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * FUTURE: Fetch homepage configuration from CMS.
 * This allows editors to control homepage layout without code changes.
 *
 * API contract (to be implemented on CMS side):
 *   GET /api/public/homepage-config
 *   Response: { sections: HomepageSectionConfig[] }
 */
export async function fetchHomepageConfigFromCMS(): Promise<HomepageSectionConfig[] | null> {
  // TODO: Implement when CMS homepage builder is ready
  // const url = `${process.env.NEXT_PUBLIC_CUSTOM_CMS_URL}/api/public/homepage-config`;
  // const res = await fetch(url, { next: { revalidate: 60 } });
  // if (!res.ok) return null;
  // const json = await res.json();
  // return json.sections;
  return null;
}
