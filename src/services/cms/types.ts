// CMS-ready types (WordPress REST API compatible structure)

export interface CMSArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  featuredMediaId?: string;
  category: string;
  categoryHindi: string;
  author: string;
  publishedDate: string;
  publishedAt?: string;
  modifiedDate?: string;
  readTime?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  views?: number;
  status: 'draft' | 'published' | 'scheduled';
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoOverride?: boolean;
  canonicalUrl?: string;
  newsKeywords?: string;
  schemaJson?: unknown;
  // Video fields
  videoUrl?: string;
  videoType?: 'youtube' | 'upload' | 'none';
  videoTitle?: string;
  // Scheduling field
  scheduledAt?: string;
}

export interface CMSCategory {
  id: string;
  slug: string;
  titleHindi: string;
  titleEnglish: string;
  description: string;
  path: string;
  parentId?: string;
  order?: number;
}

export interface CMSAuthor {
  id: string;
  name: string;
  nameHindi: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'editor' | 'author' | 'contributor';
}

export interface CMSTag {
  id: string;
  name: string;
  nameHindi?: string;
  slug: string;
}

export interface CMSMedia {
  id: string;
  url: string;
  title: string;
  altText: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CMSSettings {
  siteName: string;
  siteNameHindi: string;
  tagline: string;
  logo?: string;
  favicon?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    whatsapp?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  defaultAuthorRole?: CMSAuthor['role'];
}

// Query parameters for fetching articles
export interface ArticleQueryParams {
  category?: string;
  status?: 'draft' | 'published' | 'scheduled';
  featured?: boolean;
  breaking?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  author?: string;
  orderBy?: 'publishedDate' | 'views' | 'title';
  order?: 'asc' | 'desc';
}

// Response wrapper for paginated results
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
