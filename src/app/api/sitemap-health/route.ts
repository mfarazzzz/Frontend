import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import type { CMSArticle } from "@/services/cms";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";
const PAGE_SIZE = 200;
const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

const fetchAllByStatus = async (status: "published" | "draft") => {
  const provider = getCMSProvider();
  let offset = 0;
  const all: CMSArticle[] = [];
  while (true) {
    const res = await provider.getArticles({
      status,
      limit: PAGE_SIZE,
      offset,
      orderBy: "publishedDate",
      order: "desc",
    });
    const batch = res.data || [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    offset += batch.length;
    if (typeof res.total === "number" && offset >= res.total) break;
  }
  return all;
};

const buildArticleUrl = (article: CMSArticle) => {
  const canonical = article.canonicalUrl?.trim();
  if (canonical) return canonical;
  const path = article.category ? `/${article.category}/${article.slug}` : `/${article.slug}`;
  return new URL(path, SITE_URL).toString();
};

export async function GET() {
  try {
    const [published, drafts] = await Promise.all([
      fetchAllByStatus("published"),
      fetchAllByStatus("draft"),
    ]);

    const now = Date.now();
    const recentCount = published.filter((article) => {
      const dateValue = article.publishedDate || article.publishedAt || "";
      const time = dateValue ? new Date(dateValue).getTime() : 0;
      return Number.isFinite(time) && now - time <= RECENT_WINDOW_MS;
    }).length;

    const urlCounts = new Map<string, number>();
    for (const article of published) {
      const url = buildArticleUrl(article);
      urlCounts.set(url, (urlCounts.get(url) || 0) + 1);
    }
    const duplicateUrlCount = Array.from(urlCounts.values()).filter((count) => count > 1).length;

    const draftLeakCount = drafts.filter((article) => {
      const dateValue = article.publishedDate || article.publishedAt;
      return typeof dateValue === "string" && dateValue.trim().length > 0;
    }).length;

    return NextResponse.json({
      sitemapArticleCount: published.length,
      recentArticleCount: recentCount,
      draftLeakCount,
      duplicateUrlCount,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sitemap health check failed:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap health report." },
      { status: 500 },
    );
  }
}
