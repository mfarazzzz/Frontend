"use client";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import { useArticles, useHeroArticles, useFeaturedArticles, useCategories, useEditorials } from "@/hooks/useCMS";
import type { CMSArticle, CMSCategory, CMSEditorial } from "@/services/cms";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

type DynamicCategorySectionProps = {
  category: CMSCategory;
  limit?: number;
};

const DynamicCategorySection = ({ category, limit = 7 }: DynamicCategorySectionProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "300px 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { data } = useArticles(
    {
      category: category.slug,
      status: "published",
      orderBy: "publishedDate",
      order: "desc",
      limit,
    },
    { enabled: isInView },
  );
  const articles = data?.data ?? [];
  if (!isInView) {
    return <div ref={hostRef} className="py-6 min-h-[220px]" />;
  }
  if (articles.length === 0) return null;

  return (
    <div ref={hostRef}>
      <CategorySection
        title={category.titleHindi}
        articles={articles}
        viewAllLink={category.path || `/${category.slug}`}
        variant="featured"
      />
    </div>
  );
};

const Index = ({ initialHeroArticles }: { initialHeroArticles?: CMSArticle[] }) => {
  const { data: heroArticlesRaw = [] } = useHeroArticles(8, { initialData: initialHeroArticles });
  const { data: featuredFallback = [] } = useFeaturedArticles(3);
  const heroArticles = heroArticlesRaw.length > 0 ? heroArticlesRaw : featuredFallback;
  const { data: categories = [] } = useCategories();
  const { data: editorialResponse } = useEditorials({
    limit: 5,
    orderBy: "publishedDate",
    order: "desc",
  });
  const editorials: CMSEditorial[] = editorialResponse?.data ?? [];
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
    const handler = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", handler);
    return () => {
      carouselApi.off("select", handler);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || heroArticles.length <= 1) return;
    const id = window.setInterval(() => {
      const nextIndex = (carouselApi.selectedScrollSnap() + 1) % heroArticles.length;
      carouselApi.scrollTo(nextIndex);
    }, 5000);
    return () => {
      window.clearInterval(id);
    };
  }, [carouselApi, heroArticles.length]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {heroArticles.length > 0 && (
          <section className="mb-8">
            <Carousel className="relative" opts={{ loop: true }} setApi={setCarouselApi}>
              <CarouselContent>
                {heroArticles.map((article, index) => (
                  <CarouselItem key={article.id}>
                    <NewsCard article={article} variant="featured" imagePriority={index === 0} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {heroArticles.length > 1 && (
                <>
                  <CarouselPrevious className="-left-4 md:-left-12" />
                  <CarouselNext className="-right-4 md:-right-12" />
                </>
              )}
            </Carousel>
            {heroArticles.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {heroArticles.map((article, index) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={
                      index === selectedIndex
                        ? "h-2 w-6 rounded-full bg-primary"
                        : "h-2 w-2 rounded-full bg-muted-foreground/50"
                    }
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {(() => {
              const preferredOrder = [
                "rampur",
                "up",
                "nearby",
                "national",
                "religion-culture",
                "sports",
                "education-jobs",
                "international",
              ];

              const bySlug: Record<string, CMSCategory> = {};
              for (const cat of categories) {
                bySlug[cat.slug] = cat;
              }

              const ordered: CMSCategory[] = [];
              for (const slug of preferredOrder) {
                const cat = bySlug[slug];
                if (cat) ordered.push(cat);
              }

              for (const cat of categories) {
                if (!preferredOrder.includes(cat.slug)) {
                  ordered.push(cat);
                }
              }

              return ordered.map((category) => (
                <DynamicCategorySection key={category.id} category={category} />
              ));
            })()}

            {editorials.length > 0 && (
              <CategorySection
                title="संपादकीय"
                viewAllLink="/editorials"
                variant="featured"
                articles={editorials.map((editorial) => ({
                  id: editorial.id,
                  title: editorial.titleHindi || editorial.title,
                  slug: editorial.slug,
                  excerpt: editorial.excerpt,
                  content: editorial.content,
                  image: editorial.image,
                  category: "editorials",
                  categoryHindi: "संपादकीय",
                  author: editorial.author,
                  publishedDate: editorial.publishedDate,
                  status: editorial.status,
                  contentType: editorial.editorialType,
                  isEditorsPick: editorial.isEditorsPick,
                  isFeatured: editorial.isFeatured,
                }))}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
