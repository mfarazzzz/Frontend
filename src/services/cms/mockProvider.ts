// Mock CMS Provider - Local storage based for demo/development
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
import { mockNewsData } from '@/data/mockNews';
import { categories as defaultCategories } from '@/data/categories';

const STORAGE_KEYS = {
  ARTICLES: 'cms_articles',
  CATEGORIES: 'cms_categories',
  AUTHORS: 'cms_authors',
  MEDIA: 'cms_media',
  SETTINGS: 'cms_settings',
};

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

// Initialize storage with mock data if empty
const initializeStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    const articles: CMSArticle[] = [];
    Object.entries(mockNewsData).forEach(([category, newsItems]) => {
      newsItems.forEach(item => {
        articles.push({
          ...item,
          content: item.content || `<p>${item.excerpt}</p><p>यह एक विस्तृत समाचार है जो ${item.categoryHindi} श्रेणी से संबंधित है। पूर्ण सामग्री जल्द ही उपलब्ध होगी।</p>`,
          status: 'published',
          modifiedDate: item.publishedDate,
        });
      });
    });
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    const cats: CMSCategory[] = defaultCategories.map((cat, index) => ({
      ...cat,
      order: index,
    }));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.AUTHORS)) {
    const authors: CMSAuthor[] = [
      { id: '1', name: 'Admin', nameHindi: 'एडमिन', email: 'admin@rampurnews.com', role: 'admin' },
      { id: '2', name: 'Rakesh Sharma', nameHindi: 'राकेश शर्मा', email: 'rakesh@rampurnews.com', role: 'editor' },
      { id: '3', name: 'Preeti Verma', nameHindi: 'प्रीति वर्मा', email: 'preeti@rampurnews.com', role: 'author' },
    ];
    localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const settings: CMSSettings = {
      siteName: 'Rampur News',
      siteNameHindi: 'रामपुर न्यूज़',
      tagline: 'रामपुर की सबसे विश्वसनीय हिंदी समाचार वेबसाइट',
      socialLinks: {
        facebook: 'https://www.facebook.com/profile.php?id=61586930678729',
        twitter: 'https://twitter.com/rampurnews',
        youtube: 'https://www.youtube.com/@rampurnewsdotcom',
        whatsapp: 'https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O',
      },
      contactEmail: 'contact@rampurnews.com',
      contactPhone: '+919876543210',
      defaultAuthorRole: 'author',
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify([]));
  }
};

// Helper to get/set localStorage
const getStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const setStorage = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
};

const getStorageObject = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageObject = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize on module load
initializeStorage();

