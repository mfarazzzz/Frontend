/**
 * API Route: /api/category-articles
 * 
 * Client-side pagination endpoint for category pages.
 * Uses the aggregator (Custom CMS + Strapi) to ensure consistent
 * results between homepage sections and category archive pages.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAggregatedList } from "@/services/cms/aggregator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "24", 10);

  if (!category) {
    return NextResponse.json(
      { error: "Missing category parameter" },
      { status: 400 }
    );
  }

  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const validPageSize = Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 50 ? pageSize : 24;

  try {
    const aggregated = await getAggregatedList("articles", {
      category,
      pageSize: validPageSize,
      page: currentPage,
      sort: "publishedAt",
      order: "desc",
    });

    return NextResponse.json({
      data: aggregated.data,
      total: aggregated.meta.pagination.total,
      page: aggregated.meta.pagination.page,
      pageSize: aggregated.meta.pagination.pageSize,
      totalPages: aggregated.meta.pagination.pageCount,
    });
  } catch (error) {
    console.error("[api/category-articles] Error:", error);
    return NextResponse.json(
      { data: [], total: 0, page: 1, pageSize: validPageSize, totalPages: 0 },
      { status: 200 }
    );
  }
}
