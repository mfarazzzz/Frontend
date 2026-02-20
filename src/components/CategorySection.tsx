import { Link } from "@/lib/router-compat";
import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import type { CMSArticle } from "@/services/cms";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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

  const sliderArticles = articles.slice(0, 3);
  const secondaryArticles = articles.slice(3, 7);

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
      {variant === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : variant === "featured" ? (
        <div className="space-y-4">
          <Carousel className="w-full" opts={{ loop: sliderArticles.length > 1 }}>
            <CarouselContent>
              {sliderArticles.map((article) => (
                <CarouselItem key={article.id}>
                  <NewsCard article={article} variant="featured" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {sliderArticles.length > 1 && (
              <>
                <CarouselPrevious className="-left-4 md:-left-8" />
                <CarouselNext className="-right-4 md:-right-8" />
              </>
            )}
          </Carousel>

          {secondaryArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryArticles.map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          )}
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
