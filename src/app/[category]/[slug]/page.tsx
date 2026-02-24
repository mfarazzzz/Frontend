import NewsDetail from "../../../views/NewsDetail";
import type { Metadata } from "next";
import { type CMSArticle, getCMSProvider } from "../../../services/cms";
import {
  deriveAiSeoSignals,
  getCategoryHindi,
  stripHtmlToText,
  truncateText,
} from "../../../lib/utils";
import { notFound, redirect } from "next/navigation";

const SITE_URL = "https://rampurnews.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const buildOgImageUrl = (title: string) => `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`;
const normalizeHeadline = (value: string) =>
  value
    .replace(/([!?]){2,}/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
const isNonEmpty = (value?: string) => typeof value === "string" && value.trim().length > 0;
const pruneSchema = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    const cleaned = input.map(pruneSchema).filter((value) => value !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>)
      .map(([key, value]) => [key, pruneSchema(value)])
      .filter(([, value]) => {
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      });
    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    return trimmed ? trimmed : undefined;
  }
  return input === null || input === undefined ? undefined : input;
};

const fetchArticleForSeo = async (slug: string): Promise<CMSArticle | null> => {
  try {
    return await getCMSProvider().getArticleBySlug(slug);
  } catch (error) {
    console.error("Error fetching article for SEO:", error);
    return null;
  }
};

