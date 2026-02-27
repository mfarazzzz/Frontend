import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import NewsCard from "@/components/NewsCard";
import FollowButtons from "@/components/FollowButtons";
import type { CMSArticle, CMSCategory, CMSEditorial } from "@/services/cms";
type IndexProps = {
  heroArticles: CMSArticle[];
  categories: CMSCategory[];
  categoryArticles: Record<string, CMSArticle[]>;
  editorials: CMSEditorial[];
  trendingArticles: CMSArticle[];
};

const formatRelativeTimeHindi = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return "अभी";
  if (minutes < 60) return `${minutes} मिनट पहले`;
  if (hours < 24) return `${hours} घंटे पहले`;
  return `${days} दिन पहले`;
};

const hasRealImage = (src?: string | null) => {
  if (!src) return false;
  const lowered = src.toLowerCase();
  if (lowered.includes("placeholder")) return false;
  if (lowered.includes("news-placeholder")) return false;
  return true;
};

const Index = ({ heroArticles, categories, categoryArticles, editorials, trendingArticles }: IndexProps) => {
  const heroCandidates = heroArticles.filter((article) => hasRealImage(article.image));
  const heroPrimary = heroCandidates[0];
  const heroSecondary = heroCandidates.slice(1, 3);
  const heroCompact = heroCandidates.slice(3, 7);
  const sidebarTrending = trendingArticles.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {heroPrimary && (
          <section className="mb-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-4">
              <div>
                <NewsCard article={heroPrimary} variant="hero" imagePriority />
              </div>
              <div className="space-y-4">
                {heroSecondary.map((article) => (
                  <NewsCard key={article.id} article={article} variant="stacked" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {heroCompact.map((article) => (
                <NewsCard key={article.id} article={article} variant="mini" />
              ))}
            </div>
          </section>
        )}

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {categories.map((category) => {
              const articles = categoryArticles[category.slug] ?? [];
              if (!articles.length) return null;
              return (
                <CategorySection
                  key={category.id}
                  title={category.titleHindi}
                  articles={articles}
                  viewAllLink={category.path || `/${category.slug}`}
                />
              );
            })}

            {editorials.length > 0 && (
              <CategorySection
                title="संपादकीय"
                viewAllLink="/editorials"
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
                  publishedAt: editorial.publishedAt || editorial.publishedDate,
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
              <aside className="space-y-6">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-base font-semibold mb-4 border-b border-border pb-2">ट्रेंडिंग</h3>
                  <div className="space-y-4">
                    {sidebarTrending.map((article) => (
                      <Link
                        key={article.id}
                        href={`/news/${article.slug}`}
                        className="flex gap-3 items-start hover:text-primary transition-colors"
                      >
                        {hasRealImage(article.image) ? (
                          <div className="relative w-20 h-16 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTimeHindi(article.publishedDate || article.publishedAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-base font-semibold mb-4 border-b border-border pb-2">हमसे जुड़ें</h3>
                  <FollowButtons showLabels={false} />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
