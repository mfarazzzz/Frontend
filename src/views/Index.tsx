import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import NewsCard from "@/components/NewsCard";
import YouTubeRail from "@/components/YouTubeRail";
import Sidebar from "@/components/Sidebar";
import AdSlotLazy from "@/components/AdSlotLazy";
import type { CMSArticle, CMSCategory, CMSEditorial } from "@/services/cms";

/** Minimal category shape needed for homepage rendering */
interface HomepageCategory {
  id: string;
  slug: string;
  titleHindi: string;
  path?: string;
  template?: string;
  showAdAfter?: boolean;
}

type IndexProps = {
  heroArticles: CMSArticle[];
  categories: (CMSCategory | HomepageCategory)[];
  categoryArticles: Record<string, CMSArticle[]>;
  editorials: (CMSEditorial | CMSArticle)[];
  trendingArticles: CMSArticle[];
  todaysTop?: CMSArticle[];
  mostRead24h?: CMSArticle[];
};

const Index = ({ heroArticles, categories, categoryArticles, editorials, trendingArticles, todaysTop = [], mostRead24h = [] }: IndexProps) => {
  const heroPrimary = heroArticles[0];
  const heroSecondary = heroArticles.slice(1, 5);
  const sidebarTrending = trendingArticles.slice(0, 6);

  // Determine which sections have content
  const activeSections = categories.filter((cat) => {
    const articles = categoryArticles[cat.slug] ?? [];
    return articles.length > 0;
  });

  // Decide ad placement: only after every 3rd section (not every section)
  const adAfterIndices = new Set<number>();
  activeSections.forEach((_, index) => {
    if ((index + 1) % 3 === 0) adAfterIndices.add(index);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl px-4 py-6 article-links">
        <h1 className="sr-only">रामपुर न्यूज़ | Rampur News - ताज़ा खबरें, स्थानीय समाचार</h1>
        
        {/* ─── Hero Section ─── */}
        {heroPrimary && (
          <section className="mb-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
            <div>
              <NewsCard article={heroPrimary} variant="featured" imagePriority asHero />
            </div>
            <div className="space-y-4">
              {heroSecondary.map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </section>
        )}

        {/* Mini videos rail below hero */}
        <YouTubeRail />

        {/* ─── Main Content with Sidebar ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Single ad after hero area */}
            <AdSlotLazy placement="infeed" />

            {activeSections.map((category, index) => {
              const articles = categoryArticles[category.slug] ?? [];
              if (!articles.length) return null;

              // Map config template to component variant
              const templateMap: Record<string, "default" | "featured" | "grid" | "compact-list" | "timeline" | "two-col-grid"> = {
                'featured': 'featured',
                'grid': 'grid',
                'compact-list': 'compact-list',
                'hero-sidebar': 'featured',
                'editorial-picks': 'featured',
                'horizontal-scroll': 'grid',
                'carousel': 'grid',
                'two-columns': 'two-col-grid',
              };
              const configTemplate = (category as HomepageCategory).template || '';
              const variant = templateMap[configTemplate] || 'featured';
              const showAd = adAfterIndices.has(index);

              return (
                <div key={category.id}>
                  <CategorySection
                    title={category.titleHindi}
                    articles={articles}
                    viewAllLink={category.path || `/${category.slug}`}
                    variant={variant}
                  />
                  {showAd && (
                    <div className="my-8">
                      <AdSlotLazy placement="infeed" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Editorials section */}
            {editorials.length > 0 && (
              <CategorySection
                title="संपादकीय"
                viewAllLink="/editorials"
                variant="compact-list"
                articles={editorials.map((editorial) => ({
                  id: editorial.id,
                  title: (editorial as any).titleHindi || editorial.title,
                  slug: editorial.slug,
                  excerpt: editorial.excerpt,
                  content: editorial.content,
                  image: editorial.image,
                  category: "editorials",
                  categoryHindi: "संपादकीय",
                  author: editorial.author,
                  publishedAt: editorial.publishedAt || (editorial as any).publishedDate,
                  publishedDate: (editorial as any).publishedDate,
                  status: editorial.status,
                  contentType: (editorial as any).editorialType || (editorial as any).contentType,
                  isEditorsPick: (editorial as any).isEditorsPick,
                  isFeatured: (editorial as any).isFeatured,
                }))}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Sidebar 
                trendingArticles={sidebarTrending} 
                todaysTop={todaysTop} 
                mostRead={mostRead24h} 
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
