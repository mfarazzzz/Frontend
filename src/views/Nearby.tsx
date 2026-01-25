"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryHeader from "@/components/CategoryHeader";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import SEO from "@/components/SEO";
import { getCategoryBySlug } from "@/data/categories";
import { useArticlesByCategory } from "@/hooks/useCMS";

const NearbyPage = () => {
  const category = getCategoryBySlug("nearby")!;
  const { data: news = [], isLoading } = useArticlesByCategory("nearby", 30);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${category.titleHindi} समाचार`}
        description={category.description}
        canonical={category.path}
        ogType="website"
      />

      <Header />
      
      <main className="container py-6">
        <CategoryHeader category={category} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="text-center py-12">लोड हो रहा है...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
            
            <div className="flex justify-center mt-8">
              <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-news-red-dark transition-colors">
                और खबरें देखें
              </button>
            </div>
          </div>
          
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

export default NearbyPage;
