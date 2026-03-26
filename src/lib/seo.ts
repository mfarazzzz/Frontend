/**
 * SEO + CTR Optimization Utilities
 *
 * Helpers for generating high-CTR titles, optimized descriptions,
 * and standardized headline formats for Google News / Discover.
 */

const SITE_NAME = "रामपुर न्यूज़";

// ─── Title Generation ──────────────────────────────────────────────────────

/**
 * Build a page title optimized for CTR and Google News.
 * - Keeps titles between 50–65 characters (ideal for SERP display)
 * - Appends site name only if it fits
 * - Preserves the original headline if already in range
 */
export function buildPageTitle(headline: string, category?: string): string {
  const clean = headline.trim().replace(/\s{2,}/g, " ");

  // Already in the sweet spot
  if (clean.length >= 50 && clean.length <= 65) return clean;

  // Too short — add category context if available
  if (clean.length < 50 && category) {
    const withCategory = `${clean} | ${category}`;
    if (withCategory.length <= 65) return withCategory;
  }

  // Too long — truncate at last word boundary before 62 chars
  if (clean.length > 65) {
    const truncated = clean.slice(0, 62);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 40 ? truncated.slice(0, lastSpace) + "…" : truncated + "…";
  }

  return clean;
}

/**
 * Build a full <title> tag value: "Headline | Site Name"
 * Used for static pages (homepage, category pages).
 */
export function buildSiteTitle(label: string): string {
  return `${label} | ${SITE_NAME}`;
}

// ─── Description Optimization ──────────────────────────────────────────────

/**
 * Build a meta description optimized for CTR.
 * - Target: 140–160 characters
 * - Strips HTML, normalizes whitespace
 * - Falls back gracefully through excerpt → body text
 */
export function buildMetaDescription(
  options: {
    seoDescription?: string;
    excerpt?: string;
    bodyText?: string;
    fallback?: string;
  }
): string {
  const candidates = [
    options.seoDescription,
    options.excerpt,
    options.bodyText,
    options.fallback ?? "ताज़ा खबरें पढ़ें | रामपुर न्यूज़",
  ];

  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    const clean = stripHtml(raw).replace(/\s{2,}/g, " ").trim();
    if (clean.length < 50) continue;
    if (clean.length <= 160) return clean;
    // Truncate at last sentence or word boundary
    const atSentence = clean.slice(0, 157).lastIndexOf("।");
    if (atSentence > 100) return clean.slice(0, atSentence + 1);
    const atWord = clean.slice(0, 157).lastIndexOf(" ");
    return (atWord > 100 ? clean.slice(0, atWord) : clean.slice(0, 157)) + "…";
  }

  return options.fallback ?? "ताज़ा खबरें पढ़ें | रामपुर न्यूज़";
}

// ─── Headline Normalization ────────────────────────────────────────────────

/**
 * Normalize a headline for display and schema:
 * - Collapses repeated punctuation (!!, ??)
 * - Trims excess whitespace
 * - Ensures it doesn't end with a colon (bad for Google News)
 */
export function normalizeHeadline(value: string): string {
  return value
    .replace(/([!?]){2,}/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/:$/, "")
    .trim();
}

/**
 * Pick the best headline for SEO from available fields.
 * Priority: short_headline (55–65 chars) → seoTitle → title
 */
export function pickSeoHeadline(fields: {
  short_headline?: string;
  seoTitle?: string;
  title: string;
}): string {
  const sh = fields.short_headline?.trim() ?? "";
  if (sh.length >= 55 && sh.length <= 65) return normalizeHeadline(sh);
  const st = fields.seoTitle?.trim() ?? "";
  if (st.length >= 40) return normalizeHeadline(st);
  return normalizeHeadline(fields.title);
}

// ─── OG Image URL ──────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rampurnews.com";
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;

/**
 * Resolve the best OG image URL for an article.
 * Falls back to the dynamic /api/og generator, then the default.
 */
export function resolveOgImage(articleImage?: string, title?: string): string {
  if (articleImage?.trim()) return toAbsoluteUrl(articleImage.trim());
  if (title?.trim()) return `${SITE_URL}/api/og?title=${encodeURIComponent(title.trim())}`;
  return DEFAULT_OG;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
}

function toAbsoluteUrl(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${SITE_URL}${value}`;
  return `${SITE_URL}/${value}`;
}
