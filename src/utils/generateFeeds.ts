import type { CMSArticle } from "@/services/cms";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "रामपुर न्यूज़";
const SITE_DESCRIPTION = "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। Breaking News, Local Updates, Education, Sports, Entertainment.";

/**
 * Normalize a canonical URL so it always uses the configured SITE_URL domain.
 * Prevents GSC "url not allowed at this location" errors from www/non-www mismatches.
 */
const normalizeSiteUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const siteObj = new URL(SITE_URL);
    const bareHost = parsed.hostname.replace(/^www\./, "");
    const bareSiteHost = siteObj.hostname.replace(/^www\./, "");
    if (bareHost === bareSiteHost) {
      return `${SITE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Not a valid URL — return as-is
  }
  return url;
};

type FeedArticle = Pick<
  CMSArticle,
  | "title"
  | "slug"
  | "excerpt"
  | "content"
  | "author"
  | "category"
  | "categoryHindi"
  | "publishedDate"
  | "image"
  | "isBreaking"
  | "canonicalUrl"
>;

export const getAllNewsSorted = (articles: FeedArticle[]): FeedArticle[] => {
  return [...articles];
};

const buildCanonicalUrl = (article: FeedArticle) => {
  const canonical = (article.canonicalUrl || "").trim();
  if (canonical) {
    if (canonical.startsWith("http://") || canonical.startsWith("https://")) {
      const normalized = normalizeSiteUrl(canonical);
      // Skip URLs that don't belong to our site (e.g. example.com placeholders)
      if (!normalized.startsWith(SITE_URL)) return "";
      return normalized;
    }
    return `${SITE_URL}${canonical.startsWith("/") ? canonical : `/${canonical}`}`;
  }
  return `${SITE_URL}/${article.category}/${article.slug}`;
};

// Get news from last 48 hours for Google News sitemap
export const getRecentNews = (articles: FeedArticle[], hours: number = 48): FeedArticle[] => {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  return getAllNewsSorted(articles).filter(
    (article) => new Date(article.publishedDate) > cutoffTime
  );
};

// Escape XML special characters
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// Clean content for RSS (remove scripts, styles, etc. if needed - basic for now)
const cleanContent = (html: string): string => {
  if (!html) return "";
  // Basic cleanup - in a real app, use a sanitizer library
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
             .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gm, "");
};

// Generate RSS 2.0 feed
export const generateRSSFeed = (articles: FeedArticle[]): string => {
  const recentArticles = getAllNewsSorted(articles).slice(0, 50);
  const lastBuildDate = new Date().toUTCString();
  const pubDate = recentArticles[0]?.publishedDate 
    ? new Date(recentArticles[0].publishedDate).toUTCString() 
    : lastBuildDate;

  const items = recentArticles.map((article) => {
    const link = buildCanonicalUrl(article);
    const imageUrl = article.image 
      ? (article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`)
      : null;

    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(article.publishedDate).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt || ""}]]></description>
      <content:encoded><![CDATA[
        ${imageUrl ? `<img src="${imageUrl}" alt="${escapeXml(article.title)}" style="max-width: 100%; height: auto;" /><br/>` : ""}
        ${cleanContent(article.content || article.excerpt || "")}
      ]]></content:encoded>
      <dc:creator><![CDATA[${article.author || SITE_NAME}]]></dc:creator>
      <category><![CDATA[${article.categoryHindi || "News"}]]></category>
      ${imageUrl ? `<media:content url="${escapeXml(imageUrl)}" medium="image" type="image/jpeg" />` : ""}
      ${imageUrl ? `<enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>hi</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <copyright>Copyright ${new Date().getFullYear()} ${SITE_NAME}</copyright>
    <generator>Rampur News CMS</generator>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;
};

// Generate Atom 1.0 feed
export const generateAtomFeed = (articles: FeedArticle[]): string => {
  const recentArticles = getAllNewsSorted(articles).slice(0, 50);
  const updatedTime = new Date().toISOString();

  const entries = recentArticles.map((article) => {
    const link = buildCanonicalUrl(article);
    const imageUrl = article.image 
      ? (article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`)
      : null;

    return `
  <entry>
    <id>${link}</id>
    <title type="text">${escapeXml(article.title)}</title>
    <link href="${link}" rel="alternate" type="text/html" />
    <published>${new Date(article.publishedDate).toISOString()}</published>
    <updated>${new Date(article.publishedDate).toISOString()}</updated>
    <author>
      <name>${escapeXml(article.author || SITE_NAME)}</name>
    </author>
    <category term="${escapeXml(article.category)}" label="${escapeXml(article.categoryHindi)}" />
    <summary type="text">${escapeXml(article.excerpt || "")}</summary>
    <content type="html"><![CDATA[
      ${imageUrl ? `<img src="${imageUrl}" alt="${escapeXml(article.title)}" /><br/>` : ""}
      ${cleanContent(article.content || "")}
    ]]></content>
    ${imageUrl ? `<link href="${escapeXml(imageUrl)}" rel="enclosure" type="image/jpeg" />` : ""}
  </entry>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="hi">
  <id>${SITE_URL}/</id>
  <title type="text">${SITE_NAME}</title>
  <subtitle type="text">${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${SITE_URL}" rel="alternate" type="text/html" />
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <updated>${updatedTime}</updated>
  <author>
    <name>${SITE_NAME}</name>
    <uri>${SITE_URL}</uri>
  </author>
  <generator uri="${SITE_URL}" version="1.0">Rampur News CMS</generator>
  <icon>${SITE_URL}/favicon.ico</icon>
  <logo>${SITE_URL}/logo.png</logo>
  <rights>Copyright ${new Date().getFullYear()} ${SITE_NAME}</rights>
  ${entries}
</feed>`;
};

// Generate Google News Sitemap
export const generateNewsSitemap = (articles: FeedArticle[], hours: number = 48): string => {
  const recentArticles = getRecentNews(articles, hours);
  
  const urlEntries = recentArticles.map((article) => {
    const articleUrl = buildCanonicalUrl(article);
    // Skip articles with invalid/external canonical URLs (e.g. example.com)
    if (!articleUrl) return "";
    const keywords = [article.categoryHindi, "रामपुर", "उत्तर प्रदेश", "ताज़ा खबर"]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .join(", ");
    const publishedIso = article.publishedDate ? new Date(article.publishedDate).toISOString() : new Date().toISOString();
    const imageUrl = article.image || `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}`;
    
    return `
  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${publishedIso}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${publishedIso}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:caption>${escapeXml(article.title)}</image:caption>
    </image:image>
  </url>`;
  }).filter(Boolean).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- 
    Google News Sitemap - Auto-generated
    Contains news articles from the last 48 hours
    Last updated: ${new Date().toISOString()}
  -->
  ${urlEntries}
</urlset>`;
};
