"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEngagementTime, trackExitPage } from "@/lib/analytics";

/**
 * useEngagementTime — measures time spent on page and fires:
 *   - engagement_time on route change or tab close
 *   - exit_page when the tab becomes hidden (user leaves)
 *
 * Usage:
 *   useEngagementTime({ articleId: article.id, category: article.category });
 */
export function useEngagementTime(params: { articleId: string; category: string }) {
  const pathname = usePathname();
  const startRef = useRef<number>(Date.now());
  const firedRef = useRef<boolean>(false);

  // Reset timer on route change
  useEffect(() => {
    startRef.current = Date.now();
    firedRef.current = false;
  }, [pathname]);

  useEffect(() => {
    const { articleId, category } = params;

    function fireEngagement() {
      if (firedRef.current) return;
      firedRef.current = true;
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      trackEngagementTime({ articleId, category, seconds });
    }

    function onVisibilityChange() {
      if (document.hidden) {
        fireEngagement();
        trackExitPage(window.location.pathname);
      } else {
        // User came back — restart the timer
        startRef.current = Date.now();
        firedRef.current = false;
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    // pagehide is more reliable than beforeunload on mobile
    window.addEventListener("pagehide", fireEngagement);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", fireEngagement);
      // Also fire on component unmount (SPA navigation away)
      fireEngagement();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.articleId, params.category]);
}
