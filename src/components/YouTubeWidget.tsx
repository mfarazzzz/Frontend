 "use client";
import { useEffect, useState } from "react";
import { YOUTUBE_CHANNELS } from "@/config/youtube";

type VideoItem = { id: string; title: string; published?: string; thumbnail?: string };

const YouTubeWidget = () => {
  const first = YOUTUBE_CHANNELS[0];
  const [items, setItems] = useState<VideoItem[]>([]);
  useEffect(() => {
    const load = async () => {
      if (!first) return;
      try {
        const res = await fetch(`/api/youtube/${first.id}/latest?limit=6`, { cache: "no-store" });
        const json = await res.json();
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch {
        setItems([]);
      }
    };
    load();
  }, [first]);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-base font-semibold mb-4 border-b border-border pb-2">
        हमारा YouTube
      </h3>
      {items.length > 0 ? (
        <>
          {/* Big latest video */}
          <div className="aspect-video w-full rounded overflow-hidden mb-3">
            <iframe
              title={first?.title || "YouTube"}
              src={`https://www.youtube-nocookie.com/embed/${items[0].id}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              className="w-full h-full"
            />
          </div>
          {/* List of next 5 */}
          <div className="space-y-2">
            {items.slice(1, 6).map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-red-700">
                    {v.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </>
      ) : first ? (
        <a
          href={`https://www.youtube.com/channel/${first.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-semibold text-red-700 hover:underline"
        >
          हमारे YouTube चैनल पर जाएं →
        </a>
      ) : null}
    </div>
  );
};

export default YouTubeWidget;
