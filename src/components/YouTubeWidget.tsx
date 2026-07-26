"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/lib/router-compat";
import { YOUTUBE_CHANNELS } from "@/config/youtube";

type VideoItem = { id: string; title: string; published?: string; thumbnail?: string };

const YouTubeWidget = () => {
  const first = YOUTUBE_CHANNELS[0];
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [items, setItems] = useState<VideoItem[]>([]);
  const [playing, setPlaying] = useState(false);
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

  // Use the first individual video instead of a playlist embed.
  // Google requires videos to be on "watch pages" — a generic videoseries
  // playlist embed doesn't qualify for video indexing.
  const featuredVideo = items[0];

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
      {featuredVideo ? (
        <>
          <div className={`relative w-full rounded overflow-hidden mb-3 ${isHomepage ? "aspect-[3/2]" : "aspect-video"}`}>
            {playing ? (
              <iframe
                title={featuredVideo.title || first?.title || "YouTube"}
                src={`https://www.youtube-nocookie.com/embed/${featuredVideo.id}?rel=0&autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="relative w-full h-full group cursor-pointer"
                aria-label={`Play: ${featuredVideo.title}`}
              >
                <img
                  src={featuredVideo.thumbnail || `https://i.ytimg.com/vi/${featuredVideo.id}/hqdefault.jpg`}
                  alt={featuredVideo.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <svg className="w-14 h-14 text-white drop-shadow-lg" viewBox="0 0 68 48" aria-hidden="true">
                    <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/>
                    <path d="M45 24L27 14v20" fill="#fff"/>
                  </svg>
                </div>
              </button>
            )}
          </div>
          <p className="text-sm font-medium line-clamp-2 mb-3">{featuredVideo.title}</p>
          <div className="space-y-2">
            {items.slice(1, 6).map((v) => (
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
