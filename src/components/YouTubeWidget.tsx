"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/lib/router-compat";
import { YOUTUBE_CHANNELS, uploadsPlaylistId } from "@/config/youtube";

type VideoItem = { id: string; title: string; published?: string; thumbnail?: string };

const YouTubeWidget = () => {
  const first = YOUTUBE_CHANNELS[0];
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [items, setItems] = useState<VideoItem[]>([]);
  const [unmuted, setUnmuted] = useState(false);
  useEffect(() => {
    const load = async () => {
      if (!first) return;
      try {
        const res = await fetch(`/api/youtube/${first.id}/latest?limit=12`, { cache: "no-store" });
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">हमारा YouTube</h3>
        <Link
          to="/videos"
          className="text-xs font-semibold text-gray-600 hover:text-red-700"
        >
          और वीडियो →
        </Link>
      </div>
      {items.length > 0 ? (
        <>
          <div className={`relative w-full rounded overflow-hidden mb-3 ${isHomepage ? "aspect-[3/2]" : "aspect-video"}`}>
            <iframe
              title={first?.title || "YouTube"}
              src={
                first
                  ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(
                      uploadsPlaylistId(first.id) || ""
                    )}&rel=0&autoplay=1&mute=${unmuted ? 0 : 1}`
                  : ""
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              className="w-full h-full"
            />
            {!unmuted && (
              <button
                type="button"
                onClick={() => setUnmuted(true)}
                className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                aria-label="Unmute video"
              >
                Tap to unmute
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(isHomepage ? items.slice(1, 6) : items.slice(1, 6)).map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group hover:bg-muted/40 rounded p-1 transition-colors"
            >
              <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-muted">
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
        <Link
          to="/videos"
          className="block text-sm font-semibold text-red-700 hover:underline"
        >
          हमारे वीडियो पेज पर जाएं →
        </Link>
      ) : null}
    </div>
  );
};

export default YouTubeWidget;
