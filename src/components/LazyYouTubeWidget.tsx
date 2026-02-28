"use client";

import dynamic from "next/dynamic";

const YouTubeWidget = dynamic(() => import("./YouTubeWidget"), {
  loading: () => <div className="h-48 bg-muted animate-pulse rounded-lg" />,
  ssr: false,
});

export default function LazyYouTubeWidget() {
  return <YouTubeWidget />;
}
