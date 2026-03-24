import { NextRequest, NextResponse } from "next/server";

// CMS API URL - should be configured in environment
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.rampurnews.com/api";

/**
 * GET /api/ads
 * Fetch ads from CMS by placement
 * 
 * Query params:
 * - placement: ad placement (header, sidebar, banner_1, etc.)
 * - active: filter by active status (true/false)
 * - limit: max number of ads to return (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placement = searchParams.get("placement");
    const active = searchParams.get("active");
    const limit = searchParams.get("limit") || "100";

    if (!placement) {
      return NextResponse.json(
        { success: false, error: "Placement is required" },
        { status: 400 }
      );
    }

    // Build query params for CMS
    const params = new URLSearchParams();
    params.set("placement", placement);
    if (active !== null) {
      params.set("isActive", active);
    }
    params.set("limit", limit);

    // Fetch from CMS
    const cmsUrl = `${CMS_API_URL}/ads?${params.toString()}`;
    const response = await fetch(cmsUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // Don't cache ads requests to ensure freshness
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[Ads API] CMS returned error:", response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch ads from CMS" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || data,
    });
  } catch (error) {
    console.error("[Ads API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
