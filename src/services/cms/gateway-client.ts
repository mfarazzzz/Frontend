/**
 * Gateway Client — Frontend's interface to the Content Gateway v2 API.
 *
 * Replaces the dual-source aggregator when USE_CONTENT_GATEWAY flag is enabled.
 * All methods call cms.rampurnews.com/api/public/v2/* endpoints.
 */

const CMS_URL = (
  process.env.NEXT_PUBLIC_CUSTOM_CMS_URL ||
  process.env.CUSTOM_CMS_URL ||
  'https://cms.rampurnews.com'
).replace(/\/+$/, '');

const V2_BASE = `${CMS_URL}/api/public/v2`;

interface FetchOptions {
  revalidate?: number;
  timeout?: number;
}

async function gatewayFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 30, timeout = 5000 } = options;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
    next: { revalidate },
  } as RequestInit);

  if (!res.ok) {
    throw new Error(`Gateway ${res.status}: ${url}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

// ─── Content API ──────────────────────────────────────────────────────────────

export interface GatewayEntity {
  id: string;
  slug: string;
  content_type: string;
  sub_type: string | null;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  body: Record<string, string>;
  author_id: string | null;
  primary_category_id: string | null;
  featured_media_id: string | null;
  seo: Record<string, unknown>;
  metadata: Record<string, unknown>;
  status: string;
  is_breaking: boolean;
  is_featured: boolean;
  is_editors_pick: boolean;
  priority: number;
  published_at: string | null;
  views: number;
  read_time_minutes: number | null;
  category?: string;
  categoryTitle?: Record<string, string>;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { pagination: { page: number; page_size: number; page_count: number; total: number } };
}

export async function fetchContentList(
  type: string,
  params: Record<string, string | number | boolean | undefined> = {},
  options?: FetchOptions,
): Promise<PaginatedResponse<GatewayEntity>> {
  const url = new URL(`${V2_BASE}/content/${type}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });
  return gatewayFetch(url.toString(), options);
}

export async function fetchContentBySlug(
  type: string,
  slug: string,
  options?: FetchOptions,
): Promise<{ entity: GatewayEntity; blocks: any[]; categories: any[]; tags: any[]; author: any; featured_media: any; related: GatewayEntity[] }> {
  return gatewayFetch(`${V2_BASE}/content/${type}/${slug}`, { revalidate: 60, ...options });
}

// ─── Search API ───────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  slug: string;
  content_type: string;
  title_hi: string;
  excerpt_hi: string | null;
  published_at: string | null;
  is_featured: boolean;
}

export async function fetchSearch(
  q: string,
  params: { content_types?: string; page?: number; page_size?: number } = {},
): Promise<{ results: SearchResult[]; total: number; facets: any }> {
  const url = new URL(`${V2_BASE}/search`);
  url.searchParams.set('q', q);
  if (params.content_types) url.searchParams.set('content_types', params.content_types);
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.page_size) url.searchParams.set('page_size', String(params.page_size));
  return gatewayFetch(url.toString(), { revalidate: 10 });
}

// ─── Homepage API ─────────────────────────────────────────────────────────────

export interface HomepageSection {
  id: string;
  slug: string;
  title: Record<string, string>;
  template: string;
  items: GatewayEntity[];
  show_ad_after: boolean;
  device_visibility: string;
}

export interface HomepageHealth {
  status: 'healthy' | 'degraded' | 'critical';
  warnings: { section_slug: string; message: string }[];
  empty_sections: number;
}

export interface HomepageData {
  sections: HomepageSection[];
  health: HomepageHealth;
  last_updated: string;
}

export async function fetchHomepage(locale = 'hi'): Promise<HomepageData> {
  return gatewayFetch(`${V2_BASE}/homepage?locale=${locale}`, { revalidate: 30 });
}

// ─── Navigation API ───────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: Record<string, string>;
  url: string | null;
  icon: string | null;
  children: NavItem[];
  badge_text: string | null;
  device_visibility: string;
}

export async function fetchNavigation(slug: string, locale = 'hi'): Promise<{ navigation: any; items: NavItem[] }> {
  return gatewayFetch(`${V2_BASE}/navigation/${slug}?locale=${locale}`, { revalidate: 300 });
}

// ─── Ads API ──────────────────────────────────────────────────────────────────

export async function fetchAdsForSlot(slot: string, device = 'all'): Promise<any[]> {
  const url = `${V2_BASE}/ads/slot/${slot}?device=${device}`;
  try {
    return await gatewayFetch(url, { revalidate: 0 });
  } catch {
    return [];
  }
}

export async function trackAdImpression(placementId: string): Promise<void> {
  fetch(`${V2_BASE}/ads/impression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placement_id: placementId }),
  }).catch(() => {}); // fire-and-forget
}

export async function trackAdClick(placementId: string): Promise<void> {
  fetch(`${V2_BASE}/ads/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placement_id: placementId }),
  }).catch(() => {}); // fire-and-forget
}

// ─── SEO API ──────────────────────────────────────────────────────────────────

export async function fetchSeoMeta(slug: string): Promise<Record<string, unknown>> {
  return gatewayFetch(`${V2_BASE}/seo/meta/${slug}`, { revalidate: 300 });
}

export async function fetchSitemap(type = 'article'): Promise<any[]> {
  return gatewayFetch(`${V2_BASE}/seo/sitemap?type=${type}`, { revalidate: 900 });
}

// ─── Directory API ────────────────────────────────────────────────────────────

export async function fetchDirectory(
  params: Record<string, string | number | undefined> = {},
): Promise<PaginatedResponse<GatewayEntity>> {
  const url = new URL(`${V2_BASE}/directory`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });
  return gatewayFetch(url.toString(), { revalidate: 60 });
}

// ─── Microsites API ───────────────────────────────────────────────────────────

export async function fetchMicrosite(slug: string): Promise<any> {
  return gatewayFetch(`${V2_BASE}/microsites/${slug}`, { revalidate: 60 });
}
