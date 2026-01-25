 "use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import NewsCard from "@/components/education/NewsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Newspaper, Bell, Award, GraduationCap, FileText, 
  ClipboardCheck, Filter, TrendingUp, ArrowRight 
} from "lucide-react";
import { mockEducationNews } from "@/services/cms/extendedMockData";

const CATEGORIES = [
  { id: 'all', label: 'सभी', icon: Newspaper },
  { id: 'board-news', label: 'बोर्ड समाचार', icon: FileText },
  { id: 'exam-news', label: 'परीक्षा अपडेट', icon: ClipboardCheck },
  { id: 'result-news', label: 'रिजल्ट न्यूज़', icon: TrendingUp },
  { id: 'admission-news', label: 'एडमिशन', icon: GraduationCap },
  { id: 'scholarship', label: 'छात्रवृत्ति', icon: Award },
  { id: 'government-order', label: 'सरकारी आदेश', icon: Bell },
];

const EducationNewsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const breakingNews = mockEducationNews.filter(n => n.isBreaking);
  const importantNews = mockEducationNews.filter(n => n.isImportant && !n.isBreaking);
  
  const filteredNews = mockEducationNews.filter(news => {
    const matchesCategory = activeCategory === 'all' || news.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      news.titleHindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.excerptHindi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Education', labelHindi: 'शिक्षा', path: '/education-jobs' },
    { label: 'News', labelHindi: 'समाचार', path: '/education-jobs/news' },
  ];

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "शिक्षा समाचार",
          "description": "शिक्षा से जुड़े सभी समाचार और अपडेट",
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": filteredNews.slice(0, 10).map((news, index) => ({
              "@type": "NewsArticle",
              "position": index + 1,
              "headline": news.titleHindi,
              "datePublished": news.publishedAt,
              "articleSection": news.category,
            })),
          },
        })}
      </script>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breaking News Ticker */}
          {breakingNews.length > 0 && (
            <div className="bg-red-600 text-white py-2">
              <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <Badge className="shrink-0 bg-white text-red-600 hover:bg-white">
                    ब्रेकिंग
                  </Badge>
                  <div className="flex items-center gap-6 animate-marquee">
                    {breakingNews.map(news => (
                      <Link 
                        key={news.id}
                        to={`/education-jobs/news/${news.slug}`}
                        className="shrink-0 hover:underline"
                      >
                        • {news.titleHindi}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 py-6">
            <BreadcrumbNav items={breadcrumbs} />

            {/* Hero Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Newspaper className="h-8 w-8 text-primary" />
                शिक्षा समाचार
              </h1>
              <p className="text-muted-foreground">
                परीक्षा अपडेट, छात्रवृत्ति, एडमिशन और सरकारी आदेश - सभी शिक्षा समाचार एक जगह
              </p>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="समाचार खोजें..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">फ़िल्टर:</span>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="mt-4 overflow-x-auto pb-2">
                  <div className="flex gap-2 min-w-max">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <Button
                          key={cat.id}
                          variant={activeCategory === cat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCategory(cat.id)}
                          className="gap-1.5"
                        >
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* News List */}
              <div className="lg:col-span-2">
                {/* Important News Highlight */}
                {activeCategory === 'all' && importantNews.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-500" />
                      महत्वपूर्ण अपडेट
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {importantNews.slice(0, 2).map(news => (
                        <NewsCard key={news.id} news={news} variant="featured" />
                      ))}
                    </div>
                  </div>
                )}

                {/* All News */}
                <h2 className="text-lg font-semibold mb-3">
                  {activeCategory === 'all' ? 'सभी समाचार' : CATEGORIES.find(c => c.id === activeCategory)?.label}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredNews.length} समाचार)
                  </span>
                </h2>

                {filteredNews.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>इस श्रेणी में कोई समाचार नहीं मिला</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredNews.map(news => (
                      <NewsCard key={news.id} news={news} />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Links */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">त्वरित लिंक</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link 
                      to="/education-jobs/exams"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">परीक्षा कैलेंडर</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <Link 
                      to="/education-jobs/results"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">रिजल्ट ट्रैकर</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <Link 
                      to="/education-jobs/institutions"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">संस्थान खोजें</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>

                {/* Scholarship Alerts */}
                <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      छात्रवृत्ति अलर्ट
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockEducationNews
                        .filter(n => n.category === 'scholarship')
                        .slice(0, 3)
                        .map(news => (
                          <Link 
                            key={news.id}
                            to={`/education-jobs/news/${news.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            <span className="font-medium">{news.titleHindi}</span>
                          </Link>
                        ))}
                    </div>
                    <Button variant="link" size="sm" className="mt-3 p-0" asChild>
                      <Link to="/education-jobs/news?category=scholarship">
                        सभी छात्रवृत्ति देखें <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Results */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      हाल के रिजल्ट
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockEducationNews
                        .filter(n => n.category === 'result-news')
                        .slice(0, 3)
                        .map(news => (
                          <Link 
                            key={news.id}
                            to={`/education-jobs/news/${news.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            {news.titleHindi}
                          </Link>
                        ))}
                    </div>
                    <Button variant="link" size="sm" className="mt-3 p-0" asChild>
                      <Link to="/education-jobs/results">
                        रिजल्ट ट्रैकर देखें <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EducationNewsSection;
