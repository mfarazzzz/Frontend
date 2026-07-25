/**
 * Shared SEO utilities for all pages.
 * Single source of truth for site constants and metadata builders.
 */
import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com"
).replace(/\/+$/, "");

export const SITE_NAME = "रामपुर न्यूज़ | Rampur News";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_OG_IMAGE_ALT = "रामपुर न्यूज़ | Rampur News";

/** Ensure a path becomes an absolute URL */
export const toAbsolute = (path: string): string => {
  const p = (path || "").trim();
  if (!p) return SITE_URL;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`;
};

/** Standard robots for indexable pages */
export const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/** Standard robots for non-indexable pages (legal, utility) */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
};

/** Standard robots for legal/policy pages — index but low-priority */
export const LEGAL_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
};

type PageSeoOptions = {
  title: string;
  description: string;
  path: string;
  /** OG type — defaults to "website" */
  type?: "website" | "article" | "profile";
  /** Absolute image URL — defaults to DEFAULT_OG_IMAGE */
  image?: string;
  imageAlt?: string;
  robots?: Metadata["robots"];
  /** Extra OG fields */
  og?: Partial<NonNullable<Metadata["openGraph"]>>;
  /** Extra twitter fields */
  tw?: Partial<NonNullable<Metadata["twitter"]>>;
  keywords?: string[];
};

/**
 * Build a complete, consistent Metadata object for any page.
 * Handles absolute URLs, OG images, robots, locale, siteName automatically.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  robots = INDEX_ROBOTS,
  og = {},
  tw = {},
  keywords,
}: PageSeoOptions): Metadata {
  const canonical = toAbsolute(path);
  const imgUrl = toAbsolute(image);
  const alt = imageAlt || title;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical },
    robots,
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "hi_IN",
      images: [{ url: imgUrl, width: 1200, height: 630, alt }],
      ...og,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imgUrl],
      ...tw,
    },
  };
}
