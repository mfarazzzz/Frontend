/**
 * Tag Page — /tags/[tag]
 *
 * Lists all published articles containing a given tag, newest first.
 * Server-rendered with generateMetadata for full SEO.
 * Includes CollectionPage + BreadcrumbList JSON-LD.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAggregatedList } from "@/services/cms/aggregator";
import CategoryListing from "@/views/CategoryListing";

const SITE_URL = "https://rampurnews.com";

type PageParams = { tag: string };

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag).trim();

  if (!decoded) {
    return { title: "Tag Not Found", robots: { index: false, follow: false } };
  }

  const title = `${decoded} — ताज़ा खबरें | रामपुर न्यूज़`;
  const description = `${decoded} से जुड़ी सभी ताज़ा खबरें और समाचार पढ़ें। ${decoded} news in Hindi on RampurNews.com`;
  const canonical = `${SITE_URL}/tags/${encodeURIComponent(decoded)}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: [decoded, `${decoded} न्यूज़`, `${decoded} news`, "रामपुर न्यूज़"],
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
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(decoded)}`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/api/og?title=${encodeURIComponent(decoded)}`] },
  };
}

export default async function TagPage(props: { params: Promise<PageParams> }) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag).trim();

  if (!decoded) {
    notFound();
  }

  // Fetch articles containing this tag via aggregator (both CMS sources)
  let initialArticles;
  try {
    const aggregated = await getAggregatedList("articles", {
      search: decoded,
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

  const canonical = `${SITE_URL}/tags/${encodeURIComponent(decoded)}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${decoded} — ताज़ा खबरें`,
    description: `${decoded} से जुड़ी सभी ताज़ा खबरें`,
    url: canonical,
    inLanguage: "hi-IN",
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    about: { "@type": "Thing", name: decoded },
    publisher: { "@type": "NewsMediaOrganization", "@id": `${SITE_URL}/#organization` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "टैग्स", item: `${SITE_URL}/tags` },
      { "@type": "ListItem", position: 3, name: decoded, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CategoryListing categorySlug={decoded} initialArticles={initialArticles} />
    </>
  );
}
