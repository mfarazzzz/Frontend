import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Supabase Storage (cms-media bucket) — for images uploaded via Custom CMS
    protocol: "https",
    hostname: "qjnhaazliulyuqngfrkd.supabase.co",
    pathname: "/storage/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "3000",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "rampurnews.com",
    pathname: "/**",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  webpack(config) {
    // Explicit @/ path alias — fixes resolution on Hostinger deployment
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
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
      // City hub pages — serve city/[slug] for known city slugs
      { source: "/moradabad", destination: "/city/moradabad" },
      { source: "/bareilly", destination: "/city/bareilly" },
      { source: "/amroha", destination: "/city/amroha" },
      { source: "/sambhal", destination: "/city/sambhal" },
      { source: "/bijnor", destination: "/city/bijnor" },
      { source: "/rudrapur", destination: "/city/rudrapur" },
      { source: "/haldwani", destination: "/city/haldwani" },
      { source: "/pilibhit", destination: "/city/pilibhit" },
      { source: "/shahjahanpur", destination: "/city/shahjahanpur" },
      { source: "/budaun", destination: "/city/budaun" },
      // Region hub
      { source: "/rohilkhand", destination: "/city/rohilkhand" },
      // Directory city shortcuts (SEO — long-tail local queries)
      { source: "/:city(rampur|bareilly|moradabad|rudrapur|haldwani)/colleges", destination: "/education-jobs/institutions?city=:city" },
      { source: "/:city(rampur|bareilly|moradabad|rudrapur|haldwani)/schools", destination: "/education-jobs/institutions?city=:city&type=school" },
      { source: "/:city(rampur|bareilly|moradabad|rudrapur|haldwani)/coaching", destination: "/education-jobs/institutions?city=:city&type=coaching" },
      { source: "/:city(rampur|bareilly|moradabad|rudrapur|haldwani)/restaurants", destination: "/food-lifestyle/restaurants?city=:city" },
      { source: "/:city(rampur|bareilly|moradabad|rudrapur|haldwani)/shopping", destination: "/food-lifestyle/shopping?city=:city" },
      { source: "/:city(rampur|bareilly|moradabad|rudrapur|haldwani)/places", destination: "/food-lifestyle/places?city=:city" },
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
        source: "/sitemap-index.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=7200" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=900, s-maxage=3600" }],
      },
      {
        source: "/news-sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=1800" }],
      },
      {
        source: "/video-sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=7200" }],
      },
      // ─── Security Headers (all pages) ──────────────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      // ─── AI/LLM discovery files ────────────────────────────────────────────────
      {
        source: "/.well-known/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
