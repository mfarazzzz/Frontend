/**
 * Developer Content Audit Dashboard
 * Route: /dev/content-audit
 * 
 * Displays real-time verification of:
 * - Every homepage section vs category page consistency
 * - CMS source breakdown per category
 * - Duplicates detected and removed
 * - Empty sections and their reasons
 * - SEO completeness per page
 * - Health score
 */
import { getHomepageSections } from "@/services/content/homepageConfig";
import { fetchAllHomepageSections, deduplicateAcrossSections } from "@/services/content/contentResolver";
import { getAggregatedList } from "@/services/cms/aggregator";
import { categories } from "@/data/categories";
import { CATEGORY_PAGE_SIZE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Audit | Dev Tools",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SectionAudit {
  sectionId: string;
  title: string;
  category: string | null;
  template: string;
  homepageCount: number;
  categoryPageCount: number;
  customCmsCount: number;
  strapiCount: number;
  aggregatorCount: number;
  duplicatesInHomepage: number;
  match: boolean;
  status: "PASS" | "FAIL" | "WARN" | "EMPTY";
  notes: string[];
  timing: number;
}

interface HealthReport {
  score: number;
  totalSections: number;
  passedSections: number;
  failedSections: number;
  warnSections: number;
  emptySections: number;
  totalArticlesOnHomepage: number;
  totalDuplicatesRemoved: number;
  errors: string[];
  warnings: string[];
}

async function auditSection(sectionConfig: any): Promise<SectionAudit> {
  const start = Date.now();
  const notes: string[] = [];
  const category = sectionConfig.category;

  let homepageCount = 0;
  let categoryPageCount = 0;
  let customCmsCount = 0;
  let strapiCount = 0;
  let aggregatorCount = 0;

  // 1. What does the aggregator return for this category?
  if (category) {
    try {
      const aggResult = await getAggregatedList("articles", {
        category,
        pageSize: sectionConfig.articleCount * 2,
        page: 1,
        sort: "publishedAt",
        order: "desc",
      });
      aggregatorCount = aggResult.data.length;
      customCmsCount = aggResult.meta.sources.customCms.total;
      strapiCount = aggResult.meta.sources.strapi.total;
    } catch (e) {
      notes.push(`Aggregator error: ${(e as Error).message}`);
    }

    // 2. What would category page show?
    try {
      const catResult = await getAggregatedList("articles", {
        category,
        pageSize: CATEGORY_PAGE_SIZE,
        page: 1,
        sort: "publishedAt",
        order: "desc",
      });
      categoryPageCount = catResult.meta.pagination.total;
    } catch (e) {
      notes.push(`Category page fetch error: ${(e as Error).message}`);
    }
  }

  const timing = Date.now() - start;

  // Homepage count will be set after dedup (below)
  homepageCount = Math.min(aggregatorCount, sectionConfig.articleCount);

  // Determine status
  let status: SectionAudit["status"] = "PASS";
  if (!category) {
    status = "PASS"; // Hero or editorials — no category comparison needed
    notes.push("No category filter (hero/editorials section)");
  } else if (aggregatorCount === 0) {
    status = "EMPTY";
    notes.push("CMS has 0 articles for this category");
  } else if (homepageCount === 0 && aggregatorCount > 0) {
    status = "FAIL";
    notes.push("Articles exist in CMS but homepage shows 0 (dedup removed all?)");
  } else if (categoryPageCount === 0 && aggregatorCount > 0) {
    status = "FAIL";
    notes.push("Articles exist in CMS but category page would show 0");
  }

  // Check consistency
  const match = !category || (homepageCount > 0 && categoryPageCount > 0) || (homepageCount === 0 && categoryPageCount === 0);
  if (!match) {
    status = "FAIL";
    notes.push(`Inconsistency: Homepage=${homepageCount}, CategoryPage=${categoryPageCount}`);
  }

  return {
    sectionId: sectionConfig.id,
    title: sectionConfig.title,
    category,
    template: sectionConfig.template,
    homepageCount,
    categoryPageCount,
    customCmsCount,
    strapiCount,
    aggregatorCount,
    duplicatesInHomepage: 0, // Will be computed after full dedup
    match,
    status,
    notes,
    timing,
  };
}

