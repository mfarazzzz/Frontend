"use client";
import { useEffect, useState } from "react";

type VideoItem = { id: string; title: string; thumbnail?: string };

export default function VideosGrid({
  channelId,
  pageSize = 24,
  page = 1,
}: {
  channelId: string;
  pageSize?: number;
  page?: number;
}) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const [items, setItems] = useState<VideoItem[]>([]);
  useEffect(() => {
    const limit = Math.max(pageSize, safePage * pageSize);
    fetch(`/api/youtube/${channelId}/latest?limit=${limit}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const arr: VideoItem[] = (json.items || []).map((v: any) => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        }));
        setItems(arr);
      })
      .catch(() => setItems([]));
  }, [channelId, safePage, pageSize]);

  const start = (safePage - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);
  const hasPrev = safePage > 1;
  const hasNext = items.length > start + pageSize;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card rounded-md overflow-hidden border border-border hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-muted">
              <img
                src={v.thumbnail}
                alt={v.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-red-700">
                {v.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
      <div className="flex items-center justify-between mt-6">
        {hasPrev ? (
          <a href={`?page=${safePage - 1}`} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
            पिछला
          </a>
        ) : <span />}
        {hasNext ? (
          <a href={`?page=${safePage + 1}`} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
            अगला
          </a>
        ) : <span />}
      </div>
    </>
  );
}

