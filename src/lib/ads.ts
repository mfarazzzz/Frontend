import { getCMSProvider, type CMSAd, type AdPlacement, type AdQueryParams } from "@/services/cms";

/**
 * Server-side function to fetch ads
 * Use this for server components to avoid client-side fetching
 */
export async function getAdsByPlacement(
  placement: AdPlacement,
  options?: {
    isActive?: boolean;
    limit?: number;
  }
): Promise<CMSAd[]> {
  try {
    const provider = getCMSProvider();
    const params: AdQueryParams = {
      placement,
      isActive: options?.isActive ?? true,
      limit: options?.limit ?? 1,
    };
    return await provider.getAds(params);
  } catch (error) {
    console.error("Error fetching ads on server:", error);
    return [];
  }
}

/**
 * Get all active ads for a page
 * Useful for preloading multiple ad placements at once
 */
export async function getPageAds(
  placements: AdPlacement[]
): Promise<Record<AdPlacement, CMSAd | null>> {
  const results: Record<AdPlacement, CMSAd | null> = {} as Record<AdPlacement, CMSAd | null>;
  
  await Promise.all(
    placements.map(async (placement) => {
      const ads = await getAdsByPlacement(placement, { limit: 1 });
      results[placement] = ads[0] || null;
    })
  );
  
  return results;
}
