import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryListing, { CATEGORY_PAGE_SIZE } from "@/views/CategoryListing";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";
import { getCategoryBySlug } from "@/data/categories";
import { getCMSProvider } from "@/services/cms";

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
    initialArticles = await getCMSProvider().getArticles({
      category: slug,
      limit: CATEGORY_PAGE_SIZE,
      offset,
      orderBy: "publishedDate",
      order: "desc",
      status: "published",
    });
  } catch (error) {
    console.error("Failed to prefetch articles:", error);
    // Don't fail the page, let client-side handle it or show empty
    initialArticles = undefined; 
  }

  return <CategoryListing categorySlug={slug} initialArticles={initialArticles} />;
}
