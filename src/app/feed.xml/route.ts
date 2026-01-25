import { NextResponse } from "next/server";

const BASE_URL = "https://rampurnews.com";

type WPPost = {
  slug: string;
  date: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  _embedded?: {
    "wp:term"?: Array<Array<{ slug: string; name: string }>>;
  };
};

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, "").trim();

const getWordPressBaseUrl = () => {
  const baseUrl = process.env.WORDPRESS_BASE_URL;
  if (!baseUrl) return null;
  return baseUrl.replace(/\/+$/, "");
};

const fetchLatestPosts = async (): Promise<WPPost[]> => {
  const baseUrl = getWordPressBaseUrl();
  if (!baseUrl) return [];
  const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=50&_embed=true`, {
    next: { revalidate: 300 },
  });
  if (!response.ok) return [];
  return (await response.json()) as WPPost[];
};

export async function GET() {
  const posts = await fetchLatestPosts();
  const items = posts
    .map((post) => {
      const categories = post._embedded?.["wp:term"]?.[0] || [];
      const category = categories[0]?.slug || "uncategorized";
      const categoryHindi = categories[0]?.name || "अवर्गीकृत";
      return {
        category,
        categoryHindi,
        slug: post.slug,
        title: post.title?.rendered || "",
        excerpt: stripHtml(post.excerpt?.rendered || ""),
        publishedDate: post.date,
      };
    })
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 50);

  const lastBuildDate =
    items[0]?.publishedDate || new Date().toISOString();

  const rss = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `<channel>`,
    `<title>रामपुर न्यूज़ | Rampur News</title>`,
    `<link>${BASE_URL}</link>`,
    `<description>रामपुर और उत्तर प्रदेश की ताज़ा खबरें</description>`,
    `<language>hi-IN</language>`,
    `<lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>`,
    `<atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
    ...items.map((item) => {
      const url = `${BASE_URL}/${item.category}/${item.slug}`;
      return [
        `<item>`,
        `<title><![CDATA[${item.title}]]></title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<description><![CDATA[${item.excerpt}]]></description>`,
        `<pubDate>${new Date(item.publishedDate).toUTCString()}</pubDate>`,
        `<category><![CDATA[${item.categoryHindi}]]></category>`,
        `</item>`,
      ].join("");
    }),
    `</channel>`,
    `</rss>`,
  ].join("");

  return new NextResponse(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
