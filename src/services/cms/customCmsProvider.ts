/**
 * Custom CMS Provider — reads from the Supabase-backed CMS at cms.rampurnews.com
 *
 * This provider replaces the Strapi provider for article/content consumption.
 * The Custom CMS public API returns camelCase responses with joined relations.
 *
 * Endpoints:
 *   GET /api/public/articles?page=&pageSize=&sort=&category=&featured=&breaking=
 *   GET /api/public/articles/{slug}
 *   GET /api/public/categories
 *   GET /api/public/authors
 *   GET /api/public/tags
 *   GET /api/public/editorials
 */
import type { CMSProvider } from './provider';
import type {
  CMSArticle,
  CMSCategory,
  CMSAuthor,
  CMSMedia,
  CMSTag,
  CMSSettings,
  CMSEditorial,
  CMSAd,
  ArticleQueryParams,
  EditorialQueryParams,
  AdQueryParams,
  PaginatedResponse,
} from './types';

const CMS_BASE_URL = (() => {
  // Server-side: prefer internal URL to avoid DNS hairpin issues on same-server deployments
  if (typeof window === 'undefined') {
    const internalUrl = process.env.CUSTOM_CMS_INTERNAL_URL;
    if (internalUrl) return internalUrl.replace(/\/+$/, '');
  }
  return (
    process.env.NEXT_PUBLIC_CUSTOM_CMS_URL ||
    process.env.CUSTOM_CMS_URL ||
    'https://cms.rampurnews.com'
  ).replace(/\/+$/, '');
})();

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`[CustomCMS] ${res.status} from ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[CustomCMS] fetch failed: ${url}`, err);
    return null;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${CMS_BASE_URL}/api/public${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

/** Map API response to CMSArticle type expected by Frontend components */
function mapArticle(raw: any): CMSArticle {
  return {
    id: raw.id,
    title: raw.title || '',
    slug: raw.slug || '',
    excerpt: raw.excerpt || raw.shortHeadline || '',
    content: raw.content || '',
    image: raw.image || '',
    category: raw.category || '',
    categoryHindi: raw.categoryHindi || '',
    author: raw.author || raw.authorHindi || 'Rampur News Desk',
    authorId: raw.authorId,
    authorSlug: raw.authorSlug,
    publishedAt: raw.publishedAt || raw.createdAt || '',
    publishedDate: raw.publishedAt || raw.createdAt || '',
    scheduledAt: raw.scheduledAt,
    modifiedDate: raw.updatedAt,
    readTime: raw.readTime ? `${raw.readTime} मिनट` : undefined,
    isFeatured: raw.isFeatured || false,
    isBreaking: raw.isBreaking || false,
    isEditorsPick: raw.isEditorsPick || false,
    views: raw.views || 0,
    status: raw.status || 'published',
    contentType: raw.contentType,
    tags: raw.tags || [],
    location: raw.location,
    short_headline: raw.shortHeadline,
    discoverEligible: raw.discoverEligible,
    seoTitle: raw.seoTitle,
    seoDescription: raw.seoDescription,
    canonicalUrl: raw.canonicalUrl,
    videoUrl: raw.videoUrl,
    videoType: raw.videoType,
  };
}

function mapCategory(raw: any): CMSCategory {
  return {
    id: raw.id,
    slug: raw.slug || '',
    titleHindi: raw.titleHindi || '',
    titleEnglish: raw.titleEnglish || '',
    description: raw.description || '',
    path: raw.path || `/${raw.slug || ''}`,
    parentId: raw.parentId,
    order: raw.order,
  };
}

function mapAuthor(raw: any): CMSAuthor {
  return {
    id: raw.id,
    slug: raw.slug || '',
    name: raw.name || '',
    nameHindi: raw.nameHindi || raw.name || '',
    email: raw.email || '',
    avatar: raw.avatar || raw.coverImage || '',
    bio: raw.bio || '',
    designation: raw.designation || '',
    role: raw.role || 'author',
  };
}

export function createCustomCmsProvider(): CMSProvider {
  return {
    // ─── Articles ─────────────────────────────────────────────────────────────
    async getArticles(params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (params?.limit) query.pageSize = params.limit;
      if (params?.offset && params?.limit) {
        query.page = Math.floor(params.offset / params.limit) + 1;
      }
      if (params?.category) query.category = params.category;
      if (params?.featured) query.featured = 'true';
      if (params?.breaking) query.breaking = 'true';
      if (params?.editorsPick) query.editorsPick = 'true';
      if (params?.search) query.search = params.search;
      if (params?.orderBy === 'views') query.sort = 'views';
      else query.sort = 'published_at';
      query.order = params?.order || 'desc';

      const response = await fetchJson<any>(buildUrl('/articles', query));
      if (!response) return { data: [], total: 0, page: 1, pageSize: params?.limit || 25, totalPages: 0 };

      const articles = (response.data || []).map(mapArticle);
      const meta = response.meta?.pagination || {};
      return {
        data: articles,
        total: meta.total || articles.length,
        page: meta.page || 1,
        pageSize: meta.pageSize || params?.limit || 25,
        totalPages: meta.pageCount || 1,
      };
    },

    async getArticleById(id: string): Promise<CMSArticle | null> {
      const response = await fetchJson<any>(buildUrl(`/articles/${id}`));
      if (!response?.data) return null;
      return mapArticle(response.data);
    },

    async getArticleBySlug(slug: string): Promise<CMSArticle | null> {
      const response = await fetchJson<any>(buildUrl(`/articles/${encodeURIComponent(slug)}`));
      if (!response?.data) return null;
      return mapArticle(response.data);
    },

    async getHeroArticles(limit = 8): Promise<CMSArticle[]> {
      // Hero = latest published articles, optionally with hero_priority
      const response = await fetchJson<any>(buildUrl('/articles', { pageSize: limit, sort: 'published_at', order: 'desc' }));
      return (response?.data || []).map(mapArticle);
    },

    async getFeaturedArticles(limit = 5): Promise<CMSArticle[]> {
      const response = await fetchJson<any>(buildUrl('/articles', { pageSize: limit, featured: 'true', sort: 'published_at', order: 'desc' }));
      return (response?.data || []).map(mapArticle);
    },

    async getBreakingNews(limit = 5): Promise<CMSArticle[]> {
      // First try to get articles explicitly marked as breaking
      const response = await fetchJson<any>(buildUrl('/articles', { pageSize: limit, breaking: 'true', sort: 'published_at', order: 'desc' }));
      const breakingArticles = (response?.data || []).map(mapArticle);

      if (breakingArticles.length > 0) return breakingArticles;

      // Fallback: if no breaking articles found, return the latest published articles
      // so the ticker always shows fresh content
      const fallback = await fetchJson<any>(buildUrl('/articles', { pageSize: limit, sort: 'published_at', order: 'desc' }));
      return (fallback?.data || []).map(mapArticle);
    },

    async getTodaysTopNews(limit = 5): Promise<CMSArticle[]> {
      // Return latest articles as "today's top"
      const response = await fetchJson<any>(buildUrl('/articles', { pageSize: limit, sort: 'published_at', order: 'desc' }));
      return (response?.data || []).map(mapArticle);
    },

    async getTrendingArticles(limit = 5): Promise<CMSArticle[]> {
      const response = await fetchJson<any>(buildUrl('/articles', { pageSize: limit, sort: 'views', order: 'desc' }));
      return (response?.data || []).map(mapArticle);
    },

    async getArticlesByCategory(categorySlug: string, limit = 10): Promise<CMSArticle[]> {
      const response = await fetchJson<any>(buildUrl('/articles', { category: categorySlug, pageSize: limit, sort: 'published_at', order: 'desc' }));
      return (response?.data || []).map(mapArticle);
    },

    async searchArticles(query: string, limit = 20): Promise<CMSArticle[]> {
      const response = await fetchJson<any>(buildUrl('/articles', { search: query, pageSize: limit }));
      return (response?.data || []).map(mapArticle);
    },

    // ─── Categories ───────────────────────────────────────────────────────────
    async getCategories(): Promise<CMSCategory[]> {
      const response = await fetchJson<any>(buildUrl('/categories', { pageSize: 100 }));
      return (response?.data || []).map(mapCategory);
    },

    async getCategoryById(id: string): Promise<CMSCategory | null> {
      const response = await fetchJson<any>(buildUrl(`/categories/${id}`));
      return response?.data ? mapCategory(response.data) : null;
    },

    async getCategoryBySlug(slug: string): Promise<CMSCategory | null> {
      const response = await fetchJson<any>(buildUrl(`/categories/${encodeURIComponent(slug)}`));
      return response?.data ? mapCategory(response.data) : null;
    },

    // ─── Authors ──────────────────────────────────────────────────────────────
    async getAuthors(): Promise<CMSAuthor[]> {
      const response = await fetchJson<any>(buildUrl('/authors', { pageSize: 100 }));
      return (response?.data || []).map(mapAuthor);
    },

    async getAuthorById(id: string): Promise<CMSAuthor | null> {
      const response = await fetchJson<any>(buildUrl(`/authors/${id}`));
      return response?.data ? mapAuthor(response.data) : null;
    },

    // ─── Tags ─────────────────────────────────────────────────────────────────
    async getTags(): Promise<CMSTag[]> {
      const response = await fetchJson<any>(buildUrl('/tags', { pageSize: 100 }));
      return (response?.data || []).map((t: any) => ({
        id: t.id,
        name: t.name || '',
        nameHindi: t.nameHindi || t.name || '',
        slug: t.slug || '',
      }));
    },

    // ─── Editorials ───────────────────────────────────────────────────────────
    async getEditorials(params?: EditorialQueryParams): Promise<PaginatedResponse<CMSEditorial>> {
      const query: Record<string, string | number | boolean | undefined> = {};
      if (params?.limit) query.pageSize = params.limit;
      if (params?.offset && params?.limit) query.page = Math.floor(params.offset / params.limit) + 1;
      query.sort = 'published_at';
      query.order = params?.order || 'desc';

      const response = await fetchJson<any>(buildUrl('/editorials', query));
      if (!response) return { data: [], total: 0, page: 1, pageSize: params?.limit || 20, totalPages: 0 };

      const meta = response.meta?.pagination || {};
      return {
        data: (response.data || []).map((e: any) => ({
          id: e.id,
          title: e.title || '',
          titleHindi: e.titleHindi,
          slug: e.slug || '',
          excerpt: e.excerpt || '',
          content: e.content || '',
          image: e.image || '',
          editorialType: e.editorialType || 'editorial',
          author: e.author || '',
          authorSlug: e.authorSlug,
          publishedDate: e.publishedAt || e.createdAt || '',
          publishedAt: e.publishedAt,
          status: e.status || 'published',
        })) as CMSEditorial[],
        total: meta.total || 0,
        page: meta.page || 1,
        pageSize: meta.pageSize || params?.limit || 20,
        totalPages: meta.pageCount || 1,
      };
    },

    async getEditorialBySlug(slug: string): Promise<CMSEditorial | null> {
      const response = await fetchJson<any>(buildUrl(`/editorials/${encodeURIComponent(slug)}`));
      if (!response?.data) return null;
      const e = response.data;
      return {
        id: e.id,
        title: e.title || '',
        titleHindi: e.titleHindi,
        slug: e.slug || '',
        excerpt: e.excerpt || '',
        content: e.content || '',
        image: e.image || '',
        editorialType: e.editorialType || 'editorial',
        author: e.author || '',
        authorSlug: e.authorSlug,
        publishedDate: e.publishedAt || e.createdAt || '',
        publishedAt: e.publishedAt,
        status: e.status || 'published',
      } as CMSEditorial;
    },

    // ─── Settings ─────────────────────────────────────────────────────────────
    async getSettings(): Promise<CMSSettings> {
      return {
        siteName: 'रामपुर न्यूज़',
        siteNameHindi: 'रामपुर न्यूज़',
        tagline: 'रामपुर की ताज़ा खबरें',
        logo: '/logo.png',
        favicon: '/favicon.ico',
        socialLinks: {},
      } as CMSSettings;
    },

    async updateSettings(settings: Partial<CMSSettings>): Promise<CMSSettings> {
      return settings as CMSSettings;
    },

    // ─── Media (read-only from public API) ────────────────────────────────────
    async getMedia(limit = 25): Promise<CMSMedia[]> {
      return [];
    },

    async uploadMedia(_file: File): Promise<CMSMedia> {
      throw new Error('Media upload not available from public frontend');
    },

    async deleteMedia(_id: string): Promise<void> {
      throw new Error('Media delete not available from public frontend');
    },

    // ─── Mutations (not available on public frontend) ─────────────────────────
    async createArticle(_article: Omit<CMSArticle, 'id'>): Promise<CMSArticle> {
      throw new Error('Create not available from public frontend');
    },
    async updateArticle(_id: string, _article: Partial<CMSArticle>): Promise<CMSArticle> {
      throw new Error('Update not available from public frontend');
    },
    async publishArticle(_id: string): Promise<CMSArticle> {
      throw new Error('Publish not available from public frontend');
    },
    async unpublishArticle(_id: string): Promise<CMSArticle> {
      throw new Error('Unpublish not available from public frontend');
    },
    async deleteArticle(_id: string): Promise<void> {
      throw new Error('Delete not available from public frontend');
    },
    async createCategory(_cat: Omit<CMSCategory, 'id'>): Promise<CMSCategory> {
      throw new Error('Create not available from public frontend');
    },
    async updateCategory(_id: string, _cat: Partial<CMSCategory>): Promise<CMSCategory> {
      throw new Error('Update not available from public frontend');
    },
    async deleteCategory(_id: string): Promise<void> {
      throw new Error('Delete not available from public frontend');
    },
    async createAuthor(_author: Omit<CMSAuthor, 'id'>): Promise<CMSAuthor> {
      throw new Error('Create not available from public frontend');
    },
    async updateAuthor(_id: string, _author: Partial<CMSAuthor>): Promise<CMSAuthor> {
      throw new Error('Update not available from public frontend');
    },
    async deleteAuthor(_id: string): Promise<void> {
      throw new Error('Delete not available from public frontend');
    },

    // ─── Ads ──────────────────────────────────────────────────────────────────
    async getAds(_params?: AdQueryParams): Promise<CMSAd[]> {
      return [];
    },
    async getAdById(_id: string): Promise<CMSAd | null> {
      return null;
    },
    async createAd(_ad: any): Promise<CMSAd> {
      throw new Error('Not available from public frontend');
    },
    async updateAd(_id: string, _ad: any): Promise<CMSAd> {
      throw new Error('Not available from public frontend');
    },
    async deleteAd(_id: string): Promise<void> {
      throw new Error('Not available from public frontend');
    },
  };
}
