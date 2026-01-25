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
      return {
        category,
        slug: post.slug,
        title: post.title?.rendered || "",
        excerpt: stripHtml(post.excerpt?.rendered || ""),
        publishedDate: post.date,
      };
    })
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 50);

  const updated =
    items[0]?.publishedDate || new Date().toISOString();

  const atom = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<feed xmlns="http://www.w3.org/2005/Atom">`,
    `<title>रामपुर न्यूज़ | Rampur News</title>`,
    `<id>${BASE_URL}/</id>`,
    `<link href="${BASE_URL}/atom.xml" rel="self" />`,
    `<link href="${BASE_URL}/" rel="alternate" />`,
    `<updated>${new Date(updated).toISOString()}</updated>`,
    `<author><name>रामपुर न्यूज़</name></author>`,
    ...items.map((item) => {
      const url = `${BASE_URL}/${item.category}/${item.slug}`;
      return [
        `<entry>`,
        `<title><![CDATA[${item.title}]]></title>`,
        `<id>${url}</id>`,
        `<link href="${url}" />`,
        `<updated>${new Date(item.publishedDate).toISOString()}</updated>`,
        `<summary><![CDATA[${item.excerpt}]]></summary>`,
        `</entry>`,
      ].join("");
    }),
    `</feed>`,
  ].join("");

  return new NextResponse(atom, {
    status: 200,
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
