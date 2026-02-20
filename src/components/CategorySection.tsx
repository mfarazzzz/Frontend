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

  const sliderLimit = 5;
  const featuredCandidates = articles.filter((article) => article.isFeatured);
  const sliderArticles =
    featuredCandidates.length > 0
      ? featuredCandidates.slice(0, sliderLimit)
      : articles.slice(0, sliderLimit);
  const sliderIds = new Set(sliderArticles.map((article) => article.id));
  const remainingArticles = articles.filter((article) => !sliderIds.has(article.id));

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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Carousel className="w-full">
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
          </div>
          <div className="space-y-4">
            {remainingArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
