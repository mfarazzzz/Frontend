"use client";
import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";
import type { CMSArticle } from "@/services/cms";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

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
  const sliderArticles = articles.slice(0, 3);
  const secondaryArticles = articles.slice(3, 7);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!carouselApi) return;
    if (sliderArticles.length <= 1) return;
    if (isHovered) return;
    const id = window.setInterval(() => {
      const nextIndex = (carouselApi.selectedScrollSnap() + 1) % sliderArticles.length;
      carouselApi.scrollTo(nextIndex);
    }, 5000);
    return () => {
      window.clearInterval(id);
    };
  }, [carouselApi, isHovered, sliderArticles.length]);

  if (articles.length === 0) return null;

  return (
    <section className="py-6">
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

      {variant === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : variant === "featured" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            className="lg:col-span-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Carousel className="w-full" opts={{ loop: sliderArticles.length > 1 }} setApi={setCarouselApi}>
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
            {secondaryArticles.map((article) => (
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
