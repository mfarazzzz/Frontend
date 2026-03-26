"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackSessionDepth } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * GA4Tracker — inner component that fires on every route change.
 * Must live inside <Suspense> because useSearchParams opts the
 * subtree out of static rendering in Next.js App Router.
 */
function GA4Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;

    const qs = searchParams?.toString();
    const pagePath = qs ? `${pathname}?${qs}` : pathname;

    // gtag('config') is the correct GA4 method for SPA page tracking.
    // It sends a page_view hit AND updates the page context for subsequent events.
    // send_page_view:false at init means only this explicit call fires the hit.
    window.gtag("config", GA_ID, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });

    // Track session depth (pages viewed in this tab session)
    trackSessionDepth();
  }, [pathname, searchParams]);

  return null;
}

/**
 * GA4Analytics — place once in layout.tsx body.
 * Tracks every page navigation automatically, including dynamic routes.
 */
export function GA4Analytics() {
  return (
    <Suspense fallback={null}>
      <GA4Tracker />
    </Suspense>
  );
}
