import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeStrapiApiUrl = (value) => {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.endsWith("/api")) return trimmed;
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
};

const getStrapiApiBaseUrlFromEnv = () => {
  const candidates = [
    process.env.STRAPI_API_URL,
    process.env.NEXT_PUBLIC_STRAPI_API_URL,
    process.env.NEXT_PUBLIC_STRAPI_BASE_URL,
    process.env.NEXT_PUBLIC_STRAPI_URL,
  ]
    .filter((value) => typeof value === "string")
    .map((value) => normalizeStrapiApiUrl(String(value)))
    .filter(Boolean);

  return candidates[0] || "";
};

const getRemotePatternFromUrl = (urlValue) => {
  if (!urlValue) return null;
  try {
    const u = new URL(urlValue);
    const protocol = u.protocol.replace(":", "");
    const hostname = u.hostname;
    const port = u.port;
    if (!protocol || !hostname) return null;
    return {
      protocol,
      hostname,
      ...(port ? { port } : {}),
      pathname: "/**",
    };
  } catch {
    return null;
  }
};

const remotePatterns = [
  {
    protocol: "https",
    hostname: "api.rampur.cloud",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "cms.rampurnews.com",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "3000",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "1337",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "1337",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "picsum.photos",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "rampurnews.com",
    pathname: "/**",
  },
];

const strapiApiBaseUrl = getStrapiApiBaseUrlFromEnv();
const strapiOriginRemotePattern = getRemotePatternFromUrl(strapiApiBaseUrl);
if (strapiOriginRemotePattern) {
  remotePatterns.push(strapiOriginRemotePattern);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      { source: "/rss/:slug.xml", destination: "/rss/category/:slug" },
      { source: "/rss/:slug", destination: "/rss/category/:slug" },
    ];
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.webp",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/api/og",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=900, s-maxage=3600" }],
      },
      {
        source: "/news-sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=1800" }],
      },
    ];
  },
};

export default nextConfig;
