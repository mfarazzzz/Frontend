import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { generateNewsSitemap } from "@/utils/generateFeeds";

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
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const recentArticles = articles.filter((article) => {
      const published = new Date(article.publishedDate || "").getTime();
      return Number.isFinite(published) && published >= cutoff;
    }).slice(0, 1000);

    const feedArticles = recentArticles.map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content || article.excerpt,
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
    // Return a valid empty sitemap so Googlebot never receives a 500.
    // An empty sitemap is far better than a crawler-penalising error response.
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;
    return new NextResponse(emptySitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Short cache on error so it recovers quickly once Strapi is back
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  }
}
