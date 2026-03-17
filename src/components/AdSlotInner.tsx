"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { AdPlacement, CMSAd } from "@/services/cms";

// Frequency cap: max impressions per ad per user per day
const MAX_IMPRESSIONS_PER_AD_PER_DAY = 5;
const IMPRESSION_COUNTS_KEY = "ad_impression_counts";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * AdSlotInner - Client-only advertisement component with hooks
 */
export default function AdSlotInner({ placement, className = "" }: AdSlotProps) {
  const [ad, setAd] = useState<CMSAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const isMounted = useRef(true);
  const impressionTracked = useRef(false);

  const CMS_API_URL = "https://cms.rampurnews.com/api";

  // Get impression count for an ad from localStorage
  const getImpressionCount = useCallback((adId: string): number => {
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
  }, []);

  // Increment impression count for an ad
  const incrementImpressionCount = useCallback((adId: string): void => {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem(IMPRESSION_COUNTS_KEY);
      const counts = data ? JSON.parse(data) as Record<string, { count: number; date: string }> : {};
      const today = new Date().toISOString().split("T")[0];
      
      if (!counts[adId] || counts[adId].date !== today) {
        counts[adId] = { count: 1, date: today };
      } else {
        counts[adId].count = Math.min(counts[adId].count + 1, MAX_IMPRESSIONS_PER_AD_PER_DAY);
      }
      
      localStorage.setItem(IMPRESSION_COUNTS_KEY, JSON.stringify(counts));
    } catch {
      // Ignore errors
    }
  }, []);

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
        // Check frequency cap
        const impressionCount = getImpressionCount(data.data[0].id);
        if (impressionCount < MAX_IMPRESSIONS_PER_AD_PER_DAY) {
          setAd(data.data[0]);
          incrementImpressionCount(data.data[0].id);
        } else {
          // Frequency cap reached, try to get another ad or show placeholder
          if (data.data.length > 1) {
            setAd(data.data[1]);
            incrementImpressionCount(data.data[1].id);
          }
        }
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
  }, [placement, getImpressionCount, incrementImpressionCount]);

  // Track impression when ad is rendered
  const trackImpression = useCallback(async (adId: string) => {
    try {
      await fetch(`${CMS_API_URL}/ads/impression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
    } catch (err) {
      console.error("[Ads] Error tracking impression:", err);
    }
  }, []);

  useEffect(() => {
    if (ad && !impressionTracked.current) {
      impressionTracked.current = true;
      trackImpression(ad.id);
    }
  }, [ad, trackImpression]);

  useEffect(() => {
    isMounted.current = true;
    
    // Above-the-fold ads fetch immediately
    if (placement === "header" || placement === "article_top") {
      fetchAd();
    } else {
      // Below-the-fold: use Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasFetched.current) {
              fetchAd();
              observer.disconnect();
            }
          });
        },
        { rootMargin: "200px" }
      );

      const container = document.querySelector(`[data-ad-slot="${placement}"]`);
      if (container) {
        observer.observe(container);
      }

      return () => observer.disconnect();
    }

    return () => {
      isMounted.current = false;
    };
  }, [placement, fetchAd]);

  // Get styles based on placement
  const getStyles = useCallback(() => {
    const styles: Record<string, React.CSSProperties> = {
      header: { width: "100%", height: "90px", maxWidth: "728px", margin: "0 auto" },
      sidebar: { width: "300px", height: "250px", margin: "0 auto" },
      infeed: { width: "100%", height: "250px", maxWidth: "728px", margin: "0 auto" },
      article_top: { width: "100%", height: "90px", maxWidth: "728px", margin: "0 auto" },
      article_middle: { width: "100%", height: "250px", maxWidth: "728px", margin: "0 auto" },
      article_bottom: { width: "100%", height: "250px", maxWidth: "728px", margin: "0 auto" },
      footer: { width: "100%", height: "250px", maxWidth: "728px", margin: "0 auto" },
      mobile_sticky: { position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", height: "50px", zIndex: 50 },
    };
    return styles[placement] || {};
  }, [placement]);

  // Render ad based on type
  const renderAd = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded animate-pulse" style={getStyles()}>
          <span className="text-gray-400 text-sm">Loading advertisement...</span>
        </div>
      );
    }

    if (error || !ad) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded border border-gray-200" style={getStyles()}>
          <span className="text-gray-400 text-sm">Advertisement</span>
        </div>
      );
    }

    // AdSense ad
    if (ad.type === "adsense" && ad.code) {
      return (
        <div 
          className="adsbygoogle"
          data-ad-client={ad.code}
          style={getStyles()}
        />
      );
    }

    // Image ad
    if (ad.type === "image" && ad.imageUrl && ad.link) {
      return (
        <a 
          href={`${CMS_API_URL}/ads/click?id=${ad.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src={ad.imageUrl} 
            alt={ad.title || "Advertisement"} 
            className="max-w-full h-auto mx-auto"
            style={getStyles()}
          />
        </a>
      );
    }

    // HTML ad
    if (ad.type === "html" && ad.code) {
      return (
        <div 
          className="ad-html-content"
          dangerouslySetInnerHTML={{ __html: ad.code }}
          style={getStyles()}
        />
      );
    }

    return null;
  };

  return (
    <div 
      data-ad-slot={placement}
      className={`ad-slot ad-slot-${placement} ${className}`}
    >
      {renderAd()}
    </div>
  );
}
