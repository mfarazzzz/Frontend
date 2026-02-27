import { YOUTUBE_CHANNELS, uploadsPlaylistId } from "@/config/youtube";

const YouTubeWidget = () => {
  if (!YOUTUBE_CHANNELS.length) return null;
  const first = YOUTUBE_CHANNELS[0];
  const playlistId = uploadsPlaylistId(first.id);
  if (!playlistId) return null;
  const src = `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(
    playlistId
  )}&rel=0`;

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-base font-semibold mb-4 border-b border-border pb-2">
        हमारा YouTube
      </h3>
      <div className="aspect-video w-full rounded overflow-hidden">
        <iframe
          title={first.title}
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default YouTubeWidget;

