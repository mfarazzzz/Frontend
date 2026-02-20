"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import { useArticles, useArticlesByCategory, useHeroArticles, useFeaturedArticles } from "@/hooks/useCMS";
import type { CMSArticle } from "@/services/cms";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

type CMSCategorySectionProps = {
  slug: string;
  title: string;
  viewAllLink: string;
  variant?: "default" | "featured" | "grid";
  limit?: number;
};

const CMSCategorySection = ({
  slug,
  title,
  viewAllLink,
  variant = "default",
  limit = 9,
}: CMSCategorySectionProps) => {
  const { data: articles = [] } = useArticlesByCategory(slug, limit);
  return (
    <CategorySection
      title={title}
      articles={articles}
      viewAllLink={viewAllLink}
      variant={variant}
    />
  );
};

const Index = ({ initialHeroArticles }: { initialHeroArticles?: CMSArticle[] }) => {
  const { data: heroArticlesRaw = [] } = useHeroArticles(15, { initialData: initialHeroArticles });
  const { data: featuredFallback = [] } = useFeaturedArticles(3);
  const heroArticles = heroArticlesRaw.length > 0 ? heroArticlesRaw : featuredFallback;
  const { data: editorialData } = useArticles({
    contentType: "editorial",
    editorsPick: true,
    limit: 4,
    status: "published",
    orderBy: "publishedDate",
    order: "desc",
  });
  const editorsPicks = editorialData?.data ?? [];
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
            {editorsPicks.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    संपादकीय चुनिंदा
                  </h2>
                  <a
                    href="/editorials"
                    className="text-sm text-primary hover:underline"
                  >
                    सभी संपादकीय देखें
                  </a>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {editorsPicks.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      variant="default"
                    />
                  ))}
                </div>
              </section>
            )}
            {/* Rampur News */}
            <CMSCategorySection slug="rampur" title="रामपुर" viewAllLink="/rampur" variant="featured" limit={6} />

            {/* UP News */}
            <CMSCategorySection slug="up" title="उत्तर प्रदेश" viewAllLink="/up" variant="default" />

            {/* National News */}
            <CMSCategorySection slug="national" title="देश" viewAllLink="/national" variant="default" />

            {/* Politics */}
            <CMSCategorySection slug="politics" title="राजनीति" viewAllLink="/politics" variant="default" />

            {/* Crime */}
            <CMSCategorySection slug="crime" title="अपराध" viewAllLink="/crime" variant="default" />

            {/* Education & Jobs */}
            <CMSCategorySection slug="education-jobs" title="शिक्षा और नौकरियां" viewAllLink="/education-jobs" variant="default" />

            {/* Business */}
            <CMSCategorySection slug="business" title="व्यापार" viewAllLink="/business" variant="default" />

            {/* Entertainment */}
            <CMSCategorySection slug="entertainment" title="मनोरंजन" viewAllLink="/entertainment" variant="default" />

            {/* Sports */}
            <CMSCategorySection slug="sports" title="खेल" viewAllLink="/sports" variant="default" />

            {/* Health */}
            <CMSCategorySection slug="health" title="स्वास्थ्य" viewAllLink="/health" variant="default" />

            {/* Religion & Culture */}
            <CMSCategorySection slug="religion-culture" title="धर्म और संस्कृति" viewAllLink="/religion-culture" variant="default" />

            {/* Food & Lifestyle */}
            <CMSCategorySection slug="food-lifestyle" title="खान-पान और लाइफस्टाइल" viewAllLink="/food-lifestyle" variant="default" />

            {/* Nearby */}
            <CMSCategorySection slug="nearby" title="आस-पास" viewAllLink="/nearby" variant="default" />
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
