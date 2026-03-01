import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";

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

export async function GET() {
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

    // Static Pages
    staticPaths.forEach((path) => {
      urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}${path}`)}</loc>
    <lastmod>${formatDate(now)}</lastmod>
    <changefreq>${path === "" ? "always" : "daily"}</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`);
    });

    // Dynamic Content
    const provider = getCMSProvider();
    
    // Fetch data in parallel
    const [articlesRes, categories, authors] = await Promise.all([
      provider.getArticles({ 
        status: 'published',
        limit: 5000,
        orderBy: 'publishedDate',
        order: 'desc'
      }),
      provider.getCategories(),
      provider.getAuthors(),
    ]);

    // Categories
    (categories || []).forEach((cat) => {
      const slug = cat.slug || "";
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

    // Authors
    (authors || []).forEach((author) => {
      const slug = author.slug || "";
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

    // Articles
    const articles = articlesRes.data || [];
    articles.forEach((post) => {
      const dateStr = post.modifiedDate || post.publishedDate || now.toISOString();
      const date = new Date(dateStr);
      
      const canonical = post.canonicalUrl?.trim();
      const url = canonical
        ? canonical.startsWith("http") 
          ? canonical
          : `${BASE_URL}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
        : post.category && post.slug
          ? `${BASE_URL}/${post.category}/${post.slug}`
          : "";

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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Force no-cache to ensure Google sees fresh content immediately
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Robots-Tag": "noindex, follow", // Prevent indexing the sitemap itself, but follow links
      },
    });

  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
