"use client";
import { useEffect, useState } from "react";
import { YOUTUBE_CHANNELS } from "@/config/youtube";
import Link from "next/link";

type VideoItem = { id: string; title: string; thumbnail?: string };

const YouTubeRail = () => {
  const first = YOUTUBE_CHANNELS[0];
  const [items, setItems] = useState<VideoItem[]>([]);
  useEffect(() => {
    const load = async () => {
      if (!first) return;
      try {
        const res = await fetch(`/api/youtube/${first.id}/latest?limit=12`, { cache: "no-store" });
        const json = await res.json();
        const vids: VideoItem[] = (json.items || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        }));
        setItems(vids.slice(0, 8));
      } catch {
        setItems([]);
      }
    };
    load();
  }, [first]);

  if (!items.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold tracking-tight">वीडियो</h2>
        <Link href="/videos" className="text-sm font-semibold text-gray-600 hover:text-red-700">और देखें →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group min-w-[180px] w-44"
          >
            <div className="aspect-video rounded-md overflow-hidden bg-muted">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-red-700">{v.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default YouTubeRail;

