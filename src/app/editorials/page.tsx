import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCMSProvider } from "@/services/cms";
import type { EditorialType } from "@/services/cms/types";

// ISR: revalidate every 5 minutes so new editorials appear without a full rebuild
export const revalidate = 300;

export const metadata: Metadata = {
  title: "संपादकीय और विशेष लेख | Rampur News",
  description:
    "रामपुर न्यूज़ पर संपादकीय, विचार, रिव्यू, इंटरव्यू और विशेष रिपोर्ट पढ़ें। Editorials, opinions, reviews, interviews and special reports from rampurnews.com.",
  alternates: { canonical: "https://rampurnews.com/editorials" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "संपादकीय और विशेष लेख | Rampur News",
    description:
      "रामपुर न्यूज़ पर संपादकीय, विचार, रिव्यू, इंटरव्यू और विशेष रिपोर्ट पढ़ें।",
    type: "website",
    url: "https://rampurnews.com/editorials",
    siteName: "रामपुर न्यूज़ | Rampur News",
    locale: "hi_IN",
    images: [{ url: "https://rampurnews.com/og-image.jpg", width: 1200, height: 630, alt: "संपादकीय | Rampur News" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "संपादकीय और विशेष लेख | Rampur News",
    description:
      "रामपुर न्यूज़ पर संपादकीय, विचार, रिव्यू, इंटरव्यू और विशेष रिपोर्ट पढ़ें।",
    images: ["https://rampurnews.com/og-image.jpg"],
  },
};

const filters: { value: EditorialType | "all"; label: string }[] = [
  { value: "all", label: "सभी" },
  { value: "editorial", label: "संपादकीय" },
  { value: "opinion", label: "विचार" },
  { value: "review", label: "रिव्यू" },
  { value: "interview", label: "इंटरव्यू" },
  { value: "special-report", label: "स्पेशल रिपोर्ट" },
];

const editorialTypeLabel: Record<EditorialType, string> = {
  editorial: "संपादकीय",
  opinion: "विचार",
  review: "रिव्यू",
  interview: "इंटरव्यू",
  "special-report": "स्पेशल रिपोर्ट",
};

const getFilterFromSearch = (
  searchParams: URLSearchParams,
): EditorialType | "all" => {
  const raw = searchParams.get("type") || "all";
  const allowed = new Set(filters.map((f) => f.value));
  return allowed.has(raw as EditorialType | "all")
    ? (raw as EditorialType | "all")
    : "all";
};

export default async function EditorialsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParamsObject = (await props.searchParams) || {};
  const searchParams = new URLSearchParams();
  Object.entries(searchParamsObject).forEach(([key, value]) => {
    if (typeof value === "string") searchParams.set(key, value);
  });

  const selectedFilter = getFilterFromSearch(searchParams);

  const provider = getCMSProvider();
  const page = await provider.getEditorials({
    editorialType: selectedFilter,
    limit: 24,
    order: "desc",
    orderBy: "publishedDate",
  });
  const editorials = page?.data ?? [];

  const editorsPick = editorials.find((e) => e.isEditorsPick);
  const remaining = editorsPick
    ? editorials.filter((e) => e.id !== editorsPick.id)
    : editorials;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          संपादकीय और विशेष लेख
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          संपादकीय, विचार, रिव्यू, इंटरव्यू और विशेष रिपोर्ट – गहराई से समझने
          के लिए चुने हुए लेख।
        </p>
      </header>

      {/* Filter tabs */}
      <section className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = selectedFilter === filter.value;
          const href =
            filter.value === "all"
              ? "/editorials"
              : `/editorials?type=${encodeURIComponent(filter.value)}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={
                isActive
                  ? "px-3 py-1 rounded-full text-xs sm:text-sm bg-primary text-primary-foreground"
                  : "px-3 py-1 rounded-full text-xs sm:text-sm bg-muted text-muted-foreground hover:bg-primary/10"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </section>

      {/* Editor's Pick highlight */}
      {editorsPick && (
        <section className="border border-border rounded-2xl overflow-hidden bg-card">
          <div className="flex flex-col sm:flex-row">
            {editorsPick.image && editorsPick.image !== "/placeholder.svg" && (
              <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
                <Image
                  src={editorsPick.image}
                  alt={editorsPick.titleHindi || editorsPick.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 256px"
                />
              </div>
            )}
            <div className="p-5 flex flex-col gap-2">
              <div className="text-xs font-semibold text-primary">
                ✦ संपादक की पसंद
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {editorialTypeLabel[editorsPick.editorialType]}
              </span>
              <Link
                href={`/editorials/${editorsPick.slug}`}
                className="group"
              >
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors leading-snug">
                  {editorsPick.titleHindi || editorsPick.title}
                </h2>
              </Link>
              {(editorsPick.excerptHindi || editorsPick.excerpt) && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {editorsPick.excerptHindi || editorsPick.excerpt}
                </p>
              )}
              <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                <span>{editorsPick.author}</span>
                {editorsPick.publishedDate && (
                  <>
                    <span>·</span>
                    <time dateTime={editorsPick.publishedDate}>
                      {new Date(editorsPick.publishedDate).toLocaleDateString(
                        "hi-IN",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </time>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Editorial grid */}
      {remaining.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          अभी इस फिल्टर के लिए कोई लेख उपलब्ध नहीं है।
        </p>
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {remaining.map((editorial) => (
            <Link
              key={editorial.id}
              href={`/editorials/${editorial.slug}`}
              className="group border rounded-xl overflow-hidden hover:border-primary hover:bg-muted/40 transition-colors flex flex-col"
            >
              {editorial.image && editorial.image !== "/placeholder.svg" && (
                <div className="relative w-full h-40 flex-shrink-0">
                  <Image
                    src={editorial.image}
                    alt={editorial.titleHindi || editorial.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col gap-2 flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {editorialTypeLabel[editorial.editorialType]}
                </span>
                <h2 className="text-lg font-semibold leading-snug group-hover:text-primary line-clamp-2">
                  {editorial.titleHindi || editorial.title}
                </h2>
                {(editorial.excerptHindi || editorial.excerpt) && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {editorial.excerptHindi || editorial.excerpt}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{editorial.author}</span>
                  {editorial.publishedDate && (
                    <>
                      <span>·</span>
                      <time dateTime={editorial.publishedDate}>
                        {new Date(editorial.publishedDate).toLocaleDateString(
                          "hi-IN",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </time>
                    </>
                  )}
                  {editorial.readTime && (
                    <>
                      <span>·</span>
                      <span>{editorial.readTime}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
