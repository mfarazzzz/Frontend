import type { MetadataRoute } from "next";

const BASE_URL = "https://rampurnews.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/sitemap-news.xml`],
    host: BASE_URL,
  };
}

