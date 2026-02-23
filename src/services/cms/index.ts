// CMS Service - Main export with provider switching
import type { CMSProvider, CMSConfig, CMSProviderType } from './provider';
import type {
  CMSArticle,
  CMSCategory,
  CMSAuthor,
  CMSMedia,
  CMSTag,
  CMSSettings,
  ArticleQueryParams,
  PaginatedResponse,
  CMSEditorial,
  EditorialQueryParams,
} from './types';
import { mockCMSProvider } from './mockProvider';
import { createWordPressProvider } from './wordpressProvider';

export * from './types';
export * from './provider';
export { createWordPressProvider } from './wordpressProvider';

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
  const canUseStrapiAdmin = isStrapi && !!config.apiKey && typeof window === 'undefined';

  const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
    if (isStrapi && typeof window !== 'undefined') {
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
    return `/api/cms/strapi${path}${qs ? `?${qs}` : ''}`;
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
    options?: { allowNotFound?: boolean },
  ) => {
    const isServer = typeof window === 'undefined';
    const method = String(init?.method || 'GET').toUpperCase();
    const shouldCache = isServer && method === 'GET';
    const defaultInit = shouldCache
      ? ({ cache: 'force-cache', next: { revalidate: 30 } } as any)
      : ({ cache: 'no-store' } as any);
    const response = await fetch(input, { ...defaultInit, ...(init as any) } as any);
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
    if (input.category) query.category = input.category;
    if (input.parent) query.parent = input.parent;
    if (input.status) query.status = input.status;
    if (input.featured !== undefined) query.featured = input.featured;
    if (input.breaking !== undefined) query.breaking = input.breaking;
    if (input.editorsPick !== undefined) query.editorsPick = input.editorsPick;
    if (input.contentType) query.contentType = input.contentType;
    if (input.limit !== undefined) {
      if (isStrapi) {
        query.limit = input.limit;
      } else {
        query.limit = input.limit;
      }
    }
    if (input.offset !== undefined) {
      if (isStrapi) {
        query.offset = input.offset;
      } else {
        query.offset = input.offset;
      }
    }
    if (input.search) query.search = input.search;
    if (input.author) query.author = input.author;
    if (input.orderBy) query.orderBy = input.orderBy;
    if (input.order) query.order = input.order;
    if (!query.orderBy) query.orderBy = 'publishedDate';
    if (!query.order) query.order = 'desc';
    return query;
  };

  const getArticles = async (params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> => {
    const query = buildArticleQuery(params);
    const shouldTryAdmin = canUseStrapiAdmin;
    const path = shouldTryAdmin ? '/articles/admin' : '/articles';

    const tryFetch = async (
      endpointPath: string,
      includeApiKey: boolean,
      allowNotFound?: boolean,
      useProxy?: boolean,
    ) =>
      fetchJson<PaginatedResponse<CMSArticle>>(
        useProxy ? buildProxyUrl(endpointPath, query) : buildUrl(endpointPath, query),
        {
          method: 'GET',
          headers: getAuthHeaders(includeApiKey),
        },
        { allowNotFound },
      );

    let result: PaginatedResponse<CMSArticle> | null = null;
    try {
      if (shouldTryAdmin) {
        result = await tryFetch('/articles/admin', true, false, false);
      } else {
        result = await tryFetch(path, false, undefined, false);
      }
    } catch (error) {
      if (
        shouldTryAdmin &&
        ((error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) ||
          error instanceof TypeError)
      ) {
        try {
          result = await tryFetch('/articles', false, undefined, false);
        } catch (fallbackError) {
          if (
            config.apiKey &&
            typeof window === 'undefined' &&
            fallbackError instanceof HttpError &&
            (fallbackError.status === 401 || fallbackError.status === 403)
          ) {
            result = await tryFetch('/articles', true, undefined, false);
          } else {
            throw fallbackError;
          }
        }
      } else {
        throw error;
      }
    }
    if (!result) {
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: params?.limit || 10,
        totalPages: 0,
      };
    }
    const normalized = normalizeArticleListMedia(result.data);
    const orderBy = (params?.orderBy as unknown as string | undefined) || undefined;
    const shouldDateSort = !orderBy || orderBy === 'publishedDate' || orderBy === 'publishedAt';
    const dateSorted = shouldDateSort
      ? [...normalized].sort((a, b) => {
          const aDate = a.publishedDate || a.publishedAt || '';
          const bDate = b.publishedDate || b.publishedAt || '';
          const aTime = aDate ? new Date(aDate).getTime() : 0;
          const bTime = bDate ? new Date(bDate).getTime() : 0;
          return (params?.order || 'desc') === 'asc' ? aTime - bTime : bTime - aTime;
        })
      : normalized;
    return {
      ...result,
      data: dateSorted,
    };
  };

  return {
    async getArticles(params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> {
      return getArticles(params);
    },

    async getArticleById(id: string): Promise<CMSArticle | null> {
      const shouldTryAdmin = canUseStrapiAdmin;
      const path = shouldTryAdmin ? `/articles/admin/${id}` : `/articles/${id}`;

      const tryFetch = async (
        endpointPath: string,
        includeApiKey: boolean,
        allowNotFound?: boolean,
        useProxy?: boolean,
      ) =>
        fetchJson<CMSArticle | null>(
          useProxy ? buildProxyUrl(endpointPath) : buildUrl(endpointPath),
          {
            method: 'GET',
            headers: getAuthHeaders(includeApiKey),
          },
          { allowNotFound },
        );

      try {
        if (shouldTryAdmin) {
          return normalizeArticleMedia(await tryFetch(`/articles/admin/${id}`, true, false, false));
        }
        return normalizeArticleMedia(await tryFetch(path, false, undefined, false));
      } catch (error) {
        if (
          shouldTryAdmin &&
          ((error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) ||
            error instanceof TypeError)
        ) {
          try {
            return normalizeArticleMedia(await tryFetch(`/articles/${id}`, false, undefined, false));
          } catch (fallbackError) {
            if (
              config.apiKey &&
              typeof window === 'undefined' &&
              fallbackError instanceof HttpError &&
              (fallbackError.status === 401 || fallbackError.status === 403)
            ) {
              return normalizeArticleMedia(await tryFetch(`/articles/${id}`, true, undefined, false));
            }
            throw fallbackError;
          }
        }
        throw error;
      }
    },

    async getArticleBySlug(slug: string): Promise<CMSArticle | null> {
      const shouldTryAdmin = canUseStrapiAdmin;
      const path = shouldTryAdmin
        ? `/articles/admin/slug/${encodeURIComponent(slug)}`
        : `/articles/slug/${encodeURIComponent(slug)}`;

      const tryFetch = async (
        endpointPath: string,
        includeApiKey: boolean,
        allowNotFound?: boolean,
        useProxy?: boolean,
      ) =>
        fetchJson<CMSArticle | null>(
          useProxy ? buildProxyUrl(endpointPath) : buildUrl(endpointPath),
          {
            method: 'GET',
            headers: getAuthHeaders(includeApiKey),
          },
          { allowNotFound },
        );

      try {
        if (shouldTryAdmin) {
          return normalizeArticleMedia(
            await tryFetch(`/articles/admin/slug/${encodeURIComponent(slug)}`, true, false, false),
          );
        }
        return normalizeArticleMedia(await tryFetch(path, false, undefined, false));
      } catch (error) {
        if (
          shouldTryAdmin &&
          ((error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) ||
            error instanceof TypeError)
        ) {
          try {
            return normalizeArticleMedia(await tryFetch(`/articles/slug/${encodeURIComponent(slug)}`, false, undefined, false));
          } catch (fallbackError) {
            if (
              config.apiKey &&
              typeof window === 'undefined' &&
              fallbackError instanceof HttpError &&
              (fallbackError.status === 401 || fallbackError.status === 403)
            ) {
              return normalizeArticleMedia(await tryFetch(`/articles/slug/${encodeURIComponent(slug)}`, true, undefined, false));
            }
            throw fallbackError;
          }
        }
        throw error;
      }
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

      let combined: CMSArticle[] = [];
      try {
        const items = await fetchJson<CMSArticle[]>(buildUrl('/articles/featured-hero', { limit: desiredLimit }));
        combined = normalizeArticleListMedia(items || []);
      } catch {
        combined = [];
      }

      if (combined.length >= desiredLimit) {
        return combined.slice(0, desiredLimit);
      }

      const [featuredResult, breakingResult] = await Promise.all([
        getArticles({ featured: true, status: 'published', limit: desiredLimit }),
        getArticles({ breaking: true, status: 'published', limit: desiredLimit }),
      ]);

      const map = new Map<string, CMSArticle>();
      for (const article of combined) {
        if (article && !map.has(article.id)) {
          map.set(article.id, article);
        }
      }

      const addList = (items?: CMSArticle[]) => {
        if (!items) return;
        for (const article of items) {
          if (article && !map.has(article.id)) {
            map.set(article.id, article);
          }
        }
      };

      addList(featuredResult?.data);
      addList(breakingResult?.data);

      const merged = Array.from(map.values());
      merged.sort((a, b) => {
        const aDate = a.publishedDate || a.publishedAt || '';
        const bDate = b.publishedDate || b.publishedAt || '';
        const aTime = aDate ? new Date(aDate).getTime() : 0;
        const bTime = bDate ? new Date(bDate).getTime() : 0;
        return bTime - aTime;
      });

      return merged.slice(0, desiredLimit);
    },

    async getFeaturedArticles(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({ featured: true, status: 'published', limit });
      return result.data;
    },

    async getBreakingNews(limit = 5): Promise<CMSArticle[]> {
      try {
        const items = await fetchJson<CMSArticle[]>(buildUrl('/articles/breaking', { limit }));
        return normalizeArticleListMedia(items || []);
      } catch {
        const result = await getArticles({ breaking: true, status: 'published', limit });
        return result.data;
      }
    },

    async getTrendingArticles(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({ status: 'published', orderBy: 'views', order: 'desc', limit });
      return result.data;
    },

    async getArticlesByCategory(categorySlug: string, limit = 10): Promise<CMSArticle[]> {
      const result = await getArticles({ category: categorySlug, status: 'published', limit });
      return result.data;
    },

    async searchArticles(query: string, limit = 20): Promise<CMSArticle[]> {
      const result = await getArticles({ search: query, status: 'published', limit });
      return result.data;
    },

    // ─── Editorial methods ──────────────────────────────────────────────────

    async getEditorials(params?: EditorialQueryParams): Promise<PaginatedResponse<CMSEditorial>> {
      const query: Record<string, string | number | boolean | undefined> = {};

      if (params?.editorialType && params.editorialType !== 'all') {
        query.editorialType = params.editorialType;
      }
      if (params?.isEditorsPick !== undefined) query.isEditorsPick = params.isEditorsPick;
      if (params?.isFeatured !== undefined) query.isFeatured = params.isFeatured;
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
      if (params?.search) query.search = params.search;

      const sortField = params?.orderBy === 'views' ? 'views' : params?.orderBy === 'title' ? 'title' : 'publishedAt';
      const sortDir = params?.order === 'asc' ? 'asc' : 'desc';
      query.sort = `${sortField}:${sortDir}`;

      const isServer = typeof window === 'undefined';

      // On the server, try the direct Strapi URL first (avoids the Next.js proxy hop).
      // On the client, always use the proxy to avoid CORS issues.
      const tryDirectFetch = () =>
        fetchJson<PaginatedResponse<CMSEditorial>>(
          buildUrl('/editorials', query),
          { method: 'GET', headers: getAuthHeaders(false) },
        );

      const tryProxyFetch = () =>
        fetchJson<PaginatedResponse<CMSEditorial>>(
          buildProxyUrl('/editorials', query),
          { method: 'GET', headers: getAuthHeaders(false) },
        );

      let result: PaginatedResponse<CMSEditorial> | null = null;
      try {
        if (isServer) {
          // Server-side: try direct URL first, fall back to proxy
          try {
            result = await tryDirectFetch();
          } catch (directError) {
            console.error('[CMS] getEditorials direct fetch failed, trying proxy:', directError);
            result = await tryProxyFetch();
          }
        } else {
          // Client-side: always use proxy
          result = await tryProxyFetch();
        }
      } catch (error) {
        // Log the actual error so it is visible in server/browser console for debugging
        console.error('[CMS] getEditorials failed:', error);
        result = null;
      }

      if (!result) {
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: params?.limit || 20,
          totalPages: 0,
        };
      }

      // Normalize media URLs in editorial list
      const origin = getStrapiOrigin() || getStrapiMediaOriginFromEnv();
      const data = (result.data || []).map((editorial) => {
        if (!origin) return editorial;
        const rawImage = extractStrapiMediaUrlLike((editorial as any)?.image);
        if (!rawImage) return editorial;
        const image = resolveStrapiMediaUrl(origin, rawImage);
        return image && image !== (editorial as any).image ? { ...editorial, image } : editorial;
      });

      return { ...result, data };
    },

    async getEditorialBySlug(slug: string): Promise<CMSEditorial | null> {
      const isServer = typeof window === 'undefined';
      const encodedSlug = encodeURIComponent(slug);

      const tryDirectFetch = () =>
        fetchJson<{ data: CMSEditorial } | CMSEditorial | null>(
          buildUrl(`/editorials/slug/${encodedSlug}`),
          { method: 'GET', headers: getAuthHeaders(false) },
        );

      const tryProxyFetch = () =>
        fetchJson<{ data: CMSEditorial } | CMSEditorial | null>(
          buildProxyUrl(`/editorials/slug/${encodedSlug}`),
          { method: 'GET', headers: getAuthHeaders(false) },
        );

      let raw: { data: CMSEditorial } | CMSEditorial | null = null;
      try {
        if (isServer) {
          // Server-side: try direct URL first, fall back to proxy
          try {
            raw = await tryDirectFetch();
          } catch (directError) {
            console.error('[CMS] getEditorialBySlug direct fetch failed, trying proxy:', directError);
            raw = await tryProxyFetch();
          }
        } else {
          // Client-side: always use proxy
          raw = await tryProxyFetch();
        }
      } catch (error) {
        // Log the actual error so it is visible in server/browser console for debugging
        console.error('[CMS] getEditorialBySlug failed for slug:', slug, error);
        raw = null;
      }

      if (!raw) return null;

      // Unwrap { data: ... } wrapper if present
      const editorial: CMSEditorial | null =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw as { data: CMSEditorial }).data
          : (raw as CMSEditorial | null);

      if (!editorial) return null;

      // Normalize media URL
      const origin = getStrapiOrigin() || getStrapiMediaOriginFromEnv();
      if (!origin) return editorial;
      const rawImage = extractStrapiMediaUrlLike((editorial as any)?.image);
      if (!rawImage) return editorial;
      const image = resolveStrapiMediaUrl(origin, rawImage);
      return image && image !== (editorial as any).image ? { ...editorial, image } : editorial;
    },
  };
};

