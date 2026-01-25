import type { CMSArticle } from "@/services/cms";

const SITE_URL = "https://rampurnews.com";
const SITE_NAME = "रामपुर न्यूज़";
const SITE_DESCRIPTION = "रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। Breaking News, Local Updates, Education, Sports, Entertainment.";

type FeedArticle = Pick<
  CMSArticle,
  | "title"
  | "slug"
  | "excerpt"
  | "author"
  | "category"
  | "categoryHindi"
  | "publishedDate"
  | "image"
  | "isBreaking"
>;

export const getAllNewsSorted = (articles: FeedArticle[]): FeedArticle[] => {
  return [...articles].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
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

// Generate RSS 2.0 feed
export const generateRSSFeed = (articles: FeedArticle[]): string => {
  const recentArticles = getAllNewsSorted(articles).slice(0, 50);
  const lastBuildDate = new Date().toUTCString();
  const pubDate = recentArticles[0]?.publishedDate 
    ? new Date(recentArticles[0].publishedDate).toUTCString() 
    : lastBuildDate;

  const items = recentArticles.map((article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}/${article.category}/${article.slug}</link>
      <description>${escapeXml(article.excerpt)}</description>
      <author>${escapeXml(article.author)}</author>
      <category>${escapeXml(article.categoryHindi)}</category>
      <pubDate>${new Date(article.publishedDate).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/${article.category}/${article.slug}</guid>
      <enclosure url="${article.image}" type="image/jpeg" />
      <source url="${SITE_URL}/feed.xml">${SITE_NAME}</source>
    </item>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>hi-IN</language>
    <copyright>Copyright ${new Date().getFullYear()} ${SITE_NAME}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <managingEditor>editor@rampurnews.com (${SITE_NAME})</managingEditor>
    <webMaster>webmaster@rampurnews.com (${SITE_NAME})</webMaster>
    <generator>Rampur News CMS</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
      <width>768</width>
      <height>768</height>
    </image>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
};

// Generate Atom 1.0 feed
export const generateAtomFeed = (articles: FeedArticle[]): string => {
  const recentArticles = getAllNewsSorted(articles).slice(0, 50);
  const updatedTime = new Date().toISOString();

  const entries = recentArticles.map((article) => `
  <entry>
    <id>${SITE_URL}/${article.category}/${article.slug}</id>
    <title type="text">${escapeXml(article.title)}</title>
    <link href="${SITE_URL}/${article.category}/${article.slug}" rel="alternate" type="text/html" />
    <published>${new Date(article.publishedDate).toISOString()}</published>
    <updated>${new Date(article.publishedDate).toISOString()}</updated>
    <author>
      <name>${escapeXml(article.author)}</name>
    </author>
    <category term="${escapeXml(article.category)}" label="${escapeXml(article.categoryHindi)}" />
    <summary type="text">${escapeXml(article.excerpt)}</summary>
    <content type="html">${escapeXml(`<img src="${article.image}" alt="${article.title}" /><p>${article.excerpt}</p>`)}</content>
    <link href="${article.image}" rel="enclosure" type="image/jpeg" />
  </entry>`
  ).join("");

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
    <email>editor@rampurnews.com</email>
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
    const keywords = [article.categoryHindi, "रामपुर", "उत्तर प्रदेश", "ताज़ा खबर"].join(", ");
    const genre = article.isBreaking ? "Blog, Breaking" : "Blog";
    
    return `
  <url>
    <loc>${SITE_URL}/${article.category}/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:genres>${genre}</news:genres>
      <news:publication_date>${new Date(article.publishedDate).toISOString()}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
    <image:image>
      <image:loc>${article.image}</image:loc>
      <image:caption>${escapeXml(article.title)}</image:caption>
    </image:image>
  </url>`;
  }).join("");

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
