import Index from "@/views/Index";
import type { Metadata } from "next";
import { getHomepageData } from "@/services/content/homepageService";

export const metadata: Metadata = {
  title: "रामपुर की ताज़ा खबरें | रामपुर न्यूज़ | Rampur News",
  description: "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। राजनीति, अपराध, शिक्षा, खेल, मनोरंजन और स्थानीय समाचार।",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "रामपुर की ताज़ा खबरें | रामपुर न्यूज़ | Rampur News",
    description: "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। राजनीति, अपराध, शिक्षा, खेल, मनोरंजन और स्थानीय समाचार।",
    siteName: "रामपुर न्यूज़ | Rampur News",
    images: [
      {
        url: "https://rampurnews.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rampur News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RampurNews",
    creator: "@RampurNews",
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const siteUrl = "https://rampurnews.com";
  const siteName = "रामपुर न्यूज़ | Rampur News";

  // Single entry point: fetches all homepage data in parallel with proper category filtering
  const homepageData = await getHomepageData();

  const {
    heroArticles,
    sections,
    trendingArticles,
    todaysTop,
    mostRead24h,
  } = homepageData;

  const heroPrimary = heroArticles[0];

  // Build category articles map and categories array for Index view
  const categoryArticles: Record<string, typeof heroArticles> = {};
  const categories: Array<{ id: string; slug: string; titleHindi: string; path: string; template?: string; showAdAfter?: boolean }> = [];

  for (const { config, data } of sections) {
    if (config.contentType === 'editorials') continue;
    categoryArticles[config.category || config.id] = data.articles;
    categories.push({
      id: config.id,
      slug: config.category || config.id,
      titleHindi: config.title,
      path: config.viewAllLink,
      template: config.template,
      showAdAfter: config.showAdAfter,
    });
  }

  // Get editorials section
  const editorialsSection = sections.find((s) => s.config.id === 'editorials');
  const editorials = editorialsSection?.data.articles || [];

  const heroArticleSchema =
    heroPrimary && heroPrimary.slug
      ? {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "@id": `${siteUrl}/${heroPrimary.category}/${heroPrimary.slug}#article`,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${siteUrl}/${heroPrimary.category}/${heroPrimary.slug}`,
          },
          headline: heroPrimary.title,
          name: heroPrimary.title,
          description: heroPrimary.excerpt,
          datePublished: heroPrimary.publishedAt || heroPrimary.publishedDate,
          dateModified: heroPrimary.publishedAt || heroPrimary.publishedDate,
          author: heroPrimary.author
            ? { "@type": "Person", name: heroPrimary.author }
            : undefined,
          publisher: {
            "@type": "NewsMediaOrganization",
            "@id": `${siteUrl}/#organization`,
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: `${siteUrl}/logo.png`,
              width: 768,
              height: 768,
            },
          },
          image: heroPrimary.image || `${siteUrl}/og-image.png`,
          inLanguage: "hi-IN",
          articleSection: heroPrimary.categoryHindi,
        }
      : null;

  return (
    <>
      {heroArticleSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(heroArticleSchema) }}
        />
      ) : null}
      <Index
        heroArticles={heroArticles}
        categories={categories}
        categoryArticles={categoryArticles}
        editorials={editorials}
        trendingArticles={trendingArticles}
        todaysTop={todaysTop}
        mostRead24h={mostRead24h}
      />
    </>
  );
}

// Homepage must always be fresh


