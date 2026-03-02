import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/tag", "/tags"],
      },
    ],
    sitemap: [`${BASE_URL}/news-sitemap.xml`, `${BASE_URL}/rss.xml`],
    host: BASE_URL,
  };
}

