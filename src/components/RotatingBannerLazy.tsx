"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { AdPlacement, CMSAd } from "@/services/cms";

// Dynamically import the RotatingBanner with SSR disabled
const RotatingBanner = dynamic(() => import("./RotatingBanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded animate-pulse h-[250px] w-full max-w-[970px] mx-auto">
      <span className="text-gray-400 text-sm">Loading advertisement...</span>
    </div>
  ),
});

interface RotatingBannerLazyProps {
  placement: AdPlacement;
  className?: string;
  rotationInterval?: number;
}

/**
 * RotatingBannerLazy - Client-side ad banner with automatic rotation
 * Fetches ads from API and displays them with rotation
 */
export default function RotatingBannerLazy({
  placement,
  className = "",
  rotationInterval = 5000,
}: RotatingBannerLazyProps) {
  const [ads, setAds] = useState<CMSAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const parseAdsResponse = useCallback((json: any): CMSAd[] => {
    if (!json || json.success !== true) return [];

    const payload = json.data;
    const rawAds: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.ads)
          ? payload.ads
          : [];

    return rawAds
      .map((raw) => {
        if (!raw) return null;
        const id = raw.id != null ? String(raw.id) : "";
        if (!id) return null;
        const imageUrl = raw.imageUrl || raw.image_url || undefined;
        const targetUrl = raw.targetUrl || raw.target_url || undefined;
        const link = raw.link || raw.targetUrl || raw.target_url || raw.targetUrl || undefined;
        return {
          id,
          title: raw.title || "",
          type: raw.type || "image",
          placement: raw.placement || placement,
          code: raw.code || raw.ad_code || undefined,
          imageUrl,
          link,
          targetUrl,
          isActive: raw.isActive === true || raw.is_active === true,
          startDate: raw.startDate || raw.start_date || undefined,
          endDate: raw.endDate || raw.end_date || undefined,
          priority: typeof raw.priority === "number" ? raw.priority : Number(raw.priority) || 1,
          weight: typeof raw.weight === "number" ? raw.weight : Number(raw.weight) || undefined,
          deviceType: raw.deviceType || raw.device_type || undefined,
          impressions: typeof raw.impressions === "number" ? raw.impressions : Number(raw.impressions) || undefined,
          clicks: typeof raw.clicks === "number" ? raw.clicks : Number(raw.clicks) || undefined,
          category: raw.category || undefined,
          createdAt: String(raw.createdAt || raw.created_at || ""),
          updatedAt: String(raw.updatedAt || raw.updated_at || ""),
        } as CMSAd;
      })
      .filter((item): item is CMSAd => Boolean(item));
  }, [placement]);

  const fetchAds = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const params = new URLSearchParams({
        placement,
        active: "true",
        limit: "100",
      });

      const response = await fetch(`/api/ads?${params.toString()}`);
      const json = await response.json();
      const fetchedAds = parseAdsResponse(json);

      // Filter to only valid/active ads
      const validAds = fetchedAds.filter((ad) => {
        if (!ad.isActive) return false;
        
        // Check date validity if startDate/endDate exist
        const now = new Date();
        if (ad.startDate) {
          const start = new Date(ad.startDate);
          if (start > now) return false;
        }
        if (ad.endDate) {
          const end = new Date(ad.endDate);
          if (end < now) return false;
        }
        
        return true;
      });

      setAds(validAds);
    } catch (err) {
      console.error("[RotatingBannerLazy] Error fetching ads:", err);
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [placement, parseAdsResponse]);

  useEffect(() => {
    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasFetched.current) {
            fetchAds();
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    const container = document.querySelector(`[data-banner-slot="${placement}"]`);
    if (container) {
      observer.observe(container);
    } else {
      // If container not found, fetch immediately
      fetchAds();
    }

    return () => observer.disconnect();
  }, [placement, fetchAds]);

  // Show loading state while fetching
  if (isLoading) {
    return (
      <div
        data-banner-slot={placement}
        className={`rotating-banner rotating-banner-${placement} ${className}`}
      >
        <div className="flex items-center justify-center bg-gray-100 rounded animate-pulse h-[250px] w-full max-w-[970px] mx-auto">
          <span className="text-gray-400 text-sm">Loading advertisement...</span>
        </div>
      </div>
    );
  }

  // Pass ads to RotatingBanner for rotation
  return (
    <div
      data-banner-slot={placement}
      className={`rotating-banner rotating-banner-${placement} ${className}`}
    >
      <RotatingBanner
        ads={ads}
        placement={placement}
        className={className}
        rotationInterval={rotationInterval}
      />
    </div>
  );
}