export default async function ContentAuditPage() {
  const startTime = Date.now();
  const sections = getHomepageSections();
  const categorySections = sections.filter((s) => s.id !== "hero");

  // Run full homepage fetch to get actual dedup numbers
  const sectionMap = await fetchAllHomepageSections(categorySections);
  const sectionOrder = categorySections.map((s) => s.id);
  const dedupedMap = deduplicateAcrossSections(sectionMap, sectionOrder);

  // Audit each section
  const audits: SectionAudit[] = [];
  for (const config of categorySections) {
    const audit = await auditSection(config);
    
    // Get actual homepage count after dedup
    const dedupedData = dedupedMap.get(config.id);
    if (dedupedData) {
      const rawData = sectionMap.get(config.id);
      audit.homepageCount = dedupedData.articles.length;
      audit.duplicatesInHomepage = (rawData?.articles.length || 0) - dedupedData.articles.length;
    }

    // Re-evaluate status with actual dedup data
    if (audit.category && audit.homepageCount === 0 && audit.aggregatorCount > 0) {
      audit.status = "WARN";
      audit.notes.push("All articles removed by dedup (appeared in earlier sections)");
    }

    audits.push(audit);
  }

  // Hero section audit
  let heroCount = 0;
  try {
    const heroResult = await getAggregatedList("articles", {
      pageSize: 16,
      sort: "publishedAt",
      order: "desc",
    });
    heroCount = heroResult.data.length;
  } catch (_e) { /* hero fetch failed — count stays 0 */ }

  // Compute health
  const totalTime = Date.now() - startTime;
  const passed = audits.filter((a) => a.status === "PASS").length;
  const failed = audits.filter((a) => a.status === "FAIL").length;
  const warned = audits.filter((a) => a.status === "WARN").length;
  const empty = audits.filter((a) => a.status === "EMPTY").length;
  const totalArticles = audits.reduce((sum, a) => sum + a.homepageCount, 0) + heroCount;
  const totalDupes = audits.reduce((sum, a) => sum + a.duplicatesInHomepage, 0);

  const score = Math.round(
    ((passed + empty * 0.5) / Math.max(audits.length, 1)) * 100
  );

  const health: HealthReport = {
    score,
    totalSections: audits.length,
    passedSections: passed,
    failedSections: failed,
    warnSections: warned,
    emptySections: empty,
    totalArticlesOnHomepage: totalArticles,
    totalDuplicatesRemoved: totalDupes,
    errors: audits.filter((a) => a.status === "FAIL").map((a) => `${a.title}: ${a.notes.join(", ")}`),
    warnings: audits.filter((a) => a.status === "WARN").map((a) => `${a.title}: ${a.notes.join(", ")}`),
  };

  // SEO audit for categories
  const seoAudit = categories.map((cat) => ({
    slug: cat.slug,
    title: cat.titleHindi,
    hasDescription: !!cat.description,
    hasPath: !!cat.path,
    pathCorrect: cat.path === `/${cat.slug}` || cat.path.startsWith(`/${cat.slug}`),
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono text-sm">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">📊 Content Audit Dashboard</h1>
        <p className="text-gray-400 mb-6">
          Generated: {new Date().toISOString()} | Total time: {totalTime}ms
        </p>

        {/* Health Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg border ${score >= 80 ? "border-green-500 bg-green-950" : score >= 50 ? "border-yellow-500 bg-yellow-950" : "border-red-500 bg-red-950"}`}>
            <div className="text-3xl font-bold">{score}%</div>
            <div className="text-xs text-gray-400">Health Score</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
            <div className="text-3xl font-bold">{totalArticles}</div>
            <div className="text-xs text-gray-400">Articles on Homepage</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
            <div className="text-3xl font-bold">{totalDupes}</div>
            <div className="text-xs text-gray-400">Duplicates Removed</div>
          </div>
          <div className="p-4 rounded-lg border border-gray-700 bg-gray-900">
            <div className="text-3xl font-bold">{heroCount}</div>
            <div className="text-xs text-gray-400">Hero Articles</div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex gap-4 mb-6">
          <span className="px-3 py-1 rounded bg-green-900 text-green-300">✓ PASS: {passed}</span>
          <span className="px-3 py-1 rounded bg-red-900 text-red-300">✗ FAIL: {failed}</span>
          <span className="px-3 py-1 rounded bg-yellow-900 text-yellow-300">⚠ WARN: {warned}</span>
          <span className="px-3 py-1 rounded bg-gray-800 text-gray-400">○ EMPTY: {empty}</span>
        </div>

        {/* Errors & Warnings */}
        {health.errors.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-red-700 bg-red-950">
            <h3 className="font-bold text-red-400 mb-2">❌ Errors</h3>
            {health.errors.map((e, i) => (
              <div key={i} className="text-red-300 text-xs mb-1">• {e}</div>
            ))}
          </div>
        )}
        {health.warnings.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-yellow-700 bg-yellow-950">
            <h3 className="font-bold text-yellow-400 mb-2">⚠️ Warnings</h3>
            {health.warnings.map((w, i) => (
              <div key={i} className="text-yellow-300 text-xs mb-1">• {w}</div>
            ))}
          </div>
        )}

        {/* Section Audit Table */}
        <h2 className="text-lg font-bold mb-3 mt-8">Homepage Sections Audit</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Section</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Template</th>
                <th className="text-right p-2">Homepage</th>
                <th className="text-right p-2">Cat.Page</th>
                <th className="text-right p-2">CMS Total</th>
                <th className="text-right p-2">Custom</th>
                <th className="text-right p-2">Strapi</th>
                <th className="text-right p-2">Dupes</th>
                <th className="text-right p-2">Time</th>
                <th className="text-center p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit) => (
                <tr key={audit.sectionId} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="p-2 font-medium">{audit.title}</td>
                  <td className="p-2 text-gray-400">{audit.category || "—"}</td>
                  <td className="p-2 text-gray-400">{audit.template}</td>
                  <td className="p-2 text-right">{audit.homepageCount}</td>
                  <td className="p-2 text-right">{audit.category ? audit.categoryPageCount : "—"}</td>
                  <td className="p-2 text-right">{audit.aggregatorCount}</td>
                  <td className="p-2 text-right text-blue-400">{audit.customCmsCount}</td>
                  <td className="p-2 text-right text-purple-400">{audit.strapiCount}</td>
                  <td className="p-2 text-right text-orange-400">{audit.duplicatesInHomepage > 0 ? audit.duplicatesInHomepage : "—"}</td>
                  <td className="p-2 text-right text-gray-500">{audit.timing}ms</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      audit.status === "PASS" ? "bg-green-900 text-green-300" :
                      audit.status === "FAIL" ? "bg-red-900 text-red-300" :
                      audit.status === "WARN" ? "bg-yellow-900 text-yellow-300" :
                      "bg-gray-800 text-gray-500"
                    }`}>
                      {audit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes per section */}
        <h2 className="text-lg font-bold mb-3 mt-8">Section Notes</h2>
        <div className="space-y-2">
          {audits.filter(a => a.notes.length > 0).map((audit) => (
            <div key={audit.sectionId} className="p-3 rounded bg-gray-900 border border-gray-800">
              <div className="font-medium text-gray-300">{audit.title} ({audit.sectionId})</div>
              {audit.notes.map((note, i) => (
                <div key={i} className="text-xs text-gray-500 ml-2">→ {note}</div>
              ))}
            </div>
          ))}
        </div>

        {/* SEO Audit */}
        <h2 className="text-lg font-bold mb-3 mt-8">Category SEO Audit</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Slug</th>
                <th className="text-left p-2">Title</th>
                <th className="text-center p-2">Description</th>
                <th className="text-center p-2">Path</th>
                <th className="text-center p-2">Path OK</th>
              </tr>
            </thead>
            <tbody>
              {seoAudit.map((item) => (
                <tr key={item.slug} className="border-b border-gray-800">
                  <td className="p-2 font-medium">{item.slug}</td>
                  <td className="p-2">{item.title}</td>
                  <td className="p-2 text-center">{item.hasDescription ? "✓" : "✗"}</td>
                  <td className="p-2 text-center">{item.hasPath ? "✓" : "✗"}</td>
                  <td className="p-2 text-center">{item.pathCorrect ? "✓" : "⚠"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data Pipeline Diagram */}
        <h2 className="text-lg font-bold mb-3 mt-8">Data Pipeline</h2>
        <pre className="p-4 bg-gray-900 rounded text-xs text-gray-400 overflow-x-auto">{`
Homepage (page.tsx)
  └─ getHomepageData() [homepageService.ts]
       ├─ Hero: getAggregatedList(articles, no category)
       ├─ Sections: fetchAllHomepageSections() [contentResolver.ts]
       │    └─ Each section: fetchFromSource(config)
       │         └─ getAggregatedList(articles, { category })
       │              ├─ fetchCustomCms() → cms.rampurnews.com
       │              └─ fetchStrapi() → api.rampur.cloud + CLIENT-SIDE FILTER
       └─ Sidebar: getTrendingArticles, getBreakingNews

Category Page (/rampur, /up, etc.)
  └─ CategoryPageServer [categoryPage.tsx]
       └─ getAggregatedList(articles, { category: slug })
            ├─ Same aggregator
            └─ Passes initialArticles to CategoryListing (client)

Pagination (page 2+)
  └─ /api/category-articles?category=slug&page=2
       └─ getAggregatedList() — SAME pipeline

⚡ Single source of truth: aggregator.ts
⚠️ getCMSProvider() used ONLY as fallback in catch blocks
        `}</pre>
      </div>
    </div>
  );
}
