/**
 * City Hub Page — /{city-slug} via rewrite
 *
 * Aggregates latest articles tagged to a specific city.
 * Each city hub has optimized metadata, CollectionPage schema,
 * and BreadcrumbList schema for SEO.
 *
 * Server-rendered (no 'use client') for full SSR SEO.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocationBySlug, getAllLocationSlugs, getLocationsByRegion, LOCATIONS } from "@/data/locations";
import { buildCityHubTitle, buildCityHubDescription, generateArticleKeywords } from "@/lib/seo-keywords";
import { getAggregatedList } from "@/services/cms/aggregator";
import CategoryListing from "@/views/CategoryListing";

const SITE_URL = "https://rampurnews.com";

type PageParams = { slug: string };

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const { slug } = await props.params;
  const location = getLocationBySlug(slug);

  if (!location) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const title = buildCityHubTitle(slug);
  const description = buildCityHubDescription(slug);
  const canonical = `${SITE_URL}/${slug}`;
  const keywords = generateArticleKeywords({ cities: [slug], category: undefined });

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "रामपुर न्यूज़ | Rampur News",
      locale: "hi_IN",
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(location.nameHindi + ' समाचार')}&category=${slug}`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(location.nameHindi + ' समाचार')}&category=${slug}`],
    },
    other: {
      "geo.region": `IN-${location.state === 'uttar-pradesh' ? 'UP' : 'UK'}`,
      "geo.placename": location.nameEnglish,
    },
  };
}

export default async function CityHubPage(props: { params: Promise<PageParams> }) {
  const { slug } = await props.params;
  const location = getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  // Fetch articles tagged to this city via aggregator (both CMS sources)
  let initialArticles;
  try {
    const aggregated = await getAggregatedList("articles", {
      search: location.nameHindi,
      pageSize: 20,
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

  const canonical = `${SITE_URL}/${slug}`;

  // CollectionPage schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${location.nameHindi} समाचार`,
    description: buildCityHubDescription(slug),
    url: canonical,
    inLanguage: "hi-IN",
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    about: {
      "@type": "City",
      name: location.nameEnglish,
      "name@hi": location.nameHindi,
      containedInPlace: {
        "@type": "State",
        name: location.state === 'uttar-pradesh' ? 'Uttar Pradesh' : 'Uttarakhand',
      },
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `${location.nameHindi} समाचार`, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CategoryListing categorySlug={slug} initialArticles={initialArticles} />
    </>
  );
}
