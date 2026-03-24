import { NextRequest, NextResponse } from "next/server";

// CMS API URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.rampurnews.com/api";

/**
 * POST /api/ads/impression
 * Track an ad impression
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
      const response = await fetch(`${CMS_API_URL}/ads/impression`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
      });

      if (!response.ok) {
        console.error("[Ads Impression] CMS returned error:", response.status);
      }
    } catch (cmsError) {
      console.error("[Ads Impression] Error forwarding to CMS:", cmsError);
      // Don't fail the request if CMS is unavailable
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Ads Impression] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