export const mockCMSProvider: CMSProvider = {
  // Article operations
  async getArticles(params?: ArticleQueryParams): Promise<PaginatedResponse<CMSArticle>> {
    let articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    
    // Apply filters
    if (params?.category) {
      articles = articles.filter(a => a.category === params.category);
    }
    if (params?.status) {
      articles = articles.filter(a => a.status === params.status);
    }
    if (params?.featured !== undefined) {
      articles = articles.filter(a => a.isFeatured === params.featured);
    }
    if (params?.breaking !== undefined) {
      articles = articles.filter(a => a.isBreaking === params.breaking);
    }
    if (params?.author) {
      articles = articles.filter(a => a.author === params.author);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.excerpt.toLowerCase().includes(search)
      );
    }
    
    // Sort
    const orderBy = params?.orderBy || 'publishedDate';
    const order = params?.order || 'desc';
    articles.sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'publishedDate') {
        comparison = new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
      } else if (orderBy === 'views') {
        comparison = (a.views || 0) - (b.views || 0);
      } else if (orderBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return order === 'desc' ? -comparison : comparison;
    });
    
    // Paginate
    const total = articles.length;
    const limit = params?.limit || 10;
    const offset = params?.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    articles = articles.slice(offset, offset + limit);
    
    return { data: articles, total, page, pageSize: limit, totalPages };
  },
  
  async getArticleById(id: string): Promise<CMSArticle | null> {
    const articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    return articles.find(a => a.id === id) || null;
  },
  
  async getArticleBySlug(slug: string): Promise<CMSArticle | null> {
    const articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    return articles.find(a => a.slug === slug) || null;
  },
  
  async createArticle(article: Omit<CMSArticle, 'id'>): Promise<CMSArticle> {
    const articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    const newArticle: CMSArticle = { ...article, id: generateId() };
    articles.unshift(newArticle);
    setStorage(STORAGE_KEYS.ARTICLES, articles);
    return newArticle;
  },
  
  async updateArticle(id: string, updates: Partial<CMSArticle>): Promise<CMSArticle> {
    const articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Article not found');
    articles[index] = { ...articles[index], ...updates, modifiedDate: new Date().toISOString() };
    setStorage(STORAGE_KEYS.ARTICLES, articles);
    return articles[index];
  },
  
  async deleteArticle(id: string): Promise<void> {
    const articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    setStorage(STORAGE_KEYS.ARTICLES, articles.filter(a => a.id !== id));
  },
  
  // Category operations
  async getCategories(): Promise<CMSCategory[]> {
    return getStorage<CMSCategory>(STORAGE_KEYS.CATEGORIES);
  },
  
  async getCategoryById(id: string): Promise<CMSCategory | null> {
    const categories = getStorage<CMSCategory>(STORAGE_KEYS.CATEGORIES);
    return categories.find(c => c.id === id) || null;
  },
  
  async getCategoryBySlug(slug: string): Promise<CMSCategory | null> {
    const categories = getStorage<CMSCategory>(STORAGE_KEYS.CATEGORIES);
    return categories.find(c => c.slug === slug) || null;
  },
  
  async createCategory(category: Omit<CMSCategory, 'id'>): Promise<CMSCategory> {
    const categories = getStorage<CMSCategory>(STORAGE_KEYS.CATEGORIES);
    const newCategory: CMSCategory = { ...category, id: generateId() };
    categories.push(newCategory);
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },
  
  async updateCategory(id: string, updates: Partial<CMSCategory>): Promise<CMSCategory> {
    const categories = getStorage<CMSCategory>(STORAGE_KEYS.CATEGORIES);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    categories[index] = { ...categories[index], ...updates };
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  },
  
  async deleteCategory(id: string): Promise<void> {
    const categories = getStorage<CMSCategory>(STORAGE_KEYS.CATEGORIES);
    setStorage(STORAGE_KEYS.CATEGORIES, categories.filter(c => c.id !== id));
  },
  
  // Author operations
  async getAuthors(): Promise<CMSAuthor[]> {
    return getStorage<CMSAuthor>(STORAGE_KEYS.AUTHORS);
  },
  
  async getAuthorById(id: string): Promise<CMSAuthor | null> {
    const authors = getStorage<CMSAuthor>(STORAGE_KEYS.AUTHORS);
    return authors.find(a => a.id === id) || null;
  },
  
  async createAuthor(author: Omit<CMSAuthor, 'id'>): Promise<CMSAuthor> {
    const authors = getStorage<CMSAuthor>(STORAGE_KEYS.AUTHORS);
    const newAuthor: CMSAuthor = { ...author, id: generateId() };
    authors.push(newAuthor);
    setStorage(STORAGE_KEYS.AUTHORS, authors);
    return newAuthor;
  },
  
  async updateAuthor(id: string, updates: Partial<CMSAuthor>): Promise<CMSAuthor> {
    const authors = getStorage<CMSAuthor>(STORAGE_KEYS.AUTHORS);
    const index = authors.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Author not found');
    authors[index] = { ...authors[index], ...updates };
    setStorage(STORAGE_KEYS.AUTHORS, authors);
    return authors[index];
  },
  
  async deleteAuthor(id: string): Promise<void> {
    const authors = getStorage<CMSAuthor>(STORAGE_KEYS.AUTHORS);
    setStorage(STORAGE_KEYS.AUTHORS, authors.filter(a => a.id !== id));
  },

  async getTags(): Promise<CMSTag[]> {
    const articles = getStorage<CMSArticle>(STORAGE_KEYS.ARTICLES);
    const names = new Set<string>();
    for (const article of articles) {
      if (!Array.isArray(article.tags)) continue;
      for (const tag of article.tags) {
        const trimmed = typeof tag === 'string' ? tag.trim() : '';
        if (trimmed) names.add(trimmed);
      }
    }
    return Array.from(names)
      .map((name) => ({
        id: generateSlug(name) || name,
        name,
        nameHindi: name,
        slug: generateSlug(name) || name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  
  // Media operations
  async getMedia(limit?: number): Promise<CMSMedia[]> {
    const media = getStorage<CMSMedia>(STORAGE_KEYS.MEDIA);
    return limit ? media.slice(0, limit) : media;
  },
  
  async uploadMedia(file: File): Promise<CMSMedia> {
    const media = getStorage<CMSMedia>(STORAGE_KEYS.MEDIA);
    const url = URL.createObjectURL(file);
    const newMedia: CMSMedia = {
      id: generateId(),
      url,
      title: file.name,
      altText: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin',
    };
    media.unshift(newMedia);
    setStorage(STORAGE_KEYS.MEDIA, media);
    return newMedia;
  },
  
  async deleteMedia(id: string): Promise<void> {
    const media = getStorage<CMSMedia>(STORAGE_KEYS.MEDIA);
    setStorage(STORAGE_KEYS.MEDIA, media.filter(m => m.id !== id));
  },
  
  // Settings operations
  async getSettings(): Promise<CMSSettings> {
    return getStorageObject<CMSSettings>(STORAGE_KEYS.SETTINGS, {
      siteName: 'Rampur News',
      siteNameHindi: 'रामपुर न्यूज़',
      tagline: '',
      socialLinks: {},
      defaultAuthorRole: 'author',
    });
  },
  
  async updateSettings(updates: Partial<CMSSettings>): Promise<CMSSettings> {
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    setStorageObject(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
  
  // Special queries
  async getFeaturedArticles(limit = 5): Promise<CMSArticle[]> {
    const result = await this.getArticles({ featured: true, status: 'published', limit });
    return result.data;
  },
  
  async getBreakingNews(limit = 5): Promise<CMSArticle[]> {
    const result = await this.getArticles({ breaking: true, status: 'published', limit });
    return result.data;
  },
  
  async getTrendingArticles(limit = 5): Promise<CMSArticle[]> {
    const result = await this.getArticles({ status: 'published', limit, orderBy: 'views' });
    return result.data;
  },
  
  async getArticlesByCategory(categorySlug: string, limit = 10): Promise<CMSArticle[]> {
    const result = await this.getArticles({ category: categorySlug, status: 'published', limit });
    return result.data;
  },
  
  async searchArticles(query: string, limit = 20): Promise<CMSArticle[]> {
    const result = await this.getArticles({ search: query, status: 'published', limit });
    return result.data;
  },
};
