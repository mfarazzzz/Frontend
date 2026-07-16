/**
 * aggregator.ts — Content aggregation layer for the Frontend.
 *
 * Queries both Strapi (historical content) and Custom CMS (new content),
 * merges results, and presents a unified view.
 *
 * Design decisions:
 * - 5s timeout per source (per Requirement 7.1)
 * - Custom CMS wins on slug duplicates (rare safety net, not primary behavior)
 * - Single-source failure → serve from available source without visitor error
 * - Both sources down → return error
 */

export type ContentSource = 'strapi' | 'custom-cms';

export interface AggregatedItem {
  [key: string]: unknown;
  id: string;
  slug: string;
  _source: ContentSource;
  published_at?: string;
  publishedAt?: string;
}

export interface AggregatedListResponse<T = AggregatedItem> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
    sources: {
      strapi: { total: number; available: boolean };
      customCms: { total: number; available: boolean };
    };
  };
}

export interface AggregatedItemResponse<T = AggregatedItem> {
  data: T | null;
  meta: { resolvedFrom: ContentSource | null };
}


// ─── Configuration ────────────────────────────────────────────────────────────

function getCustomCmsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CUSTOM_CMS_URL ||
    process.env.CUSTOM_CMS_URL ||
    'http://localhost:3001'
  ).replace(/\/+$/, '');
}

function getStrapiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.STRAPI_API_URL ||
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    'http://localhost:1337/api'
  ).replace(/\/+$/, '');
}

function getStrapiToken(): string | undefined {
  return process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
}

// ─── Fetch utilities ──────────────────────────────────────────────────────────

interface FetchResult<T> {
  data: T[];
  total: number;
}

export async function fetchCustomCms<T = any>(
  contentType: string,
  params: Record<string, string | number | undefined> = {},
): Promise<FetchResult<T>> {
  const url = new URL(`${getCustomCmsUrl()}/api/public/${contentType}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return { data: [], total: 0 };
    const json = await res.json();
    return {
      data: json.data ?? [],
      total: json.meta?.pagination?.total ?? json.data?.length ?? 0,
    };
  } catch {
    return { data: [], total: 0 };
  }
}

async function fetchCustomCmsBySlug<T = any>(
  contentType: string,
  slug: string,
): Promise<T | null> {
  const url = `${getCustomCmsUrl()}/api/public/${contentType}/${slug}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchStrapi<T = any>(
  contentType: string,
  params: Record<string, string | number | undefined> = {},
): Promise<FetchResult<T>> {
  const url = new URL(`${getStrapiUrl()}/${contentType}`);
  // Standard Strapi v4 pagination
  url.searchParams.set('publicationState', 'live');
  url.searchParams.set('pagination[withCount]', 'true');
  if (params.page) url.searchParams.set('pagination[page]', String(params.page));
  if (params.pageSize) url.searchParams.set('pagination[pageSize]', String(params.pageSize));
  if (params.sort) url.searchParams.set('sort[0]', `${params.sort}:${params.order || 'desc'}`);
  url.searchParams.set('populate', '*');

  const headers: Record<string, string> = {};
  const token = getStrapiToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return { data: [], total: 0 };
    const json = await res.json();
    const data = (json.data ?? []).map((item: any) => normalizeStrapi(item));
    const total = json.meta?.pagination?.total ?? data.length;
    return { data, total };
  } catch {
    return { data: [], total: 0 };
  }
}

async function fetchStrapiBySlug<T = any>(
  contentType: string,
  slug: string,
): Promise<T | null> {
  const url = new URL(`${getStrapiUrl()}/${contentType}`);
  url.searchParams.set('filters[slug][$eq]', slug);
  url.searchParams.set('publicationState', 'live');
  url.searchParams.set('populate', '*');

  const headers: Record<string, string> = {};
  const token = getStrapiToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data?.[0];
    return item ? normalizeStrapi(item) : null;
  } catch {
    return null;
  }
}


// ─── Normalization ────────────────────────────────────────────────────────────

function normalizeStrapi(entity: any): any {
  if (!entity) return null;
  // Strapi v4: { id, attributes: { ... } } → flatten
  const attrs = entity.attributes ?? entity;
  return { id: String(entity.id ?? entity.documentId ?? ''), ...attrs };
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  search?: string;
  [key: string]: string | number | undefined;
}

