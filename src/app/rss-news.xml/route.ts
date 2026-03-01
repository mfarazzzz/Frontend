import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateRSSFeed, getRecentNews } from "@/utils/generateFeeds";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getCMSProvider();
    const res = await provider.getArticles({
      status: "published",
      limit: 100, // Fetch more to filter
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

    // Filter for last 48 hours
    const recentNews = getRecentNews(feedArticles, 48);
    const rss = generateRSSFeed(recentNews);

    return new NextResponse(rss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "s-maxage=1800, stale-while-revalidate", // 30 mins cache for news
      },
    });
  } catch (error) {
    console.error("Error generating news RSS feed:", error);
    return new NextResponse("Error generating news RSS feed", { status: 500 });
  }
}
