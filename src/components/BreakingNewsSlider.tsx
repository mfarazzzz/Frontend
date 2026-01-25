"use client";
import { useState, useEffect, useCallback } from "react";
import { Link } from "@/lib/router-compat";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBreakingNews } from "@/hooks/useCMS";
import Image from "next/image";

const isLocalUpstreamImage = (src: string) => {
  try {
    const url = new URL(src);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
  } catch {
    return false;
  }
};

const BreakingNewsSlider = () => {
  const { data: breakingNews = [] } = useBreakingNews(6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  }, [breakingNews.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  }, [breakingNews.length]);

  useEffect(() => {
    if (currentIndex >= breakingNews.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, breakingNews.length]);

  useEffect(() => {
    if (isPaused || breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, breakingNews.length]);

  if (breakingNews.length === 0) return null;

  return (
    <section className="py-4 md:py-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg">
          <Zap size={18} className="animate-pulse" />
          <span className="font-bold">ब्रेकिंग न्यूज़</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={prevSlide}
            aria-label="Previous news"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextSlide}
            aria-label="Next news"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {breakingNews.map((news) => (
            <div
              key={news.id}
              className="w-full flex-shrink-0"
            >
              <Link to={`/${news.category}/${news.slug}`} className="block group">
                <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden rounded-xl">
                  {news.image ? (
                    <Image
                      src={news.image}
                      alt={news.title}
                      fill
                      priority={news.id === breakingNews[0]?.id}
                      unoptimized={isLocalUpstreamImage(news.image)}
                      sizes="(min-width: 1024px) 1024px, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full mb-3">
                      {news.categoryHindi}
                    </span>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight line-clamp-2 group-hover:underline decoration-2 underline-offset-4">
                      {news.title}
                    </h3>
                    <p className="text-white/80 mt-2 text-sm md:text-base line-clamp-2 max-w-3xl">
                      {news.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 right-6 flex items-center gap-2">
          {breakingNews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BreakingNewsSlider;
