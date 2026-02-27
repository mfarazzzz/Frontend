import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { YOUTUBE_CHANNELS, uploadsPlaylistId } from "@/config/youtube";

export const metadata = {
  title: "वीडियो | Rampur News",
  description: "रामपुर न्यूज़ के सभी नवीनतम यूट्यूब वीडियो एक ही जगह देखें",
  alternates: { canonical: "/videos" },
};

export const revalidate = 600;

export default async function VideosPage({ searchParams }: { searchParams: { page?: string } }) {
  const first = YOUTUBE_CHANNELS[0];
  const playlistId = first ? uploadsPlaylistId(first.id) : null;
  const pageSize = 24;
  const page = Math.max(1, Number(searchParams?.page || 1));
  // Fetch items for grid below
  let items: Array<{ id: string; title: string; thumbnail?: string }> = [];
  if (first) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const res = await fetch(`${base}/api/youtube/${first.id}/latest?limit=${page * pageSize}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      items = (json.items || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      }));
    }
  }
  const paged = items.slice((page - 1) * pageSize, page * pageSize);
  const hasNext = items.length > page * pageSize;
  const hasPrev = page > 1;
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
              <a href={`/videos?page=${page - 1}`} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                पिछला
              </a>
            ) : <span />}
            {hasNext ? (
              <a href={`/videos?page=${page + 1}`} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">
                अगला
              </a>
            ) : <span />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
