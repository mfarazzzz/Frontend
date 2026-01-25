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
  PaginatedResponse
} from './types';
import { mockCMSProvider } from './mockProvider';
import { createWordPressProvider } from './wordpressProvider';

export * from './types';
export * from './provider';
export { createWordPressProvider } from './wordpressProvider';

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
    const response = await fetch(input, { cache: 'no-store', ...init });
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
    if (!params) return undefined;
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.category) query.category = params.category;
    if (params.status) query.status = params.status;
    if (params.featured !== undefined) query.featured = params.featured;
    if (params.breaking !== undefined) query.breaking = params.breaking;
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.offset !== undefined) query.offset = params.offset;
    if (params.search) query.search = params.search;
    if (params.author) query.author = params.author;
    if (params.orderBy) query.orderBy = params.orderBy;
    if (params.order) query.order = params.order;
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
    return result;
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
          return await tryFetch(`/articles/admin/${id}`, true, false, false);
        }
        return await tryFetch(path, false, undefined, false);
      } catch (error) {
        if (
          shouldTryAdmin &&
          ((error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) ||
            error instanceof TypeError)
        ) {
          try {
            return await tryFetch(`/articles/${id}`, false, undefined, false);
          } catch (fallbackError) {
            if (
              config.apiKey &&
              typeof window === 'undefined' &&
              fallbackError instanceof HttpError &&
              (fallbackError.status === 401 || fallbackError.status === 403)
            ) {
              return await tryFetch(`/articles/${id}`, true, undefined, false);
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
          return await tryFetch(`/articles/admin/slug/${encodeURIComponent(slug)}`, true, false, false);
        }
        return await tryFetch(path, false, undefined, false);
      } catch (error) {
        if (
          shouldTryAdmin &&
          ((error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status === 404)) ||
            error instanceof TypeError)
        ) {
          try {
            return await tryFetch(`/articles/slug/${encodeURIComponent(slug)}`, false, undefined, false);
          } catch (fallbackError) {
            if (
              config.apiKey &&
              typeof window === 'undefined' &&
              fallbackError instanceof HttpError &&
              (fallbackError.status === 401 || fallbackError.status === 403)
            ) {
              return await tryFetch(`/articles/slug/${encodeURIComponent(slug)}`, true, undefined, false);
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
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSCategory[] | null>(buildUrl('/categories'), {
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
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSAuthor[] | null>(buildUrl('/authors'), {
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
      const tryFetch = async (includeApiKey: boolean) =>
        fetchJson<CMSTag[] | null>(buildUrl('/tags'), {
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

    async getFeaturedArticles(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({ featured: true, status: 'published', limit });
      return result.data;
    },

    async getBreakingNews(limit = 5): Promise<CMSArticle[]> {
      const result = await getArticles({ breaking: true, status: 'published', limit });
      return result.data;
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
  };
};

const defaultConfig: CMSConfig = {
  provider: 'strapi',
  baseUrl: 'http://localhost:1337/api',
};

let currentConfig: CMSConfig = defaultConfig;

const providerInstances: Partial<Record<CMSProviderType, CMSProvider>> = {
  mock: mockCMSProvider,
  strapi: createRestCMSProvider(defaultConfig),
};

let didHydrateFromStorage = false;

const normalizeStrapiBaseUrl = (value: string): string => {
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
