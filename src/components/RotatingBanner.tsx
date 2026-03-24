"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { CMSAd } from "@/services/cms";

interface RotatingBannerProps {
  ads: CMSAd[];
  placement: string;
  className?: string;
  rotationInterval?: number; // in milliseconds, default 5000
}

/**
 * RotatingBanner - A banner that cycles through multiple ads
 * - Randomizes initial ad on client-side to avoid hydration mismatch
 * - Rotates every 5 seconds (configurable)
 * - Handles 0, 1, or many ads safely
 * - Cleans up interval properly on unmount
 * - Returns null for no ads
 */
export default function RotatingBanner({
  ads,
  placement,
  className = "",
  rotationInterval = 5000,
}: RotatingBannerProps) {
  const [currentAd, setCurrentAd] = useState<CMSAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRotated = useRef(false);

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
      banner_1: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_2: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_3: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_4: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_5: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_6: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_7: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_8: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_9: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
      banner_10: { width: "100%", height: "250px", maxWidth: "970px", margin: "0 auto" },
    };
    return styles[placement] || { width: "100%", height: "250px", maxWidth: "728px", margin: "0 auto" };
  }, [placement]);

  // Track impression
  const trackImpression = useCallback(async (adId: string) => {
    try {
      await fetch(`/api/ads/impression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });
    } catch (err) {
      console.error("[RotatingBanner] Error tracking impression:", err);
    }
  }, []);

  // Handle click tracking
  const handleAdClick = useCallback((ad: CMSAd) => {
    // Build click URL with target if available
    const targetParam = ad.targetUrl || ad.link ? `&target=${encodeURIComponent(ad.targetUrl || ad.link || '')}` : '';
    // Track click
    fetch(`/api/ads/click?adId=${encodeURIComponent(ad.id)}${targetParam}`, {
      method: "POST",
    }).catch(console.error);
  }, []);

  // Initialize and handle rotation
  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    if (typeof window === "undefined") return;

    // Filter out invalid ads
    const validAds = ads.filter((ad) => {
      if (!ad) return false;
      if (ad.type === "adsense") return Boolean(ad.code);
      if (ad.type === "html") return Boolean(ad.code);
      if (ad.type === "image") return Boolean(ad.imageUrl);
      return false;
    });

    if (validAds.length === 0) {
      setIsLoaded(true);
      return;
    }

    // Random starting position (client-side only)
    const startIndex = Math.floor(Math.random() * validAds.length);
    setCurrentAd(validAds[startIndex]);
    trackImpression(validAds[startIndex].id);
    setIsLoaded(true);

    // Don't start interval if only one ad
    if (validAds.length <= 1) {
      return;
    }

    // Start rotation interval
    intervalRef.current = setInterval(() => {
      setCurrentAd((prevAd) => {
        if (!prevAd) return validAds[0];
        
        const currentIndex = validAds.findIndex((ad) => ad.id === prevAd.id);
        const nextIndex = (currentIndex + 1) % validAds.length;
        const nextAd = validAds[nextIndex];
        
        // Track impression for the new ad
        trackImpression(nextAd.id);
        
        return nextAd;
      });
    }, rotationInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ads, rotationInterval, trackImpression]);

  // Don't render until client-side hydration is complete
  if (!isLoaded) {
    return (
      <div
        data-ad-slot={placement}
        className={`ad-slot ad-slot-${placement} ${className}`}
      >
        <div
          className="flex items-center justify-center bg-gray-100 rounded animate-pulse"
          style={getStyles()}
        >
          <span className="text-gray-400 text-sm">Loading advertisement...</span>
        </div>
      </div>
    );
  }

  // No ads available
  if (!currentAd) {
    return (
      <div
        data-ad-slot={placement}
        className={`ad-slot ad-slot-${placement} ${className}`}
      >
        <div
          className="flex items-center justify-center bg-gray-50 rounded border border-gray-200"
          style={getStyles()}
        >
          <span className="text-gray-400 text-sm">Advertisement</span>
        </div>
      </div>
    );
  }

  // Render ad based on type
  const renderAd = () => {
    // AdSense ad
    if (currentAd.type === "adsense" && currentAd.code) {
      return (
        <div
          className="adsbygoogle"
          data-ad-client={currentAd.code}
          style={getStyles()}
        />
      );
    }

    // Image ad
    if (currentAd.type === "image" && currentAd.imageUrl) {
      const hasLink = Boolean(currentAd.targetUrl || currentAd.link);
      const img = (
        <img
          src={currentAd.imageUrl}
          alt={currentAd.title || "Advertisement"}
          className="max-w-full h-auto mx-auto"
          style={getStyles()}
        />
      );
      if (!hasLink) {
        return img;
      }
      return (
        <a
          href={currentAd.targetUrl || currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          onClick={() => handleAdClick(currentAd)}
        >
          {img}
        </a>
      );
    }

    // HTML ad
    if (currentAd.type === "html" && currentAd.code) {
      return (
        <div
          className="ad-html-content"
          dangerouslySetInnerHTML={{ __html: currentAd.code }}
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
