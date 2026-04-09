// CMS Service - Main export with provider switching
import type { CMSProvider, CMSConfig, CMSProviderType } from './provider';
import type {
  CMSArticle,
  CMSCategory,
  CMSAuthor,
  CMSMedia,
  CMSTag,
  CMSSettings,
  CMSAd,
  ArticleQueryParams,
  AdQueryParams,
  PaginatedResponse,
  CMSEditorial,
  EditorialQueryParams,
} from './types';
import { mockCMSProvider } from './mockProvider';

export * from './types';
export * from './provider';

/**
 * Normalizes a Strapi base URL by trimming whitespace, removing trailing slashes,
 * and ensuring it ends with /api if needed.
 */
export const normalizeStrapiBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return trimmed;
  try {
    const u = new URL(trimmed);
    const segments = u.pathname.split('/').filter(Boolean);
    const apiIndex = segments.indexOf('api');
    if (apiIndex >= 0) {
      u.pathname = `/${segments.slice(0, apiIndex + 1).join('/')}`;
      u.search = '';
      u.hash = '';
      return u.toString().replace(/\/+$/, '');
    }
  } catch {
    void 0;
  }
  if (trimmed.endsWith('/api')) return trimmed;
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
};

const createRestCMSProvider = (config: CMSConfig): CMSProvider => {
  const baseUrl = (config.baseUrl || '').replace(/\/+$/, '');
  const isStrapi = config.provider === 'strapi';
  const canUseStrapiAdmin =
    isStrapi && typeof window !== 'undefined' && (window.location?.pathname || '').startsWith('/admin');

  const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
    if (isStrapi && typeof window !== 'undefined' && canUseStrapiAdmin) {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const qs = searchParams.toString();
      return `/api/cms/strapi${path}${qs ? `?${qs}` : ''}`;
    }

    if (isStrapi && !baseUrl) {
      throw new Error('Strapi API URL is not configured');
    }

    const urlString = `${baseUrl}${path}`;
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      const url = new URL(urlString);
      searchParams.forEach((value, key) => url.searchParams.append(key, value));
      return url.toString();
    }
    return `${urlString}${qs ? `?${qs}` : ''}`;
  };

  const buildProxyUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    const relativePath = `/api/cms/strapi${path}${qs ? `?${qs}` : ''}`;
    
    // On the server, we must return an absolute URL for fetch to work.
    if (typeof window === 'undefined') {
      const siteUrl = (
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://rampurnews.com'
      ).replace(/\/+$/, '');
      return `${siteUrl}${relativePath}`;
    }
    
    return relativePath;
  };

  const getAuthHeaders = (includeApiKey = true) => {
    const headers: Record<string, string> = {};
    if (includeApiKey && config.apiKey && typeof window === 'undefined') {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }
    return headers;
  };

  const requireStrapiApiKey = (operation: string) => {
    if (!isStrapi) return;
    if (config.apiKey) return;
    void operation;
  };

  const getStrapiOrigin = () => {
    try {
      const u = new URL(baseUrl);
      return `${u.protocol}//${u.host}`;
    } catch {
      return '';
    }
  };

  const toAbsoluteStrapiUrl = (origin: string, url: string) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    try {
      return new URL(url, origin).toString();
    } catch {
      return url;
    }
  };

  const getStrapiMediaOriginFromEnv = () => {
    const candidates = [
      process.env.NEXT_PUBLIC_API_URL,
      process.env.NEXT_PUBLIC_STRAPI_URL,
      process.env.NEXT_PUBLIC_STRAPI_API_URL,
      process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
      typeof window === 'undefined' ? process.env.STRAPI_API_URL : undefined,
    ]
      .filter((value) => typeof value === 'string')
      .map((value) => normalizeStrapiBaseUrl(String(value)))
      .filter(Boolean);

    if (candidates.length === 0) {
      return '';
    }
    try {
      const u = new URL(candidates[0]!);
      return `${u.protocol}//${u.host}`;
    } catch {
      return '';
    }
  };

  const resolveStrapiMediaUrl = (origin: string, url?: string) => {
    if (!url) return url || '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    const normalizedPath = url.startsWith('/api/uploads/') ? url.replace(/^\/api/, '') : url;
    const baseOrigin = origin || getStrapiMediaOriginFromEnv();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const u = new URL(url);
        const normalizedAbsolutePath = u.pathname.startsWith('/api/uploads/')
          ? u.pathname.replace(/^\/api/, '')
          : u.pathname;
        const isUploadPath = normalizedAbsolutePath.startsWith('/uploads/');
        if (!baseOrigin || !isUploadPath) return url;
        const base = new URL(baseOrigin);
        const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(u.hostname);
        const isSameHostDifferentProtocol = u.host === base.host && u.protocol !== base.protocol;
        if (isLocalHost || isSameHostDifferentProtocol) {
          return `${baseOrigin}${normalizedAbsolutePath}${u.search}${u.hash}`;
        }
        return url;
      } catch {
        return url;
      }
    }
    if (!baseOrigin || !normalizedPath.startsWith('/')) return normalizedPath;
    return `${baseOrigin}${normalizedPath}`;
  };

  const extractStrapiMediaUrlLike = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value !== 'object') return undefined;
    const v: any = value as any;
    const direct =
      (typeof v.url === 'string' && v.url) ||
      (typeof v.src === 'string' && v.src) ||
      (typeof v.path === 'string' && v.path) ||
      undefined;
    if (direct) return direct;
    const nestedData = v?.data;
    if (nestedData) {
      if (Array.isArray(nestedData)) {
        const first = nestedData[0];
        if (first) return extractStrapiMediaUrlLike(first);
        return undefined;
      }
      return extractStrapiMediaUrlLike(nestedData);
    }
    const attrs = v?.attributes;
    if (attrs && typeof attrs === 'object') {
      return extractStrapiMediaUrlLike(attrs);
    }
    return undefined;
  };

  const normalizeArticleMedia = (article: CMSArticle | null): CMSArticle | null => {
    if (!article) return article;
    const origin = getStrapiOrigin() || getStrapiMediaOriginFromEnv();
    if (!origin) return article;

    const updatedArticle = { ...article };

    // Normalize featured image
    const rawImage = extractStrapiMediaUrlLike((article as any).image);
    if (rawImage) {
      const image = resolveStrapiMediaUrl(origin, rawImage);
      if (image && image !== (article as any).image) updatedArticle.image = image;
    }

    // Normalize content images
    if (article.content) {
      updatedArticle.content = article.content.replace(
        /src="\/api\/uploads\//g,
        `src="${origin}/uploads/`
      ).replace(
        /src='\/api\/uploads\//g,
        `src='${origin}/uploads/`
      ).replace(
        /src="\/uploads\//g,
        `src="${origin}/uploads/`
      ).replace(
        /src='\/uploads\//g,
        `src='${origin}/uploads/`
      ).replace(
        /src="https?:\/\/localhost(?::\d+)?\/api\/uploads\//g,
        `src="${origin}/uploads/`
      ).replace(
        /src='https?:\/\/localhost(?::\d+)?\/api\/uploads\//g,
        `src='${origin}/uploads/`
      ).replace(
        /src="https?:\/\/localhost(?::\d+)?\/uploads\//g,
        `src="${origin}/uploads/`
      ).replace(
        /src='https?:\/\/localhost(?::\d+)?\/uploads\//g,
        `src='${origin}/uploads/`
      ).replace(
        /src="https?:\/\/127\.0\.0\.1(?::\d+)?\/api\/uploads\//g,
        `src="${origin}/uploads/`
      ).replace(
        /src='https?:\/\/127\.0\.0\.1(?::\d+)?\/api\/uploads\//g,
        `src='${origin}/uploads/`
      ).replace(
        /src="https?:\/\/127\.0\.0\.1(?::\d+)?\/uploads\//g,
        `src="${origin}/uploads/`
      ).replace(
        /src='https?:\/\/127\.0\.0\.1(?::\d+)?\/uploads\//g,
        `src='${origin}/uploads/`
      );
    }

    return updatedArticle;
  };

  const normalizeArticleListMedia = (items: CMSArticle[]) => {
    const origin = getStrapiOrigin() || getStrapiMediaOriginFromEnv();
    if (!origin) return items;
    return items.map((article) => {
      const rawImage = extractStrapiMediaUrlLike((article as any)?.image);
      if (!rawImage) return article;
      const image = resolveStrapiMediaUrl(origin, rawImage);
      return image && image !== (article as any).image ? { ...article, image } : article;
    });
  };

  const normalizeStrapiUploadFile = (file: any, origin: string): CMSMedia | null => {
    if (!file) return null;
    return {
      id: String(file.id),
      url: toAbsoluteStrapiUrl(origin, String(file.url || '')),
      title: String(file.name || file.hash || 'file'),
      altText: typeof file.alternativeText === 'string' ? file.alternativeText : '',
      mimeType: typeof file.mime === 'string' ? file.mime : '',
      size: typeof file.size === 'number' ? file.size : 0,
      width: typeof file.width === 'number' ? file.width : undefined,
      height: typeof file.height === 'number' ? file.height : undefined,
      uploadedAt: typeof file.createdAt === 'string' ? file.createdAt : new Date().toISOString(),
      uploadedBy: 'strapi',
    };
  };

  class HttpError extends Error {
    status: number;
    body?: unknown;
    constructor(status: number, message: string, body?: unknown) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }

  const fetchJson = async <T>(
    input: RequestInfo,
    init?: RequestInit,
    options?: { allowNotFound?: boolean; revalidate?: number },
  ) => {
    const isServer = typeof window === 'undefined';
    const method = String(init?.method || 'GET').toUpperCase();
    // Server-side GET requests use ISR revalidation (default 60s).
    // Client-side and mutation requests always bypass cache.
    const nextInit: RequestInit =
      isServer && method === 'GET'
        ? ({ next: { revalidate: options?.revalidate ?? 30 } } as any)
        : ({ cache: 'no-store' } as any);
    const response = await fetch(input, { ...nextInit, ...(init as any) } as any);
    if (response.status === 204) {
      return null as T;
    }
    if (!response.ok) {
      if (response.status === 404 && options?.allowNotFound !== false) {
        return null;
      }
      let body: unknown = undefined;
      let message = `Request failed with status ${response.status}`;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          body = await response.json();
          const maybeMessage =
            (body as any)?.error?.message ||
            (body as any)?.message ||
            (body as any)?.error ||
            undefined;
          if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
            message = maybeMessage;
          }
        } else {
          const text = await response.text();
          if (text.trim()) {
            body = text;
            message = text;
          }
        }
      } catch {
        void 0;
      }
      throw new HttpError(response.status, message, body);
    }
    const data = (await response.json()) as T;
    return data;
  };

  const buildArticleQuery = (params?: ArticleQueryParams) => {
    const query: Record<string, string | number | boolean | undefined> = {};
    const input = params || {};

    if (isStrapi) {
      if (input.category) {
        query['filters[category][slug][$eq]'] = input.category;
      }
      if (input.parent) {
        query['filters[category][parent][slug][$eq]'] = input.parent;
      }
      if (input.featured !== undefined) {
        query['filters[isFeatured][$eq]'] = input.featured;
      }
      if (input.breaking !== undefined) {
        query['filters[isBreaking][$eq]'] = input.breaking;
      }
      if (input.editorsPick !== undefined) {
        query['filters[isEditorsPick][$eq]'] = input.editorsPick;
      }
      if ((input as any).todaysTop !== undefined) {
        query['filters[isTodaysTopStory][$eq]'] = Boolean((input as any).todaysTop);
      }
      if ((input as any).sinceHours && Number((input as any).sinceHours) > 0) {
        const hrs = Number((input as any).sinceHours);
        const since = new Date(Date.now() - hrs * 3600_000).toISOString();
        query['filters[publishedAt][$gte]'] = since;
      }
      if (input.search) {
        query['filters[title][$containsi]'] = input.search;
      }
      if (input.author) {
        const raw = String(input.author || '').trim();
        if (raw) {
          if (raw.includes('@')) {
            query['filters[author][email][$eq]'] = raw;
          } else {
            query['filters[$or][0][author][slug][$eq]'] = raw;
            query['filters[$or][1][author][name][$eq]'] = raw;
            query['filters[$or][2][author][nameHindi][$eq]'] = raw;
          }
        }
      }

      const rawLimit = typeof input.limit === 'number' && input.limit > 0 ? input.limit : undefined;
      const rawOffset = typeof input.offset === 'number' && input.offset >= 0 ? input.offset : 0;
      if (rawLimit !== undefined || rawOffset > 0) {
        const pageSize = rawLimit ?? 25;
        const page = Math.floor(rawOffset / pageSize) + 1;
        query['pagination[pageSize]'] = pageSize;
        query['pagination[page]'] = page;
      }

      if (!input.orderBy) {
        query['sort'] = 'publishedAt:desc';
      } else {
        const sortField = input.orderBy === 'publishedDate' || input.orderBy === 'publishedAt'
          ? 'publishedAt'
          : input.orderBy;
        const sortOrder = input.order || 'desc';
        query['sort'] = `${sortField}:${sortOrder}`;
      }

      // Handle publication state
      if (input.status === 'draft') {
        query['publicationState'] = 'preview';
      } else if (input.status === 'published') {
        query['publicationState'] = 'live';
      } else {
        // Default to live for frontend, preview for admin if needed
        // But here we let the caller decide or default to Strapi default (live)
      }

      // Explicitly populate critical fields if 'populate=*' is too heavy or shallow
      // In v5, populate=* usually works, but for deep relations (media, author, category) it is safer to be explicit
      query['populate'] = '*'; 
    } else {
      // Legacy or other provider logic
      if (input.category) query.category = input.category;
      if (input.parent) query.parent = input.parent;
      if (input.status) query.status = input.status;
      if (input.featured !== undefined) query.featured = input.featured;
      if (input.breaking !== undefined) query.breaking = input.breaking;
      if (input.editorsPick !== undefined) query.editorsPick = input.editorsPick;
      if (input.contentType) query.contentType = input.contentType;
      query.limit = input.limit;
      query.offset = input.offset;
      if (input.search) query.search = input.search;
      if (input.author) query.author = input.author;
      if (input.orderBy) query.orderBy = input.orderBy;
      if (input.order) query.order = input.order;
      if (!query.orderBy) query.orderBy = 'publishedDate';
      if (!query.order) query.order = 'desc';
    }
    return query;
  };

  const flattenStrapi = (data: any): any => {
    if (!data) return null;
    if (Array.isArray(data)) return data.map(flattenStrapi);
    if (data.data) return flattenStrapi(data.data);
    
    const attributes = data.attributes || data;
    const id = data.id;
    
    const flat: Record<string, any> = {
      id,
      documentId: data.documentId,
      publishedAt: data.publishedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ...attributes,
    };

    // Map featured_image to image (for News Articles)
    if (flat.featured_image && !flat.image) {
        flat.image = flat.featured_image;
    }

    // Handle image relation flattening
    if (flat.image && typeof flat.image === 'object') {
      const imgData = flat.image.data;
      if (imgData) {
         // Handle single image
         if (!Array.isArray(imgData)) {
            flat.image = imgData.attributes?.url || imgData.url || null;
         }
      }
    }
    
    // Handle category relation flattening if needed
    if (flat.category && typeof flat.category === 'object') {
       const catData = flat.category.data;
       if (catData && !Array.isArray(catData)) {
          flat.category = catData.attributes?.slug || catData.slug || flat.category;
          flat.categoryHindi = catData.attributes?.titleHindi || catData.titleHindi || flat.categoryHindi;
       }
    }

    // Map meta_description to seoDescription for frontend compatibility
    if (flat.meta_description && !flat.seoDescription) {
      flat.seoDescription = flat.meta_description;
    }

    // Map SEO title
    if (flat.seo_title && !flat.seoTitle) {
      flat.seoTitle = flat.seo_title;
    }

    // Normalize OpenGraph fields
    if (flat.og_title) {
      flat.ogTitle = flat.og_title;
    }
    if (flat.og_description) {
      flat.ogDescription = flat.og_description;
    }

    return flat;
  };

  const getArticles = async (params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> => {
    const query = buildArticleQuery(params);

    try {
      // Use standard 'articles' endpoint (v5 plural ID)
      const response = await fetchJson<any>(
        buildUrl('/articles', query),
        { method: 'GET', headers: getAuthHeaders(true) }
      );

      if (!response) {
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: params?.limit || 10,
          totalPages: 0,
        };
      }

      // Flatten and normalize
      const rawData = response.data || [];
      const flatData = flattenStrapi(rawData);
      const normalized = normalizeArticleListMedia(flatData);

      if (params?.category) {
        const slug = String(params.category || '').trim().toLowerCase();
        if (slug) {
          const filtered = normalized.filter(
            (article) => String(article.category || '').trim().toLowerCase() === slug,
          );
          return {
            ...response,
            data: filtered,
          };
        }
      }
      return {
        ...response,
        data: normalized,
      };
    } catch (error) {
      console.error('getArticles failed:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: params?.limit || 10,
        totalPages: 0,
      };
    }
  };

  return {
    async getArticles(params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> {
      return getArticles(params);
    },

    async getArticleById(id: string): Promise<CMSArticle | null> {
      const query = isStrapi
        ? {
            'filters[$or][0][id][$eq]': id,
            'filters[$or][1][documentId][$eq]': id,
            populate: '*',
          }
        : {};

      const response = await fetchJson<any>(
        buildUrl('/articles', query),
        { method: 'GET', headers: getAuthHeaders(true) },
        { allowNotFound: true }
      );
      
      const raw = Array.isArray(response?.data) ? response.data[0] : response?.data;
      if (!raw) return null;
      const flat = flattenStrapi(raw);
      return normalizeArticleMedia(flat);
    },

    async getArticleBySlug(slug: string, options?: { preview?: boolean; previewToken?: string }): Promise<CMSArticle | null> {
      const encodedSlug = encodeURIComponent(slug);
      const isPreview = options?.preview === true;
      const previewToken = options?.previewToken;

      // Build query params for preview mode
      const params: Record<string, string | number | boolean | undefined> = {};
      if (isPreview && previewToken) {
        params.preview = 'true';
        params.token = previewToken;
      }

      const response = await fetchJson<any>(
        buildUrl(`/articles/slug/${encodedSlug}`, isPreview ? params : undefined),
        { method: 'GET', headers: getAuthHeaders(true) },
        { allowNotFound: true }
      );
      const raw = response?.data ?? response;

      // Only fall back to editorials if the article endpoint returned nothing (true 404).
      if (!raw) {
        const editorialResponse = await fetchJson<any>(
          buildUrl(`/editorials/slug/${encodedSlug}`),
          { method: 'GET', headers: getAuthHeaders(true) },
          { allowNotFound: true }
        );
        const editorialRaw = editorialResponse?.data ?? editorialResponse;
        if (!editorialRaw) return null;
        return normalizeArticleMedia(flattenStrapi(editorialRaw));
      }

      return normalizeArticleMedia(flattenStrapi(raw));
    },

    async createArticle(article: Omit<CMSArticle, 'id'>): Promise<CMSArticle> {
      const init: RequestInit = {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      };

      let result: CMSArticle | null = null;
      if (isStrapi) {
        try {
          result = await fetchJson<CMSArticle>(buildProxyUrl('/articles'), {
            ...init,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          if (
            config.apiKey &&
            error instanceof HttpError &&
            (error.status === 401 || error.status === 403 || error.status === 404)
          ) {
            result = await fetchJson<CMSArticle>(buildUrl('/articles'), init);
          } else {
            throw error;
          }
        }
      } else {
        result = await fetchJson<CMSArticle>(buildUrl('/articles'), init);
      }
      if (!result) {
        throw new Error('Article creation failed');
      }
      return result;
    },

    async updateArticle(id: string, article: Partial<CMSArticle>): Promise<CMSArticle> {
      const init: RequestInit = {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      };

      let result: CMSArticle | null = null;
      if (isStrapi) {
        try {
          result = await fetchJson<CMSArticle>(buildProxyUrl(`/articles/${id}`), {
            ...init,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          if (
            config.apiKey &&
            error instanceof HttpError &&
            (error.status === 401 || error.status === 403 || error.status === 404)
          ) {
            result = await fetchJson<CMSArticle>(buildUrl(`/articles/${id}`), init);
          } else {
            throw error;
          }
        }
      } else {
        result = await fetchJson<CMSArticle>(buildUrl(`/articles/${id}`), init);
      }
      if (!result) {
        throw new Error('Article update failed');
      }
      return result;
    },

    async publishArticle(id: string): Promise<CMSArticle> {
      const init: RequestInit = {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      };

      let result: CMSArticle | null = null;
      if (isStrapi) {
        try {
          result = await fetchJson<CMSArticle>(buildProxyUrl(`/articles/${id}/publish`), {
            ...init,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          if (
            config.apiKey &&
            error instanceof HttpError &&
            (error.status === 401 || error.status === 403 || error.status === 404)
          ) {
            result = await fetchJson<CMSArticle>(buildUrl(`/articles/${id}/publish`), init);
          } else {
            throw error;
          }
        }
      } else {
        result = await fetchJson<CMSArticle>(buildUrl(`/articles/${id}/publish`), init);
      }
      if (!result) {
        throw new Error('Article publish failed');
      }
      return result;
    },

    async unpublishArticle(id: string): Promise<CMSArticle> {
      const init: RequestInit = {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      };

      let result: CMSArticle | null = null;
      if (isStrapi) {
        try {
          result = await fetchJson<CMSArticle>(buildProxyUrl(`/articles/${id}/unpublish`), {
            ...init,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          if (
            config.apiKey &&
            error instanceof HttpError &&
            (error.status === 401 || error.status === 403 || error.status === 404)
          ) {
            result = await fetchJson<CMSArticle>(buildUrl(`/articles/${id}/unpublish`), init);
          } else {
            throw error;
          }
        }
      } else {
        result = await fetchJson<CMSArticle>(buildUrl(`/articles/${id}/unpublish`), init);
      }
      if (!result) {
        throw new Error('Article unpublish failed');
      }
      return result;
    },

    async deleteArticle(id: string): Promise<void> {
      if (isStrapi) {
        try {
          await fetchJson<null>(
            buildProxyUrl(`/articles/${id}`),
            {
              method: 'DELETE',
            },
            { allowNotFound: false },
          );
          return;
        } catch (error) {
          if (
            config.apiKey &&
            error instanceof HttpError &&
            (error.status === 401 || error.status === 403 || error.status === 404)
          ) {
            await fetchJson<null>(
              buildUrl(`/articles/${id}`),
              {
                method: 'DELETE',
                headers: getAuthHeaders(),
              },
              { allowNotFound: false },
            );
            return;
          }
          throw error;
        }
      }

      await fetchJson<null>(
        buildUrl(`/articles/${id}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
        { allowNotFound: false },
      );
    },

    async getCategories(): Promise<CMSCategory[]> {
      const query = isStrapi ? { 'pagination[limit]': 1000 } : { limit: 1000 };
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSCategory[] | null>(buildUrl('/categories', query), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      try {
        return (await tryFetch(false)) || [];
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          return (await tryFetch(true)) || [];
        }
        throw error;
      }
    },

    async getCategoryById(id: string): Promise<CMSCategory | null> {
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSCategory | null>(buildUrl(`/categories/${id}`), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      try {
        return await tryFetch(false);
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          return await tryFetch(true);
        }
        throw error;
      }
    },

    async getCategoryBySlug(slug: string): Promise<CMSCategory | null> {
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSCategory | null>(buildUrl(`/categories/slug/${encodeURIComponent(slug)}`), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      try {
        return await tryFetch(false);
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          return await tryFetch(true);
        }
        throw error;
      }
    },

    async createCategory(category: Omit<CMSCategory, 'id'>): Promise<CMSCategory> {
      const result = await fetchJson<CMSCategory>(buildUrl('/categories'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      if (!result) {
        throw new Error('Category creation failed');
      }
      return result;
    },

    async updateCategory(id: string, category: Partial<CMSCategory>): Promise<CMSCategory> {
      const result = await fetchJson<CMSCategory>(buildUrl(`/categories/${id}`), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      if (!result) {
        throw new Error('Category update failed');
      }
      return result;
    },

    async deleteCategory(id: string): Promise<void> {
      await fetchJson<null>(
        buildUrl(`/categories/${id}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
        { allowNotFound: false },
      );
    },

    async getAuthors(): Promise<CMSAuthor[]> {
      const query = isStrapi ? { 'pagination[limit]': 1000 } : { limit: 1000 };
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSAuthor[] | null>(buildUrl('/authors', query), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      try {
        return (await tryFetch(false)) || [];
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          return (await tryFetch(true)) || [];
        }
        throw error;
      }
    },

    async getAuthorById(id: string): Promise<CMSAuthor | null> {
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSAuthor | null>(buildUrl(`/authors/${id}`), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      try {
        return await tryFetch(false);
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          return await tryFetch(true);
        }
        throw error;
      }
    },

    async createAuthor(author: Omit<CMSAuthor, 'id'>): Promise<CMSAuthor> {
      const result = await fetchJson<CMSAuthor>(buildUrl('/authors'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(author),
      });
      if (!result) {
        throw new Error('Author creation failed');
      }
      return result;
    },

    async updateAuthor(id: string, author: Partial<CMSAuthor>): Promise<CMSAuthor> {
      const result = await fetchJson<CMSAuthor>(buildUrl(`/authors/${id}`), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(author),
      });
      if (!result) {
        throw new Error('Author update failed');
      }
      return result;
    },

    async deleteAuthor(id: string): Promise<void> {
      await fetchJson<null>(
        buildUrl(`/authors/${id}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        },
        { allowNotFound: false },
      );
    },

    async getTags(): Promise<CMSTag[]> {
      const query = isStrapi ? { 'pagination[limit]': 1000 } : { limit: 1000 };
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSTag[] | null>(buildUrl('/tags', query), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      try {
        return (await tryFetch(false)) || [];
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          return (await tryFetch(true)) || [];
        }
        throw error;
      }
    },

    async getMedia(limit?: number): Promise<CMSMedia[]> {
      const params = limit ? { limit } : undefined;
      const origin = getStrapiOrigin();

      const tryUploadFiles = async () => {
        const result = await fetchJson<any[]>(
          buildUrl('/upload/files', params),
          {
            method: 'GET',
            headers: getAuthHeaders(),
          },
          { allowNotFound: false },
        );
        if (!result) return [];
        return result.map((f) => normalizeStrapiUploadFile(f, origin)).filter(Boolean) as CMSMedia[];
      };

      const tryMediaWrapper = async () => {
        const result = await fetchJson<CMSMedia[] | null>(buildUrl('/media', params), {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        return result || [];
      };

      try {
        if (isStrapi) return await tryUploadFiles();
      } catch (error) {
        if (error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) {
          return await tryMediaWrapper();
        }
        throw error;
      }

      return await tryMediaWrapper();
    },

    async uploadMedia(file: File): Promise<CMSMedia> {
      const origin = getStrapiOrigin();
      const formData = new FormData();
      formData.append('files', file);

      const tryUpload = async () => {
        const uploaded = await fetchJson<any>(
          buildUrl('/upload'),
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
          },
          { allowNotFound: false },
        );
        const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
        const normalized = normalizeStrapiUploadFile(first, origin);
        if (!normalized) {
          throw new Error('Media upload returned an unexpected response');
        }
        return normalized;
      };

      const tryMediaWrapper = async () => {
        const result = await fetchJson<CMSMedia>(buildUrl('/media'), {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        });
        return result;
      };

      if (!isStrapi) {
        return await tryMediaWrapper();
      }

      try {
        return await tryUpload();
      } catch (error) {
        if (error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) {
          return await tryMediaWrapper();
        }
        throw error;
      }
    },

    async deleteMedia(id: string): Promise<void> {
      const tryUploadFilesDelete = async () => {
        await fetchJson<null>(
          buildUrl(`/upload/files/${encodeURIComponent(id)}`),
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          },
          { allowNotFound: false },
        );
      };

      const tryMediaWrapperDelete = async () => {
        await fetchJson<null>(buildUrl(`/media/${encodeURIComponent(id)}`), {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      };

      try {
        if (isStrapi) {
          await tryUploadFilesDelete();
          return;
        }
      } catch (error) {
        if (error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) {
          await tryMediaWrapperDelete();
          return;
        }
        throw error;
      }

      await tryMediaWrapperDelete();
    },

    async getSettings(): Promise<CMSSettings> {
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSSettings | null>(buildUrl('/settings'), {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        });

      let result: CMSSettings | null = null;
      try {
        result = await tryFetch(false);
      } catch (error) {
        if (
          isStrapi &&
          config.apiKey &&
          error instanceof HttpError &&
          (error.status === 401 || error.status === 403)
        ) {
          result = await tryFetch(true);
        } else {
          throw error;
        }
      }
      if (result) {
        return result;
      }
      const fallback: CMSSettings = {
        siteName: 'Rampur News',
        siteNameHindi: 'रामपुर न्यूज़',
        tagline: '',
        logo: '/logo.png',
        favicon: '/favicon.ico',
        socialLinks: {},
        gscPropertyUrl: '',
        gscExportUrl: '',
        backlinkReportUrl: '',
        referringDomains: [],
        backlinkNotes: '',
        lastBacklinkSync: '',
      };
      return fallback;
    },

    async updateSettings(settings: Partial<CMSSettings>): Promise<CMSSettings> {
      const result = await fetchJson<CMSSettings>(buildUrl('/settings'), {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      if (!result) {
        throw new Error('Settings update failed');
      }
      return result;
    },

    async getHeroArticles(limit = 5): Promise<CMSArticle[]> {
      const desiredLimit = Math.max(1, limit || 5);
      const result = await getArticles({
        status: 'published',
        limit: desiredLimit * 4,
        orderBy: 'publishedAt',
        order: 'desc',
      });
      const items = result?.data || [];
      const filtered = items.filter((article) => article.isFeatured || article.isBreaking);
      const map = new Map<string, CMSArticle>();
      for (const article of filtered) {
        if (!map.has(article.id)) {
          map.set(article.id, article);
        }
      }
      return Array.from(map.values()).slice(0, desiredLimit);
    },

    async getFeaturedArticles(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({ featured: true, status: 'published', limit });
      return result.data;
    },

    async getBreakingNews(limit = 5): Promise<CMSArticle[]> {
      // Fetch latest news for ticker without 'breaking' filter to ensure updates
      // Using news-articles endpoint via getArticles
      const result = await getArticles({ 
        status: 'published', 
        breaking: true,
        limit: 20, // Fetch more to allow client-side filtering
        orderBy: 'publishedAt',
        order: 'desc'
      });

      const now = Date.now();
      const cutoff = now - 72 * 60 * 60 * 1000; // 72 hours ago

      const filtered = result.data.filter(article => {
        const pubDate = article.publishedAt || article.publishedDate;
        if (!pubDate) return false;
        return new Date(pubDate).getTime() >= cutoff;
      });

      return filtered.slice(0, limit);
    },

    async getTodaysTopNews(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({
        status: 'published',
        todaysTop: true,
        limit: 20, // Fetch more to allow client-side filtering
        orderBy: 'publishedAt',
        order: 'desc',
      });

      const now = Date.now();
      const cutoff = now - 48 * 60 * 60 * 1000; // 48 hours ago

      const filtered = result.data.filter(article => {
        const pubDate = article.publishedAt || article.publishedDate;
        if (!pubDate) return false;
        return new Date(pubDate).getTime() >= cutoff;
      });

      return filtered.slice(0, limit);
    },

    async getTrendingArticles(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({ status: 'published', orderBy: 'views', order: 'desc', limit });
      return result.data;
    },

    async getArticlesByCategory(
      categorySlug: string,
      limit = 10
    ): Promise<CMSArticle[]> {
      const result = await getArticles({
        category: categorySlug,
        status: 'published',
        limit,
        orderBy: 'publishedAt',
        order: 'desc',
      });
      return result.data;
    },

    async searchArticles(query: string, limit = 20): Promise<CMSArticle[]> {
      const result = await getArticles({
        search: query,
        status: 'published',
        limit,
        orderBy: 'publishedAt',
        order: 'desc',
      });
      return result.data;
    },

    // ─── Editorial methods ──────────────────────────────────────────────────

    async getEditorials(params?: EditorialQueryParams): Promise<PaginatedResponse<CMSEditorial>> {
      const query: Record<string, string | number | boolean | undefined> = {};

      if (params?.editorialType && params.editorialType !== 'all') {
        if (isStrapi) {
           query['filters[editorialType][$eq]'] = params.editorialType;
        } else {
           query.editorialType = params.editorialType;
        }
      }
      if (params?.isEditorsPick !== undefined) {
          if (isStrapi) query['filters[isEditorsPick][$eq]'] = params.isEditorsPick;
          else query.isEditorsPick = params.isEditorsPick;
      }
      if (params?.isFeatured !== undefined) {
          if (isStrapi) query['filters[isFeatured][$eq]'] = params.isFeatured;
          else query.isFeatured = params.isFeatured;
      }
      if (params?.limit !== undefined) {
        if (isStrapi) {
          query['pagination[limit]'] = params.limit;
        } else {
          query.limit = params.limit;
        }
      }
      if (params?.offset !== undefined) {
        if (isStrapi) {
          query['pagination[start]'] = params.offset;
        } else {
          query.offset = params.offset;
        }
      }
      if (params?.search) {
         if (isStrapi) query['filters[title][$containsi]'] = params.search;
         else query.search = params.search;
      }

      const sortField = params?.orderBy === 'views' ? 'views' : params?.orderBy === 'title' ? 'title' : 'publishedAt';
      const sortDir = params?.order === 'asc' ? 'asc' : 'desc';
      
      if (isStrapi) {
        query['sort'] = `${sortField}:${sortDir}`;
        query['populate'] = '*';
        query['publicationState'] = 'live';
      } else {
        query.sort = `${sortField}:${sortDir}`;
      }

      try {
        const response = await fetchJson<any>(
          buildUrl('/editorials', query),
          { method: 'GET', headers: getAuthHeaders(true) }
        );

        if (!response) {
            return {
            data: [],
            total: 0,
            page: 1,
            pageSize: params?.limit || 20,
            totalPages: 0,
            };
        }

        // Flatten and Normalize
        const rawData = response.data || [];
        const flatData = flattenStrapi(rawData);

        // Keep only publicly viewable editorials to avoid homepage links that 404 on detail pages
        const publishedOnly = flatData.filter((editorial: any) => {
          const status = String(editorial?.status || '').toLowerCase();
          const hasPublishedAt = Boolean(editorial?.publishedAt || editorial?.publishedDate);
          if (status === 'published') return true;
          return hasPublishedAt;
        });

        // Normalize media URLs in editorial list
        const origin = getStrapiOrigin() || getStrapiMediaOriginFromEnv();
        const data = publishedOnly.map((editorial: any) => {
            if (!origin) return editorial;
            const rawImage = extractStrapiMediaUrlLike((editorial as any)?.image);
            if (!rawImage) return editorial;
            const image = resolveStrapiMediaUrl(origin, rawImage);
            return image && image !== (editorial as any).image ? { ...editorial, image } : editorial;
        });

        return {
          ...response,
          data,
          total: data.length,
          pageSize: params?.limit || data.length || 20,
          totalPages: 1,
        };

      } catch (error) {
        console.error('[CMS] getEditorials failed:', error);
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: params?.limit || 20,
          totalPages: 0,
        };
      }
    },

    async getEditorialBySlug(slug: string): Promise<CMSEditorial | null> {
      const encodedSlug = encodeURIComponent(slug);
   
      const response = await fetchJson<any>(
        buildUrl(`/editorials/slug/${encodedSlug}`),
        { method: 'GET', headers: getAuthHeaders(true) },
        { allowNotFound: true }
      );
   
      const raw = response?.data ?? response;
      
      if (!raw) return null;
      
      const flat = flattenStrapi(raw);
      
      // Normalize media
      const origin = getStrapiOrigin() || getStrapiMediaOriginFromEnv();
      if (origin && flat.image) {
          const rawImage = extractStrapiMediaUrlLike(flat.image);
          if (rawImage) {
              const image = resolveStrapiMediaUrl(origin, rawImage);
              if (image) flat.image = image;
          }
      }
      
      return flat;
    },

    // ─── Advertisement methods ──────────────────────────────────────────────────

    async getAds(params?: AdQueryParams): Promise<CMSAd[]> {
      const query: Record<string, string | number | boolean | undefined> = {};

      if (params?.placement) {
        if (isStrapi) {
          query['filters[placement][$eq]'] = params.placement;
        } else {
          query.placement = params.placement;
        }
      }
      if (params?.isActive !== undefined) {
        if (isStrapi) {
          query['filters[isActive][$eq]'] = params.isActive;
        } else {
          query.isActive = params.isActive;
        }
      }
      if (params?.limit) {
        if (isStrapi) {
          query['pagination[limit]'] = params.limit;
        } else {
          query.limit = params.limit;
        }
      }

      const response = await fetchJson<any>(
        buildUrl('/ads', query),
        { method: 'GET', headers: getAuthHeaders(true) }
      );

      const rawData = response?.data ?? response;
      if (!rawData) return [];

      const ads = Array.isArray(rawData) ? rawData : [rawData];
      return ads.map((ad: any) => flattenStrapi(ad));
    },

    async getAdById(id: string): Promise<CMSAd | null> {
      const response = await fetchJson<any>(
        buildUrl(`/ads/${id}`),
        { method: 'GET', headers: getAuthHeaders(true) },
        { allowNotFound: true }
      );

      const raw = response?.data ?? response;
      if (!raw) return null;
      return flattenStrapi(raw);
    },

    async createAd(ad: Omit<CMSAd, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSAd> {
      const response = await fetchJson<any>(
        buildUrl('/ads'),
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(true),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: ad }),
        }
      );

      const raw = response?.data ?? response;
      return flattenStrapi(raw);
    },

    async updateAd(id: string, updates: Partial<CMSAd>): Promise<CMSAd> {
      const response = await fetchJson<any>(
        buildUrl(`/ads/${id}`),
        {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(true),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: updates }),
        }
      );

      const raw = response?.data ?? response;
      return flattenStrapi(raw);
    },

    async deleteAd(id: string): Promise<void> {
      await fetchJson<any>(
        buildUrl(`/ads/${id}`),
        {
          method: 'DELETE',
          headers: getAuthHeaders(true),
        }
      );
    },
  };
};

const getEnvStrapiUrl = () => {
  if (typeof process !== 'undefined' && process.env) {
    const isBrowser = typeof window !== 'undefined';
    const url = isBrowser
      ? process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_URL ||
        process.env.NEXT_PUBLIC_STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_BASE_URL
      : process.env.STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
        process.env.NEXT_PUBLIC_STRAPI_URL ||
        process.env.STRAPI_URL;
    if (url) return normalizeStrapiBaseUrl(url);
    
    if (process.env.NODE_ENV === 'production') {
      return normalizeStrapiBaseUrl('https://api.rampur.cloud/api');
    }
    
    return normalizeStrapiBaseUrl('http://localhost:1337/api');
  }
  return '';
};

const defaultConfig: CMSConfig = {
  provider: 'strapi',
  baseUrl: getEnvStrapiUrl(),
};

let currentConfig: CMSConfig = defaultConfig;

const providerInstances: Partial<Record<CMSProviderType, CMSProvider>> = {
  // Only register mock provider when explicitly configured — avoids bundling
  // mock data in production builds where provider is always 'strapi'.
  ...(process.env.NEXT_PUBLIC_CMS_PROVIDER === 'mock' ? { mock: mockCMSProvider } : {}),
  strapi: createRestCMSProvider(defaultConfig),
};

let didHydrateFromStorage = false;

const hydrateCMSConfigFromStorage = (): void => {
  if (didHydrateFromStorage) return;
  if (typeof window === 'undefined') return;
  didHydrateFromStorage = true;

  try {
    const savedStrapi = window.localStorage.getItem('strapi_config');
    if (savedStrapi) {
      const parsed = JSON.parse(savedStrapi) as { baseUrl?: string; apiKey?: string } | null;
      const baseUrl = typeof parsed?.baseUrl === 'string' ? normalizeStrapiBaseUrl(parsed.baseUrl) : '';
      if (baseUrl) {
        configureCMS({
          provider: 'strapi',
          baseUrl,
          apiKey: parsed?.apiKey || undefined,
        });
        return;
      }
    }
  } catch (error) {
    void error;
  }

};

export const getCMSProvider = (): CMSProvider => {
  hydrateCMSConfigFromStorage();
  const provider = providerInstances[currentConfig.provider];
  if (!provider) {
    console.warn(`CMS provider "${currentConfig.provider}" not available, falling back to mock`);
    return mockCMSProvider;
  }
  return provider;
};

export const configureCMS = (config: CMSConfig): void => {
  currentConfig = config;

  if ((config.provider === 'strapi' || config.provider === 'django' || config.provider === 'custom') && config.baseUrl) {
    providerInstances[config.provider] = createRestCMSProvider(config);
  }
};

export const getCMSConfig = (): CMSConfig => {
  hydrateCMSConfigFromStorage();
  return currentConfig;
};

export const registerCMSProvider = (type: CMSProviderType, provider: CMSProvider): void => {
  providerInstances[type] = provider;
};

export const cms = {
  get provider() {
    return getCMSProvider();
  },
  configure: configureCMS,
  getConfig: getCMSConfig,
  register: registerCMSProvider,
};

export default cms;
