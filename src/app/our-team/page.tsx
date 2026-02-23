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
  title: "Our Team | Rampur News",
  description: "Rampur News की टीम के लेखकों और संपादकों से मिलें।",
  alternates: {
    canonical: "/our-team",
  },
  openGraph: {
    type: "website",
    title: "Our Team | Rampur News",
    description: "Rampur News की टीम के लेखकों और संपादकों से मिलें।",
    url: `${SITE_URL}/our-team`,
    siteName: "रामपुर न्यूज़ | Rampur News",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Team | Rampur News",
    description: "Rampur News की टीम के लेखकों और संपादकों से मिलें।",
    images: [`${SITE_URL}/og-image.jpg`],
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
  const list = (authors ?? []).filter((author) => author.name || author.nameHindi);

  return (
    <main className="bg-background">
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Our Team
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">हमारी टीम</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
            Rampur News की टीम में अनुभवी संपादक, रिपोर्टर और लेखक शामिल हैं जो तथ्य-आधारित
            रिपोर्टिंग और समुदाय-केंद्रित पत्रकारिता पर केंद्रित हैं।
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            अभी कोई लेखक उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((author) => {
              const slug = buildAuthorSlug(author);
              const name = author.nameHindi || author.name || "लेखक";
              const designation =
                author.designation || (author.role ? author.role : "लेखक");
              return (
                <Link
                  key={author.id}
                  href={`/authors/${slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 transition hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {author.avatar ? (
                        <img
                          src={author.avatar}
                          alt={name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
                          {name}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {designation}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {buildAuthorSummary(author)}
                      </p>
                    </div>
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
