"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { AdPlacement, CMSAd } from "@/services/cms";

// Frequency cap: max impressions per ad per user per day
const MAX_IMPRESSIONS_PER_AD_PER_DAY = 5;
const IMPRESSION_COUNTS_KEY = "ad_impression_counts";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

// Track seen ads globally to prevent duplicate impressions
const globalSeenAds = new Set<string>();

/**
 * Get impression count for an ad from localStorage
 */
function getImpressionCount(adId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = localStorage.getItem(IMPRESSION_COUNTS_KEY);
    if (!data) return 0;
    const counts = JSON.parse(data) as Record<string, { count: number; date: string }>;
    const today = new Date().toISOString().split("T")[0];
    
    if (counts[adId]?.date !== today) {
      return 0;
    }
    return counts[adId]?.count || 0;
  } catch {
    return 0;
  }
}

/**
 * Increment impression count for an ad
 */
function incrementImpressionCount(adId: string): void {
  if (typeof window === "undefined") return;
  try {
    const data = localStorage.getItem(IMPRESSION_COUNTS_KEY);
    const counts = data ? JSON.parse(data) as Record<string, { count: number; date: string }> : {};
    const today = new Date().toISOString().split("T")[0];
    
    if (counts[adId]?.date !== today) {
      counts[adId] = { count: 0, date: today };
    }
    counts[adId].count += 1;
    localStorage.setItem(IMPRESSION_COUNTS_KEY, JSON.stringify(counts));
  } catch {
    // Ignore errors
  }
}

/**
 * Check if ad was already seen globally
 */
function wasAdSeenGlobally(adId: string): boolean {
  return globalSeenAds.has(adId);
}

/**
 * Mark ad as seen globally
 */
function markAdSeenGlobally(adId: string): void {
  globalSeenAds.add(adId);
}

// Debounce function
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const debouncedTrackImpression = debounce(async (adId: string) => {
  // Check frequency cap
  const impressionCount = getImpressionCount(adId);
  if (impressionCount >= MAX_IMPRESSIONS_PER_AD_PER_DAY) {
    console.log(`[Ads] Frequency cap reached for ${adId}`);
    return;
  }
  
  // Check global deduplication
  if (wasAdSeenGlobally(adId)) {
    console.log(`[Ads] Already tracked ${adId}`);
    return;
  }
  
  try {
    const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.rampurnews.com/api";
    const response = await fetch(`${CMS_API_URL}/ads/impression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId }),
    });
    
    if (response.ok) {
      incrementImpressionCount(adId);
      markAdSeenGlobally(adId);
      console.log(`[Ads] Impression tracked for ${adId}`);
    }
  } catch (error) {
    console.error("[Ads] Failed to track impression:", error);
  }
}, 1000);

/**
 * Get container styles based on ad placement
 */
const getAdContainerStyle = useCallback((placement: AdPlacement): React.CSSProperties => {
  const styles: Record<AdPlacement, React.CSSProperties> = {
    header: { width: "100%", height: "90px", maxWidth: "728px", margin: "0 auto" },
    sidebar: { width: "100%", height: "250px", maxWidth: "300px", margin: "0 auto" },
    infeed: { width: "100%", height: "250px", maxWidth: "728px", margin: "1rem auto" },
    article_top: { width: "100%", height: "90px", maxWidth: "728px", margin: "1rem auto" },
    article_middle: { width: "100%", height: "250px", maxWidth: "728px", margin: "1rem auto" },
    article_bottom: { width: "100%", height: "250px", maxWidth: "728px", margin: "1rem auto" },
    footer: { width: "100%", height: "250px", maxWidth: "728px", margin: "0 auto" },
    mobile_sticky: { position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", height: "50px", zIndex: 50 },
  };
  return styles[placement] || {};
}, []);

/**
 * AdSlot - Optimized advertisement component
 */
export default function AdSlot({ placement, className = "" }: AdSlotProps) {
  const [ad, setAd] = useState<CMSAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const isMounted = useRef(true);
  const impressionTracked = useRef(false);
  const CMS_API_URL = useMemo(() => 
    process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.rampurnews.com/api", 
  []);

  const fetchAd = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const params = new URLSearchParams({
        placement,
        isActive: "true",
        limit: "1",
      });

      const response = await fetch(`${CMS_API_URL}/ads?${params.toString()}`);
      const data = await response.json();

      if (isMounted.current && data.success && data.data?.length > 0) {
        setAd(data.data[0]);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("[Ads] Error fetching ad:", err);
        setError("Failed to load advertisement");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [placement, CMS_API_URL]);

  // Track impression when ad is rendered
  useEffect(() => {
    if (ad && !impressionTracked.current) {
      impressionTracked.current = true;
      debouncedTrackImpression(ad.id);
    }
  }, [ad]);

  useEffect(() => {
    isMounted.current = true;
    
    // Above-the-fold ads fetch immediately
    if (placement === "header" || placement === "article_top") {
      fetchAd();
    } else {
      // Below-the-fold: use Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            fetchAd();
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "100px" }
      );

      const element = document.getElementById(`ad-slot-${placement}`);
      if (element) observer.observe(element);

      return () => {
        observer.disconnect();
        isMounted.current = false;
      };
    }

    return () => {
      isMounted.current = false;
    };
  }, [placement, fetchAd]);

  // Don't render if no ad and not loading
  if (!isLoading && !ad) return null;

  // Loading state
  if (isLoading) {
    return (
      <div
        id={`ad-slot-${placement}`}
        className={`ad-slot ad-slot--loading ${className}`}
        style={getAdContainerStyle(placement)}
      >
        <div className="animate-pulse bg-muted rounded h-full min-h-[100px] flex items-center justify-center">
          <span className="text-muted-foreground text-sm">विज्ञापन</span>
        </div>
      </div>
    );
  }

  if (error || !ad) return null;

  return (
    <div
      id={`ad-slot-${placement}`}
      className={`ad-slot ${className}`}
      style={getAdContainerStyle(placement)}
    >
      {ad.type !== "adsense" && (
        <div className="text-xs text-gray-500 mb-1">Sponsored</div>
      )}
      
      {ad.type === "adsense" && ad.code && (
        <div className="adsense-ad" dangerouslySetInnerHTML={{ __html: ad.code }} />
      )}
      {ad.type === "image" && ad.imageUrl && (
        <a
          href={`${CMS_API_URL}/ads/click?adId=${ad.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto object-contain" loading="lazy" />
        </a>
      )}
      {ad.type === "html" && ad.code && (
        <div className="html-ad" dangerouslySetInnerHTML={{ __html: ad.code }} />
      )}
    </div>
  );
}
