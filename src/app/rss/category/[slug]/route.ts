import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateRSSFeed } from "@/utils/generateFeeds";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const provider = getCMSProvider();
    
    // Fetch articles for the specific category
    const res = await provider.getArticles({
      category: slug,
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
    console.error("Error generating category RSS feed:", error);
    return new NextResponse("Error generating category RSS feed", { status: 500 });
  }
}
