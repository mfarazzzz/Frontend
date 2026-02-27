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
    <section className="py-6">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link className="flex items-center gap-1 text-sm font-medium text-primary hover:underline" href={viewAllLink}>
          और देखें
          <ChevronRight size={16} />
        </Link>
      </div>

      {variant === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : variant === "featured" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <div>{featuredPrimary && <NewsCard article={featuredPrimary} variant="featured" />}</div>
          <div className="space-y-4">
            {featuredSecondary.map((article) => (
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
