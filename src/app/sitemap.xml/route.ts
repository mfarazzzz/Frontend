import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";
import { LOCATIONS, REGIONS } from "@/data/locations";

export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;",
  );

const iso = (v: string | Date) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

// All static + semi-static paths with tuned priority/changefreq
const STATIC_PATHS: Array<{ path: string; priority: string; changefreq: string }> = [
  // Homepage
  { path: "",                           priority: "1.0", changefreq: "always"  },
  // High-traffic news categories
  { path: "/rampur",                    priority: "0.9", changefreq: "hourly"  },
  { path: "/up",                        priority: "0.9", changefreq: "hourly"  },
  { path: "/national",                  priority: "0.9", changefreq: "hourly"  },
  { path: "/politics",                  priority: "0.8", changefreq: "daily"   },
  { path: "/crime",                     priority: "0.8", changefreq: "daily"   },
  { path: "/education-jobs",            priority: "0.8", changefreq: "daily"   },
  { path: "/business",                  priority: "0.8", changefreq: "daily"   },
  { path: "/entertainment",             priority: "0.8", changefreq: "daily"   },
  { path: "/sports",                    priority: "0.8", changefreq: "daily"   },
  { path: "/international",             priority: "0.8", changefreq: "daily"   },
  { path: "/nearby",                    priority: "0.7", changefreq: "daily"   },
  { path: "/health",                    priority: "0.7", changefreq: "weekly"  },
  { path: "/religion-culture",          priority: "0.7", changefreq: "weekly"  },
  { path: "/food-lifestyle",            priority: "0.7", changefreq: "weekly"  },
  // Subcategories
  { path: "/education-jobs/career",     priority: "0.7", changefreq: "daily"   },
  { path: "/education-jobs/exams",      priority: "0.7", changefreq: "daily"   },
  { path: "/education-jobs/results",    priority: "0.7", changefreq: "daily"   },
  { path: "/education-jobs/news",       priority: "0.7", changefreq: "daily"   },
  { path: "/education-jobs/institutions", priority: "0.6", changefreq: "weekly" },
  { path: "/food-lifestyle/restaurants", priority: "0.6", changefreq: "weekly" },
  { path: "/food-lifestyle/events",     priority: "0.6", changefreq: "weekly"  },
  { path: "/food-lifestyle/fashion",    priority: "0.6", changefreq: "weekly"  },
  { path: "/food-lifestyle/places",     priority: "0.6", changefreq: "weekly"  },
  { path: "/food-lifestyle/shopping",   priority: "0.6", changefreq: "weekly"  },
  { path: "/religion-culture/holidays", priority: "0.6", changefreq: "monthly" },
  // Editorial / opinion
  { path: "/editorials",                priority: "0.7", changefreq: "daily"   },
  { path: "/press-release",             priority: "0.6", changefreq: "weekly"  },
  // People / team
  { path: "/authors",                   priority: "0.6", changefreq: "weekly"  },
  { path: "/our-team",                  priority: "0.5", changefreq: "monthly" },
  // Media
  { path: "/videos",                    priority: "0.6", changefreq: "daily"   },
  // Community
  { path: "/join-us",                   priority: "0.5", changefreq: "monthly" },
  // About / legal
  { path: "/about",                     priority: "0.5", changefreq: "monthly" },
  { path: "/about-us",                  priority: "0.5", changefreq: "monthly" },
  { path: "/contact",                   priority: "0.5", changefreq: "monthly" },
  { path: "/grievance",                 priority: "0.4", changefreq: "monthly" },
  { path: "/editorial-policy",          priority: "0.4", changefreq: "yearly"  },
  { path: "/corrections-policy",        priority: "0.3", changefreq: "yearly"  },
  { path: "/privacy",                   priority: "0.3", changefreq: "yearly"  },
  { path: "/terms",                     priority: "0.3", changefreq: "yearly"  },
  { path: "/disclaimer",                priority: "0.3", changefreq: "yearly"  },
  { path: "/ownership",                 priority: "0.3", changefreq: "yearly"  },
  { path: "/ownership-disclosure",      priority: "0.3", changefreq: "yearly"  },
  // City hub pages (auto-generated from location taxonomy)
  ...LOCATIONS.filter(l => l.slug !== 'rampur').map(l => ({
    path: `/${l.slug}`,
    priority: l.isPrimary ? "0.9" : "0.8",
    changefreq: "hourly" as string,
  })),
  // Region hub
  { path: "/rohilkhand",               priority: "0.8", changefreq: "hourly"  },
];

const STATIC_PATH_SET = new Set(STATIC_PATHS.map((s) => s.path));

