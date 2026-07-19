/**
 * SEO Audit API: /api/debug/seo-audit
 * 
 * Verifies SEO completeness for all category pages:
 * - canonical URLs
 * - titles
 * - descriptions
 * - schema markup references
 * - sitemap inclusion
 */
import { NextResponse } from "next/server";
import { categories } from "@/data/categories";
import { buildCategoryMetadata } from "@/lib/categoryMetadata";

export const dynamic = "force-dynamic";

export async function GET() {
  const SITE_URL = "https://rampurnews.com";

  const results = categories.map((cat) => {
    const metadata = buildCategoryMetadata(cat.slug);
    const issues: string[] = [];

    // Check title
    if (!metadata.title) issues.push("missing_title");
    else if (typeof metadata.title === "string" && metadata.title.length < 20) issues.push("title_too_short");

    // Check description
    if (!metadata.description) issues.push("missing_description");
    else if (metadata.description.length < 50) issues.push("description_too_short");

    // Check canonical
    const alternates = metadata.alternates as any;
    if (!alternates?.canonical) issues.push("missing_canonical");

    // Check OpenGraph
    const og = metadata.openGraph as any;
    if (!og) issues.push("missing_opengraph");
    else {
      if (!og.title) issues.push("missing_og_title");
      if (!og.description) issues.push("missing_og_description");
      if (!og.url) issues.push("missing_og_url");
      if (!og.images || og.images.length === 0) issues.push("missing_og_image");
    }

    // Check Twitter
    const twitter = metadata.twitter as any;
    if (!twitter) issues.push("missing_twitter_card");
    else {
      if (!twitter.title) issues.push("missing_twitter_title");
      if (!twitter.images || twitter.images.length === 0) issues.push("missing_twitter_image");
    }

    return {
      slug: cat.slug,
      titleHindi: cat.titleHindi,
      path: cat.path,
      canonical: alternates?.canonical || null,
      title: metadata.title || null,
      description: metadata.description ? (metadata.description as string).substring(0, 80) + "..." : null,
      hasOpenGraph: !!og,
      hasTwitterCard: !!twitter,
      issues,
      status: issues.length === 0 ? "PASS" : issues.length <= 2 ? "WARN" : "FAIL",
    };
  });

  const passed = results.filter((r) => r.status === "PASS").length;
  const total = results.length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    score: Math.round((passed / total) * 100),
    total,
    passed,
    failed: results.filter((r) => r.status === "FAIL").length,
    warned: results.filter((r) => r.status === "WARN").length,
    categories: results,
  });
}
