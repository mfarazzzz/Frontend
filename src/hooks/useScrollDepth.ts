"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackScrollDepth, resetScrollDepth } from "@/lib/analytics";

/**
 * useScrollDepth — tracks scroll depth at 25/50/75/100% thresholds.
 * Pass articleId to tag events per-article in GA4 reports.
 *
 * Usage:
 *   useScrollDepth({ articleId: article.id });
 */
export function useScrollDepth(options?: { articleId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    resetScrollDepth();
  }, [pathname]);

  useEffect(() => {
    const articleId = options?.articleId;

    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total === 0) return;
      const percent = Math.round((scrolled / total) * 100);
      trackScrollDepth(percent, articleId);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [options?.articleId]);
}
