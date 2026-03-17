"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { AdPlacement, CMSAd } from "@/services/cms";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * AdSlot - Reusable advertisement component
 * Fetches and displays ads based on placement
 * Supports AdSense, sponsored images, and HTML ads
 */
export default function AdSlot({ placement, className = "" }: AdSlotProps) {
  const [ad, setAd] = useState<CMSAd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  const fetchAd = useCallback(async () => {
    // Prevent re-fetching
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const params = new URLSearchParams({
        placement,
        isActive: "true",
        limit: "1",
      });

      const response = await fetch(`/api/ads?${params.toString()}`);
      const data = await response.json();

      if (isMounted.current && data.success && data.data?.length > 0) {
        setAd(data.data[0]);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error fetching ad:", err);
        setError("Failed to load advertisement");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [placement]);

  useEffect(() => {
    isMounted.current = true;
    
    // Lazy load ads - only fetch when component is in viewport
    // For above-the-fold ads (header), fetch immediately
    if (placement === "header" || placement === "article_top") {
      fetchAd();
    } else {
      // For below-the-fold ads, use Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            fetchAd();
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "100px" }
      );

      const currentElement = document.getElementById(`ad-slot-${placement}`);
      if (currentElement) {
        observer.observe(currentElement);
      }

      return () => {
        observer.disconnect();
        isMounted.current = false;
      };
    }

    return () => {
      isMounted.current = false;
    };
  }, [placement, fetchAd]);

  // Don't render anything if no ad is available and not loading
  if (!isLoading && !ad) {
    return null;
  }

  // Render loading placeholder
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

  // Render error state
  if (error || !ad) {
    return null;
  }

  return (
    <div
      id={`ad-slot-${placement}`}
      className={`ad-slot ${className}`}
      style={getAdContainerStyle(placement)}
    >
      {ad.type === "adsense" && ad.code && (
        <div
          className="adsense-ad"
          dangerouslySetInnerHTML={{ __html: ad.code }}
        />
      )}
      {ad.type === "image" && ad.imageUrl && (
        <a
          href={ad.link || ad.targetUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </a>
      )}
      {ad.type === "html" && ad.code && (
        <div
          className="html-ad"
          dangerouslySetInnerHTML={{ __html: ad.code }}
        />
      )}
    </div>
  );
}

/**
 * Get container styles based on ad placement
 */
function getAdContainerStyle(placement: AdPlacement): React.CSSProperties {
  const styles: Record<AdPlacement, React.CSSProperties> = {
    header: {
      width: "100%",
      height: "90px",
      maxWidth: "728px",
      margin: "0 auto",
    },
    sidebar: {
      width: "100%",
      height: "250px",
      maxWidth: "300px",
      margin: "0 auto",
    },
    infeed: {
      width: "100%",
      height: "250px",
      maxWidth: "728px",
      margin: "1rem auto",
    },
    article_top: {
      width: "100%",
      height: "90px",
      maxWidth: "728px",
      margin: "1rem auto",
    },
    article_middle: {
      width: "100%",
      height: "250px",
      maxWidth: "728px",
      margin: "1rem auto",
    },
    article_bottom: {
      width: "100%",
      height: "250px",
      maxWidth: "728px",
      margin: "1rem auto",
    },
    footer: {
      width: "100%",
      height: "250px",
      maxWidth: "728px",
      margin: "0 auto",
    },
    mobile_sticky: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      width: "100%",
      height: "50px",
      zIndex: 50,
    },
  };

  return styles[placement] || {};
}
