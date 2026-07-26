/**
 * /video-sitemap.xml — Google Video Sitemap
 *
 * Generates a video sitemap for articles with YouTube embeds.
 * Helps Google index video content for Video rich results, Google Discover,
 * and Google Video search.
 *
 * References:
 * - https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 * - https://developers.google.com/search/docs/appearance/structured-data/video
 */
import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;",
  );

/**
 * Extract YouTube video ID from various URL formats.
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Direct ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/").filter(Boolean)[1] || null;
      }
      return parsed.searchParams.get("v") || null;
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

export async function GET() {
  const entries: string[] = [];

  try {
    const provider = getCMSProvider();

    // Fetch articles with YouTube videos
    const articlesRes = await provider.getArticles({
      status: "published",
      limit: 1000,
      orderBy: "publishedDate",
      order: "desc",
    });

    const articles = (articlesRes.data || []).filter(
      (a) => a.videoType === "youtube" && a.videoUrl,
    );

    for (const article of articles) {
      const videoId = extractYouTubeId(article.videoUrl || "");
      if (!videoId) continue;

      const articleUrl = `${SITE_URL}/${article.category}/${article.slug}`;
      const thumbnailUrl = article.image || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const publishedDate = article.publishedAt || article.publishedDate || "";
      const title = article.videoTitle || article.title || "";
      const description = article.excerpt || article.title || "";

      entries.push(`
  <url>
    <loc>${esc(articleUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${esc(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${esc(title)}</video:title>
      <video:description>${esc(description.slice(0, 2048))}</video:description>
      <video:player_loc allow_embed="yes">https://www.youtube.com/embed/${videoId}</video:player_loc>
      <video:publication_date>${publishedDate ? new Date(publishedDate).toISOString() : new Date().toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:platform relationship="allow">web mobile tv</video:platform>
    </video:video>
  </url>`);
    }

    // NOTE: Only article-embedded videos are included in the video sitemap.
    // Channel-only videos (not embedded in articles) are NOT listed here because:
    // - They don't have dedicated "watch pages" on rampurnews.com
    // - Google requires each video URL to be a page primarily about that video
    // - Channel videos are already indexed via YouTube itself
    // This fixes the GSC "Video isn't on a watch page" error.
  } catch (error) {
    console.error("[video-sitemap] Error:", error);
  }

  // If no videos, return a valid empty sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <!-- 
    Video Sitemap - Auto-generated
    Includes YouTube videos from articles and channel
    Last updated: ${new Date().toISOString()}
    Total videos: ${entries.length}
  -->${entries.join("")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200",
    },
  });
}
