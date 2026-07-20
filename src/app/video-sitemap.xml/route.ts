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
import { YOUTUBE_CHANNELS, uploadsPlaylistId } from "@/config/youtube";

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

    // Also add latest videos from the YouTube channel (not embedded in articles)
    const channelId = YOUTUBE_CHANNELS[0]?.id;
    if (channelId) {
      try {
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
        const feedRes = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
        if (feedRes.ok) {
          const xml = await feedRes.text();
          const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
          let match: RegExpExecArray | null;
          let count = 0;

          while ((match = entryRegex.exec(xml)) !== null && count < 20) {
            const entry = match[1];
            const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
            const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
            const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

            const id = idMatch?.[1]?.trim();
            const title = titleMatch?.[1]?.trim();
            const published = publishedMatch?.[1]?.trim();
            const desc = descMatch?.[1]?.trim();

            if (id && title) {
              // Link to the /videos page as the hosting URL
              const videoPageUrl = `${SITE_URL}/videos`;
              const thumbUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

              entries.push(`
  <url>
    <loc>${esc(videoPageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${esc(thumbUrl)}</video:thumbnail_loc>
      <video:title>${esc(title)}</video:title>
      <video:description>${esc((desc || title).slice(0, 2048))}</video:description>
      <video:player_loc allow_embed="yes">https://www.youtube.com/embed/${id}</video:player_loc>
      <video:publication_date>${published || new Date().toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
      <video:platform relationship="allow">web mobile tv</video:platform>
    </video:video>
  </url>`);
              count++;
            }
          }
        }
      } catch {
        // YouTube feed unavailable — skip channel videos
      }
    }
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
