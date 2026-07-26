/**
 * /api/indexnow — Instant URL indexing via IndexNow protocol
 *
 * Notifies Bing, Yandex, and other participating search engines
 * that a URL has been updated. Called by the CMS webhook after article publish.
 *
 * Usage:
 *   POST /api/indexnow
 *   Body: { urls: ["/rampur/article-slug", "/up/another-slug"] }
 *   Headers: { Authorization: Bearer <REVALIDATION_SECRET> }
 *
 * IndexNow key file must exist at: /public/{key}.txt
 * https://www.indexnow.org/documentation
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "rampurnews-indexnow-key-2026";
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET || "";

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!REVALIDATION_SECRET || token !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { urls?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawUrls = body.urls || [];
  if (!Array.isArray(rawUrls) || rawUrls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  // Normalize URLs to absolute
  const urls = rawUrls.slice(0, 100).map((u) => {
    const trimmed = u.trim();
    if (trimmed.startsWith("http")) return trimmed;
    return `${SITE_URL}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  });

  // Submit to IndexNow (Bing + Yandex + others simultaneously)
  const indexNowEndpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const results = await Promise.allSettled(
    indexNowEndpoints.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      return { endpoint, status: res.status, ok: res.ok };
    }),
  );

  const submitted = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { endpoint: indexNowEndpoints[i], status: 0, ok: false, error: (r.reason as Error).message };
  });

  console.log(`[IndexNow] Submitted ${urls.length} URLs:`, submitted);

  // Also ping Google to re-crawl the sitemap (accelerates discovery of new pages)
  try {
    await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`,
      { method: "GET", signal: AbortSignal.timeout(5000) },
    );
    await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/news-sitemap.xml`)}`,
      { method: "GET", signal: AbortSignal.timeout(5000) },
    );
    console.log("[IndexNow] Google sitemap ping sent.");
  } catch {
    // Non-blocking — Google ping is best-effort
  }

  return NextResponse.json({
    success: true,
    urlsSubmitted: urls.length,
    results: submitted,
  });
}

/**
 * GET /api/indexnow — Returns the IndexNow verification key
 * (Alternative to hosting the key as a static file)
 */
export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
