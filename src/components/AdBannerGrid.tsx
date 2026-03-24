"use client";

import RotatingBannerLazy from "./RotatingBannerLazy";
import type { AdPlacement } from "@/services/cms";

/**
 * AdBannerGrid - A component that displays all 10 rotating banner positions
 * 
 * Each banner position:
 * - Fetches ads from the API
 * - Randomizes initial ad on client-side
 * - Rotates ads every 5 seconds
 * - Shows placeholder when no ads available
 * 
 * Usage:
 * import AdBannerGrid from "@/components/AdBannerGrid";
 * 
 * <AdBannerGrid />
 * 
 * Or use individual banners:
 * import RotatingBannerLazy from "@/components/RotatingBannerLazy";
 * <RotatingBannerLazy placement="banner_1" />
 */

interface AdBannerGridProps {
  className?: string;
  // Optionally specify which banners to show (default: all 10)
  banners?: AdPlacement[];
}

/**
 * Get all 10 banner placements
 */
export function getBannerPlacements(): AdPlacement[] {
  return [
    "banner_1",
    "banner_2",
    "banner_3",
    "banner_4",
    "banner_5",
    "banner_6",
    "banner_7",
    "banner_8",
    "banner_9",
    "banner_10",
  ];
}

export default function AdBannerGrid({ className = "", banners }: AdBannerGridProps) {
  const placements = banners || getBannerPlacements();

  return (
    <div className={`ad-banner-grid ${className}`}>
      {placements.map((placement) => (
        <div key={placement} className="mb-4">
          <RotatingBannerLazy 
            placement={placement} 
            rotationInterval={5000}
          />
        </div>
      ))}
    </div>
  );
}

// Export individual banner components for granular control
export function Banner1(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_1" {...props} />;
}

export function Banner2(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_2" {...props} />;
}

export function Banner3(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_3" {...props} />;
}

export function Banner4(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_4" {...props} />;
}

export function Banner5(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_5" {...props} />;
}

export function Banner6(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_6" {...props} />;
}

export function Banner7(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_7" {...props} />;
}

export function Banner8(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_8" {...props} />;
}

export function Banner9(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_9" {...props} />;
}

export function Banner10(props: { className?: string }) {
  return <RotatingBannerLazy placement="banner_10" {...props} />;
}
