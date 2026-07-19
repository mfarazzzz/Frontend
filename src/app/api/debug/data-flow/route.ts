/**
 * DEBUG API: /api/debug/data-flow
 * 
 * Instruments the entire data pipeline to prove:
 * 1. What the aggregator returns for a given category
 * 2. What getCMSProvider() returns for the same category
 * 3. Where the disconnect happens
 * 
 * Usage: /api/debug/data-flow?category=rampur
 * 
 * This endpoint is for development/verification only.
 * Remove or protect before production deployment.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAggregatedList, fetchCustomCms, fetchStrapi } from "@/services/cms/aggregator";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || "rampur";

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    category,
    pipelines: {},
  };

  // ─── Pipeline 1: Aggregator (correct pipeline — used by homepage & category pages) ───
  try {
    const startAgg = Date.now();
    const aggregated = await getAggregatedList("articles", {
      category,
      pageSize: 25,
      page: 1,
      sort: "publishedAt",
      order: "desc",
    });
    const aggTime = Date.now() - startAgg;

    results.pipelines = {
      ...results.pipelines as object,
      aggregator: {
        status: "OK",
        timing: `${aggTime}ms`,
        articleCount: aggregated.data.length,
        total: aggregated.meta.pagination.total,
        sources: aggregated.meta.sources,
        sampleTitles: aggregated.data.slice(0, 5).map((a: any) => ({
          title: a.title?.substring(0, 60),
          category: a.category,
          source: a._source,
          slug: a.slug,
        })),
      },
    };
  } catch (error) {
    results.pipelines = {
      ...results.pipelines as object,
      aggregator: {
        status: "ERROR",
        error: (error as Error).message,
      },
    };
  }

  // ─── Pipeline 2: Custom CMS directly ───
  try {
    const startCms = Date.now();
    const customResult = await fetchCustomCms("articles", {
      category,
      pageSize: 25,
    });
    const cmsTime = Date.now() - startCms;

    results.pipelines = {
      ...results.pipelines as object,
      customCms: {
        status: "OK",
        timing: `${cmsTime}ms`,
        articleCount: customResult.data.length,
        total: customResult.total,
        sampleTitles: customResult.data.slice(0, 3).map((a: any) => ({
          title: a.title?.substring(0, 60),
          category: a.category,
          slug: a.slug,
        })),
      },
    };
  } catch (error) {
    results.pipelines = {
      ...results.pipelines as object,
      customCms: {
        status: "ERROR",
        error: (error as Error).message,
      },
    };
  }

  // ─── Pipeline 3: Strapi directly (with category filter) ───
  try {
    const startStrapi = Date.now();
    const strapiResult = await fetchStrapi("articles", {
      category,
      pageSize: 25,
      sort: "publishedAt",
      order: "desc",
    });
    const strapiTime = Date.now() - startStrapi;

    results.pipelines = {
      ...results.pipelines as object,
      strapi: {
        status: "OK",
        timing: `${strapiTime}ms`,
        articleCount: strapiResult.data.length,
        total: strapiResult.total,
        note: "Strapi custom controller may ignore category filter. Client-side filtering applied.",
        sampleTitles: strapiResult.data.slice(0, 3).map((a: any) => ({
          title: a.title?.substring(0, 60),
          category: a.category,
          slug: a.slug,
        })),
      },
    };
  } catch (error) {
    results.pipelines = {
      ...results.pipelines as object,
      strapi: {
        status: "ERROR",
        error: (error as Error).message,
      },
    };
  }

  // ─── Pipeline 4: getCMSProvider().getArticles() — the BROKEN path ───
  // This is what useArticles hook was calling on category pages
  try {
    const startProvider = Date.now();
    const providerResult = await getCMSProvider().getArticles({
      category,
      limit: 25,
      offset: 0,
      orderBy: "publishedDate",
      order: "desc",
      status: "published",
    });
    const providerTime = Date.now() - startProvider;

    results.pipelines = {
      ...results.pipelines as object,
      cmsProvider: {
        status: "OK",
        timing: `${providerTime}ms`,
        articleCount: providerResult.data.length,
        total: providerResult.total,
        note: "This was the OLD category page pipeline (useArticles hook). If count is 0 while aggregator shows articles, THIS PROVES THE BUG.",
        sampleTitles: providerResult.data.slice(0, 3).map((a: any) => ({
          title: a.title?.substring(0, 60),
          category: a.category,
          slug: a.slug,
        })),
      },
    };
  } catch (error) {
    results.pipelines = {
      ...results.pipelines as object,
      cmsProvider: {
        status: "ERROR",
        error: (error as Error).message,
        note: "getCMSProvider().getArticles() failed — this was the broken pipeline",
      },
    };
  }

  // ─── Comparison ───
  const agg = (results.pipelines as any).aggregator;
  const prov = (results.pipelines as any).cmsProvider;

  if (agg && prov) {
    const aggCount = agg.articleCount || 0;
    const provCount = prov.articleCount || 0;
    
    results.diagnosis = {
      aggregatorArticles: aggCount,
      providerArticles: provCount,
      match: aggCount === provCount,
      bugProven: aggCount > 0 && provCount === 0,
      explanation: aggCount > 0 && provCount === 0
        ? `BUG CONFIRMED: Aggregator found ${aggCount} articles for category "${category}" but getCMSProvider() returned ${provCount}. The old useArticles hook (which called getCMSProvider) would show "no articles" even though content exists. The fix correctly uses the aggregator API instead.`
        : aggCount > 0 && provCount > 0
        ? `Both pipelines return articles. getCMSProvider returns ${provCount} (may differ due to single-source vs dual-source).`
        : `Aggregator: ${aggCount}, Provider: ${provCount}. Category may genuinely have no content.`,
    };
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
