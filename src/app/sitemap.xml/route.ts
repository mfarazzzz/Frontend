import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function absoluteSiteOrigin(request: Request): Promise<string> {
  try {
    const hdrProto = request.headers.get("x-forwarded-proto");
    const hdrHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (hdrProto && hdrHost) return `${hdrProto}://${hdrHost}`;
    const u = new URL(BASE_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://rampurnews.com";
  }
}

async function fetchViaProxy(request: Request, pathAndQuery: string) {
  const origin = await absoluteSiteOrigin(request);
  const url = `${origin}/api/cms/strapi${pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
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

    let urls: string[] = [];

    staticPaths.forEach((path) => {
      urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}${path}`)}</loc>
    <lastmod>${formatDate(now)}</lastmod>
    <changefreq>${path === "" ? "always" : "daily"}</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`);
    });

    const provider = getCMSProvider();
    const [articlesRes, categories, authors] = await Promise.all([
      provider.getArticles({
        status: "published",
        limit: 500,
        orderBy: "publishedDate",
        order: "desc",
      }),
      provider.getCategories(),
      provider.getAuthors(),
    ]);

    let cats = categories || [];
    let auths = authors || [];
    let arts = articlesRes?.data || [];

    if (cats.length === 0 || auths.length === 0 || arts.length === 0) {
      const qBase = "?publicationState=live&filters[publishedAt][$notNull]=true";
      const [pCats, pAuths, pArts] = await Promise.all([
        cats.length ? Promise.resolve(null) : fetchViaProxy(request, `/categories?pagination[limit]=1000`),
        auths.length ? Promise.resolve(null) : fetchViaProxy(request, `/authors?pagination[limit]=1000`),
        arts.length
          ? Promise.resolve(null)
          : fetchViaProxy(request, `/articles${qBase}&sort=publishedAt:desc&pagination[pageSize]=500&populate=*`),
      ]);
      if (pCats?.length) cats = pCats;
      if (pAuths?.length) auths = pAuths;
      if (pArts?.data?.length) arts = pArts.data;
    }

    (cats || []).forEach((cat: any) => {
      const slug = cat?.slug || "";
      if (slug && !staticPaths.includes(`/${slug}`)) {
        urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}/${slug}`)}</loc>
    <lastmod>${formatDate(now)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    });

    (auths || []).forEach((author: any) => {
      const slug = author?.slug || "";
      if (slug) {
        urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}/authors/${slug}`)}</loc>
    <lastmod>${formatDate(now)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
      }
    });

    const articles = arts || [];
    articles.forEach((post: any) => {
      const dateStr = post?.modifiedDate || post?.publishedDate || post?.publishedAt || now.toISOString();
      const date = new Date(dateStr);
      const canonicalRaw = (post?.canonicalUrl || "").trim();
      let url = "";
      if (canonicalRaw) {
        url = canonicalRaw.startsWith("http") ? canonicalRaw : `${BASE_URL}${canonicalRaw.startsWith("/") ? canonicalRaw : `/${canonicalRaw}`}`;
      } else if (post?.category && post?.slug) {
        url = `${BASE_URL}/${post.category}/${post.slug}`;
      }
      if (url && !url.includes("/tags") && !url.includes("/admin") && !url.includes("/api")) {
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        let changefreq = "monthly";
        let priority = "0.5";
        if (diffHours < 24) {
          changefreq = "hourly";
          priority = "1.0";
        } else if (diffHours < 24 * 7) {
          changefreq = "daily";
          priority = "0.9";
        } else if (diffHours < 24 * 30) {
          changefreq = "weekly";
          priority = "0.7";
        }
        urls.push(`
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${formatDate(date)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
      }
    });

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("")}
</urlset>`;

    const headers: Record<string, string> = {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Robots-Tag": "noindex, follow",
      "X-Sitemap-Counts": `articles=${articles.length}; categories=${cats.length}; authors=${auths.length}`,
    };

    return new NextResponse(sitemapXml, { status: 200, headers });

  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
