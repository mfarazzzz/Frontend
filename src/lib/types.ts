
// Type Safety (Important)
export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: any; // Using any for rich text/blocks as requested
  featured_image?: {
    url: string;
    width?: number;
    height?: number;
    alternativeText?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  author?: {
    name: string;
    slug: string;
    avatar?: string;
  };
  publishedAt: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  videoUrl?: string;
  seoTitle?: string;
  meta_description?: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
