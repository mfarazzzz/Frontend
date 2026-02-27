import Link from "next/link";
import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import type { CMSArticle } from "@/services/cms";

interface CategorySectionProps {
  title: string;
  articles: CMSArticle[];
  viewAllLink: string;
}

const CategorySection = ({ title, articles, viewAllLink }: CategorySectionProps) => {
  if (articles.length === 0) return null;

  const featuredPrimary = articles[0];
  const featuredSecondary = articles.slice(1, 5);

  return (
    <section className="py-5">
      <div className="section-header">
        <h2 className="section-title text-lg md:text-xl">{title}</h2>
        <Link className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground" href={viewAllLink}>
          और देखें
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div>{featuredPrimary && <NewsCard article={featuredPrimary} variant="featured" />}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {featuredSecondary.map((article) => (
            <NewsCard key={article.id} article={article} variant="mini" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
