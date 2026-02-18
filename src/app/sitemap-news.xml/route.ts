import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateNewsSitemap } from "@/utils/generateFeeds";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getCMSProvider();
    const res = await provider.getArticles({
      status: "published",
      limit: 200,
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

    const xml = generateNewsSitemap(feedArticles);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating news sitemap:", error);
    return new NextResponse("Error generating news sitemap", { status: 500 });
  }
}

