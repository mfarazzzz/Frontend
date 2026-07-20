/**
 * Shared category page server component.
 * Used by all specific category routes (/rampur, /up, /national, etc.)
 * to ensure server-side data fetching from Custom CMS.
 */
import CategoryListing from "@/views/CategoryListing";
import { CATEGORY_PAGE_SIZE } from "@/lib/constants";
import { getAggregatedList } from "@/services/cms/aggregator";
import type { CMSArticle, PaginatedResponse } from "@/services/cms";

export async function CategoryPageServer({
  categorySlug,
  page = 1,
}: {
  categorySlug: string;
  page?: number;
}) {
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  let initialArticles: PaginatedResponse<CMSArticle> | undefined;
  try {
    const aggregated = await getAggregatedList('articles', {
      category: categorySlug,
      pageSize: CATEGORY_PAGE_SIZE,
      page: currentPage,
      sort: 'publishedAt',
      order: 'desc',
    });
    initialArticles = {
      data: aggregated.data as unknown as CMSArticle[],
      total: aggregated.meta.pagination.total,
      page: aggregated.meta.pagination.page,
      pageSize: aggregated.meta.pagination.pageSize,
      totalPages: aggregated.meta.pagination.pageCount,
    };
  } catch (error) {
    console.error(`[CategoryPage] Fetch failed for ${categorySlug}:`, error);
    initialArticles = {
      data: [],
      total: 0,
      page: currentPage,
      pageSize: CATEGORY_PAGE_SIZE,
      totalPages: 0,
    };
  }

  return <CategoryListing categorySlug={categorySlug} initialArticles={initialArticles} />;
}
