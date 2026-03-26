"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * GA4 Analytics Component
 * 
 * This component automatically tracks page views on all client-side navigation.
 * Place this in your providers or layout to track all pages.
 * 
 * Uses Suspense to handle useSearchParams properly in Next.js App Router.
 * 
 * @usage
 * // In src/app/providers.tsx:
 * import { GA4Analytics } from "@/app/analytics";
 * 
 * <GA4Analytics />
 */

const GA_ID = "G-L1WDKXW81F"; // Your GA4 Measurement ID

// Inner component that uses useSearchParams
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
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    // Push pageview event to dataLayer
    // This triggers a pageview in GA4
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: fullPath,
      page_location: window.location.href,
      page_title: document.title,
      ga4_measurement_id: GA_ID,
    });
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

// Loading fallback for Suspense
function GA4Loading() {
  return null;
}

/**
 * GA4Analytics - Wrap this in your providers to track all page views
 * 
 * This version uses Suspense to properly handle useSearchParams
 * without causing SSR/prerender errors.
 */
export function GA4Analytics() {
  return (
    <Suspense fallback={<GA4Loading />}>
      <GA4Tracker />
    </Suspense>
  );
}

export default GA4Analytics;