/** Compute changefreq + priority from article age */
const articleMeta = (dateStr: string, now: Date) => {
  const diff = (now.getTime() - new Date(dateStr).getTime()) / 36e5; // hours
  if (diff < 24)  return { cf: "hourly",   pr: "1.0" };
  if (diff < 168) return { cf: "daily",    pr: "0.9" };
  if (diff < 720) return { cf: "weekly",   pr: "0.7" };
  return           { cf: "monthly",  pr: "0.5" };
};

export async function GET() {
  const now = new Date();
  const entries: string[] = [];

  // ── Static paths ──────────────────────────────────────────────────────────
  for (const { path: p, priority, changefreq } of STATIC_PATHS) {
    entries.push(
      `\n  <url>\n    <loc>${esc(`${SITE}${p}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    );
  }

  // ── Dynamic content ───────────────────────────────────────────────────────
  let arts: any[] = [];
  let cats: any[] = [];
  let auths: any[] = [];
  let editorials: any[] = [];
  let restaurants: any[] = [];
  let events: any[] = [];
  let fashionStores: any[] = [];
  let places: any[] = [];
  let shoppingCentres: any[] = [];
  let institutionsList: any[] = [];

  try {
    const provider = getCMSProvider();
    const [
      articlesRes,
      catsRes,
      authsRes,
      editorialsRes,
      restaurantsRes,
      eventsRes,
      fashionRes,
      placesRes,
      shoppingRes,
      institutionsRes,
    ] = await Promise.all([
      provider.getArticles({ status: "published", limit: 5000, orderBy: "publishedDate", order: "desc" }),
      provider.getCategories(),
      provider.getAuthors(),
      provider.getEditorials({ limit: 1000, orderBy: "publishedDate", order: "desc" }).catch(() => ({ data: [] })),
      (provider as any).getRestaurants?.({ limit: 500 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      (provider as any).getEvents?.({ limit: 500 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      (provider as any).getFashionStores?.({ limit: 500 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      (provider as any).getFamousPlaces?.({ limit: 500 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      (provider as any).getShoppingCentres?.({ limit: 500 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      (provider as any).getInstitutions?.({ limit: 500 }).catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
    ]);

    arts = articlesRes?.data || [];
    cats = catsRes || [];
    auths = authsRes || [];
    editorials = editorialsRes?.data || [];
    restaurants = restaurantsRes?.data || [];
    events = eventsRes?.data || [];
    fashionStores = fashionRes?.data || [];
    places = placesRes?.data || [];
    shoppingCentres = shoppingRes?.data || [];
    institutionsList = institutionsRes?.data || [];
  } catch (err) {
    // CMS unreachable — return valid static-only sitemap, never 500 to crawlers
    console.error("[sitemap] CMS fetch failed:", err);
  }

  // ── Categories (dynamic, not already in static list) ─────────────────────
  for (const c of cats) {
    const slug = (c?.slug || "").trim();
    if (slug && !STATIC_PATH_SET.has(`/${slug}`)) {
      entries.push(
        `\n  <url>\n    <loc>${esc(`${SITE}/${slug}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      );
    }
  }

  // ── Authors ───────────────────────────────────────────────────────────────
  for (const a of auths) {
    const slug = (a?.slug || "").trim();
    if (!slug) continue;
    // Use canonical /author/{slug} path (middleware redirects /authors/ → /author/)
    entries.push(
      `\n  <url>\n    <loc>${esc(`${SITE}/author/${slug}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
    );
  }

  // ── Tags (extracted from articles) ────────────────────────────────────────
  const tagSet = new Set<string>();
  for (const a of arts) {
    if (Array.isArray(a?.tags)) {
      for (const t of a.tags) {
        const tag = String(t || '').trim();
        if (tag && tag.length > 1) tagSet.add(tag);
      }
    }
  }
  for (const tag of tagSet) {
    entries.push(
      `\n  <url>\n    <loc>${esc(`${SITE}/tags/${encodeURIComponent(tag)}`)}</loc>\n    <lastmod>${iso(now)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.5</priority>\n  </url>`,
    );
  }

  // ── Editorial articles ────────────────────────────────────────────────────
  for (const e of editorials) {
    const slug = (e?.slug || "").trim();
    if (!slug) continue;
    const dateStr = e?.modifiedDate || e?.publishedDate || e?.publishedAt || now.toISOString();
    const { cf, pr } = articleMeta(dateStr, now);
    const url = `${SITE}/editorials/${slug}`;
    const imagePart = e.image
      ? `\n    <image:image>\n      <image:loc>${esc(e.image)}</image:loc>\n      <image:title>${esc(e.titleHindi || e.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>${imagePart}\n  </url>`,
    );
  }

  // ── News articles ─────────────────────────────────────────────────────────
  for (const p of arts) {
    const dateStr = p?.modifiedDate || p?.publishedDate || p?.publishedAt || now.toISOString();
    const canonical = (p?.canonicalUrl || "").trim();
    let url = "";
    if (canonical) {
      url = canonical.startsWith("http") ? canonical : `${SITE}${canonical.startsWith("/") ? canonical : `/${canonical}`}`;
    } else if (p?.category && p?.slug) {
      url = `${SITE}/${p.category}/${p.slug}`;
    }
    if (!url) continue;
    // Skip admin/api/tag paths
    if (/\/(admin|api\/|tags?)\//.test(url)) continue;

    const { cf, pr } = articleMeta(dateStr, now);
    const imagePart = p.image
      ? `\n    <image:image>\n      <image:loc>${esc(p.image)}</image:loc>\n      <image:title>${esc(p.title || "")}</image:title>${p.excerpt ? `\n      <image:caption>${esc(String(p.excerpt).slice(0, 100))}</image:caption>` : ""}\n    </image:image>`
      : "";

    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>${imagePart}\n  </url>`,
    );
  }

  // ── Lifestyle Content: Restaurants ────────────────────────────────────────
  for (const r of restaurants) {
    const slug = (r?.slug || "").trim();
    if (!slug) continue;
    const dateStr = r?.updatedAt || r?.createdAt || now.toISOString();
    const url = `${SITE}/food-lifestyle/restaurants/${slug}`;
    const imagePart = r.image
      ? `\n    <image:image>\n      <image:loc>${esc(r.image)}</image:loc>\n      <image:title>${esc(r.name || r.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imagePart}\n  </url>`,
    );
  }

  // ── Lifestyle Content: Events ─────────────────────────────────────────────
  for (const e of events) {
    const slug = (e?.slug || "").trim();
    if (!slug) continue;
    const dateStr = e?.updatedAt || e?.createdAt || now.toISOString();
    const url = `${SITE}/food-lifestyle/events/${slug}`;
    const imagePart = e.image
      ? `\n    <image:image>\n      <image:loc>${esc(e.image)}</image:loc>\n      <image:title>${esc(e.name || e.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>${imagePart}\n  </url>`,
    );
  }

  // ── Lifestyle Content: Fashion Stores ─────────────────────────────────────
  for (const f of fashionStores) {
    const slug = (f?.slug || "").trim();
    if (!slug) continue;
    const dateStr = f?.updatedAt || f?.createdAt || now.toISOString();
    const url = `${SITE}/food-lifestyle/fashion/${slug}`;
    const imagePart = f.image
      ? `\n    <image:image>\n      <image:loc>${esc(f.image)}</image:loc>\n      <image:title>${esc(f.name || f.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imagePart}\n  </url>`,
    );
  }

  // ── Lifestyle Content: Famous Places ──────────────────────────────────────
  for (const p of places) {
    const slug = (p?.slug || "").trim();
    if (!slug) continue;
    const dateStr = p?.updatedAt || p?.createdAt || now.toISOString();
    const url = `${SITE}/food-lifestyle/places/${slug}`;
    const imagePart = p.image
      ? `\n    <image:image>\n      <image:loc>${esc(p.image)}</image:loc>\n      <image:title>${esc(p.name || p.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imagePart}\n  </url>`,
    );
  }

  // ── Lifestyle Content: Shopping Centres ───────────────────────────────────
  for (const s of shoppingCentres) {
    const slug = (s?.slug || "").trim();
    if (!slug) continue;
    const dateStr = s?.updatedAt || s?.createdAt || now.toISOString();
    const url = `${SITE}/food-lifestyle/shopping/${slug}`;
    const imagePart = s.image
      ? `\n    <image:image>\n      <image:loc>${esc(s.image)}</image:loc>\n      <image:title>${esc(s.name || s.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imagePart}\n  </url>`,
    );
  }

  // ── Education: Institutions ───────────────────────────────────────────────
  for (const inst of (institutionsList || [])) {
    const slug = (inst?.slug || "").trim();
    if (!slug) continue;
    const dateStr = inst?.updatedAt || inst?.createdAt || now.toISOString();
    const url = `${SITE}/education-jobs/institutions/${slug}`;
    const imagePart = inst.image
      ? `\n    <image:image>\n      <image:loc>${esc(inst.image)}</image:loc>\n      <image:title>${esc(inst.name || inst.title || "")}</image:title>\n    </image:image>`
      : "";
    entries.push(
      `\n  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${iso(dateStr)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imagePart}\n  </url>`,
    );
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset`,
    `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`,
    `  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`,
    ...entries,
    `\n</urlset>`,
  ].join("\n");

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // 15-min CDN cache, always revalidate at origin
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
