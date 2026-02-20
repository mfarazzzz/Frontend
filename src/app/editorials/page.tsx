import type { Metadata } from "next";
import Link from "next/link";
import { getCMSProvider } from "@/services/cms";

export const metadata: Metadata = {
  title: "Editorials, Opinions and Special Reports | Rampur News",
  description:
    "Editorials, opinions, reviews, interviews and special reports from rampurnews.com.",
};

type EditorialFilter =
  | "all"
  | "editorial"
  | "opinion"
  | "review"
  | "interview"
  | "special-report";

const filters: { value: EditorialFilter; label: string }[] = [
  { value: "all", label: "सभी" },
  { value: "editorial", label: "संपादकीय" },
  { value: "opinion", label: "विचार" },
  { value: "review", label: "रिव्यू" },
  { value: "interview", label: "इंटरव्यू" },
  { value: "special-report", label: "स्पेशल रिपोर्ट" },
];

const getFilterFromSearch = (searchParams: URLSearchParams): EditorialFilter => {
  const raw = searchParams.get("type") || "all";
  const allowed = new Set(filters.map((f) => f.value));
  return allowed.has(raw as EditorialFilter) ? (raw as EditorialFilter) : "all";
};

export default async function EditorialsPage(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParamsObject = (await props.searchParams) || {};
  const searchParams = new URLSearchParams();
  Object.entries(searchParamsObject).forEach(([key, value]) => {
    if (typeof value === "string") searchParams.set(key, value);
  });

  const selectedFilter = getFilterFromSearch(searchParams);

  const provider = getCMSProvider();
  const baseParams: any = {
    limit: 24,
    status: "published" as const,
    orderBy: "publishedDate" as const,
    order: "desc" as const,
  };

  if (selectedFilter !== "all") {
    baseParams.contentType = selectedFilter;
  } else {
    baseParams.contentType = "editorial";
  }

  const page = await provider.getArticles(baseParams);
  const articles = page?.data ?? [];

  const editorsPick = articles.find((a) => a.isEditorsPick);
  const remaining = editorsPick
    ? articles.filter((a) => a.id !== editorsPick.id)
    : articles;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          संपादकीय और विशेष लेख
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          संपादकीय, विचार, रिव्यू, इंटरव्यू और विशेष रिपोर्ट – गहराई से समझने के
          लिए चुने हुए लेख।
        </p>
      </header>

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

      {editorsPick && (
        <section className="border border-border rounded-2xl p-5 bg-card">
          <div className="text-xs font-semibold text-primary mb-2">
            संपादक की पसंद
          </div>
          <Link
            href={`/${editorsPick.category}/${editorsPick.slug}`}
            className="group flex flex-col gap-2"
          >
            <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
              {editorsPick.title}
            </h2>
            {editorsPick.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {editorsPick.excerpt}
              </p>
            )}
            <span className="text-xs text-muted-foreground mt-1">
              {editorsPick.author}
            </span>
          </Link>
        </section>
      )}

      {remaining.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          अभी इस फिल्टर के लिए कोई लेख उपलब्ध नहीं है।
        </p>
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {remaining.map((article) => (
            <Link
              key={article.id}
              href={`/${article.category}/${article.slug}`}
              className="group border rounded-xl p-5 hover:border-primary hover:bg-muted/40 transition-colors flex flex-col gap-3"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                {article.categoryHindi || "संपादकीय"}
              </span>
              <h2 className="text-lg font-semibold leading-snug group-hover:text-primary line-clamp-2">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.excerpt}
                </p>
              )}
              <span className="mt-auto text-xs text-muted-foreground">
                {article.author}
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
