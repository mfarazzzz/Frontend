import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateNewsSitemap } from "@/utils/generateFeeds";

export const revalidate = 60;

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
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const recentArticles = articles.filter((article) => {
      const published = new Date(article.publishedDate || "").getTime();
      return Number.isFinite(published) && published >= cutoff;
    }).slice(0, 1000);

    const feedArticles = recentArticles.map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      categoryHindi: article.categoryHindi,
      publishedDate: article.publishedDate,
      image: article.image,
      isBreaking: !!article.isBreaking,
      canonicalUrl: article.canonicalUrl,
    }));

    const xml = generateNewsSitemap(feedArticles);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=1800",
      },
    });
  } catch (error) {
    console.error("Error generating news sitemap:", error);
    return new NextResponse("Error generating news sitemap", { status: 500 });
  }
}
