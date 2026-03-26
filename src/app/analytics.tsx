"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * GA4 Analytics Component
 * 
 * This component properly tracks page views using window.gtag()
 * instead of directly using dataLayer.push
 * 
 * Usage: Import and use in src/app/providers.tsx
 */

const GA_ID = "G-L1WDKXW81F";

// Define gtag type
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

function GA4Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined" || !GA_ID) {
      return;
    }

    // Build the full URL with query parameters
    const queryString = searchParams?.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    // Use window.gtag() to properly track page views
    // This is the correct way to track SPA navigation in GA4
    if (typeof window.gtag === "function") {
      window.gtag("config", GA_ID, {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    } else {
      // Fallback: If gtag is not available yet, push to dataLayer
      // This can happen if gtag.js hasn't fully loaded
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

function GA4Loading() {
  return null;
}

/**
 * GA4Analytics - Wrap this in your providers to track all page views
 * 
 * Uses Suspense to properly handle useSearchParams in Next.js App Router
 */
export function GA4Analytics() {
  return (
    <Suspense fallback={<GA4Loading />}>
      <GA4Tracker />
    </Suspense>
  );
}

export default GA4Analytics;