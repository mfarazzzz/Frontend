"use client";
import { useEffect, useState } from "react";
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

const DynamicCategorySection = ({ category, limit = 12 }: DynamicCategorySectionProps) => {
  const { data } = useArticles({
    category: category.slug,
    status: "published",
    orderBy: "publishedDate",
    order: "desc",
    limit,
  });
  const articles = data?.data ?? [];
  if (articles.length === 0) return null;

  return (
    <CategorySection
      title={category.titleHindi}
      articles={articles}
      viewAllLink={category.path || `/${category.slug}`}
      variant="featured"
    />
  );
};

const Index = ({ initialHeroArticles }: { initialHeroArticles?: CMSArticle[] }) => {
  const { data: heroArticlesRaw = [] } = useHeroArticles(15, { initialData: initialHeroArticles });
  const { data: featuredFallback = [] } = useFeaturedArticles(3);
  const heroArticles = heroArticlesRaw.length > 0 ? heroArticlesRaw : featuredFallback;
  const { data: categories = [] } = useCategories();
  const { data: editorialResponse } = useEditorials({
    isEditorsPick: true,
    limit: 4,
    orderBy: "publishedDate",
    order: "desc",
  });
  const editorsPicks: CMSEditorial[] = editorialResponse?.data ?? [];
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
                {heroArticles.map((article) => (
                  <CarouselItem key={article.id}>
                    <NewsCard article={article} variant="featured" />
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
            {categories
              .slice()
              .sort((a, b) => {
                const orderA = a.order ?? 999;
                const orderB = b.order ?? 999;
                if (orderA !== orderB) return orderA - orderB;
                return a.titleHindi.localeCompare(b.titleHindi);
              })
              .map((category) => (
                <DynamicCategorySection key={category.id} category={category} />
              ))}

            {editorsPicks.length > 0 && (
              <section className="py-6">
                <div className="section-header">
                  <h2 className="section-title">संपादकीय चुनिंदा</h2>
                  <a
                    href="/editorials"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    और देखें
                  </a>
                </div>
                <Carousel className="mt-4">
                  <CarouselContent>
                    {editorsPicks.map((editorial) => (
                      <CarouselItem key={editorial.id}>
                        <NewsCard
                          article={{
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
                          }}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {editorsPicks.length > 1 && (
                    <>
                      <CarouselPrevious className="-left-4 md:-left-8" />
                      <CarouselNext className="-right-4 md:-right-8" />
                    </>
                  )}
                </Carousel>
              </section>
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
