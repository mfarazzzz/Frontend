import type { MetadataRoute } from "next";
import { getCMSProvider } from "@/services/cms";

const BASE_URL = "https://rampurnews.com";

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
    "/editorial-policy",
    "/corrections-policy",
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
  try {
    const res = await getCMSProvider().getArticles({ 
      // We might want to add a limit param to ArticleQueryParams if supported, 
      // or just accept default pagination.
      // Assuming getArticles handles params correctly.
      status: 'published' 
    });
    
    // Check if res has data (PaginatedResponse)
    const articles = res.data || [];

    articleEntries = articles.map((post) => {
      // Ensure we have a valid date
      const dateStr = post.modifiedDate || post.publishedDate || now.toISOString();
      const date = new Date(dateStr);
      
      return {
        url: `${BASE_URL}/${post.category}/${post.slug}`,
        lastModified: isNaN(date.getTime()) ? now : date,
        changeFrequency: "hourly",
        priority: 0.9,
      };
    });
  } catch (e) {
    console.error("Sitemap fetch failed", e);
  }

  return [...staticEntries, ...articleEntries];
}
