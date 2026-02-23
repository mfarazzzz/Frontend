import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategorySection from "@/components/CategorySection";
import NewsCard from "@/components/NewsCard";
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

const Index = ({ heroArticles, categories, categoryArticles, editorials, trendingArticles }: IndexProps) => {
  const heroPrimary = heroArticles[0];
  const heroSecondary = heroArticles.slice(1, 5);
  const sidebarTrending = trendingArticles.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {heroPrimary && (
          <section className="mb-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
            <div>
              <NewsCard article={heroPrimary} variant="featured" imagePriority />
            </div>
            <div className="space-y-4">
              {heroSecondary.map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </section>
        )}

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {categories.map((category) => {
              const articles = categoryArticles[category.slug] ?? [];
              if (!articles.length) return null;
              return (
                <CategorySection
                  key={category.id}
                  title={category.titleHindi}
                  articles={articles}
                  viewAllLink={category.path || `/${category.slug}`}
                  variant="featured"
                />
              );
            })}

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
              <aside className="space-y-6">
                <div className="bg-card rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4 border-b border-primary pb-2">ट्रेंडिंग</h3>
                  <div className="space-y-4">
                    {sidebarTrending.map((article) => (
                      <Link
                        key={article.id}
                        href={`/news/${article.slug}`}
                        className="flex gap-3 items-start hover:text-primary transition-colors"
                      >
                        <div className="relative w-20 h-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={article.image || "/news-placeholder.jpg"}
                            alt={article.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
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

                <div className="bg-card rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4 border-b border-primary pb-2">लोकप्रिय खबरें</h3>
                  <div className="space-y-3">
                    {sidebarTrending.slice(0, 5).map((article, index) => (
                      <Link
                        key={article.id}
                        href={`/news/${article.slug}`}
                        className="flex gap-3 items-start hover:text-primary transition-colors"
                      >
                        <span className="text-lg font-bold text-primary">{index + 1}</span>
                        <div>
                          <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTimeHindi(article.publishedDate || article.publishedAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4 border-b border-primary pb-2">हमसे जुड़ें</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="https://whatsapp.com/channel/0029Vb7TEPsLI8Yg4gbsqe3O"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg bg-[#25D366] text-white py-2 text-sm font-medium"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="https://t.me/rampurnewsofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg bg-[#0088cc] text-white py-2 text-sm font-medium"
                    >
                      Telegram
                    </a>
                  </div>
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
