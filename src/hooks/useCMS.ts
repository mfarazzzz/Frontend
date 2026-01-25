// React hooks for CMS operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCMSConfig, getCMSProvider, type CMSArticle, type ArticleQueryParams, type CMSCategory, type CMSAuthor, type CMSTag, type CMSSettings } from '@/services/cms';

const getProviderKey = () => {
  const config = getCMSConfig();
  return `${config.provider}:${config.baseUrl || ''}:${config.apiKey || ''}`;
};

// Query keys
export const cmsKeys = {
  all: ['cms'] as const,
  articles: () => [...cmsKeys.all, 'articles'] as const,
  article: (id: string) => [...cmsKeys.articles(), id] as const,
  articleBySlug: (slug: string) => [...cmsKeys.articles(), 'slug', slug] as const,
  articlesList: (params?: ArticleQueryParams) => [...cmsKeys.articles(), 'list', params] as const,
  featured: () => [...cmsKeys.articles(), 'featured'] as const,
  breaking: () => [...cmsKeys.articles(), 'breaking'] as const,
  trending: () => [...cmsKeys.articles(), 'trending'] as const,
  byCategory: (slug: string) => [...cmsKeys.articles(), 'category', slug] as const,
  categories: () => [...cmsKeys.all, 'categories'] as const,
  category: (id: string) => [...cmsKeys.categories(), id] as const,
  authors: () => [...cmsKeys.all, 'authors'] as const,
  author: (id: string) => [...cmsKeys.authors(), id] as const,
  tags: () => [...cmsKeys.all, 'tags'] as const,
  media: () => [...cmsKeys.all, 'media'] as const,
  settings: () => [...cmsKeys.all, 'settings'] as const,
};

// Article hooks
export const useArticles = (params?: ArticleQueryParams) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.articlesList(params), providerKey],
    queryFn: () => getCMSProvider().getArticles(params),
  });
};

export const useArticle = (id: string) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.article(id), providerKey],
    queryFn: () => getCMSProvider().getArticleById(id),
    enabled: !!id,
  });
};

export const useArticleBySlug = (slug: string) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.articleBySlug(slug), providerKey],
    queryFn: () => getCMSProvider().getArticleBySlug(slug),
    enabled: !!slug,
  });
};

export const useFeaturedArticles = (limit = 5) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.featured(), providerKey],
    queryFn: () => getCMSProvider().getFeaturedArticles(limit),
  });
};

export const useBreakingNews = (limit = 5) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.breaking(), providerKey],
    queryFn: () => getCMSProvider().getBreakingNews(limit),
  });
};

export const useTrendingArticles = (limit = 5) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.trending(), providerKey],
    queryFn: () => getCMSProvider().getTrendingArticles(limit),
  });
};

export const useArticlesByCategory = (categorySlug: string, limit = 10) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.byCategory(categorySlug), providerKey],
    queryFn: () => getCMSProvider().getArticlesByCategory(categorySlug, limit),
    enabled: !!categorySlug,
  });
};

export const useSearchArticles = (query: string, limit = 20) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.articles(), 'search', query, providerKey],
    queryFn: () => getCMSProvider().searchArticles(query, limit),
    enabled: query.length > 2,
  });
};

// Article mutations
export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (article: Omit<CMSArticle, 'id'>) => getCMSProvider().createArticle(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CMSArticle> }) => 
      getCMSProvider().updateArticle(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
      queryClient.invalidateQueries({ queryKey: cmsKeys.article(id) });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getCMSProvider().deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.articles() });
    },
  });
};

// Category hooks
export const useCategories = () => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.categories(), providerKey],
    queryFn: () => getCMSProvider().getCategories(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (category: Omit<CMSCategory, 'id'>) => getCMSProvider().createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.categories() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CMSCategory> }) => 
      getCMSProvider().updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.categories() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getCMSProvider().deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.categories() });
    },
  });
};

// Author hooks
export const useAuthors = () => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.authors(), providerKey],
    queryFn: () => getCMSProvider().getAuthors(),
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (author: Omit<CMSAuthor, 'id'>) => getCMSProvider().createAuthor(author),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.authors() });
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CMSAuthor> }) => 
      getCMSProvider().updateAuthor(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.authors() });
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getCMSProvider().deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.authors() });
    },
  });
};

export const useTags = () => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.tags(), providerKey],
    queryFn: () => getCMSProvider().getTags(),
  });
};

// Settings hooks
export const useCMSSettings = () => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.settings(), providerKey],
    queryFn: () => getCMSProvider().getSettings(),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Partial<CMSSettings>) => getCMSProvider().updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.settings() });
    },
  });
};

// Media hooks
export const useMedia = (limit?: number) => {
  const providerKey = getProviderKey();
  return useQuery({
    queryKey: [...cmsKeys.media(), providerKey, limit],
    queryFn: () => getCMSProvider().getMedia(limit),
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => getCMSProvider().uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.media() });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getCMSProvider().deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.media() });
    },
  });
};
