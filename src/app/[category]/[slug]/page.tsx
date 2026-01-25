import NewsDetail from "@/views/NewsDetail";
import type { Metadata } from "next";
import type { CMSArticle } from "@/services/cms";
import {
  VALID_NEWS_CATEGORIES,
  deriveAiSeoSignals,
  getCategoryHindi,
  stripHtmlToText,
  truncateText,
} from "@/lib/utils";
import { headers } from "next/headers";

const SITE_URL = "https://rampurnews.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const getRequestOrigin = async () => {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "http";
  if (!host) return "";
  return `${proto}://${host}`;
};

const fetchArticleForSeo = async (slug: string): Promise<CMSArticle | null> => {
  const origin = await getRequestOrigin();
  const url = origin
    ? `${origin}/api/cms/strapi/articles/slug/${encodeURIComponent(slug)}`
    : `${SITE_URL}/api/cms/strapi/articles/slug/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CMSArticle;
  } catch {
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
  const isValidCategory = VALID_NEWS_CATEGORIES.includes(category);
  const canonicalPath = isValidCategory ? `/${category}/${slug}` : `/${slug}`;

  const article = await fetchArticleForSeo(slug);
  if (!article || (isValidCategory && article.category !== category)) {
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

  const seoTitle = article.seoTitle?.trim() || article.title;
  const bodyText = stripHtmlToText(article.content || "");
  const seoDescription =
    article.seoDescription?.trim() ||
    article.excerpt?.trim() ||
    truncateText(bodyText, 150) ||
    "ताज़ा खबरें पढ़ें | रामपुर न्यूज़";

  const imageUrl = article.image || DEFAULT_OG_IMAGE;
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
  const articleSection = article.categoryHindi || getCategoryHindi(category);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical,
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
  const isValidCategory = VALID_NEWS_CATEGORIES.includes(category);
  const canonicalPath = isValidCategory ? `/${category}/${slug}` : `/${slug}`;

  const article = await fetchArticleForSeo(slug);
  const canInjectSchema = !!article && (!isValidCategory || article.category === category);

  const title = article?.seoTitle?.trim() || article?.title || "";
  const bodyText = article ? stripHtmlToText(article.content || "") : "";
  const description = article
    ? article.seoDescription?.trim() ||
      article.excerpt?.trim() ||
      truncateText(bodyText, 150)
    : "";
  const imageUrl = (article?.image || DEFAULT_OG_IMAGE).trim();
  const authorName = article?.author?.trim() || "Rampur News Desk";
  const publishedDate = article?.publishedDate || "";
  const modifiedDate = article?.modifiedDate || article?.publishedDate || "";

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
  const categoryLabelHindi = getCategoryHindi(category);

  const schemaFromCms =
    canInjectSchema && article && article.schemaJson && typeof article.schemaJson === "object" && !Array.isArray(article.schemaJson)
      ? (article.schemaJson as Record<string, unknown>)
      : null;

  const newsArticleSchema = schemaFromCms
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
          description: description || article.excerpt,
          image: {
            "@type": "ImageObject",
            url: imageUrl,
            width: 1200,
            height: 630,
          },
          thumbnailUrl: imageUrl,
          datePublished: publishedDate,
          dateModified: modifiedDate,
          author: [{ "@type": "Person", name: authorName }],
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
          articleSection: article.categoryHindi || categoryLabelHindi,
          inLanguage: "hi-IN",
          isAccessibleForFree: true,
          keywords: keywordList.join(", "),
          about: ai?.primaryEntity
            ? { "@type": ai.primaryEntity.type, name: ai.primaryEntity.name }
            : undefined,
          mentions: ai?.mentions?.length
            ? ai.mentions.map((m) => ({ "@type": m.type, name: m.name }))
            : undefined,
        }
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
              item: `${SITE_URL}/${category}`,
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
