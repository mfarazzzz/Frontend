// WordPress REST API Provider - Connect to external WordPress sites
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
import type { CMSProvider } from './provider';

// WordPress REST API response types
interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: 'publish' | 'draft' | 'pending' | 'private' | 'future';
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  meta?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
    author?: Array<{ id: number; name: string; avatar_urls?: Record<string, string> }>;
  };
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
}

interface WPTag {
  id: number;
  name: string;
  slug: string;
}

interface WPUser {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_urls: Record<string, string>;
  meta?: Record<string, unknown>;
}

interface WPMedia {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  source_url: string;
  alt_text: string;
  mime_type: string;
  media_details?: {
    width: number;
    height: number;
    filesize: number;
  };
}

interface WordPressConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

// Helper to strip HTML tags
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

// Helper to calculate read time
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = stripHtml(content).split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} मिनट`;
};

const parseBooleanMeta = (value: unknown): boolean => {
  if (value === true) return true;
  if (value === false) return false;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
};

const parseNumberMeta = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

// Create WordPress provider
export const createWordPressProvider = (config: WordPressConfig): CMSProvider => {
  const { baseUrl, apiKey, username, password } = config;
  
  // Build authorization header
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (username && password) {
      const credentials = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }
    
    return headers;
  };

  // API endpoint builder
  const apiUrl = (endpoint: string, params?: Record<string, string | number | boolean>) => {
    const url = new URL(`${baseUrl}/wp-json/wp/v2/${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  };

  // Transform WordPress post to CMSArticle
  const transformPost = (post: WPPost): CMSArticle => {
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder.svg';
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const authorData = post._embedded?.author?.[0];
    const category = categories[0];

    return {
      id: String(post.id),
      title: post.title.rendered,
      slug: post.slug,
      excerpt: stripHtml(post.excerpt.rendered),
      content: post.content.rendered,
      image: featuredImage,
      featuredMediaId: post.featured_media ? String(post.featured_media) : undefined,
      category: category?.slug || 'uncategorized',
      categoryHindi: category?.name || 'अवर्गीकृत',
      author: authorData?.name || 'अज्ञात',
      publishedDate: post.date,
      modifiedDate: post.modified,
      readTime: calculateReadTime(post.content.rendered),
      isFeatured: parseBooleanMeta(post.meta?.featured),
      isBreaking: parseBooleanMeta(post.meta?.breaking),
      views: parseNumberMeta(post.meta?.views),
      status: post.status === 'publish' ? 'published' : post.status === 'future' ? 'scheduled' : 'draft',
      tags: post._embedded?.['wp:term']?.[1]?.map(t => t.name) || [],
    };
  };

  // Transform CMSArticle to WordPress post format
  const transformToWPPost = (article: Partial<CMSArticle>): Record<string, unknown> => {
    const wpPost: Record<string, unknown> = {};
    
    if (article.title) wpPost.title = article.title;
    if (article.content) wpPost.content = article.content;
    if (article.excerpt) wpPost.excerpt = article.excerpt;
    if (article.slug) wpPost.slug = article.slug;
    if (article.featuredMediaId) {
      const id = parseInt(article.featuredMediaId, 10);
      if (!Number.isNaN(id)) {
        wpPost.featured_media = id;
      }
    }
    if (article.status) {
      wpPost.status = article.status === 'published' ? 'publish' : article.status === 'scheduled' ? 'future' : 'draft';
    }
    
    return wpPost;
  };

  // Transform WordPress category to CMSCategory
  const transformCategory = (cat: WPCategory): CMSCategory => ({
    id: String(cat.id),
    slug: cat.slug,
    titleHindi: cat.name,
    titleEnglish: cat.slug.replace(/-/g, ' '),
    description: cat.description,
    path: `/${cat.slug}`,
    parentId: cat.parent ? String(cat.parent) : undefined,
    order: cat.id,
  });

  // Transform WordPress user to CMSAuthor
  const transformAuthor = (user: WPUser): CMSAuthor => ({
    id: String(user.id),
    name: user.name,
    nameHindi: user.name,
    email: '', // Not exposed in WP REST API
    avatar: user.avatar_urls?.['96'] || user.avatar_urls?.['48'],
    bio: user.description,
    role: 'author',
  });

  // Transform WordPress media to CMSMedia
  const transformMedia = (media: WPMedia): CMSMedia => ({
    id: String(media.id),
    url: media.source_url,
    title: media.title.rendered,
    altText: media.alt_text || media.title.rendered,
    mimeType: media.mime_type,
    size: media.media_details?.filesize || 0,
    width: media.media_details?.width,
    height: media.media_details?.height,
    uploadedAt: media.date,
    uploadedBy: 'wordpress',
  });

  // Category cache for lookups
  let categoryCache: WPCategory[] | null = null;
  
  const getCategoryId = async (slug: string): Promise<number | null> => {
    if (!categoryCache) {
      const response = await fetch(apiUrl('categories', { per_page: 100 }));
      categoryCache = await response.json();
    }
    return categoryCache?.find(c => c.slug === slug)?.id || null;
  };

  const buildWpPostPayload = async (article: Partial<CMSArticle>): Promise<Record<string, unknown>> => {
    const payload = transformToWPPost(article);

    if (article.category) {
      const catId = await getCategoryId(article.category);
      if (catId) {
        payload.categories = [catId];
      }
    }

    const meta: Record<string, unknown> = {};
    if (article.isFeatured !== undefined) meta.featured = article.isFeatured;
    if (article.isBreaking !== undefined) meta.breaking = article.isBreaking;
    if (article.views !== undefined) meta.views = article.views;
    if (article.seoTitle !== undefined) meta.seoTitle = article.seoTitle;
    if (article.seoDescription !== undefined) meta.seoDescription = article.seoDescription;
    if (article.videoUrl !== undefined) meta.videoUrl = article.videoUrl;
    if (article.videoType !== undefined) meta.videoType = article.videoType;
    if (article.videoTitle !== undefined) meta.videoTitle = article.videoTitle;
    if (Object.keys(meta).length > 0) {
      payload.meta = meta;
    }

    return payload;
  };

  return {
    // Article operations
    async getArticles(params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> {
      const queryParams: Record<string, string | number | boolean> = {
        _embed: true,
        per_page: params?.limit || 10,
        offset: params?.offset || 0,
        orderby: params?.orderBy === 'views' ? 'date' : (params?.orderBy || 'date'),
        order: params?.order || 'desc',
      };

      if (params?.status) {
        queryParams.status = params.status === 'published' ? 'publish' : params.status;
      }
      
      if (params?.search) {
        queryParams.search = params.search;
      }

      if (params?.category) {
        const catId = await getCategoryId(params.category);
        if (catId) queryParams.categories = catId;
      }

      if (params?.author) {
        queryParams.author = params.author;
      }

      const response = await fetch(apiUrl('posts', queryParams), {
        headers: getAuthHeaders(),
      });

      const totalHeader = response.headers.get('X-WP-Total');
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      const posts: WPPost[] = await response.json();

      const total = totalHeader ? parseInt(totalHeader, 10) : posts.length;
      const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
      const pageSize = params?.limit || 10;
      const page = Math.floor((params?.offset || 0) / pageSize) + 1;

      return {
        data: posts.map(transformPost),
        total,
        page,
        pageSize,
        totalPages,
      };
    },

    async getArticleById(id: string): Promise<CMSArticle | null> {
      try {
        const response = await fetch(apiUrl(`posts/${id}`, { _embed: true }), {
          headers: getAuthHeaders(),
        });
        if (!response.ok) return null;
        const post: WPPost = await response.json();
        return transformPost(post);
      } catch {
        return null;
      }
    },

    async getArticleBySlug(slug: string): Promise<CMSArticle | null> {
      try {
        const response = await fetch(apiUrl('posts', { slug, _embed: true }), {
          headers: getAuthHeaders(),
        });
        const posts: WPPost[] = await response.json();
        return posts.length > 0 ? transformPost(posts[0]) : null;
      } catch {
        return null;
      }
    },

    async createArticle(article: Omit<CMSArticle, 'id'>): Promise<CMSArticle> {
      const response = await fetch(apiUrl('posts'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(await buildWpPostPayload(article)),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create article: ${response.statusText}`);
      }
      
      const post: WPPost = await response.json();
      return transformPost(post);
    },

    async updateArticle(id: string, updates: Partial<CMSArticle>): Promise<CMSArticle> {
      const response = await fetch(apiUrl(`posts/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(await buildWpPostPayload(updates)),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update article: ${response.statusText}`);
      }
      
      const post: WPPost = await response.json();
      return transformPost(post);
    },

    async deleteArticle(id: string): Promise<void> {
      const response = await fetch(apiUrl(`posts/${id}`, { force: true }), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete article: ${response.statusText}`);
      }
    },

    // Category operations
    async getCategories(): Promise<CMSCategory[]> {
      const response = await fetch(apiUrl('categories', { per_page: 100 }));
      const categories: WPCategory[] = await response.json();
      categoryCache = categories;
      return categories.map(transformCategory);
    },

    async getCategoryById(id: string): Promise<CMSCategory | null> {
      try {
        const response = await fetch(apiUrl(`categories/${id}`));
        if (!response.ok) return null;
        const category: WPCategory = await response.json();
        return transformCategory(category);
      } catch {
        return null;
      }
    },

    async getCategoryBySlug(slug: string): Promise<CMSCategory | null> {
      try {
        const response = await fetch(apiUrl('categories', { slug }));
        const categories: WPCategory[] = await response.json();
        return categories.length > 0 ? transformCategory(categories[0]) : null;
      } catch {
        return null;
      }
    },

    async createCategory(category: Omit<CMSCategory, 'id'>): Promise<CMSCategory> {
      const response = await fetch(apiUrl('categories'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: category.titleHindi,
          slug: category.slug,
          description: category.description,
          parent: category.parentId ? parseInt(category.parentId, 10) : 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create category: ${response.statusText}`);
      }
      
      const cat: WPCategory = await response.json();
      categoryCache = null; // Invalidate cache
      return transformCategory(cat);
    },

    async updateCategory(id: string, updates: Partial<CMSCategory>): Promise<CMSCategory> {
      const response = await fetch(apiUrl(`categories/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: updates.titleHindi,
          slug: updates.slug,
          description: updates.description,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update category: ${response.statusText}`);
      }
      
      const cat: WPCategory = await response.json();
      categoryCache = null;
      return transformCategory(cat);
    },

    async deleteCategory(id: string): Promise<void> {
      const response = await fetch(apiUrl(`categories/${id}`, { force: true }), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }
      categoryCache = null;
    },

    // Author operations
    async getAuthors(): Promise<CMSAuthor[]> {
      const response = await fetch(apiUrl('users', { per_page: 100 }));
      const users: WPUser[] = await response.json();
      return users.map(transformAuthor);
    },

    async getAuthorById(id: string): Promise<CMSAuthor | null> {
      try {
        const response = await fetch(apiUrl(`users/${id}`));
        if (!response.ok) return null;
        const user: WPUser = await response.json();
        return transformAuthor(user);
      } catch {
        return null;
      }
    },

    async createAuthor(author: Omit<CMSAuthor, 'id'>): Promise<CMSAuthor> {
      const response = await fetch(apiUrl('users'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: author.name.toLowerCase().replace(/\s+/g, '_'),
          name: author.name,
          email: author.email,
          description: author.bio,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create author: ${response.statusText}`);
      }
      
      const user: WPUser = await response.json();
      return transformAuthor(user);
    },

    async updateAuthor(id: string, updates: Partial<CMSAuthor>): Promise<CMSAuthor> {
      const response = await fetch(apiUrl(`users/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: updates.name,
          description: updates.bio,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update author: ${response.statusText}`);
      }
      
      const user: WPUser = await response.json();
      return transformAuthor(user);
    },

    async deleteAuthor(id: string): Promise<void> {
      const response = await fetch(apiUrl(`users/${id}`, { force: true, reassign: 1 }), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete author: ${response.statusText}`);
      }
    },

    async getTags(): Promise<CMSTag[]> {
      const response = await fetch(apiUrl('tags', { per_page: 100 }));
      const tags: WPTag[] = await response.json();
      return tags.map((t) => ({
        id: String(t.id),
        name: t.name,
        nameHindi: t.name,
        slug: t.slug,
      }));
    },

    // Media operations
    async getMedia(limit = 20): Promise<CMSMedia[]> {
      const response = await fetch(apiUrl('media', { per_page: limit }));
      const media: WPMedia[] = await response.json();
      return media.map(transformMedia);
    },

    async uploadMedia(file: File): Promise<CMSMedia> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('alt_text', file.name);

      const headers = getAuthHeaders();
      delete headers['Content-Type']; // Let browser set multipart boundary

      const response = await fetch(apiUrl('media'), {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload media: ${response.statusText}`);
      }
      
      const media: WPMedia = await response.json();
      return transformMedia(media);
    },

    async deleteMedia(id: string): Promise<void> {
      const response = await fetch(apiUrl(`media/${id}`, { force: true }), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.statusText}`);
      }
    },

    // Settings operations
    async getSettings(): Promise<CMSSettings> {
      // WordPress doesn't have a standard settings endpoint
      // You would need to implement a custom endpoint or use options API
      try {
        const response = await fetch(`${baseUrl}/wp-json`);
        const siteInfo = await response.json();
        
        return {
          siteName: siteInfo.name || 'WordPress Site',
          siteNameHindi: siteInfo.name || 'वर्डप्रेस साइट',
          tagline: siteInfo.description || '',
          socialLinks: {},
        };
      } catch {
        return {
          siteName: 'WordPress Site',
          siteNameHindi: 'वर्डप्रेस साइट',
          tagline: '',
          socialLinks: {},
        };
      }
    },

    async updateSettings(settings: Partial<CMSSettings>): Promise<CMSSettings> {
      // WordPress settings update requires custom implementation
      console.warn('WordPress settings update requires custom endpoint implementation');
      const current = await this.getSettings();
      return { ...current, ...settings };
    },

    // Special queries
    async getFeaturedArticles(limit = 5): Promise<CMSArticle[]> {
      // Use sticky posts as featured in WordPress
      const response = await fetch(apiUrl('posts', { _embed: true, sticky: true, per_page: limit }));
      const posts: WPPost[] = await response.json();
      return posts.map(transformPost);
    },

    async getBreakingNews(limit = 5): Promise<CMSArticle[]> {
      // Breaking news could be a specific category or tag
      // Here we use the most recent posts
      const result = await this.getArticles({ limit, status: 'published' });
      return result.data.slice(0, limit);
    },

    async getTrendingArticles(limit = 5): Promise<CMSArticle[]> {
      // Trending based on comments or custom meta
      // Here we fetch by comment count
      const response = await fetch(apiUrl('posts', { _embed: true, orderby: 'comment_count', order: 'desc', per_page: limit }));
      const posts: WPPost[] = await response.json();
      return posts.map(transformPost);
    },

    async getArticlesByCategory(categorySlug: string, limit = 10): Promise<CMSArticle[]> {
      const catId = await getCategoryId(categorySlug);
      if (!catId) return [];
      
      const response = await fetch(apiUrl('posts', { _embed: true, categories: catId, per_page: limit }));
      const posts: WPPost[] = await response.json();
      return posts.map(transformPost);
    },

    async searchArticles(query: string, limit = 20): Promise<CMSArticle[]> {
      const response = await fetch(apiUrl('posts', { _embed: true, search: query, per_page: limit }));
      const posts: WPPost[] = await response.json();
      return posts.map(transformPost);
    },
  };
};

export default createWordPressProvider;
