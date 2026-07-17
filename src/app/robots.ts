import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms", "/api/debug"],
      },
      // Explicitly allow AI search crawlers for citation/GEO traffic
      {
        userAgent: ["GPTBot", "ChatGPT-User"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      {
        userAgent: ["ClaudeBot", "Claude-Web", "anthropic-ai"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      {
        userAgent: ["PerplexityBot"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      {
        userAgent: ["Google-Extended"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Block generic scraper bots that don't add value
      {
        userAgent: ["CCBot"],
        disallow: ["/"],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/news-sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
