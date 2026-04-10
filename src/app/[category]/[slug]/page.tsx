import NewsDetail from "../../../views/NewsDetail";
import type { Metadata } from "next";
import { cache } from "react";
import { type CMSArticle, getCMSProvider } from "../../../services/cms";
import {
  deriveAiSeoSignals,
  getCategoryHindi,
  stripHtmlToText,
  truncateText,
} from "../../../lib/utils";
import { notFound } from "next/navigation";

const SITE_URL = "https://rampurnews.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const buildOgImageUrl = (title: string) =>
  `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`;
const toAbsoluteUrl = (value?: string) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw}`;
};
const normalizeHeadline = (value: string) =>
  value
    .replace(/([!?]){2,}/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
const isNonEmpty = (value?: string) =>
  typeof value === "string" && value.trim().length > 0;

const pruneSchema = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    const cleaned = input.map(pruneSchema).filter((v) => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>)
      .map(([k, v]) => [k, pruneSchema(v)])
      .filter(([, v]) => {
        if (v === undefined || v === null) return false;
        if (typeof v === "string" && v.trim() === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      });
    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
  }
  if (typeof input === "string") {
    const t = input.trim();
    return t ? t : undefined;
  }
  return input === null || input === undefined ? undefined : input;
};

/**
 * Fetch article by slug — deduplicated with React cache() so generateMetadata
 * and Page share a single Strapi request per render pass. Never throws —
 * returns null on any error so the page can call notFound() cleanly.
 */
const fetchArticle = cache(async (slug: string): Promise<CMSArticle | null> => {
  try {
    const article = await getCMSProvider().getArticleBySlug(slug);
    if (!article) {
      console.warn(`[fetchArticle] no article for slug="${slug}"`);
    }
    return article;
  } catch (err) {
    console.error(`[fetchArticle] error for slug="${slug}":`, err instanceof Error ? err.message : err);
    return null;
  }
});

export const revalidate = 60;

type PageParams = { category: string; slug: string };

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { category, slug } = await props.params;
  const article = await fetchArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const effectiveCategory = (article.category || category || "").trim().toLowerCase();
  const urlCategory = (category || "").trim().toLowerCase();
  const canonicalPath = effectiveCategory
    ? `/${effectiveCategory}/${slug}`
    : `/${slug}`;

  // Only block indexing if categories are genuinely different slugs (not just case)
  // Do NOT return "Article Not Found" — the article exists, just serve its metadata
  const categoryMismatch = effectiveCategory && urlCategory && effectiveCategory !== urlCategory;

  const shortHeadline = article.short_headline?.trim() || "";
  const seoTitle = normalizeHeadline(
    shortHeadline.length >= 55 && shortHeadline.length <= 65
      ? shortHeadline
      : article.seoTitle?.trim() || article.title,
  );
  const bodyText = stripHtmlToText(article.content || "");
  const seoDescription =
    (article as any).seoDescription?.trim() ||
    article.meta_description?.trim() ||
    article.excerpt?.trim() ||
    truncateText(bodyText, 150) ||
    "ताज़ा खबरें पढ़ें | रामपुर न्यूज़";

  const imageUrl = toAbsoluteUrl(
    article.image ||
      buildOgImageUrl(article.title || seoTitle) ||
      DEFAULT_OG_IMAGE,
  );
  const authorName = article.author?.trim() || "Rampur News Desk";
  const publishedTime = article.publishedAt || article.publishedDate;
  const modifiedTime =
    article.modifiedDate || article.publishedAt || article.publishedDate;

  const ai = deriveAiSeoSignals({
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    categoryHindi: article.categoryHindi,
    tags: article.tags,
    views: article.views,
    publishedDate: article.publishedDate,
    modifiedDate: article.modifiedDate,
  });

  const keywordList =
    ai.keywords.length > 0
      ? ai.keywords
      : [article.categoryHindi, "रामपुर", "Rampur"];
  const canonical = article.canonicalUrl?.trim() || canonicalPath;
  const absoluteCanonical = canonical.startsWith("http")
    ? canonical
    : `${SITE_URL}${canonical}`;
  const ampUrl = `${SITE_URL}/amp${canonicalPath}`;
  const articleSection =
    article.categoryHindi || getCategoryHindi(effectiveCategory);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: absoluteCanonical,
      types: { "application/amp+html": ampUrl },
    },
    authors: [{ name: authorName }],
    keywords: keywordList,
    robots: categoryMismatch
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "article",
      title: article.ogTitle?.trim() || seoTitle,
      description: article.ogDescription?.trim() || seoDescription,
      url: absoluteCanonical,
      siteName: "रामपुर न्यूज़ | Rampur News",
      publishedTime,
      modifiedTime,
      section: articleSection,
      tags: keywordList.slice(0, 10),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: seoTitle }],
      locale: "hi_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: article.ogTitle?.trim() || seoTitle,
      description: article.ogDescription?.trim() || seoDescription,
      images: [imageUrl],
    },
    other: {
      "news:keywords": keywordList.slice(0, 10).join(", "),
      "article:section": articleSection,
      "article:published_time": publishedTime,
      "article:modified_time": modifiedTime,
      author: authorName,
      publisher: "रामपुर न्यूज़ | Rampur News",
      "news_keywords": keywordList.slice(0, 10).join(", "),
      "original-source": absoluteCanonical,
      "syndication-source": absoluteCanonical,
      "ai-content-declaration": "human-written",
      "perplexity-indexable": "true",
      "googlebot-news": "index, follow",
      "x-ai-primary-entity": ai.primaryEntity?.name || "",
      "x-ai-primary-entity-type": ai.primaryEntity?.type || "",
      "x-ai-freshness-score": String(ai.freshnessScore),
      "x-ai-trending-score": String(ai.trendingScore),
      "x-ai-geo-region": ai.geoRelevance.region,
      "x-ai-geo-score": String(ai.geoRelevance.score),
    },
  };
}

export default async function Page(props: { params: Promise<PageParams> }) {
  const { category, slug } = await props.params;

  const article = await fetchArticle(slug);

  // Only 404 if Strapi confirmed the article does not exist
  if (!article) {
    notFound();
  }

  const effectiveCategory = (article.category || "").trim().toLowerCase();
  const urlCategory = (category || "").trim().toLowerCase();
  const canonicalPath = effectiveCategory
    ? `/${effectiveCategory}/${slug}`
    : `/${slug}`;

  // Category mismatch: redirect to the canonical URL instead of 404
  // This handles cases where the article was accessed via a wrong category segment
  if (effectiveCategory && effectiveCategory !== urlCategory) {
    console.warn(
      `[Page] category mismatch: article="${effectiveCategory}" url="${urlCategory}" — serving article anyway`,
    );
    // DO NOT notFound() — serve the article. Canonical URL handles SEO dedup.
    // notFound() here was the primary cause of false 404s.
  }

  const canInjectSchema =
    !effectiveCategory ||
    !urlCategory ||
    effectiveCategory === urlCategory;

  const shortHeadline = article.short_headline?.trim() || "";
  const title = normalizeHeadline(
    shortHeadline.length >= 55 && shortHeadline.length <= 65
      ? shortHeadline
      : article.seoTitle?.trim() || article.title || "",
  );
  const bodyText = stripHtmlToText(article.content || "");
  const description =
    (article as any).seoDescription?.trim() ||
    article.meta_description?.trim() ||
    article.excerpt?.trim() ||
    truncateText(bodyText, 150);
  const imageUrl = toAbsoluteUrl(
    article.image ||
      buildOgImageUrl(title || article.title || "") ||
      DEFAULT_OG_IMAGE,
  );
  const modifiedDate = article.modifiedDate || article.publishedDate || "";
  const schemaImageUrl = toAbsoluteUrl(article.image || "") || imageUrl;
  const schemaAuthorName = (article.author || "").trim();
  const schemaPublishedDate = (
    article.publishedDate ||
    article.publishedAt ||
    ""
  ).trim();

  const ai = deriveAiSeoSignals({
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    categoryHindi: article.categoryHindi,
    tags: article.tags,
    views: article.views,
    publishedDate: article.publishedDate,
    modifiedDate: article.modifiedDate,
  });

  const keywordList =
    ai.keywords.length > 0
      ? ai.keywords
      : [article.categoryHindi, "रामपुर", "Rampur"];

  const absoluteCanonical = article.canonicalUrl?.trim()
    ? article.canonicalUrl.trim()
    : `${SITE_URL}${canonicalPath}`;
  const categoryLabelHindi = getCategoryHindi(effectiveCategory || category);
  const hasRequiredSchemaFields =
    isNonEmpty(schemaAuthorName) &&
    isNonEmpty(schemaImageUrl) &&
    isNonEmpty(schemaPublishedDate);

  const schemaFromCms =
    canInjectSchema &&
    article.schemaJson &&
    typeof article.schemaJson === "object" &&
    !Array.isArray(article.schemaJson)
      ? (article.schemaJson as Record<string, unknown>)
      : null;

  const newsArticleSchema = hasRequiredSchemaFields
    ? (pruneSchema(
        schemaFromCms
          ? {
              ...schemaFromCms,
              mainEntityOfPage: { "@type": "WebPage", "@id": absoluteCanonical },
              url: absoluteCanonical,
            }
          : canInjectSchema
            ? {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": absoluteCanonical,
                },
                headline: title || article.title,
                image: {
                  "@type": "ImageObject",
                  url: schemaImageUrl,
                  width: 1200,
                  height: 630,
                },
                datePublished: schemaPublishedDate,
                dateModified: isNonEmpty(modifiedDate)
                  ? modifiedDate
                  : schemaPublishedDate,
                author: [{ "@type": "Person", name: schemaAuthorName }],
                publisher: {
                  "@type": "Organization",
                  name: "रामपुर न्यूज़ | Rampur News",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://rampurnews.com/logo.png",
                    width: 768,
                    height: 768,
                  },
                },
                isAccessibleForFree: true,
                inLanguage: "hi-IN",
                articleSection: isNonEmpty(article.categoryHindi)
                  ? article.categoryHindi
                  : isNonEmpty(categoryLabelHindi)
                    ? categoryLabelHindi
                    : undefined,
              }
            : null,
      ) as Record<string, unknown>)
    : null;

  const breadcrumbSchema = canInjectSchema
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "होम", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryLabelHindi,
            item: `${SITE_URL}/${effectiveCategory || category}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title || article.title,
            item: absoluteCanonical,
          },
        ],
      }
    : null;

  return (
    <>
      {newsArticleSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
        />
      ) : null}
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}
      <NewsDetail nextParams={{ category, slug }} initialArticle={article} />
    </>
  );
}
