"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { CMSAd, AdPlacement } from "@/services/cms";

// CMS API URL
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "https://cms.rampurnews.com/api";

// Cache for ads - persists for session
const adsCache = new Map<string, { data: CMSAd[]; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

interface AdsContextValue {
  getAds: (placement: AdPlacement) => Promise<CMSAd[]>;
  prefetchAds: (placements: AdPlacement[]) => void;
  clearCache: () => void;
  isLoading: boolean;
}

const AdsContext = createContext<AdsContextValue | null>(null);

// Track in-flight requests to prevent duplicate calls
const inFlightRequests = new Map<string, Promise<CMSAd[]>>();

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const fetchAds = useCallback(async (placement: AdPlacement): Promise<CMSAd[]> => {
    const cacheKey = `ads:${placement}`;

    // Check cache first
    const cached = adsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Check if request is already in flight
    const existingRequest = inFlightRequests.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const params = new URLSearchParams({
          placement,
          isActive: "true",
          limit: "1",
        });

        const response = await fetch(`${CMS_API_URL}/ads?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data?.length > 0) {
          // Update cache
          adsCache.set(cacheKey, {
            data: result.data,
            timestamp: Date.now(),
          });
          return result.data;
        }

        return [];
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }, []);

  const getAds = useCallback(async (placement: AdPlacement): Promise<CMSAd[]> => {
    setIsLoading(true);
    try {
      return await fetchAds(placement);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAds]);

  const prefetchAds = useCallback((placements: AdPlacement[]) => {
    placements.forEach((placement) => {
      fetchAds(placement);
    });
  }, [fetchAds]);

  const clearCache = useCallback(() => {
    adsCache.clear();
  }, []);

  const value = useMemo(
    () => ({
      getAds,
      prefetchAds,
      clearCache,
      isLoading,
    }),
    [getAds, prefetchAds, clearCache, isLoading]
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds() {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error("useAds must be used within an AdsProvider");
  }
  return context;
}

// Export for use in AdSlot
export { adsCache, CACHE_TTL, inFlightRequests };
