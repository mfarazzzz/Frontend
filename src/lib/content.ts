/**
 * content.ts — Aggregated content fetching for the Frontend.
 *
 * This module provides server-side functions that query both Strapi
 * and the Custom CMS and merge results. Used by page components
 * for listing and detail pages.
 *
 * Import this instead of using getCMSProvider() directly when you want
 * content from both sources merged.
 */
import {
  getAggregatedList,
  resolveBySlug,
  type AggregatedListResponse,
  type AggregatedItemResponse,
  type AggregatedItem,
} from '@/services/cms/aggregator';
import { getCMSProvider } from '@/services/cms';

export type { AggregatedListResponse, AggregatedItemResponse, AggregatedItem };

/**
 * Get aggregated article listing (both sources merged).
 * Drop-in replacement for getCMSProvider().getArticles() in listing pages.
 */
export async function getArticles(params: {
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
} = {}): Promise<AggregatedListResponse> {
  return getAggregatedList('articles', {
    page: params.page || 1,
    pageSize: params.pageSize || 25,
    sort: params.sort || 'published_at',
    order: params.order || 'desc',
    category: params.category,
    search: params.search,
  });
}

/**
 * Get aggregated editorial listing.
 */
export async function getEditorials(params: {
  page?: number;
  pageSize?: number;
  editorial_type?: string;
} = {}): Promise<AggregatedListResponse> {
  return getAggregatedList('editorials', {
    page: params.page || 1,
    pageSize: params.pageSize || 25,
    sort: 'published_at',
    order: 'desc',
    ...params,
  });
}

/**
 * Resolve an article by slug — checks Custom CMS first, falls back to Strapi.
 * Drop-in replacement for getCMSProvider().getArticleBySlug() in detail pages.
 */
export async function getArticleBySlug(slug: string): Promise<AggregatedItem | null> {
  const result = await resolveBySlug('articles', slug);
  return result.data;
}

/**
 * Resolve an editorial by slug.
 */
export async function getEditorialBySlug(slug: string): Promise<AggregatedItem | null> {
  const result = await resolveBySlug('editorials', slug);
  return result.data;
}

/**
 * Resolve any content type by slug.
 */
export async function getContentBySlug(contentType: string, slug: string): Promise<AggregatedItem | null> {
  const result = await resolveBySlug(contentType, slug);
  return result.data;
}

/**
 * Get content listing for any type (both sources).
 */
export async function getContentList(contentType: string, params: {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  search?: string;
} = {}): Promise<AggregatedListResponse> {
  return getAggregatedList(contentType, {
    page: params.page || 1,
    pageSize: params.pageSize || 25,
    sort: params.sort || 'published_at',
    order: params.order || 'desc',
    category: params.category,
    search: params.search,
  });
}

/**
 * Get categories (these don't need aggregation — just from Strapi or Custom CMS).
 * Falls back to existing provider for non-aggregated content.
 */
export async function getCategories() {
  try {
    return await getCMSProvider().getCategories();
  } catch {
    return [];
  }
}

/**
 * Get authors (non-aggregated — shared reference data).
 */
export async function getAuthors() {
  try {
    return await getCMSProvider().getAuthors();
  } catch {
    return [];
  }
}

/**
 * Determine the correct detail page URL based on source.
 * Articles from Custom CMS and Strapi use the same URL pattern.
 */
export function getDetailUrl(item: AggregatedItem, category?: string): string {
  const slug = item.slug;
  const cat = category || (item as any).category || '';
  if (cat) return `/${cat}/${slug}`;
  return `/${slug}`;
}
