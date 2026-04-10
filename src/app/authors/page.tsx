import type { Metadata } from "next";
import Link from "next/link";
import { User } from "lucide-react";
import { getCMSProvider } from "@/services/cms";
import type { CMSAuthor } from "@/services/cms";
import { stripHtmlToText, truncateText } from "@/lib/utils";

const SITE_URL = "https://rampurnews.com";

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildAuthorSlug = (author: CMSAuthor) => {
  if (author.slug) return author.slug;
  const candidate = author.nameHindi || author.name || "";
  const normalized = toSlug(candidate);
  return normalized || String(author.id);
};

const buildAuthorSummary = (author: CMSAuthor) => {
  const rawBio = author.bio ? stripHtmlToText(author.bio) : "";
  if (rawBio) return truncateText(rawBio, 170);
  const name = author.nameHindi || author.name || "लेखक";
  const designation = author.designation ? ` (${author.designation})` : "";
  return truncateText(`${name}${designation} rampurnews.com के लिए लिखते हैं।`, 170);
};

export const metadata: Metadata = {
  title: "Authors | Rampur News",
  description: "रामपुर न्यूज़ के लेखकों और संपादकों से मिलें।",
  alternates: {
    canonical: "/authors",
  },
  openGraph: {
    type: "website",
    title: "Authors | Rampur News",
    description: "रामपुर न्यूज़ के लेखकों और संपादकों से मिलें।",
    url: `${SITE_URL}/authors`,
    siteName: "रामपुर न्यूज़ | Rampur News",
    images: [`${SITE_URL}/og-image.svg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authors | Rampur News",
    description: "रामपुर न्यूज़ के लेखकों और संपादकों से मिलें।",
    images: [`${SITE_URL}/og-image.svg`],
  },
};

const getAuthors = async () => {
  const provider = getCMSProvider();
  try {
    return await provider.getAuthors();
  } catch {
    return [];
  }
};

export default async function Page() {
  const authors = await getAuthors();
  // Filter authors that have at least a name or hindi name
  const list = (authors ?? []).filter((author) => author.name || author.nameHindi);

  return (
    <main className="bg-background min-h-screen">
      <section className="container py-12 md:py-16">
        <div className="space-y-4 mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Authors
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            हमारे लेखक
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            रामपुर न्यूज़ की विश्वसनीय टीम से मिलें। हमारे अनुभवी पत्रकार और लेखक जो आप तक 
            सटीक और निष्पक्ष खबरें पहुँचाने के लिए प्रतिबद्ध हैं।
          </p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">अभी कोई लेखक उपलब्ध नहीं है।</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((author) => {
              const slug = buildAuthorSlug(author);
              const name = author.nameHindi || author.name || "लेखक";
              const designation = author.designation || (author.role ? author.role : "लेखक");
              
              return (
                <Link
                  key={author.id}
                  href={`/authors/${slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-background shadow-sm group-hover:border-primary transition-colors">
                      {author.avatar ? (
                        <img
                          src={author.avatar}
                          alt={name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {name}
                      </h2>
                      <p className="text-xs font-medium text-primary/80 uppercase tracking-wide">
                        {designation}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {buildAuthorSummary(author)}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <span>प्रोफ़ाइल देखें</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