type PageParams = {
  category: string;
  slug: string;
};

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { category, slug } = await props.params;
  const article = await fetchArticleForSeo(slug);
  
  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const effectiveCategory = (article?.category || category || "").trim();
  const canonicalPath = effectiveCategory ? `/${effectiveCategory}/${slug}` : `/${slug}`;

  // Strict validation for metadata too
  if (effectiveCategory !== category) {
     return {
      title: "Article Not Found", // Avoid indexing duplicate content
      robots: { index: false, follow: false }
     }
  }

  if (!article) {
    const title = "खबर नहीं मिली | रामपुर न्यूज़";
    const description = "यह खबर मौजूद नहीं है या हटा दी गई है।";
    return {
      title,
      description,
      alternates: { canonical: canonicalPath },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        type: "website",
        title,
        description,
        url: canonicalPath,
      },
      twitter: {
        card: "summary",
        title,
        description,
        
      },
    };
  }

  const seoTitle = normalizeHeadline(article.seoTitle?.trim() || article.title);
  const bodyText = stripHtmlToText(article.content || "");
  const seoDescription =
    article.seoDescription?.trim() ||
    article.excerpt?.trim() ||
    truncateText(bodyText, 150) ||
    "ताज़ा खबरें पढ़ें | रामपुर न्यूज़";

  const imageUrl = article.image || buildOgImageUrl(article.title || seoTitle) || DEFAULT_OG_IMAGE;
  const authorName = article.author?.trim() || "Rampur News Desk";
  const publishedTime = article.publishedAt || article.publishedDate;
  const modifiedTime = article.modifiedDate || article.publishedAt || article.publishedDate;

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

  const keywordList = ai.keywords.length > 0 ? ai.keywords : [article.categoryHindi, "रामपुर", "Rampur"];
  const canonical = article.canonicalUrl?.trim() || canonicalPath;
  const absoluteCanonical = canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`;
  const ampPath = `/amp${canonicalPath}`;
  const ampUrl = `${SITE_URL}${ampPath}`;
  const articleSection = article.categoryHindi || getCategoryHindi(effectiveCategory);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical,
      types: {
        "application/amp+html": ampUrl,
      },
    },
    authors: [{ name: authorName }],
    keywords: keywordList,
    robots: {
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
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "रामपुर न्यूज़ | Rampur News",
      publishedTime,
      modifiedTime,
      section: articleSection,
      tags: keywordList.slice(0, 10),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      locale: "hi_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
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
  const article = await fetchArticleForSeo(slug);
  
  if (!article) {
    notFound();
  }

  const effectiveCategory = (article.category || "").trim();
  const urlCategory = (category || "").trim();
  const canonicalPath = effectiveCategory ? `/${effectiveCategory}/${slug}` : `/${slug}`;

  // Strict category validation to prevent duplicate content
  if (effectiveCategory && effectiveCategory !== urlCategory) {
    notFound();
  }

  const canInjectSchema = !!article && (!category || !article?.category || article.category === category);

  const title = normalizeHeadline(article?.seoTitle?.trim() || article?.title || "");
  const bodyText = article ? stripHtmlToText(article.content || "") : "";
  const description = article
    ? article.seoDescription?.trim() ||
      article.excerpt?.trim() ||
      truncateText(bodyText, 150)
    : "";
  const imageUrl = (article?.image || buildOgImageUrl(title || article?.title || "") || DEFAULT_OG_IMAGE).trim();
  const authorName = article?.author?.trim() || "Rampur News Desk";
  const publishedDate = article?.publishedDate || "";
  const modifiedDate = article?.modifiedDate || article?.publishedDate || "";
  const schemaImageUrl = (article?.image || "").trim();
  const schemaAuthorName = (article?.author || "").trim();
  const schemaPublishedDate = (article?.publishedDate || article?.publishedAt || "").trim();

  const ai = article
    ? deriveAiSeoSignals({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        categoryHindi: article.categoryHindi,
        tags: article.tags,
        views: article.views,
        publishedDate: article.publishedDate,
        modifiedDate: article.modifiedDate,
      })
    : null;

  const keywordList =
    ai && ai.keywords.length > 0
      ? ai.keywords
      : article
        ? [article.categoryHindi, "रामपुर", "Rampur"]
        : ["रामपुर", "Rampur"];

  const absoluteCanonical = article?.canonicalUrl?.trim()
    ? article.canonicalUrl.trim()
    : `${SITE_URL}${canonicalPath}`;
  const categoryLabelHindi = getCategoryHindi(effectiveCategory || category);
  const hasRequiredSchemaFields =
    isNonEmpty(schemaAuthorName) && isNonEmpty(schemaImageUrl) && isNonEmpty(schemaPublishedDate);

  // Safe schema injection
  const schemaFromCms =
    canInjectSchema && 
    article && 
    article.schemaJson && 
    typeof article.schemaJson === "object" && 
    !Array.isArray(article.schemaJson)
      ? (article.schemaJson as { [key: string]: unknown })
      : null;

  if (canInjectSchema && article && !hasRequiredSchemaFields) {
    console.warn("Skipping NewsArticle schema due to missing required fields.", {
      slug: article.slug,
      authorName: schemaAuthorName,
      imageUrl: schemaImageUrl,
      publishedDate: schemaPublishedDate,
    });
  }

  const newsArticleSchema = hasRequiredSchemaFields
    ? (pruneSchema(
        schemaFromCms
          ? {
              ...schemaFromCms,
              mainEntityOfPage: { "@type": "WebPage", "@id": absoluteCanonical },
              url: absoluteCanonical,
            }
          : canInjectSchema && article
            ? {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                mainEntityOfPage: { "@type": "WebPage", "@id": absoluteCanonical },
                headline: title || article.title,
                name: title || article.title,
                description: isNonEmpty(description) ? description : undefined,
                image: isNonEmpty(schemaImageUrl)
                  ? {
                      "@type": "ImageObject",
                      url: schemaImageUrl,
                      width: 1200,
                      height: 630,
                    }
                  : undefined,
                thumbnailUrl: isNonEmpty(schemaImageUrl) ? schemaImageUrl : undefined,
                datePublished: schemaPublishedDate,
                dateModified: isNonEmpty(modifiedDate) ? modifiedDate : undefined,
                author: isNonEmpty(schemaAuthorName)
                  ? [{ "@type": "Person", name: schemaAuthorName }]
                  : undefined,
                publisher: {
                  "@type": "Organization",
                  name: "रामपुर न्यूज़ | Rampur News",
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/logo.png`,
                    width: 768,
                    height: 768,
                  },
                },
                articleSection: isNonEmpty(article.categoryHindi)
                  ? article.categoryHindi
                  : isNonEmpty(categoryLabelHindi)
                    ? categoryLabelHindi
                    : undefined,
                inLanguage: "hi-IN",
                isAccessibleForFree: true,
                keywords: keywordList.length > 0 ? keywordList.join(", ") : undefined,
                about: ai?.primaryEntity
                  ? { "@type": ai.primaryEntity.type, name: ai.primaryEntity.name }
                  : undefined,
                mentions: ai?.mentions?.length
                  ? ai.mentions.map((m) => ({ "@type": m.type, name: m.name }))
                  : undefined,
              }
            : null,
      ) as Record<string, unknown>)
    : null;

  const breadcrumbSchema =
    canInjectSchema && article
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
      <NewsDetail nextParams={{ category, slug }} />
    </>
  );
}
