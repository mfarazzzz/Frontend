import { NextRequest, NextResponse } from "next/server";

// CMS API URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.rampurnews.com/api";

/**
 * GET /api/ads/click
 * Track ad click and redirect to target URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get("adId");

    if (!adId) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Forward click to CMS for tracking
    try {
      await fetch(`${CMS_API_URL}/ads/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      });
    } catch (cmsError) {
      console.error("[Ads Click] Error forwarding to CMS:", cmsError);
      // Don't fail the redirect if CMS is unavailable
    }

    // Get the target URL from the request or default to home
    const targetUrl = searchParams.get("target") || "/";
    
    return NextResponse.redirect(new URL(targetUrl, request.url));
  } catch (error) {
    console.error("[Ads Click] Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

/**
 * POST /api/ads/click
 * Track ad click (alternative method)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { success: false, error: "Ad ID is required" },
        { status: 400 }
      );
    }

    // Forward to CMS for tracking
    try {
      const response = await fetch(`${CMS_API_URL}/ads/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      });

      if (!response.ok) {
        console.error("[Ads Click] CMS returned error:", response.status);
      }
    } catch (cmsError) {
      console.error("[Ads Click] Error forwarding to CMS:", cmsError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Ads Click] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