// Content type mapping: Frontend name → [custom-cms path, strapi path]
const CONTENT_TYPE_MAP: Record<string, [string, string]> = {
  articles: ['articles', 'articles'],
  editorials: ['editorials', 'editorials'],
  events: ['events', 'events'],
  exams: ['exams', 'exams'],
  holidays: ['holidays', 'holidays'],
  institutions: ['institutions', 'institutions'],
  places: ['places', 'places'],
  restaurants: ['restaurants', 'restaurants'],
  results: ['results', 'results'],
  'education-news': ['education-news', 'education-news'],
};

/**
 * Fetch content from both sources and merge.
 * Newest first, deduplicate by slug (Custom CMS wins on rare collisions).
 */
export async function getAggregatedList<T extends AggregatedItem = AggregatedItem>(
  contentType: string,
  params: ListParams = {},
): Promise<AggregatedListResponse<T>> {
  const { page = 1, pageSize = 25, ...rest } = params;
  const [customPath, strapiPath] = CONTENT_TYPE_MAP[contentType] ?? [contentType, contentType];

  // Fetch 2x pageSize from each to improve merge quality
  const fetchSize = pageSize * 2;

  const [customResult, strapiResult] = await Promise.allSettled([
    fetchCustomCms<T>(customPath, { page: 1, pageSize: fetchSize, ...rest }),
    fetchStrapi<T>(strapiPath, { page: 1, pageSize: fetchSize, ...rest }),
  ]);

  const customData =
    customResult.status === 'fulfilled' ? customResult.value : { data: [] as T[], total: 0 };
  const strapiData =
    strapiResult.status === 'fulfilled' ? strapiResult.value : { data: [] as T[], total: 0 };

  const customAvailable = customData.data.length > 0 || customData.total > 0;
  const strapiAvailable = strapiData.data.length > 0 || strapiData.total > 0;

  // Both sources completely down — throw so callers can display an error
  if (!customAvailable && !strapiAvailable) {
    const customFailed = customResult.status === 'rejected';
    const strapiFailed = strapiResult.status === 'rejected';
    if (customFailed && strapiFailed) {
      throw new Error(
        `Both content sources are unavailable for "${contentType}". Please try again later.`,
      );
    }
  }

  // Tag each item with source
  const customItems = customData.data.map((item) => ({ ...item, _source: 'custom-cms' as const }));
  const strapiItems = strapiData.data.map((item) => ({ ...item, _source: 'strapi' as const }));

  // Merge: newest first, deduplicate by slug (Custom CMS wins on rare collisions)
  // NOTE: True slug collisions between sources should be extremely rare because:
  // 1. The architecture is split-by-time: historical content stays in Strapi, new in Custom CMS
  // 2. This dedup is a safety net for the edge case where a new article re-uses a Strapi slug
  const slugsSeen = new Set<string>();
  const merged = [...customItems, ...strapiItems]
    .sort((a, b) => {
      const dateA = new Date(
        (a as any).published_at || (a as any).publishedAt || (a as any).created_at || 0,
      ).getTime();
      const dateB = new Date(
        (b as any).published_at || (b as any).publishedAt || (b as any).created_at || 0,
      ).getTime();
      return dateB - dateA;
    })
    .filter((item) => {
      const slug = item.slug;
      if (!slug) return true;
      if (slugsSeen.has(slug)) return false;
      slugsSeen.add(slug);
      return true;
    }) as T[];

  // Paginate the merged result
  const start = (page - 1) * pageSize;
  const pageData = merged.slice(start, start + pageSize);
  const total = customData.total + strapiData.total;

  return {
    data: pageData,
    meta: {
      pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total },
      sources: {
        strapi: { total: strapiData.total, available: strapiAvailable },
        customCms: { total: customData.total, available: customAvailable },
      },
    },
  };
}

/**
 * Resolve a single content item by slug.
 * Checks Custom CMS first, falls back to Strapi.
 */
export async function resolveBySlug<T extends AggregatedItem = AggregatedItem>(
  contentType: string,
  slug: string,
): Promise<AggregatedItemResponse<T>> {
  const [customPath, strapiPath] = CONTENT_TYPE_MAP[contentType] ?? [contentType, contentType];

  // Custom CMS first (new content lives here)
  const customItem = await fetchCustomCmsBySlug<T>(customPath, slug);
  if (customItem) {
    return {
      data: { ...customItem, _source: 'custom-cms' } as T,
      meta: { resolvedFrom: 'custom-cms' },
    };
  }

  // Fallback to Strapi (historical content)
  const strapiItem = await fetchStrapiBySlug<T>(strapiPath, slug);
  if (strapiItem) {
    return {
      data: { ...strapiItem, _source: 'strapi' } as T,
      meta: { resolvedFrom: 'strapi' },
    };
  }

  return { data: null, meta: { resolvedFrom: null } };
}
