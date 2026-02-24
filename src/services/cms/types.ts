// CMS-ready types

// ─── Editorial types ─────────────────────────────────────────────────────────

export type EditorialType =
  | 'editorial'
  | 'opinion'
  | 'review'
  | 'interview'
  | 'special-report';

/** A related article stub embedded in an editorial response */
export interface CMSEditorialRelatedArticle {
  id: string;
  title: string;
  titleHindi?: string;
  slug: string;
  image: string;
  category: string;
  categoryHindi: string;
  publishedDate: string;
}

/**
 * Editorial content type — completely separate from CMSArticle.
 * Maps to the Strapi `api::editorial.editorial` collection.
 */
export interface CMSEditorial {
  id: string;
  title: string;
  titleHindi?: string;
  slug: string;
  excerpt: string;
  excerptHindi?: string;
  content: string;
  contentHindi?: string;
  image: string;
  editorialType: EditorialType;
  author: string;
  authorId?: string;
  authorSlug?: string;
  authorAvatar?: string;
  authorRole?: string;
  publishedDate: string;
  publishedAt?: string;
  modifiedDate?: string;
  readTime?: string;
  isFeatured?: boolean;
  isEditorsPick?: boolean;
  views?: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoOverride?: boolean;
  canonicalUrl?: string;
  newsKeywords?: string;
  schemaJson?: unknown;
  relatedArticles?: CMSEditorialRelatedArticle[];
}

/** Query parameters for fetching editorials */
export interface EditorialQueryParams {
  editorialType?: EditorialType | 'all';
  isEditorsPick?: boolean;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  orderBy?: 'publishedDate' | 'views' | 'title';
  order?: 'asc' | 'desc';
}

// ─── Article types ────────────────────────────────────────────────────────────

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
  categories?: string[];
  author: string;
  authorId?: string;
  authorSlug?: string;
  publishedAt: string; // Required in v5
  publishedDate?: string; // Legacy compatibility
  scheduledAt?: string;
  modifiedDate?: string;
  readTime?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  isEditorsPick?: boolean;
  views?: number;
  status: 'draft' | 'published' | 'scheduled';
  contentType?: string;
  authorRole?: CMSAuthor['role'];
  tags?: string[];
  seoTitle?: string;
  meta_description?: string; // Requested field name
  seoDescription?: string; // Legacy
  seoOverride?: boolean;
  canonicalUrl?: string;
  newsKeywords?: string;
  discoverEligible?: boolean;
  schemaJson?: unknown;
  // Video fields
  videoUrl?: string;
  videoType?: 'youtube' | 'upload' | 'none';
  videoTitle?: string;
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
  slug?: string;
  name: string;
  nameHindi: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  designation?: string;
  profession?: string;
  otherRoles?: string;
  experience?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;
  knowsAbout?: any;
  socialLinks?: any;
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
  gscPropertyUrl?: string;
  gscExportUrl?: string;
  backlinkReportUrl?: string;
  referringDomains?: string[];
  backlinkNotes?: string;
  lastBacklinkSync?: string;
}

// Query parameters for fetching articles
export interface ArticleQueryParams {
  category?: string;
  parent?: string;
  status?: 'draft' | 'published' | 'scheduled';
  featured?: boolean;
  breaking?: boolean;
   editorsPick?: boolean;
   contentType?:
    | 'news'
    | 'editorial'
    | 'review'
    | 'interview'
    | 'opinion'
    | 'special-report';
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