const getEnvStrapiUrl = () => {
  if (typeof process !== 'undefined' && process.env) {
    const isBrowser = typeof window !== 'undefined';
    const url = isBrowser
      ? process.env.NEXT_PUBLIC_STRAPI_URL ||
        process.env.NEXT_PUBLIC_STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_BASE_URL
      : process.env.STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
        process.env.NEXT_PUBLIC_STRAPI_URL;
    if (url) return normalizeStrapiBaseUrl(url);
    if (process.env.NODE_ENV !== 'production') {
      return normalizeStrapiBaseUrl('http://localhost:1337/api');
    }
  }
  return '';
};

const defaultConfig: CMSConfig = {
  provider: 'strapi',
  baseUrl: getEnvStrapiUrl(),
};

let currentConfig: CMSConfig = defaultConfig;

const providerInstances: Partial<Record<CMSProviderType, CMSProvider>> = {
  mock: mockCMSProvider,
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

  try {
    const savedWordPress = window.localStorage.getItem('wordpress_config');
    if (savedWordPress) {
      configureCMS({
        provider: 'wordpress',
        baseUrl: '/api/cms/wordpress',
      });
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
  
  if (config.provider === 'wordpress' && config.baseUrl) {
    providerInstances.wordpress = createWordPressProvider({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      username: config.options?.username as string,
      password: config.options?.password as string,
    });
  }

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
