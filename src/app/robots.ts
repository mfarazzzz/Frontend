import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms", "/api/debug", "/_next/"],
      },
      // Google crawlers (Search, News, Discover)
      {
        userAgent: ["Googlebot", "Googlebot-News", "Googlebot-Image", "Googlebot-Video"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Bing / Microsoft AI (Copilot, Edge AI)
      {
        userAgent: ["Bingbot", "msnbot"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // OpenAI crawlers (ChatGPT, GPT-4)
      {
        userAgent: ["GPTBot", "ChatGPT-User"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Anthropic (Claude)
      {
        userAgent: ["ClaudeBot", "Claude-Web", "anthropic-ai"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Perplexity AI
      {
        userAgent: ["PerplexityBot"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Google AI (Gemini, AI Overviews, SGE)
      {
        userAgent: ["Google-Extended"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Meta AI
      {
        userAgent: ["FacebookBot", "meta-externalagent"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Apple (Siri, Apple Intelligence)
      {
        userAgent: ["Applebot"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // You.com AI
      {
        userAgent: ["YouBot"],
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/cms"],
      },
      // Block known bad scraper bots (keeping SemrushBot/AhrefsBot unblocked for backlink monitoring)
      {
        userAgent: ["CCBot", "DotBot", "MJ12bot"],
        disallow: ["/"],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap-index.xml`,
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/news-sitemap.xml`,
      `${BASE_URL}/video-sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
