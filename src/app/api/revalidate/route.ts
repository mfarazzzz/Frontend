/**
 * POST /api/revalidate
 *
 * Receives revalidation webhooks from both:
 * - Custom CMS (new): sends { paths: [...], contentType, slug, source: 'custom-cms' } with x-revalidate-token header
 * - Strapi (existing): may send different payload format with x-revalidate-token, query param, or body secret
 *
 * Both systems can trigger this endpoint independently.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCMSProvider } from "@/services/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "rampurnews-indexnow-key-2026";

/**
 * Fire-and-forget IndexNow submission for newly published/updated content.
 * Notifies Bing, Yandex, and other participating search engines instantly.
 * Also pings Google to re-crawl sitemaps (accelerates Discover/News inclusion).
 */
async function triggerIndexNow(paths: string[]): Promise<void> {
  const urls = paths.slice(0, 50).map((p) =>
    p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`,
  );

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  // Submit to IndexNow endpoints (Bing + API hub)
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  await Promise.allSettled(
    endpoints.map((endpoint) =>
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      }),
    ),
  );

  // Ping Google to re-crawl sitemaps (accelerates Discover discovery)
  await Promise.allSettled([
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    }),
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/news-sitemap.xml`)}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    }),
  ]);
}

// ─── Token extraction ─────────────────────────────────────────────────────────
// Supports multiple token locations for backwards compatibility:
// - x-revalidate-token header (Custom CMS + new Strapi format)
// - x-webhook-secret header (legacy Strapi webhooks)
// - authorization header (Bearer token)
// - ?secret= query param (legacy)
// - body.secret field (legacy)
const getToken = (request: NextRequest, body: any): string => {
  const headerToken = request.headers.get("x-revalidate-token");
  if (headerToken) return headerToken;

  const webhookSecret = request.headers.get("x-webhook-secret");
  if (webhookSecret) return webhookSecret;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    // Strip "Bearer " prefix if present
    return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  }

  const queryToken = request.nextUrl.searchParams.get("secret");
  if (queryToken) return queryToken;

  const bodyToken = typeof body?.secret === "string" ? body.secret : null;
  if (bodyToken) return bodyToken;

  return "";
};

export async function POST(request: NextRequest) {
  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  // ─── Token verification ───────────────────────────────────────────────────
  // Check both REVALIDATION_SECRET (new) and REVALIDATE_SECRET (legacy) env vars
  const expectedToken = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET;
  if (expectedToken) {
    const token = getToken(request, payload);
    if (!token || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // ─── Custom CMS format ────────────────────────────────────────────────────
    // { paths: string[], contentType?, slug?, source: 'custom-cms' }
    if (payload?.source === "custom-cms" && Array.isArray(payload?.paths)) {
      const revalidated: string[] = [];
      for (const path of payload.paths) {
        if (typeof path === "string" && path.trim()) {
          revalidatePath(path.trim());
          revalidated.push(path.trim());
        }
      }

      // ─── Auto-trigger IndexNow for Google Discover / Bing instant indexing ──
      // Fire-and-forget: don't block the revalidation response
      const contentPaths = revalidated.filter(
        (p) => p !== "/" && !p.includes("sitemap") && !p.startsWith("/api"),
      );
      if (contentPaths.length > 0) {
        triggerIndexNow(contentPaths).catch(() => {});
      }

      return NextResponse.json(
        { revalidated: true, paths: revalidated, source: "custom-cms", indexNowTriggered: contentPaths.length > 0, now: Date.now() },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    // ─── Strapi webhook format ────────────────────────────────────────────────
    // { event?, model?, entry? } OR legacy { slug, type, category, paths?, secret? }
    const slug = typeof payload?.slug === "string" ? payload.slug.trim() : "";
    const type = typeof payload?.type === "string" ? payload.type.trim() : "";
    const category = typeof payload?.category === "string" ? payload.category.trim() : "";

    // Always revalidate base paths
    const paths = new Set<string>(["/", "/sitemap.xml", "/sitemap-news.xml", "/news-sitemap.xml"]);

    // Accept explicit paths array from publish handler (single-source revalidation)
    if (Array.isArray(payload?.paths)) {
      for (const p of payload.paths) {
        if (typeof p === "string" && p.trim()) paths.add(p.trim());
      }
    }

    // Strapi event-based webhook: derive paths from entry
    if (payload?.entry?.slug) {
      const entrySlug = payload.entry.slug;
      const entryCategory = payload.entry?.category?.slug || payload.entry?.category;
      if (entryCategory) {
        paths.add(`/${entryCategory}/${entrySlug}`);
        paths.add(`/${entryCategory}`);
      } else {
        paths.add(`/${entrySlug}`);
      }
    }

    // Fallback: derive paths from slug + category if no explicit paths provided
    if (type === "article" && slug && !Array.isArray(payload?.paths)) {
      let categorySlug = category;
      if (!categorySlug) {
        try {
          const provider = getCMSProvider();
          const article = await provider.getArticleBySlug(slug);
          if (article?.category) categorySlug = article.category;
        } catch {
          categorySlug = "";
        }
      }
      if (categorySlug) {
        paths.add(`/${categorySlug}/${slug}`);
        paths.add(`/${categorySlug}`);
      } else if (slug) {
        paths.add(`/${slug}`);
      }
    }

    const revalidated: string[] = [];
    for (const path of paths) {
      try {
        revalidatePath(path);
        revalidated.push(path);
      } catch {
        void 0;
      }
    }

    return NextResponse.json(
      {
        revalidated: true,
        paths: revalidated,
        source: payload?.source || "strapi",
        now: Date.now(),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
