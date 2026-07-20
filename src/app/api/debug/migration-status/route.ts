/**
 * GET /api/debug/migration-status
 *
 * Production validation dashboard for the Strapi → Custom CMS migration.
 * Reports health of all content systems, feature flags, and data integrity.
 */
import { NextResponse } from "next/server";
import { getProviderInfo, getContent, getArticleBySlug } from "@/services/content/gateway";

export const dynamic = "force-dynamic";

interface StatusCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  value: string | number | boolean;
  detail?: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: StatusCheck[] = [];

  // 1. Provider info
  const provider = getProviderInfo();
  checks.push({
    name: "active_provider",
    status: "pass",
    value: provider.provider,
    detail: provider.url,
  });

  // 2. Provider mode
  const mode = process.env.CONTENT_PROVIDER_MODE || 'hybrid';
  checks.push({
    name: "content_provider_mode",
    status: mode === 'custom' ? "pass" : mode === 'hybrid' ? "warn" : "fail",
    value: mode,
    detail: mode === 'custom' 
      ? "Custom CMS only — Strapi fully retired"
      : mode === 'hybrid'
      ? "Custom CMS + Strapi fallback (migration in progress)"
      : "Emergency Strapi-only mode",
  });

  // 3. Article count
  try {
    const articles = await getContent("articles", { pageSize: 1 });
    checks.push({
      name: "article_count",
      status: articles.meta.pagination.total >= 100 ? "pass" : "warn",
      value: articles.meta.pagination.total,
      detail: "Expected: ≥100 articles (100 from Strapi + 2 native CMS)",
    });
  } catch (e: any) {
    checks.push({ name: "article_count", status: "fail", value: 0, detail: e.message });
  }

  // 4. Category articles (verify category linking works)
  try {
    const rampur = await getContent("articles", { category: "rampur", pageSize: 1 });
    const up = await getContent("articles", { category: "up", pageSize: 1 });
    const national = await getContent("articles", { category: "national", pageSize: 1 });
    checks.push({
      name: "category_rampur",
      status: rampur.meta.pagination.total > 0 ? "pass" : "fail",
      value: rampur.meta.pagination.total,
    });
    checks.push({
      name: "category_up",
      status: up.meta.pagination.total > 0 ? "pass" : "fail",
      value: up.meta.pagination.total,
    });
    checks.push({
      name: "category_national",
      status: national.meta.pagination.total > 0 ? "pass" : "fail",
      value: national.meta.pagination.total,
    });
  } catch (e: any) {
    checks.push({ name: "categories", status: "fail", value: false, detail: e.message });
  }

  // 5. Article detail with content
  try {
    const article = await getArticleBySlug("rampur-police-chhetradhikar-tay-kanoon-vyavastha-sudridh");
    const hasContent = !!(article as any)?.content && (article as any).content.length > 100;
    const hasAuthor = !!(article as any)?.author;
    const hasCategory = !!(article as any)?.category;
    checks.push({
      name: "article_detail_content",
      status: hasContent ? "pass" : "fail",
      value: hasContent,
      detail: hasContent ? `${(article as any).content.length} chars` : "Missing body content",
    });
    checks.push({
      name: "article_detail_author",
      status: hasAuthor ? "pass" : "fail",
      value: hasAuthor ? (article as any).author : "missing",
    });
    checks.push({
      name: "article_detail_category",
      status: hasCategory ? "pass" : "fail",
      value: hasCategory ? (article as any).category : "missing",
    });
  } catch (e: any) {
    checks.push({ name: "article_detail", status: "fail", value: false, detail: e.message });
  }

  // 6. Editorials
  try {
    const editorials = await getContent("editorials", { pageSize: 1 });
    checks.push({
      name: "editorials_count",
      status: editorials.meta.pagination.total >= 15 ? "pass" : "warn",
      value: editorials.meta.pagination.total,
    });
  } catch (e: any) {
    checks.push({ name: "editorials", status: "fail", value: 0, detail: e.message });
  }

  // 7. Tags
  try {
    const tags = await getContent("tags", { pageSize: 1 });
    checks.push({
      name: "tags_count",
      status: tags.meta.pagination.total >= 100 ? "pass" : "warn",
      value: tags.meta.pagination.total,
    });
  } catch (e: any) {
    checks.push({ name: "tags", status: "fail", value: 0, detail: e.message });
  }

  // 8. Authors
  try {
    const authors = await getContent("authors", { pageSize: 100 });
    checks.push({
      name: "authors_count",
      status: authors.data.length >= 3 ? "pass" : "warn",
      value: authors.data.length,
    });
  } catch (e: any) {
    checks.push({ name: "authors", status: "fail", value: 0, detail: e.message });
  }

  // 9. Homepage (quick check)
  try {
    const heroArticles = await getContent("articles", { pageSize: 8, sort: "publishedAt", order: "desc" });
    checks.push({
      name: "homepage_hero",
      status: heroArticles.data.length >= 5 ? "pass" : "warn",
      value: heroArticles.data.length,
      detail: `Latest: ${(heroArticles.data[0] as any)?.slug || "none"}`,
    });
  } catch (e: any) {
    checks.push({ name: "homepage", status: "fail", value: false, detail: e.message });
  }

  // 10. Image health (sample check)
  try {
    const sample = await getContent("articles", { pageSize: 5, sort: "publishedAt", order: "desc" });
    const images = sample.data.map((a: any) => a.image).filter(Boolean);
    const strapiImages = images.filter((u: string) => u.includes("api.rampur.cloud"));
    const supabaseImages = images.filter((u: string) => u.includes("supabase.co"));
    checks.push({
      name: "images_strapi_hosted",
      status: strapiImages.length > 0 ? "warn" : "pass",
      value: strapiImages.length,
      detail: strapiImages.length > 0
        ? "Images still on api.rampur.cloud — media migration pending"
        : "All images on Supabase Storage",
    });
    checks.push({
      name: "images_supabase_hosted",
      status: "pass",
      value: supabaseImages.length,
    });
  } catch {
    // non-critical
  }

  // 11. API latency
  const latency = Date.now() - startTime;
  checks.push({
    name: "api_latency_ms",
    status: latency < 5000 ? "pass" : "warn",
    value: latency,
  });

  // 12. Latest publish timestamp
  try {
    const latest = await getContent("articles", { pageSize: 1, sort: "publishedAt", order: "desc" });
    const publishedAt = (latest.data[0] as any)?.publishedAt;
    checks.push({
      name: "latest_publish",
      status: publishedAt ? "pass" : "warn",
      value: publishedAt || "unknown",
    });
  } catch {
    // non-critical
  }

  // Summary
  const passed = checks.filter((c) => c.status === "pass").length;
  const warned = checks.filter((c) => c.status === "warn").length;
  const failed = checks.filter((c) => c.status === "fail").length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    migration_phase: mode === 'custom' ? "single-source CMS (production)" : mode === 'hybrid' ? "hybrid (CMS + Strapi fallback)" : "strapi-only (emergency)",
    provider: provider.provider,
    summary: { total: checks.length, passed, warned, failed },
    score: `${Math.round((passed / checks.length) * 100)}%`,
    checks,
    environment: {
      CONTENT_PROVIDER_MODE: mode,
      CUSTOM_CMS_URL: provider.url,
      CUSTOM_CMS_INTERNAL_URL: process.env.CUSTOM_CMS_INTERNAL_URL || "(not set)",
    },
  });
}
