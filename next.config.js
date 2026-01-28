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
  experimental: {},
  output: "standalone",
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns,
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
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
