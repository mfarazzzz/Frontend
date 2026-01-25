"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import BreakingNewsSlider from "@/components/BreakingNewsSlider";
import CategorySection from "@/components/CategorySection";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import SEO from "@/components/SEO";
import { useArticlesByCategory, useFeaturedArticles } from "@/hooks/useCMS";

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

const Index = () => {
  const { data: featuredNews = [] } = useFeaturedArticles(3);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="रामपुर की ताज़ा खबरें"
        description="रामपुर न्यूज़ - रामपुर जिले और उत्तर प्रदेश की ताज़ा, विश्वसनीय खबरें। राजनीति, अपराध, शिक्षा, खेल, मनोरंजन और स्थानीय समाचार।"
        canonical="/"
        ogType="website"
        isHomepage={true}
      />

      <Header />
      <BreakingNewsTicker />

      <main className="container py-6">
        {/* Breaking News Slider */}
        <BreakingNewsSlider />

        {/* Featured Hero Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Featured */}
            <div className="lg:col-span-2">
              {featuredNews[0] && (
                <NewsCard article={featuredNews[0]} variant="featured" />
              )}
            </div>
            {/* Side Featured */}
            <div className="space-y-4">
              {featuredNews.slice(1, 3).map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
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
