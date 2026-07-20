/**
 * GET /api/breaking-news
 * 
 * Proxy route for breaking news ticker.
 * Fetches from the CMS server-side (avoids CORS issues with client-side fetches).
 * Returns only articles marked as is_breaking=true from the last 48 hours.
 */
import { NextResponse } from "next/server";
import { getCMSProvider } from "@/services/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provider = getCMSProvider();
    const articles = await provider.getBreakingNews(10);

    return NextResponse.json(
      { data: articles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[api/breaking-news] Error:", error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
