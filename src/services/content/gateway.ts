/**
 * Content Gateway — Single abstraction layer for all content reads.
 *
 * This is the ONLY entry point for fetching published content on the frontend.
 * It delegates to the active provider (Custom CMS) and can be swapped
 * via feature flags without changing any consumer code.
 *
 * Architecture:
 *   Page/Component → ContentGateway → Provider (Custom CMS / Supabase)
 *
 * Feature flags:
 *   CONTENT_PROVIDER=custom-cms  (default, production)
 *   CONTENT_PROVIDER=strapi      (rollback only — requires STRAPI env vars)
 *
 * @module ContentGateway
 */

export type ContentProvider = 'custom-cms' | 'strapi';

export interface GatewayArticle {
  id: string;
  slug: string;
  title: string;
  shortHeadline?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  categoryHindi?: string;
  author?: string;
  authorSlug?: string;
  publishedAt?: string;
  publishedDate?: string;
  modifiedDate?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isEditorsPick?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  schemaJson?: unknown;
  videoUrl?: string;
  videoType?: string;
  views?: number;
  status?: string;
  contentType?: string;
  newsCategory?: string;
  location?: string;
  focusKeyword?: string;
  discoverEligible?: boolean;
  [key: string]: unknown;
}

export interface GatewayListResponse<T = GatewayArticle> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GatewayListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  search?: string;
  featured?: string;
  breaking?: string;
  [key: string]: string | number | undefined;
}

// ─── Configuration ────────────────────────────────────────────────────────────

function getActiveProvider(): ContentProvider {
  const env = process.env.CONTENT_PROVIDER || 'custom-cms';
  if (env === 'strapi') return 'strapi';
  return 'custom-cms';
}

function getCustomCmsUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CUSTOM_CMS_URL ||
    process.env.CUSTOM_CMS_URL ||
    'https://cms.rampurnews.com'
  ).replace(/\/+$/, '');
}

// ─── Custom CMS Fetcher ──────────────────────────────────────────────────────

async function fetchFromCms<T = any>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<{ data: T[]; total: number }> {
  const url = new URL(`${getCustomCmsUrl()}/api/public/${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
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

async function fetchOneFromCms<T = any>(
  path: string,
  slug: string,
): Promise<T | null> {
  const url = `${getCustomCmsUrl()}/api/public/${path}/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    } as RequestInit);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch a paginated list of content items.
 */
export async function getContent<T extends GatewayArticle = GatewayArticle>(
  contentType: string,
  params: GatewayListParams = {},
): Promise<GatewayListResponse<T>> {
  const { page = 1, pageSize = 25, ...rest } = params;

  const result = await fetchFromCms<T>(contentType, { page, pageSize, ...rest });

  return {
    data: result.data,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(result.total / pageSize),
        total: result.total,
      },
    },
  };
}

/**
 * Resolve a single content item by slug.
 */
export async function getContentBySlug<T = GatewayArticle>(
  contentType: string,
  slug: string,
): Promise<T | null> {
  return fetchOneFromCms<T>(contentType, slug);
}

/**
 * Shorthand: fetch articles list.
 */
export async function getArticles(
  params: GatewayListParams = {},
): Promise<GatewayListResponse> {
  return getContent('articles', params);
}

/**
 * Shorthand: fetch single article by slug.
 */
export async function getArticleBySlug(
  slug: string,
): Promise<GatewayArticle | null> {
  return getContentBySlug<GatewayArticle>('articles', slug);
}

/**
 * Shorthand: fetch editorials.
 */
export async function getEditorials(
  params: GatewayListParams = {},
): Promise<GatewayListResponse> {
  return getContent('editorials', params);
}

/**
 * Get the currently active content provider name.
 */
export function getProviderInfo(): { provider: ContentProvider; url: string } {
  return {
    provider: getActiveProvider(),
    url: getCustomCmsUrl(),
  };
}
