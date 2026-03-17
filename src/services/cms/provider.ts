// CMS Provider Interface - Abstract layer for easy CMS swap
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
  CMSAd,
  AdQueryParams,
} from './types';

export interface CMSProvider {
  // Article operations
  getArticles(params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>>;
  getArticleById(id: string): Promise<CMSArticle | null>;
  getArticleBySlug(slug: string): Promise<CMSArticle | null>;
  createArticle(article: Omit<CMSArticle, 'id'>): Promise<CMSArticle>;
  updateArticle(id: string, article: Partial<CMSArticle>): Promise<CMSArticle>;
  publishArticle(id: string): Promise<CMSArticle>;
  unpublishArticle(id: string): Promise<CMSArticle>;
  deleteArticle(id: string): Promise<void>;

  // Editorial operations (separate collection from articles)
  getEditorials(params?: EditorialQueryParams): Promise<PaginatedResponse<CMSEditorial>>;
  getEditorialBySlug(slug: string): Promise<CMSEditorial | null>;
  
  // Category operations
  getCategories(): Promise<CMSCategory[]>;
  getCategoryById(id: string): Promise<CMSCategory | null>;
  getCategoryBySlug(slug: string): Promise<CMSCategory | null>;
  createCategory(category: Omit<CMSCategory, 'id'>): Promise<CMSCategory>;
  updateCategory(id: string, category: Partial<CMSCategory>): Promise<CMSCategory>;
  deleteCategory(id: string): Promise<void>;
  
  // Author operations
  getAuthors(): Promise<CMSAuthor[]>;
  getAuthorById(id: string): Promise<CMSAuthor | null>;
  createAuthor(author: Omit<CMSAuthor, 'id'>): Promise<CMSAuthor>;
  updateAuthor(id: string, author: Partial<CMSAuthor>): Promise<CMSAuthor>;
  deleteAuthor(id: string): Promise<void>;
  
  // Tag operations
  getTags(): Promise<CMSTag[]>;

  // Media operations
  getMedia(limit?: number): Promise<CMSMedia[]>;
  uploadMedia(file: File): Promise<CMSMedia>;
  deleteMedia(id: string): Promise<void>;
  
  // Settings operations
  getSettings(): Promise<CMSSettings>;
  updateSettings(settings: Partial<CMSSettings>): Promise<CMSSettings>;
  
  // Special queries
  getHeroArticles(limit?: number): Promise<CMSArticle[]>;
  getFeaturedArticles(limit?: number): Promise<CMSArticle[]>;
  getBreakingNews(limit?: number): Promise<CMSArticle[]>;
  getTodaysTopNews(limit?: number): Promise<CMSArticle[]>;
  getTrendingArticles(limit?: number): Promise<CMSArticle[]>;
  getArticlesByCategory(
    categorySlug: string,
    limit?: number
  ): Promise<CMSArticle[]>;
  searchArticles(query: string, limit?: number): Promise<CMSArticle[]>;

  // Advertisement operations
  getAds(params?: AdQueryParams): Promise<CMSAd[]>;
  getAdById(id: string): Promise<CMSAd | null>;
  createAd(ad: Omit<CMSAd, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSAd>;
  updateAd(id: string, ad: Partial<CMSAd>): Promise<CMSAd>;
  deleteAd(id: string): Promise<void>;
}

export type CMSProviderType = 'mock' | 'strapi' | 'django' | 'sanity' | 'custom';

export interface CMSConfig {
  provider: CMSProviderType;
  baseUrl?: string;
  apiKey?: string;
  options?: Record<string, unknown>;
}
