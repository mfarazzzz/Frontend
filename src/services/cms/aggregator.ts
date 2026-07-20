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
    'https://cms.rampurnews.com'
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

  // Category filter — passed to API (may be ignored by custom controllers)
  if (params.category) {
    url.searchParams.set('filters[category][slug][$eq]', String(params.category));
  }

  // Search filter
  if (params.search) {
    url.searchParams.set('filters[title][$containsi]', String(params.search));
  }

  // Featured filter
  if (params.featured) {
    url.searchParams.set('filters[isFeatured][$eq]', 'true');
  }

  // Breaking filter
  if (params.breaking) {
    url.searchParams.set('filters[isBreaking][$eq]', 'true');
  }

  const headers: Record<string, string> = {};
  const token = getStrapiToken();
  if (token && token !== 'PASTE_YOUR_STRAPI_API_TOKEN_HERE') {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return { data: [], total: 0 };
    const json = await res.json();
    let data = (json.data ?? []).map((item: any) => normalizeStrapi(item));

    // Client-side category filtering: the Strapi custom controller may ignore
    // server-side filters. Apply category filter defensively on the client.
    if (params.category) {
      const targetCategory = String(params.category).toLowerCase();
      data = data.filter((item: any) => {
        const itemCategory = String(item?.category || '').toLowerCase();
        return itemCategory === targetCategory;
      });
    }

    // Use filtered data length as total when client-side filtering was applied,
    // since Strapi's pagination.total doesn't account for our client-side filter.
    const rawTotal = json.meta?.pagination?.total ?? data.length;
    const total = params.category ? data.length : rawTotal;
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
  // Strapi custom controller: { id, slug, category, ... } → already flat
  const attrs = entity.attributes ?? entity;
  const id = String(entity.id ?? entity.documentId ?? '');

  // Handle category relation: may be { data: { attributes: { slug } } } or a plain string
  let category = attrs.category;
  let categoryHindi = attrs.categoryHindi;
  if (category && typeof category === 'object') {
    const catData = category.data;
    if (catData && !Array.isArray(catData)) {
      category = catData.attributes?.slug || catData.slug || '';
      categoryHindi = catData.attributes?.titleHindi || catData.titleHindi || categoryHindi || '';
    }
  }

  // Handle image relation: may be { data: { attributes: { url } } } or string
  let image = attrs.image || attrs.featured_image || '';
  if (image && typeof image === 'object') {
    const imgData = image.data;
    if (imgData && !Array.isArray(imgData)) {
      image = imgData.attributes?.url || imgData.url || '';
    }
  }

  return {
    id,
    ...attrs,
    category: typeof category === 'string' ? category : '',
    categoryHindi: categoryHindi || '',
    image: typeof image === 'string' ? image : '',
    publishedAt: attrs.publishedAt || attrs.publishedDate || attrs.created_at || '',
  };
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
 * Fetch content from the Custom CMS (single source of truth).
 * 
 * MIGRATION NOTE (2026-07-20): Strapi dual-fetch has been disabled.
 * The Custom CMS now contains all reconciled content (100 articles with
 * full body HTML, categories, authors, tags, editorials).
 * 
 * The Strapi fetch code is preserved below (commented) for rollback.
 * To re-enable dual-source: set ENABLE_STRAPI_AGGREGATION=true in env.
 */
export async function getAggregatedList<T extends AggregatedItem = AggregatedItem>(
  contentType: string,
  params: ListParams = {},
): Promise<AggregatedListResponse<T>> {
  const { page = 1, pageSize = 25, ...rest } = params;
  const [customPath] = CONTENT_TYPE_MAP[contentType] ?? [contentType, contentType];

  // ─── Feature flag: re-enable Strapi aggregation for rollback ────────────
  const enableStrapi = process.env.ENABLE_STRAPI_AGGREGATION === 'true';

  // Fetch from Custom CMS (primary and only source)
  const customResult = await fetchCustomCms<T>(customPath, { page, pageSize, ...rest })
    .catch(() => ({ data: [] as T[], total: 0 }));

  let strapiData = { data: [] as T[], total: 0 };

  // ─── DEPRECATED: Strapi fetch (disabled, retained for rollback) ─────────
  if (enableStrapi) {
    const [, strapiPath] = CONTENT_TYPE_MAP[contentType] ?? [contentType, contentType];
    const fetchSize = pageSize * 2;
    try {
      strapiData = await fetchStrapi<T>(strapiPath, { page: 1, pageSize: fetchSize, ...rest });
    } catch {
      strapiData = { data: [], total: 0 };
    }
  }

  const customAvailable = customResult.data.length > 0 || customResult.total > 0;
  const strapiAvailable = strapiData.data.length > 0 || strapiData.total > 0;

  if (!customAvailable && !strapiAvailable) {
    throw new Error(
      `Content source unavailable for "${contentType}". Please try again later.`,
    );
  }

  // Tag items with source
  const customItems = customResult.data.map((item) => ({ ...item, _source: 'custom-cms' as const }));
  const strapiItems = strapiData.data.map((item) => ({ ...item, _source: 'strapi' as const }));

  // Merge + deduplicate (only relevant when Strapi is enabled for rollback)
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

  // When single-source (normal operation), use CMS pagination directly
  const total = enableStrapi ? (customResult.total + strapiData.total) : customResult.total;
  const pageData = enableStrapi ? merged.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : merged;

  return {
    data: pageData,
    meta: {
      pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total },
      sources: {
        strapi: { total: strapiData.total, available: strapiAvailable },
        customCms: { total: customResult.total, available: customAvailable },
      },
    },
  };
}

/**
 * Resolve a single content item by slug.
 * Reads from Custom CMS only. Strapi fallback disabled (retained for rollback).
 */
export async function resolveBySlug<T extends AggregatedItem = AggregatedItem>(
  contentType: string,
  slug: string,
): Promise<AggregatedItemResponse<T>> {
  const [customPath, strapiPath] = CONTENT_TYPE_MAP[contentType] ?? [contentType, contentType];

  // Custom CMS (single source of truth after reconciliation)
  const customItem = await fetchCustomCmsBySlug<T>(customPath, slug);
  if (customItem) {
    return {
      data: { ...customItem, _source: 'custom-cms' } as T,
      meta: { resolvedFrom: 'custom-cms' },
    };
  }

  // ─── DEPRECATED: Strapi fallback (disabled, retained for rollback) ──────
  const enableStrapi = process.env.ENABLE_STRAPI_AGGREGATION === 'true';
  if (enableStrapi) {
    const strapiItem = await fetchStrapiBySlug<T>(strapiPath, slug);
    if (strapiItem) {
      return {
        data: { ...strapiItem, _source: 'strapi' } as T,
        meta: { resolvedFrom: 'strapi' },
      };
    }
  }

  return { data: null, meta: { resolvedFrom: null } };
}
