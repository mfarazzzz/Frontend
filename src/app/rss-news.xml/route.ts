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
  if (!normalized) throw new Error("NEXT_PUBLIC_STRAPI_URL is not configured");
  return normalized;
};

const getSiteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com").replace(/\/+$/, "");
const getSiteName = () => process.env.NEXT_PUBLIC_SITE_NAME || "रामपुर न्यूज़ | Rampur News";

type StrapiMedia = { url?: string; mime?: string };
type StrapiCategory = { slug?: string; titleHindi?: string; name?: string };
type StrapiArticleAttributes = {
  title?: string;
  slug?: string;
  excerpt?: string;
  publishedAt?: string;
  category?: { data?: { attributes?: StrapiCategory } } | StrapiCategory;
  coverImage?: { data?: { attributes?: StrapiMedia } } | StrapiMedia;
};
type StrapiCollectionResponse = { data?: Array<{ id?: string | number; attributes?: StrapiArticleAttributes }> };

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
  params.set("publicationState", "live");
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
  const feedUrl = `${siteUrl}/rss-news.xml`;

  const feed = new RSS({
    title: `${siteName} (Google News RSS)`,
    description: "Latest Hindi News Updates",
    site_url: siteUrl,
    feed_url: feedUrl,
    language: "hi-IN",
    managingEditor: `editor@rampurnews.com (${siteName})`,
    webMaster: `webmaster@rampurnews.com (${siteName})`,
    copyright: `Copyright ${new Date().getFullYear()} ${siteName}`,
    ttl: 10,
    custom_namespaces: {
      media: "http://search.yahoo.com/mrss/",
      dc: "http://purl.org/dc/elements/1.1/",
      atom: "http://www.w3.org/2005/Atom",
    },
    custom_elements: [{ "atom:link": [{ _attr: { href: feedUrl, rel: "self", type: "application/rss+xml" } }] }],
  });

  try {
    const strapiApiBaseUrl = getStrapiApiBaseUrl();
    const res = await fetch(buildArticlesUrl(), {
      next: { revalidate: 600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi request failed: ${res.status}`);

    const json = (await res.json()) as StrapiCollectionResponse | unknown;
    const items =
      json && typeof json === "object" && "data" in (json as Record<string, unknown>)
        ? ((json as StrapiCollectionResponse).data || [])
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
      const categoryLabel = (category?.titleHindi || category?.name || categorySlug).toString();
      const url = `${siteUrl}/${categorySlug}/${slug}`;
      if (seen.has(url)) continue;
      seen.add(url);

      const cover = pickCover(attrs);
      const imageUrl = absoluteStrapiMediaUrl(strapiApiBaseUrl, cover?.url);
      const imageType = cover?.mime || (imageUrl ? "image/jpeg" : undefined);

      feed.item({
        title,
        description: (attrs.excerpt || "").trim(),
        url,
        guid: url,
        date: new Date(publishedAt),
        categories: [categoryLabel, categorySlug].filter(Boolean),
        ...(imageUrl
          ? {
              enclosure: { url: imageUrl, type: imageType },
              custom_elements: [
                { "media:thumbnail": [{ _attr: { url: imageUrl } }] },
                { "media:content": [{ _attr: { url: imageUrl, type: imageType, medium: "image" } }] },
              ],
            }
          : {}),
        custom_elements: [{ "dc:creator": "Rampur News" }],
      });
    }
  } catch {
    // keep valid empty feed
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
