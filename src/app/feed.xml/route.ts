import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateRSSFeed } from "@/utils/generateFeeds";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getCMSProvider();
    const res = await provider.getArticles({
      status: "published",
      limit: 500,
      orderBy: "publishedDate",
      order: "desc",
    });

    const articles = res.data || [];

    const feedArticles = articles.map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      categoryHindi: article.categoryHindi,
      publishedDate: article.publishedDate,
      image: article.image,
      isBreaking: !!article.isBreaking,
    }));

    const rss = generateRSSFeed(feedArticles);

    return new NextResponse(rss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
