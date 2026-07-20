import type { Metadata } from "next";
import { getAggregatedList } from "@/services/cms/aggregator";
import type { CMSArticle } from "@/services/cms/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "खोजें | रामपुर न्यूज़",
  description: "रामपुर न्यूज़ पर खबरें खोजें — रामपुर, उत्तर प्रदेश और देशभर की ताज़ा खबरें।",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  let results: CMSArticle[] = [];
  let total = 0;

  if (query.length >= 2) {
    try {
      const response = await getAggregatedList("articles", {
        search: query,
        pageSize: 20,
        sort: "publishedAt",
        order: "desc",
      });
      results = response.data as unknown as CMSArticle[];
      total = response.meta.pagination.total;
    } catch {
      results = [];
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">खोजें</h1>

      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="खबरें खोजें..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            खोजें
          </button>
        </div>
      </form>

      {query && (
        <p className="text-gray-600 mb-4">
          &ldquo;{query}&rdquo; के लिए {total} परिणाम
        </p>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">कोई परिणाम नहीं मिला</p>
          <p className="mt-2">कृपया अलग शब्दों से खोजें</p>
        </div>
      )}

      <div className="space-y-6">
        {results.map((article: any) => (
          <article key={article.slug} className="border-b border-gray-200 pb-6">
            <Link
              href={`/${article.category || "rampur"}/${article.slug}`}
              className="group"
            >
              <div className="flex gap-4">
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {article.categoryHindi && (
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">
                        {article.categoryHindi}
                      </span>
                    )}
                    {article.publishedAt && (
                      <time>
                        {new Date(article.publishedAt).toLocaleDateString("hi-IN")}
                      </time>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
