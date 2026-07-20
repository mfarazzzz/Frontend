/**
 * aggregator.ts — Content fetching layer for the Frontend.
 *
 * Single source: Custom CMS at cms.rampurnews.com (Supabase-backed).
 * Strapi is retired — all content lives in the Custom CMS.
 */

export type ContentSource = 'custom-cms';

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
  // Server-side: prefer internal URL (avoids DNS hairpin issues on same-server deployments)
  if (typeof window === 'undefined') {
    const internalUrl = process.env.CUSTOM_CMS_INTERNAL_URL;
    if (internalUrl) return internalUrl.replace(/\/+$/, '');
  }
  return (
    process.env.NEXT_PUBLIC_CUSTOM_CMS_URL ||
    process.env.CUSTOM_CMS_URL ||
    'https://cms.rampurnews.com'
  ).replace(/\/+$/, '');
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

// Content type mapping: Frontend name → custom-cms path
const CONTENT_TYPE_MAP: Record<string, string> = {
  articles: 'articles',
  editorials: 'editorials',
  events: 'events',
  exams: 'exams',
  holidays: 'holidays',
  institutions: 'institutions',
  places: 'places',
  restaurants: 'restaurants',
  results: 'results',
  'education-news': 'education-news',
};

/**
 * Fetch content from Custom CMS.
 */
export async function getAggregatedList<T extends AggregatedItem = AggregatedItem>(
  contentType: string,
  params: ListParams = {},
): Promise<AggregatedListResponse<T>> {
  const { page = 1, pageSize = 25, ...rest } = params;
  const customPath = CONTENT_TYPE_MAP[contentType] ?? contentType;

  const result = await fetchCustomCms<T>(customPath, { page, pageSize, ...rest })
    .catch(() => ({ data: [] as T[], total: 0 }));

  const available = result.data.length > 0 || result.total > 0;

  if (!available) {
    throw new Error(
      `Content source unavailable for "${contentType}". Please try again later.`,
    );
  }

  const items = result.data.map((item) => ({ ...item, _source: 'custom-cms' as const }));

  return {
    data: items as T[],
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(result.total / pageSize),
        total: result.total,
      },
      sources: {
        customCms: { total: result.total, available },
      },
    },
  };
}

/**
 * Resolve a single content item by slug from Custom CMS.
 */
export async function resolveBySlug<T extends AggregatedItem = AggregatedItem>(
  contentType: string,
  slug: string,
): Promise<AggregatedItemResponse<T>> {
  const customPath = CONTENT_TYPE_MAP[contentType] ?? contentType;

  const item = await fetchCustomCmsBySlug<T>(customPath, slug);
  if (item) {
    return {
      data: { ...item, _source: 'custom-cms' } as T,
      meta: { resolvedFrom: 'custom-cms' },
    };
  }

  return { data: null, meta: { resolvedFrom: null } };
}
