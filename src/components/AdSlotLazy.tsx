"use client";

import dynamic from "next/dynamic";

// Dynamically import the actual AdSlot component with SSR disabled
const AdSlotInner = dynamic(() => import("./AdSlotInner"), {
  ssr: false,
  loading: () => (
    <div className="ad-slot-loading flex items-center justify-center bg-gray-100 rounded animate-pulse" style={{ width: "100%", height: "250px" }}>
      <span className="text-gray-400 text-sm">Loading advertisement...</span>
    </div>
  ),
});

import type { AdPlacement } from "@/services/cms";

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

export default function AdSlotLazy({ placement, className = "" }: AdSlotProps) {
  return <AdSlotInner placement={placement} className={className} />;
}
