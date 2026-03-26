import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { YOUTUBE_CHANNELS, uploadsPlaylistId } from "@/config/youtube";
import VideosGrid from "@/components/VideosGrid";

export const metadata = {
  title: "वीडियो | Rampur News",
  description: "रामपुर न्यूज़ के सभी नवीनतम यूट्यूब वीडियो एक ही जगह देखें",
  alternates: { canonical: "/videos" },
};

export const revalidate = 600;

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const first = YOUTUBE_CHANNELS[0];
  const playlistId = first ? uploadsPlaylistId(first.id) : null;
  const resolvedSearchParams = await searchParams;
  const parsedPage = Number(resolvedSearchParams?.page || "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">वीडियो</h1>
          {first ? (
            <a
              href={`https://www.youtube.com/channel/${first.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-600 hover:text-red-700"
            >
              और वीडियो YouTube पर →
            </a>
          ) : null}
        </div>
        {playlistId ? (
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video w-full rounded overflow-hidden">
              <iframe
                title="Rampur News Playlist"
                src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(
                  playlistId
                )}&rel=0&autoplay=1&mute=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">अभी कोई वीडियो उपलब्ध नहीं है</div>
        )}
        {/* Grid below playlist */}
        <section className="mt-8">
          {first ? <VideosGrid channelId={first.id} pageSize={24} page={page} /> : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
