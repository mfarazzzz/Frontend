import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Redirect cache (in-memory, 60s TTL) ─────────────────────────────────────
let redirectCache: Map<string, { to: string; status: number }> | null = null;
let redirectCacheExpiry = 0;
const REDIRECT_CACHE_TTL = 60_000; // 60 seconds

async function getRedirects(): Promise<Map<string, { to: string; status: number }>> {
  const now = Date.now();
  if (redirectCache && now < redirectCacheExpiry) return redirectCache;

  try {
    const cmsUrl = process.env.CUSTOM_CMS_URL || process.env.NEXT_PUBLIC_CUSTOM_CMS_URL || 'https://cms.rampurnews.com';
    const res = await fetch(`${cmsUrl}/api/public/v2/seo/redirects`, {
      next: { revalidate: 60 },
    } as RequestInit);

    if (res.ok) {
      const json = await res.json();
      const map = new Map<string, { to: string; status: number }>();
      for (const r of (json.data || [])) {
        map.set(r.from_path, { to: r.to_path, status: r.status_code || 301 });
      }
      redirectCache = map;
      redirectCacheExpiry = now + REDIRECT_CACHE_TTL;
      return map;
    }
  } catch {
    // Silently fail — don't block page loads for redirect lookup failures
  }

  return redirectCache || new Map();
}

export async function middleware(request: NextRequest) {
  // ─── Canonical host redirect ────────────────────────────────────────────────
  const canonicalHost = "rampurnews.com";
  const host = request.headers.get("host") || "";
  if (host && host.toLowerCase() !== canonicalHost) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = canonicalHost;
    return NextResponse.redirect(url, 301);
  }

  // ─── HTTPS redirect ─────────────────────────────────────────────────────────
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  if (proto !== "https") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // ─── CMS-managed redirects ──────────────────────────────────────────────────
  const pathname = request.nextUrl.pathname;
  // Skip Next.js internal routes, static assets, and localhost dev
  if (!pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
    try {
      const redirects = await getRedirects();
      const redirect = redirects.get(pathname);
      if (redirect) {
        const destination = new URL(redirect.to, request.url);
        return NextResponse.redirect(destination, redirect.status as 301 | 302 | 307 | 308);
      }
    } catch {
      // Silently continue if redirect lookup fails — don't break page loads
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
