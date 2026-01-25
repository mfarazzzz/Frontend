import { Link } from "@/lib/router-compat";
import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import type { CMSArticle } from "@/services/cms";

interface CategorySectionProps {
  title: string;
  titleEnglish?: string;
  description?: string;
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

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <section className="py-6">
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          और देखें
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Content Grid */}
      {variant === "featured" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <NewsCard article={featuredArticle} variant="featured" />
          </div>
          <div className="space-y-4">
            {remainingArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </div>
      ) : variant === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
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
