import NewsDetail from "../../../views/NewsDetail";
import type { Metadata } from "next";
import { cache } from "react";
import { type CMSArticle, getCMSProvider } from "../../../services/cms";
import { resolveBySlug } from "../../../services/cms/aggregator";
import {
  deriveAiSeoSignals,
  getCategoryHindi,
  stripHtmlToText,
  truncateText,
} from "../../../lib/utils";
import { notFound } from "next/navigation";
import { extractLocationTags, getLocationBySlug } from "@/data/locations";
import { generateArticleKeywords, buildArticleSeoTitle } from "@/lib/seo-keywords";

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
 * Fetch article by slug — reads exclusively from Custom CMS (Supabase).
 * 
 * MIGRATION (2026-07-20): Strapi fallback disabled. All content now lives
 * in the Custom CMS after successful reconciliation.
 * To rollback: set ENABLE_STRAPI_AGGREGATION=true in environment.
 * 
 * Deduplicated with React cache() so generateMetadata and Page share a single
 * request per render pass. Never throws — returns null on any error.
 */
const fetchArticle = cache(async (slug: string): Promise<CMSArticle | null> => {
  // Custom CMS (single source of truth)
  try {
    // Use internal URL on server to avoid DNS hairpin issues
    const cmsBase = (
      process.env.CUSTOM_CMS_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_CUSTOM_CMS_URL ||
      'https://cms.rampurnews.com'
    ).replace(/\/+$/, '');
    const cmsUrl = `${cmsBase}/api/public/articles/${encodeURIComponent(slug)}`;
    const res = await fetch(cmsUrl, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return json.data as CMSArticle;
      }
    }
  } catch {
    // Custom CMS unavailable
  }

  // Strapi fallback (enabled in 'hybrid' mode — default during migration)
  if (process.env.CONTENT_PROVIDER_MODE !== 'custom') {
    try {
      const article = await getCMSProvider().getArticleBySlug(slug);
      if (article) return article;
    } catch {
      // Strapi also failed
    }

    try {
      const { data } = await resolveBySlug<any>('articles', slug);
      if (data) return data as CMSArticle;
    } catch {
      // Both sources exhausted
    }
  }

  console.warn(`[fetchArticle] no article for slug="${slug}" in CMS`);
  return null;
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
    location: article.location,
  });

  // Extract city tags from article data
  const detectedCities = extractLocationTags(article.tags, article.title, article.content);
  const citySlugs = detectedCities.length > 0
    ? detectedCities.map(l => l.slug)
    : (article.location ? [article.location] : ['rampur']);

  // Generate city-aware keywords
  const cityKeywords = generateArticleKeywords({
    cities: citySlugs,
    category: effectiveCategory,
    title: article.title,
    tags: article.tags,
  });

  const keywordList = cityKeywords.length > 0
    ? cityKeywords
    : ai.keywords.length > 0
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

/**
 * Auto-generate FAQ schema from article content.
 * Only generates for explainer/Q&A-shaped articles — skips straight news reports.
 * Heuristic: article must have Q&A indicators like questions marks, "क्या", "कैसे", "क्यों",
 * or be from education/health categories which are typically informational.
 */
function generateFaqFromArticle(
  article: CMSArticle,
  title: string,
  category: string,
): object | null {
  const bodyText = stripHtmlToText(article.content || '').slice(0, 1000);
  if (!bodyText || bodyText.length < 100) return null;

  // Check if article is Q&A/explainer shaped (not straight news)
  const qaIndicators = ['?', '?', 'क्या', 'कैसे', 'क्यों', 'कब', 'कहां', 'कौन', 'कितना'];
  const titleLower = (article.title || '').toLowerCase();
  const contentSnippet = bodyText.toLowerCase();
  const isExplainerCategory = ['education-jobs', 'health', 'business'].includes(category);
  const hasQaSignals = qaIndicators.some(q => titleLower.includes(q) || contentSnippet.includes(q));
  const hasMultipleQuestions = (bodyText.match(/[?？]/g) || []).length >= 2;

  // Only generate FAQ for explainer/informational content
  if (!isExplainerCategory && !hasQaSignals && !hasMultipleQuestions) {
    return null;
  }

  const detectedCities = extractLocationTags(article.tags, article.title, article.content);
  const primaryCity = detectedCities[0]?.nameHindi || 'रामपुर';
  const categoryHindi = article.categoryHindi || getCategoryHindi(category);
  const excerpt = article.excerpt?.trim() || truncateText(bodyText, 150);

  const questions: { name: string; acceptedAnswer: { "@type": string; text: string } }[] = [];

  // Q1: What is this news about?
  questions.push({
    name: `${title} — क्या है पूरी खबर?`,
    acceptedAnswer: { "@type": "Answer", text: excerpt },
  });

  // Q2: City-specific question
  questions.push({
    name: `${primaryCity} में आज क्या हुआ?`,
    acceptedAnswer: { "@type": "Answer", text: `${primaryCity} से जुड़ी इस खबर के अनुसार: ${truncateText(bodyText, 200)}` },
  });

  // Q3: Category-specific
  if (category === 'crime') {
    questions.push({
      name: `${primaryCity} में अपराध की ताज़ा खबर क्या है?`,
      acceptedAnswer: { "@type": "Answer", text: excerpt },
    });
  } else if (category === 'politics') {
    questions.push({
      name: `${primaryCity} में राजनीतिक हलचल क्या है?`,
      acceptedAnswer: { "@type": "Answer", text: excerpt },
    });
  } else if (category === 'education-jobs') {
    questions.push({
      name: `${primaryCity} में शिक्षा/नौकरी का ताज़ा अपडेट क्या है?`,
      acceptedAnswer: { "@type": "Answer", text: excerpt },
    });
  } else {
    questions.push({
      name: `${primaryCity} ${categoryHindi} समाचार — मुख्य बातें क्या हैं?`,
      acceptedAnswer: { "@type": "Answer", text: excerpt },
    });
  }

  if (questions.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(q => ({ "@type": "Question", ...q })),
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
    location: article.location,
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

  // Generate FAQ schema from article content (3-5 Q&A pairs)
  const faqSchema = canInjectSchema ? generateFaqFromArticle(article, title, effectiveCategory) : null;

  // Speakable schema for voice assistants and AI answer engines
  const speakableSchema = canInjectSchema ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-headline", ".article-summary", "h1", ".excerpt"],
    },
    url: absoluteCanonical,
  } : null;

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
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      {speakableSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
        />
      ) : null}
      <NewsDetail nextParams={{ category, slug }} initialArticle={article} />
    </>
  );
}
