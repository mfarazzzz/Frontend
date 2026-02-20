import type { Metadata } from "next";
import Link from "next/link";
import { getCMSProvider } from "@/services/cms";

export const metadata: Metadata = {
  title: "Editorials, Opinions and Special Reports | Rampur News",
  description:
    "Editorials, opinions, reviews, interviews and special reports from rampurnews.com.",
};

export default async function EditorialsPage() {
  const provider = getCMSProvider();
  const page = await provider.getArticles({
    category: "editorials",
    limit: 12,
    orderBy: "publishedDate",
    order: "desc",
  });

  const articles = page?.data ?? [];

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

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          अभी इस सेक्शन में कोई संपादकीय प्रकाशित नहीं हुआ है।
        </p>
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
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

