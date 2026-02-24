import RSS from "rss";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 600;

const normalizeStrapiApiUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.endsWith("/api")) return trimmed;
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
};

const getStrapiApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_STRAPI_URL;
  const normalized = raw ? normalizeStrapiApiUrl(raw) : "";
  if (!normalized) {
    throw new Error("NEXT_PUBLIC_STRAPI_URL is not configured");
  }
  return normalized;
};

const getSiteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");
const getSiteName = () => process.env.NEXT_PUBLIC_SITE_NAME || "रामपुर न्यूज़ | Rampur News";

type StrapiMedia = {
  url?: string;
  mime?: string;
  alternativeText?: string;
};

type StrapiCategory = {
  slug?: string;
  titleHindi?: string;
  titleEnglish?: string;
  name?: string;
};

type StrapiArticleAttributes = {
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  category?: { data?: { attributes?: StrapiCategory } } | StrapiCategory;
  coverImage?: { data?: { attributes?: StrapiMedia } } | StrapiMedia;
};

type StrapiCollectionResponse = {
  data?: Array<{ id?: string | number; attributes?: StrapiArticleAttributes }>;
};

const pickCategory = (attrs: StrapiArticleAttributes) => {
  const raw = attrs.category;
  const fromRelation = raw && typeof raw === "object" && "data" in raw ? raw.data?.attributes : undefined;
  return fromRelation || (raw as StrapiCategory | undefined);
};

const pickCover = (attrs: StrapiArticleAttributes) => {
  const raw = attrs.coverImage;
  const fromRelation = raw && typeof raw === "object" && "data" in raw ? raw.data?.attributes : undefined;
  return fromRelation || (raw as StrapiMedia | undefined);
};

const absoluteStrapiMediaUrl = (strapiApiBaseUrl: string, mediaUrl?: string) => {
  if (!mediaUrl) return "";
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) return mediaUrl;
  if (mediaUrl.startsWith("//")) return `https:${mediaUrl}`;
  if (!mediaUrl.startsWith("/")) return mediaUrl;
  const origin = new URL(strapiApiBaseUrl).origin;
  return `${origin}${mediaUrl}`;
};

const buildArticlesUrl = () => {
  const params = new URLSearchParams();
  params.set("filters[publishedAt][$notNull]", "true");
  params.set("sort", "publishedAt:desc");
  params.set("pagination[limit]", "50");
  params.append("fields[0]", "title");
  params.append("fields[1]", "slug");
  params.append("fields[2]", "excerpt");
  params.append("fields[3]", "publishedAt");
  params.append("populate[coverImage][fields][0]", "url");
  params.append("populate[coverImage][fields][1]", "mime");
  params.append("populate[category][fields][0]", "slug");
  params.append("populate[category][fields][1]", "titleHindi");
  params.append("populate[category][fields][2]", "name");
  return `${getStrapiApiBaseUrl()}/articles?${params.toString()}`;
};

export async function GET() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const feedUrl = `${siteUrl}/rss.xml`;

  const feed = new RSS({
    title: siteName,
    description: "Latest Hindi News Updates",
    site_url: siteUrl,
    feed_url: feedUrl,
    language: "hi-IN",
    managingEditor: `editor@rampurnews.com (${siteName})`,
    webMaster: `webmaster@rampurnews.com (${siteName})`,
    copyright: `Copyright ${new Date().getFullYear()} ${siteName}`,
    ttl: 10,
  });

  try {
    const strapiApiBaseUrl = getStrapiApiBaseUrl();
    const url = buildArticlesUrl();
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Strapi request failed: ${res.status}`);
    }

    const json = (await res.json()) as StrapiCollectionResponse | unknown;
    const items =
      json && typeof json === "object" && "data" in (json as Record<string, unknown>)
        ? (((json as StrapiCollectionResponse).data || []) as Array<{ id?: string | number; attributes?: StrapiArticleAttributes }>)
        : [];

    const seen = new Set<string>();
    for (const entity of items) {
      const attrs = entity?.attributes || {};
      const title = (attrs.title || "").trim();
      const slug = (attrs.slug || "").trim();
      const publishedAt = (attrs.publishedAt || "").trim();
      if (!title || !slug || !publishedAt) continue;

      const category = pickCategory(attrs);
      const categorySlug = (category?.slug || "news").trim();
      const articleUrl = `${siteUrl}/${categorySlug}/${slug}`;
      if (seen.has(articleUrl)) continue;
      seen.add(articleUrl);

      const cover = pickCover(attrs);
      const enclosureUrl = absoluteStrapiMediaUrl(strapiApiBaseUrl, cover?.url);
      const enclosureType = cover?.mime || (enclosureUrl ? "image/jpeg" : undefined);

      feed.item({
        title,
        description: (attrs.excerpt || "").trim(),
        url: articleUrl,
        guid: articleUrl,
        date: new Date(publishedAt),
        categories: [
          (category?.titleHindi || category?.name || categorySlug).toString(),
          categorySlug,
        ].filter(Boolean),
        ...(enclosureUrl
          ? {
              enclosure: {
                url: enclosureUrl,
                type: enclosureType,
              },
            }
          : {}),
      });
    }
  } catch {
    // Return an empty feed on failure (still valid XML)
  }

  const xml = feed.xml({ indent: true });
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600",
    },
  });
}
