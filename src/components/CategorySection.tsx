import Link from "next/link";
import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import type { CMSArticle } from "@/services/cms";

interface CategorySectionProps {
  title: string;
  articles: CMSArticle[];
  viewAllLink: string;
  variant?: "default" | "featured" | "grid";
}

const CategorySection = ({
  title,
  articles,
  viewAllLink,
  variant = "default",
}: CategorySectionProps) => {
  if (articles.length === 0) return null;

  const featuredPrimary = articles[0];
  const featuredSecondary = articles.slice(1, 5);

  return (
    <section className="py-6 space-y-4 border-t border-border first:border-t-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight border-l-4 border-red-700 pl-3">
          <Link href={viewAllLink} className="hover:text-red-700 transition-colors">
            {title}
          </Link>
        </h2>
        <Link className="text-sm font-semibold text-gray-600 hover:text-red-700 flex items-center gap-1" href={viewAllLink}>
          और देखें <ChevronRight size={16} />
        </Link>
      </div>
      <div className="thin-divider" />

      {variant === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : variant === "featured" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div>
            {featuredPrimary && (
              <NewsCard article={featuredPrimary} variant="featured" />
            )}
          </div>
          <div className="space-y-3">
            {articles.slice(1, 6).map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
