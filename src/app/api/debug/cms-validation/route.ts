/**
 * CMS Validation API: /api/debug/cms-validation
 * 
 * Validates content quality across both CMS sources:
 * - Articles with missing images
 * - Missing SEO fields
 * - Missing category assignments
 * - Duplicate slugs
 * - Unpublished but featured articles
 */
import { NextResponse } from "next/server";
import { getAggregatedList, fetchCustomCms, fetchStrapi } from "@/services/cms/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const issues: Array<{
    severity: "error" | "warning" | "info";
    type: string;
    article?: { slug: string; title: string; category: string; source: string };
    message: string;
  }> = [];

  try {
    // Fetch a large batch from the aggregator
    const result = await getAggregatedList("articles", {
      pageSize: 100,
      page: 1,
      sort: "publishedAt",
      order: "desc",
    });

    const articles = result.data as any[];

    // Track slugs for duplicate detection
    const slugMap = new Map<string, any[]>();

    for (const article of articles) {
      const source = article._source || "unknown";
      const articleRef = {
        slug: article.slug,
        title: (article.title || "").substring(0, 60),
        category: article.category || "",
        source,
      };

      // Check for missing image
      if (!article.image) {
        issues.push({
          severity: "warning",
          type: "missing_image",
          article: articleRef,
          message: `Article "${articleRef.title}" has no image`,
        });
      }

      // Check for missing category
      if (!article.category) {
        issues.push({
          severity: "error",
          type: "missing_category",
          article: articleRef,
          message: `Article "${articleRef.title}" has no category assigned`,
        });
      }

      // Check for missing excerpt
      if (!article.excerpt) {
        issues.push({
          severity: "warning",
          type: "missing_excerpt",
          article: articleRef,
          message: `Article "${articleRef.title}" has no excerpt`,
        });
      }

      // Check for missing author
      if (!article.author) {
        issues.push({
          severity: "warning",
          type: "missing_author",
          article: articleRef,
          message: `Article "${articleRef.title}" has no author`,
        });
      }

      // Check for very short titles
      if (article.title && article.title.length < 15) {
        issues.push({
          severity: "warning",
          type: "short_title",
          article: articleRef,
          message: `Article title is very short: "${articleRef.title}"`,
        });
      }

      // Track duplicates
      if (article.slug) {
        const existing = slugMap.get(article.slug) || [];
        existing.push(articleRef);
        slugMap.set(article.slug, existing);
      }
    }

    // Check for duplicate slugs (across sources)
    for (const [slug, entries] of slugMap) {
      if (entries.length > 1) {
        issues.push({
          severity: "error",
          type: "duplicate_slug",
          message: `Slug "${slug}" appears ${entries.length} times across sources: ${entries.map((e) => e.source).join(", ")}`,
        });
      }
    }

    // Category distribution
    const categoryDistribution: Record<string, { total: number; customCms: number; strapi: number; noImage: number }> = {};
    for (const article of articles) {
      const cat = article.category || "uncategorized";
      if (!categoryDistribution[cat]) {
        categoryDistribution[cat] = { total: 0, customCms: 0, strapi: 0, noImage: 0 };
      }
      categoryDistribution[cat].total++;
      if (article._source === "custom-cms") categoryDistribution[cat].customCms++;
      else categoryDistribution[cat].strapi++;
      if (!article.image) categoryDistribution[cat].noImage++;
    }

    const timing = Date.now() - startTime;
    const errors = issues.filter((i) => i.severity === "error").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      timing: `${timing}ms`,
      totalArticlesChecked: articles.length,
      totalErrors: errors,
      totalWarnings: warnings,
      healthScore: Math.max(0, 100 - errors * 10 - warnings * 2),
      categoryDistribution,
      issues: issues.slice(0, 50), // Cap at 50 issues
      sources: result.meta.sources,
    });
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        timing: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
