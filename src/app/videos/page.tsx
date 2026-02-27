import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { YOUTUBE_CHANNELS } from "@/config/youtube";

export const metadata = {
  title: "वीडियो | Rampur News",
  description: "रामपुर न्यूज़ के सभी नवीनतम यूट्यूब वीडियो एक ही जगह देखें",
  alternates: { canonical: "/videos" },
};

export const revalidate = 600;

type VideoItem = { id: string; title: string; published?: string; thumbnail?: string };

async function getVideos(): Promise<VideoItem[]> {
  const videos: VideoItem[] = [];
  for (const ch of YOUTUBE_CHANNELS) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/youtube/${ch.id}/latest?limit=24`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const items: VideoItem[] = Array.isArray(json.items) ? json.items : [];
      videos.push(...items);
    }
  }
  // sort newest first
  videos.sort((a, b) => {
    const ta = a.published ? Date.parse(a.published) : 0;
    const tb = b.published ? Date.parse(b.published) : 0;
    return tb - ta;
  });
  // de-duplicate by id
  const seen = new Set<string>();
  return videos.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

export default async function VideosPage() {
  const items = await getVideos();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">वीडियो</h1>
          {YOUTUBE_CHANNELS[0] ? (
            <a
              href={`https://www.youtube.com/channel/${YOUTUBE_CHANNELS[0].id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-600 hover:text-red-700"
            >
              YouTube पर देखें →
            </a>
          ) : null}
        </div>
        {items.length === 0 ? (
          <div className="text-muted-foreground">अभी कोई वीडियो उपलब्ध नहीं है</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card rounded-md overflow-hidden border border-border hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-muted">
                  <img
                    src={v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
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
        )}
      </main>
      <Footer />
    </div>
  );
}

