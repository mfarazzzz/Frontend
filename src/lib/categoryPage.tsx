/**
 * Shared category page server component.
 * Used by all specific category routes (/rampur, /up, /national, etc.)
 * to ensure server-side data fetching with the aggregator.
 */
import CategoryListing from "@/views/CategoryListing";
import { CATEGORY_PAGE_SIZE } from "@/lib/constants";
import { getAggregatedList } from "@/services/cms/aggregator";
import { getCMSProvider } from "@/services/cms";
import type { CMSArticle, PaginatedResponse } from "@/services/cms";

const SITE_URL = "https://rampurnews.com";

export async function CategoryPageServer({
  categorySlug,
  page = 1,
}: {
  categorySlug: string;
  page?: number;
}) {
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const offset = (currentPage - 1) * CATEGORY_PAGE_SIZE;

  let initialArticles: PaginatedResponse<CMSArticle> | undefined;
  try {
    // Aggregated fetch: merges articles from Custom CMS + Strapi
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
    console.error(`[CategoryPage] Aggregator failed for ${categorySlug}:`, error);
    // Fallback: try custom CMS provider directly
    try {
      initialArticles = await getCMSProvider().getArticles({
        category: categorySlug,
        limit: CATEGORY_PAGE_SIZE,
        offset,
        orderBy: "publishedDate",
        order: "desc",
        status: "published",
      });
    } catch (fallbackError) {
      console.error(`[CategoryPage] Fallback also failed for ${categorySlug}:`, fallbackError);
      // Return empty instead of crashing the page
      initialArticles = {
        data: [],
        total: 0,
        page: currentPage,
        pageSize: CATEGORY_PAGE_SIZE,
        totalPages: 0,
      };
    }
  }

  return <CategoryListing categorySlug={categorySlug} initialArticles={initialArticles} />;
}
