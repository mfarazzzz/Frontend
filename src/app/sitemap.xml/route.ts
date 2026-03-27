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
  // priority + changefreq tuned per page type
  const staticPaths: Array<{ path: string; priority: string; changefreq: string }> = [
    { path: "",                      priority: "1.0", changefreq: "always"  },
    { path: "/rampur",               priority: "0.9", changefreq: "hourly"  },
    { path: "/up",                   priority: "0.9", changefreq: "hourly"  },
    { path: "/national",             priority: "0.9", changefreq: "hourly"  },
    { path: "/politics",             priority: "0.8", changefreq: "daily"   },
    { path: "/crime",                priority: "0.8", changefreq: "daily"   },
    { path: "/education-jobs",       priority: "0.8", changefreq: "daily"   },
    { path: "/business",             priority: "0.8", changefreq: "daily"   },
    { path: "/entertainment",        priority: "0.8", changefreq: "daily"   },
    { path: "/sports",               priority: "0.8", changefreq: "daily"   },
    { path: "/health",               priority: "0.7", changefreq: "weekly"  },
    { path: "/religion-culture",     priority: "0.7", changefreq: "weekly"  },
    { path: "/food-lifestyle",       priority: "0.7", changefreq: "weekly"  },
    { path: "/nearby",               priority: "0.7", changefreq: "daily"   },
    { path: "/about",                priority: "0.5", changefreq: "monthly" },
    { path: "/contact",              priority: "0.5", changefreq: "monthly" },
    { path: "/privacy",              priority: "0.3", changefreq: "yearly"  },
    { path: "/terms",                priority: "0.3", changefreq: "yearly"  },
    { path: "/disclaimer",           priority: "0.3", changefreq: "yearly"  },
    { path: "/ownership",            priority: "0.3", changefreq: "yearly"  },
    { path: "/ownership-disclosure", priority: "0.3", changefreq: "yearly"  },
    { path: "/editorial-policy",     priority: "0.4", changefreq: "yearly"  },
    { path: "/press-release",        priority: "0.6", changefreq: "weekly"  },
    { path: "/corrections-policy",   priority: "0.3", changefreq: "yearly"  },
    { path: "/about-us",             priority: "0.5", changefreq: "monthly" },
    { path: "/grievance",            priority: "0.4", changefreq: "monthly" },
  ];

  const staticPathSet = new Set(staticPaths.map((s) => s.path));
  const entries: string[] = [];

  // Static Paths
  for (const { path: p, priority, changefreq } of staticPaths) {
    entries.push(
      `\n  <url>\n    <loc>${esc(`${site}${p}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    );
  }

  // Dynamic Content Fetching — wrapped so a Strapi outage never returns a 500 to crawlers
  let arts: any[] = [];
  let cats: any[] = [];
  let auths: any[] = [];

  try {
    const provider = getCMSProvider();
    const [articlesRes, catsRes, authsRes] = await Promise.all([
      provider.getArticles({ status: "published", limit: 5000, orderBy: "publishedDate", order: "desc" }),
      provider.getCategories(),
      provider.getAuthors(),
    ]);

    arts = articlesRes?.data || [];
    cats = catsRes || [];
    auths = authsRes || [];

    // Fallback to Proxy if dynamic fetching returns empty results
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
  } catch (err) {
    // CMS is unreachable — return a valid sitemap with static pages only so
    // Googlebot never receives a 500 and doesn't penalise crawl budget.
    console.error("[sitemap] Failed to fetch dynamic content from CMS:", err);
  }

  // Add Categories to sitemap
  for (const c of cats) {
    const slug = c?.slug || "";
    if (slug && !staticPathSet.has(`/${slug}`)) {
      entries.push(
        `\n  <url>\n    <loc>${esc(`${site}/${slug}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      );
    }
  }

  // Add Authors to sitemap
  for (const a of auths) {
    const slug = a?.slug || "";
    if (slug) {
      entries.push(
        `\n  <url>\n    <loc>${esc(`${site}/authors/${slug}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
      );
    }
  }

  // Add Articles to sitemap with Image support
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

    const imagePart = p.image
      ? `\n    <image:image>\n      <image:loc>${esc(p.image)}</image:loc>\n      <image:title>${esc(p.title)}</image:title>${p.excerpt ? `\n      <image:caption>${esc(String(p.excerpt).slice(0, 100))}</image:caption>` : ""}\n    </image:image>`
      : "";

    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>${imagePart}\n  </url>`,
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
