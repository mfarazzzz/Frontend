import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateRSSFeed } from "@/utils/generateFeeds";

export const dynamic = "force-dynamic";

const EMPTY_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>रामपुर न्यूज़ | Rampur News</title>
    <link>https://rampurnews.com</link>
    <description>रामपुर और उत्तर प्रदेश की ताज़ा खबरें</description>
  </channel>
</rss>`;

export async function GET() {
  try {
    const provider = getCMSProvider();
    const res = await provider.getArticles({
      status: "published",
      limit: 50,
      orderBy: "publishedDate",
      order: "desc",
    });

    const articles = res.data || [];

    const feedArticles = articles.map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      category: article.category,
      categoryHindi: article.categoryHindi,
      publishedDate: article.publishedDate,
      image: article.image,
      isBreaking: !!article.isBreaking,
      canonicalUrl: article.canonicalUrl,
    }));

    const rss = generateRSSFeed(feedArticles);

    return new NextResponse(rss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating feed.xml:", error);
    return new NextResponse(EMPTY_RSS, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  }
}
