import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { stripHtmlToText, truncateText } from "@/lib/utils";

const SITE_URL = "https://rampurnews.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;
const toAbsoluteUrl = (value?: string) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${SITE_URL}${raw}`;
  return `${SITE_URL}/${raw}`;
};

const escapeHtml = (value: string) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isNonEmpty = (value?: string) => typeof value === "string" && value.trim().length > 0;

const htmlToParagraphs = (value: string) => {
  const withBreaks = String(value || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h\d>/gi, "\n");
  const text = stripHtmlToText(withBreaks);
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const buildAmpHtml = (input: {
  title: string;
  description: string;
  canonicalUrl: string;
  ampUrl: string;
  imageUrl: string;
  publishedDate: string;
  modifiedDate: string;
  authorName: string;
  articleBody: string;
  categoryLabel: string;
  keywords: string[];
  indexable: boolean;
}) => {
  const paragraphs = htmlToParagraphs(input.articleBody);
  const headline = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const authorName = escapeHtml(input.authorName);
  const canonicalUrl = escapeHtml(input.canonicalUrl);
  const ampUrl = escapeHtml(input.ampUrl);
  const imageUrl = escapeHtml(input.imageUrl);
  const publishedDate = escapeHtml(input.publishedDate);
  const modifiedDate = escapeHtml(input.modifiedDate);
  const keywords = escapeHtml(input.keywords.join(", "));
  const categoryLabel = escapeHtml(input.categoryLabel);
  const indexable = input.indexable;

  const hasSchemaFields =
    input.authorName.trim().length > 0 &&
    input.imageUrl.trim().length > 0 &&
    input.publishedDate.trim().length > 0;

  const schemaJson = indexable && hasSchemaFields
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": input.canonicalUrl },
        headline: input.title,
        name: input.title,
        description: input.description,
        image: {
          "@type": "ImageObject",
          url: input.imageUrl,
          width: 1200,
          height: 630,
        },
        thumbnailUrl: input.imageUrl,
        datePublished: input.publishedDate,
        dateModified: input.modifiedDate || input.publishedDate,
        author: [{ "@type": "Person", name: input.authorName }],
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
        articleSection: input.categoryLabel,
        inLanguage: "hi-IN",
        isAccessibleForFree: true,
        keywords: input.keywords.join(", "),
      })
    : "";

  const robotsMeta = indexable
    ? ""
    : `<meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />`;

  return `<!doctype html>
<html amp lang="hi">
  <head>
    <meta charset="utf-8" />
    <title>${headline}</title>
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="amphtml" href="${ampUrl}" />
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
    <meta name="description" content="${description}" />
    <meta name="author" content="${authorName}" />
    <meta name="keywords" content="${keywords}" />
    ${robotsMeta}
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
    <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <style amp-custom>
      body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Noto Sans Devanagari","Segoe UI",sans-serif;margin:0;background:#fff;color:#0f172a}
      header{padding:16px 20px;border-bottom:1px solid #e2e8f0}
      header a{color:#0f172a;text-decoration:none;font-weight:700}
      main{padding:20px;max-width:900px;margin:0 auto}
      h1{font-size:28px;line-height:1.35;margin:12px 0}
      .meta{font-size:13px;color:#475569;margin-bottom:16px}
      .badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#e2e8f0;color:#0f172a;font-size:12px;margin-right:8px}
      article p{font-size:18px;line-height:1.7;margin:14px 0}
    </style>
    ${schemaJson ? `<script type="application/ld+json">${schemaJson}</script>` : ""}
  </head>
  <body>
    <header>
      <a href="${SITE_URL}">रामपुर न्यूज़</a>
    </header>
    <main>
      <div class="meta">
        <span class="badge">${categoryLabel}</span>
        <span>${authorName}</span>
        <span> • ${publishedDate}</span>
      </div>
      <h1>${headline}</h1>
      <amp-img src="${imageUrl}" width="1200" height="630" layout="responsive" alt="${headline}"></amp-img>
      <article>
        ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      </article>
    </main>
  </body>
</html>`;
};

export async function GET(request: Request, context: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await context.params;
  const provider = getCMSProvider();
  const article = await provider.getArticleBySlug(slug);

  if (!article) {
    return new NextResponse("Article not found", { status: 404 });
  }

  const requestedCategory = (category || "").trim().toLowerCase();
  const articleCategory = (article.category || "").trim().toLowerCase();
  if (articleCategory && articleCategory !== requestedCategory) {
    return new NextResponse("Article not found", { status: 404 });
  }
  const canonicalPath = requestedCategory ? `/${requestedCategory}/${slug}` : `/${slug}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const ampUrl = `${SITE_URL}/amp${canonicalPath}`;
  const shortHeadline = article.short_headline?.trim() || "";
  const title =
    shortHeadline.length >= 55 && shortHeadline.length <= 65
      ? shortHeadline
      : article.seoTitle?.trim() || article.title;
  const bodyText = stripHtmlToText(article.content || "");
  const description =
    article.seoDescription?.trim() ||
    article.excerpt?.trim() ||
    truncateText(bodyText, 150) ||
    "ताज़ा खबरें पढ़ें | रामपुर न्यूज़";
  const rawImageUrl = article.image?.trim() || "";
  const imageUrl = toAbsoluteUrl(rawImageUrl || DEFAULT_IMAGE);
  const authorName = article.author?.trim() || "";
  const publishedDate = (article.publishedAt || article.publishedDate || "").trim();
  const modifiedDate = (article.modifiedDate || article.publishedAt || article.publishedDate || "").trim();
  const categoryLabel = article.categoryHindi?.trim() || requestedCategory || "समाचार";
  const keywords = Array.isArray(article.tags) && article.tags.length > 0
    ? article.tags
    : [article.categoryHindi, "रामपुर", "Rampur"].filter(Boolean) as string[];
  const isDiscoverEligible = article.discoverEligible === true;
  const hasRequiredFields =
    isNonEmpty(title) &&
    isNonEmpty(authorName) &&
    isNonEmpty(publishedDate) &&
    isNonEmpty(rawImageUrl);
  const indexable = isDiscoverEligible && hasRequiredFields;

  const html = buildAmpHtml({
    title,
    description,
    canonicalUrl,
    ampUrl,
    imageUrl,
    publishedDate,
    modifiedDate,
    authorName,
    articleBody: article.content || article.excerpt || "",
    categoryLabel,
    keywords,
    indexable,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=1800",
    },
  });
}
