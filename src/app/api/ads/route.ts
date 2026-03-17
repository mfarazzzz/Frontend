import { NextRequest, NextResponse } from "next/server";
import { getCMSProvider, type CMSAd, type AdPlacement } from "@/services/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ads
 * Fetch ads with optional filtering by placement, active status, and date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const placement = searchParams.get("placement") as AdPlacement | null;
    const isActive = searchParams.get("isActive");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");
    
    const provider = getCMSProvider();
    
    // Get ads from CMS provider
    const ads = await provider.getAds({
      placement: placement || undefined,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    
    return NextResponse.json({
      success: true,
      data: ads,
      count: ads.length,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ads
 * Create a new ad (requires admin authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Check for admin API key
    const adminKey = request.headers.get("x-admin-api-key");
    const expectedKey = process.env.ADMIN_API_KEY;
    
    if (expectedKey && adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const provider = getCMSProvider();
    
    const newAd = await provider.createAd(body);
    
    return NextResponse.json({
      success: true,
      data: newAd,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ad" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ads
 * Update an existing ad (requires admin authentication)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check for admin API key
    const adminKey = request.headers.get("x-admin-api-key");
    const expectedKey = process.env.ADMIN_API_KEY;
    
    if (expectedKey && adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ad ID is required" },
        { status: 400 }
      );
    }
    
    const provider = getCMSProvider();
    const updatedAd = await provider.updateAd(id, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedAd,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ad" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ads
 * Delete an ad (requires admin authentication)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check for admin API key
    const adminKey = request.headers.get("x-admin-api-key");
    const expectedKey = process.env.ADMIN_API_KEY;
    
    if (expectedKey && adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Ad ID is required" },
        { status: 400 }
      );
    }
    
    const provider = getCMSProvider();
    await provider.deleteAd(id);
    
    return NextResponse.json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete ad" },
      { status: 500 }
    );
  }
}
