"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/ga-config";

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * GAProvider - Component that wraps your app with GA4 page tracking
 * 
 * Automatically tracks page views on all client-side navigations.
 * Does NOT use useSearchParams to avoid Suspense boundary requirements.
 */
interface GAProviderProps {
  children: React.ReactNode;
}

export function GAProvider({ children }: GAProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined" || !GA_MEASUREMENT_ID) {
      return;
    }

    // Push pageview event to dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
