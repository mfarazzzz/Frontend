import { YOUTUBE_CHANNELS, uploadsPlaylistId } from "@/config/youtube";

const YouTubeWidget = () => {
  const first = YOUTUBE_CHANNELS[0];
  const playlistId = first ? uploadsPlaylistId(first.id) : null;
  const src = playlistId
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(
        playlistId
      )}&rel=0`
    : null;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-base font-semibold mb-4 border-b border-border pb-2">
        हमारा YouTube
      </h3>
      {src ? (
        <div className="aspect-video w-full rounded overflow-hidden">
          <iframe
            title={first?.title || "YouTube"}
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            className="w-full h-full"
          />
        </div>
      ) : (
        <a
          href={first ? `https://www.youtube.com/channel/${first.id}` : "https://www.youtube.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-semibold text-red-700 hover:underline"
        >
          हमारे YouTube चैनल पर जाएं →
        </a>
      )}
    </div>
  );
};

export default YouTubeWidget;
