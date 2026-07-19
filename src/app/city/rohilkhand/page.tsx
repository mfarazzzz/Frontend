/**
 * Rohilkhand Region Hub Page — /rohilkhand
 *
 * Aggregates articles across all Rohilkhand cities.
 * Has CollectionPage schema with all constituent cities.
 */
import type { Metadata } from "next";
import { getLocationsByRegion } from "@/data/locations";
import { getAggregatedList } from "@/services/cms/aggregator";
import CategoryListing from "@/views/CategoryListing";

const SITE_URL = "https://rampurnews.com";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "रोहिलखंड समाचार | Rohilkhand News Today | RampurNews.com",
  description: "रोहिलखंड क्षेत्र (रामपुर, मुरादाबाद, बरेली, अमरोहा, संभल, बिजनौर, पीलीभीत, शाहजहाँपुर, बदायूं) की ताज़ा खबरें हिंदी में।",
  keywords: ["रोहिलखंड न्यूज़", "Rohilkhand News", "रोहिलखंड समाचार", "रामपुर न्यूज़", "मुरादाबाद न्यूज़", "बरेली न्यूज़"],
  alternates: { canonical: `${SITE_URL}/rohilkhand` },
  openGraph: {
    type: "website",
    title: "रोहिलखंड समाचार | Rohilkhand News",
    description: "रोहिलखंड क्षेत्र की ताज़ा खबरें — रामपुर, मुरादाबाद, बरेली और आसपास।",
    url: `${SITE_URL}/rohilkhand`,
    siteName: "रामपुर न्यूज़ | Rampur News",
    locale: "hi_IN",
    images: [{ url: `${SITE_URL}/api/og?title=रोहिलखंड समाचार`, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "रोहिलखंड समाचार", images: [`${SITE_URL}/api/og?title=रोहिलखंड समाचार`] },
};

export default async function RohilkhandPage() {
  const cities = getLocationsByRegion("rohilkhand");
  const searchTerms = cities.map(c => c.nameHindi).join(" ");

  let initialArticles;
  try {
    const aggregated = await getAggregatedList("articles", {
      search: searchTerms,
      pageSize: 30,
      page: 1,
      sort: "publishedAt",
      order: "desc",
    });
    initialArticles = {
      data: aggregated.data,
      total: aggregated.meta.pagination.total,
      page: aggregated.meta.pagination.page,
      pageSize: aggregated.meta.pagination.pageSize,
      totalPages: aggregated.meta.pagination.pageCount,
    };
  } catch {
    initialArticles = undefined;
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "रोहिलखंड समाचार",
    description: "रोहिलखंड क्षेत्र की ताज़ा खबरें",
    url: `${SITE_URL}/rohilkhand`,
    inLanguage: "hi-IN",
    about: {
      "@type": "AdministrativeArea",
      name: "Rohilkhand",
      containedInPlace: { "@type": "State", name: "Uttar Pradesh" },
      containsPlace: cities.map(c => ({ "@type": "City", name: c.nameEnglish })),
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "रोहिलखंड समाचार", item: `${SITE_URL}/rohilkhand` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CategoryListing categorySlug="rohilkhand" initialArticles={initialArticles} />
    </>
  );
}
