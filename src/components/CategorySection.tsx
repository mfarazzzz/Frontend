import Link from "next/link";
import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import type { CMSArticle } from "@/services/cms";

interface CategorySectionProps {
  title: string;
  articles: CMSArticle[];
  viewAllLink: string;
  variant?: "default" | "featured" | "grid" | "compact-list" | "timeline" | "two-col-grid";
}

const CategorySection = ({
  title,
  articles,
  viewAllLink,
  variant = "default",
}: CategorySectionProps) => {
  if (articles.length === 0) return null;

  const featuredPrimary = articles[0];

  return (
    <section className="py-6 space-y-4 border-t border-border first:border-t-0">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight border-l-4 border-red-700 pl-3">
          <Link href={viewAllLink} className="hover:text-red-700 transition-colors">
            {title}
          </Link>
        </h2>
        <Link className="text-sm font-semibold text-gray-600 hover:text-red-700 flex items-center gap-1" href={viewAllLink}>
          और देखें <ChevronRight size={16} />
        </Link>
      </div>

      {/* Grid: 3 columns of equal cards */}
      {variant === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.slice(0, 6).map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Compact list: horizontal cards stacked */}
      {variant === "compact-list" && (
        <div className="space-y-2 divide-y divide-border">
          {articles.slice(0, 7).map((article) => (
            <NewsCard key={article.id} article={article} variant="horizontal" />
          ))}
        </div>
      )}

      {/* Featured: 1 large + sidebar list */}
      {variant === "featured" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div>
            {featuredPrimary && (
              <NewsCard article={featuredPrimary} variant="featured" />
            )}
          </div>
          <div className="space-y-3">
            {articles.slice(1, 5).map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </div>
      )}

      {/* Two-col grid: 2 featured cards side by side + more below */}
      {variant === "two-col-grid" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.slice(0, 2).map((article) => (
              <NewsCard key={article.id} article={article} variant="stacked" />
            ))}
          </div>
          {articles.length > 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {articles.slice(2, 5).map((article) => (
                <NewsCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline: numbered list with time emphasis */}
      {variant === "timeline" && (
        <div className="space-y-3 pl-4 border-l-2 border-red-100">
          {articles.slice(0, 7).map((article, index) => (
            <div key={article.id} className="relative">
              <div className="absolute -left-[1.35rem] top-2 w-3 h-3 bg-red-700 rounded-full border-2 border-white" />
              <NewsCard article={article} variant="horizontal" />
            </div>
          ))}
        </div>
      )}

      {/* Default: 3-col grid with standard cards */}
      {variant === "default" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.slice(0, 6).map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
