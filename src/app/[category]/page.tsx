import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryListing from "@/views/CategoryListing";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";
import { getCategoryBySlug } from "@/data/categories";

type PageParams = {
  category: string;
};

export const revalidate = 60;

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

export default async function Page(props: { params: Promise<PageParams> }) {
  const { category } = await props.params;
  const slug = String(category || "").trim().toLowerCase();
  const match = getCategoryBySlug(slug);
  if (!match) {
    notFound();
  }
  return <CategoryListing categorySlug={slug} />;
}
