import type { MetadataRoute } from "next";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  // Fetch from Strapi CMS
  let articleEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  let authorEntries: MetadataRoute.Sitemap = [];

  try {
    const provider = getCMSProvider();
    const [articlesRes, categories, authors] = await Promise.all([
      provider.getArticles({ 
        status: 'published',
        limit: 5000 // Fetch up to 5000 articles for sitemap
      }),
      provider.getCategories(),
      provider.getAuthors(),
    ]);
    
    // Check if res has data (PaginatedResponse)
    const articles = articlesRes.data || [];

    articleEntries = (articles
      .map((post) => {
        const dateStr = post.modifiedDate || post.publishedDate || now.toISOString();
        const date = new Date(dateStr);
        const canonical = post.canonicalUrl?.trim();
        const url = canonical
          ? canonical.startsWith("http://") || canonical.startsWith("https://")
            ? canonical
            : `${BASE_URL}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
          : post.category && post.slug
            ? `${BASE_URL}/${post.category}/${post.slug}`
            : "";

        if (!url) return null;

        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        let changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "monthly";
        let priority = 0.5;

        if (diffHours < 24) {
          changeFrequency = "hourly";
          priority = 1.0;
        } else if (diffHours < 24 * 7) {
          changeFrequency = "daily";
          priority = 0.9;
        } else if (diffHours < 24 * 30) {
          changeFrequency = "weekly";
          priority = 0.7;
        }

        return {
          url,
          lastModified: isNaN(date.getTime()) ? now : date,
          changeFrequency,
          priority,
        };
      })
      .filter((entry) => entry !== null)
      .filter(
        (entry) =>
          !entry.url.includes("/tags") &&
          !entry.url.includes("/tag") &&
          !entry.url.includes("/admin") &&
          !entry.url.includes("/api"),
      )) as MetadataRoute.Sitemap;

    // Process categories
    categoryEntries = (categories || [])
      .filter((cat) => !staticPaths.includes(`/${cat.slug}`))
      .map((cat) => ({
        url: `${BASE_URL}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // Process authors
    authorEntries = (authors || []).map((author) => ({
      url: `${BASE_URL}/authors/${author.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  } catch (e) {
    console.error("Sitemap fetch failed", e);
  }

  return [...staticEntries, ...categoryEntries, ...authorEntries, ...articleEntries];
}
