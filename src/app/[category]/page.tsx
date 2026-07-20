import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryListing from "@/views/CategoryListing";
import { CATEGORY_PAGE_SIZE } from "@/lib/constants";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";
import { getCategoryBySlug } from "@/data/categories";
import { getCMSProvider } from "@/services/cms";
import { getAggregatedList } from "@/services/cms/aggregator";

const SITE_URL = "https://rampurnews.com";

type PageParams = {
  category: string;
};

type SearchParams = {
  page?: string;
};

export const revalidate = 30;

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const { category } = await props.params;
  const slug = String(category || "").trim().toLowerCase();
  const match = getCategoryBySlug(slug);
  if (!match) {
    return {
      title: "Page Not Found",
      robots: { index: false, follow: false },
    };
  }
  return buildCategoryMetadata(slug);
}

export default async function Page(props: { 
  params: Promise<PageParams>; 
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await props.params;
  const { page } = await props.searchParams;
  
  const slug = String(category || "").trim().toLowerCase();
  const match = getCategoryBySlug(slug);
  if (!match) {
    notFound();
  }

  // Server-side fetch for SEO and performance
  const pageNum = Number.parseInt(page || "1", 10);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const offset = (currentPage - 1) * CATEGORY_PAGE_SIZE;

  let initialArticles;
  try {
    // Aggregated fetch: merges articles from Custom CMS (Supabase) + Strapi
    const aggregated = await getAggregatedList('articles', {
      category: slug,
      pageSize: CATEGORY_PAGE_SIZE,
      page: currentPage,
      sort: 'publishedAt',
      order: 'desc',
    });
    initialArticles = {
      data: aggregated.data,
      total: aggregated.meta.pagination.total,
      page: aggregated.meta.pagination.page,
      pageSize: aggregated.meta.pagination.pageSize,
      totalPages: aggregated.meta.pagination.pageCount,
    };
  } catch (error) {
    console.error("Failed to prefetch articles:", error);
    // Fallback to Strapi-only if aggregator throws
    try {
      initialArticles = await getCMSProvider().getArticles({
        category: slug,
        limit: CATEGORY_PAGE_SIZE,
        offset,
        orderBy: "publishedDate",
        order: "desc",
        status: "published",
      });
    } catch {
      initialArticles = undefined;
    }
  }

  const canonical = `${SITE_URL}${match.path}`;

  // CollectionPage JSON-LD
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}#collection`,
    name: `${match.titleHindi} समाचार | रामपुर न्यूज़`,
    description: match.description,
    url: canonical,
    inLanguage: "hi-IN",
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    about: { "@type": "Thing", name: match.titleHindi },
    publisher: { "@type": "NewsMediaOrganization", "@id": `${SITE_URL}/#organization` },
  };

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: match.titleHindi, item: canonical },
    ],
  };

  // ItemList JSON-LD for Google Carousel rich results
  const articles = initialArticles?.data || [];
  const itemListSchema = articles.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: articles.slice(0, 10).map((article: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${article.category || slug}/${article.slug}`,
      name: article.title,
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <CategoryListing categorySlug={slug} initialArticles={initialArticles} />
    </>
  );
}
