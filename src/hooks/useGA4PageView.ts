"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/ga-config";

/**
 * useGA4PageView - Custom hook to automatically send pageview events to Google Analytics 4
 * 
 * This hook automatically tracks:
 * - Initial page load
 * - Page navigation (client-side routing)
 * - Search parameter changes
 * 
 * Usage:
 * import { useGA4PageView } from "@/hooks/useGA4PageView";
 * 
 * function MyComponent() {
 *   useGA4PageView();
 *   // ... rest of component
 * }
 * 
 * Or use the GAProvider in app/providers.tsx
 */

export function useGA4PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if GA_MEASUREMENT_ID is available
    if (!GA_MEASUREMENT_ID || typeof window === "undefined") {
      return;
    }

    // Build the current URL
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Push pageview event to dataLayer
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);
}

/**
 * GAProvider - Component that wraps your app with GA4 page tracking
 * 
 * Usage:
 * // In app/providers.tsx or app/layout.tsx
 * 
 * import { GAProvider } from "@/components/GAProvider";
 * 
 * export function Providers({ children }) {
 *   return (
 *     <GAProvider>
 *       {children}
 *     </GAProvider>
 *   );
 * }
 */

interface GAProviderProps {
  children: React.ReactNode;
}

export function GAProvider({ children }: GAProviderProps) {
  useGA4PageView();
  return <>{children}</>;
}

export default useGA4PageView;
