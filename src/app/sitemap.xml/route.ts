import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

const ENV_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;",
  );

const iso = (v: string | Date) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const originFrom = (req: Request) => {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (proto && host) return `${proto}://${host}`;
  try {
    const u = new URL(ENV_BASE);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://rampurnews.com";
  }
};

const fetchProxy = async (req: Request, path: string) => {
  const base = originFrom(req);
  const url = `${base}/api/cms/strapi${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export async function GET(request: Request) {
  const site = ENV_BASE;
  const now = new Date();
  const staticPaths = [
    "",
    "/rampur",
    "/up",
    "/national",
    "/politics",
    "/crime",
    "/education-jobs",
    "/business",
    "/entertainment",
    "/sports",
    "/health",
    "/religion-culture",
    "/food-lifestyle",
    "/nearby",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/ownership",
    "/ownership-disclosure",
    "/editorial-policy",
    "/press-release",
    "/corrections-policy",
    "/about-us",
    "/grievance",
  ];

  const entries: string[] = [];

  for (const p of staticPaths) {
    entries.push(
      `\n  <url>\n    <loc>${esc(`${site}${p}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>${p === "" ? "always" : "daily"}</changefreq>\n    <priority>${p === "" ? "1.0" : "0.8"}</priority>\n  </url>`,
    );
  }

  const provider = getCMSProvider();
  let [articlesRes, cats, auths] = await Promise.all([
    provider.getArticles({ status: "published", limit: 5000, orderBy: "publishedDate", order: "desc" }),
    provider.getCategories(),
    provider.getAuthors(),
  ]);

  let arts = articlesRes?.data || [];
  cats = cats || [];
  auths = auths || [];

  if (!arts.length || !cats.length || !auths.length) {
    const [pArts, pCats, pAuths] = await Promise.all([
      arts.length ? Promise.resolve(null) : fetchProxy(request, "/articles?publicationState=live&filters[publishedAt][$notNull]=true&sort=publishedAt:desc&pagination[pageSize]=5000&populate=*"),
      cats.length ? Promise.resolve(null) : fetchProxy(request, "/categories?pagination[limit]=1000"),
      auths.length ? Promise.resolve(null) : fetchProxy(request, "/authors?pagination[limit]=1000"),
    ]);
    if (pArts?.data?.length) arts = pArts.data;
    if (pCats?.length) cats = pCats;
    if (pAuths?.length) auths = pAuths;
  }

  for (const c of cats) {
    const slug = c?.slug || "";
    if (slug && !staticPaths.includes(`/${slug}`)) {
      entries.push(
        `\n  <url>\n    <loc>${esc(`${site}/${slug}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      );
    }
  }

  for (const a of auths) {
    const slug = a?.slug || "";
    if (slug) {
      entries.push(
        `\n  <url>\n    <loc>${esc(`${site}/authors/${slug}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
      );
    }
  }

  for (const p of arts) {
    const dateStr = p?.modifiedDate || p?.publishedDate || p?.publishedAt || now.toISOString();
    const canonical = (p?.canonicalUrl || "").trim();
    let url = "";
    if (canonical) {
      url = canonical.startsWith("http") ? canonical : `${site}${canonical.startsWith("/") ? canonical : `/${canonical}`}`;
    } else if (p?.category && p?.slug) {
      url = `${site}/${p.category}/${p.slug}`;
    }
    if (!url) continue;
    if (url.includes("/tags") || url.includes("/admin") || url.includes("/api")) continue;
    const diff = (now.getTime() - new Date(dateStr).getTime()) / 36e5;
    let cf = "monthly";
    let pr = "0.5";
    if (diff < 24) {
      cf = "hourly";
      pr = "1.0";
    } else if (diff < 168) {
      cf = "daily";
      pr = "0.9";
    } else if (diff < 720) {
      cf = "weekly";
      pr = "0.7";
    }
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join(
    "",
  )}\n</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
