"use client";
import { Link } from "@/lib/router-compat";
import { 
  FileText, Trophy, Building2, Briefcase, Bell, Newspaper,
  Calendar, GraduationCap, Users, TrendingUp, ArrowRight, Play, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { HeroSection, ExamCard, ResultCard, CareerCard, QuickNavCard, TestimonialCard, VideoCard } from "@/components/education";
import NewsCard from "@/components/education/NewsCard";
import { useExams, useResults } from "@/hooks/useExtendedCMS";
import { mockCareerGuides, mockTestimonials, mockVideoTutorials, mockEducationNews } from "@/services/cms/extendedMockData";

const EducationHub = () => {
  const { data: examsData, isLoading: examsLoading } = useExams({ limit: 6, featured: true });
  const { data: resultsData, isLoading: resultsLoading } = useResults({ limit: 4 });

  const featuredCareers = mockCareerGuides.filter(c => c.isFeatured).slice(0, 3);
  const featuredTestimonials = mockTestimonials.filter(t => t.isFeatured).slice(0, 2);
  const featuredVideos = mockVideoTutorials.filter(v => v.isFeatured).slice(0, 4);
  const latestNews = mockEducationNews.slice(0, 3);
  const breakingNews = mockEducationNews.filter(n => n.isBreaking);
  const scholarshipNews = mockEducationNews.filter(n => n.category === 'scholarship').slice(0, 3);
  const examUpdates = mockEducationNews.filter(n => n.category === 'exam-news' || n.category === 'result-news').slice(0, 4);

  return (
    <>
      <SEO 
        title="शिक्षा एवं करियर - परीक्षा कैलेंडर, रिजल्ट, संस्थान | रामपुर न्यूज़"
        description="रामपुर और उत्तर प्रदेश की सभी परीक्षाओं की जानकारी, रिजल्ट अपडेट, कॉलेज-स्कूल की जानकारी और करियर गाइडेंस। यूपी बोर्ड, सरकारी नौकरी, प्रवेश परीक्षा।"
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection />

        {/* Quick Navigation - Mobile */}
        <section className="lg:hidden py-6 px-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <QuickNavCard
              title="Exam Calendar"
              titleHindi="परीक्षा कैलेंडर"
              icon={FileText}
              href="/education-jobs/exams"
              variant="primary"
            />
            <QuickNavCard
              title="Results"
              titleHindi="परिणाम"
              icon={Trophy}
              href="/education-jobs/results"
            />
            <QuickNavCard
              title="Institutions"
              titleHindi="संस्थान"
              icon={Building2}
              href="/education-jobs/institutions"
            />
            <QuickNavCard
              title="Career Guide"
              titleHindi="करियर गाइड"
              icon={Briefcase}
              href="/education-jobs/career"
            />
          </div>
        </section>

        {/* Latest News Ticker */}
        {latestNews.length > 0 && (
          <section className="border-b bg-card">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="shrink-0 px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded">
                  ताज़ा खबर
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-6 animate-pulse">
                    {latestNews.map((news, i) => (
                      <Link 
                        key={news.id} 
                        to={`/education-jobs/news/${news.slug}`}
                        className="shrink-0 text-sm hover:text-primary transition-colors"
                      >
                        {news.isBreaking && <span className="text-primary font-semibold mr-1">●</span>}
                        {news.titleHindi}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Exam Calendar Section */}
        <section className="py-10 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                परीक्षा कैलेंडर 2026
              </h2>
              <p className="text-muted-foreground mt-1">आगामी परीक्षाओं की पूरी जानकारी</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/education-jobs/exams">
                सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {examsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-48 bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examsData?.data.map(exam => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </section>

        {/* Results Tracker Section */}
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  परिणाम ट्रैकर
                </h2>
                <p className="text-muted-foreground mt-1">घोषित और आगामी परिणाम</p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/education-jobs/results">
                  सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            {resultsLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6 h-40 bg-muted" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {resultsData?.data.map(result => (
                  <ResultCard key={result.id} result={result} variant="compact" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Career Guidance Section */}
        <section className="py-10 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" />
                करियर गाइडेंस
              </h2>
              <p className="text-muted-foreground mt-1">सही करियर का चुनाव करें</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/education-jobs/career">
                सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {featuredCareers.map(career => (
              <CareerCard key={career.id} career={career} variant="compact" />
            ))}
          </div>
        </section>

        {/* Institutions CTA */}
        <section className="py-10 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold">
              रामपुर में शिक्षण संस्थान खोजें
            </h2>
            <p className="text-lg opacity-90 mt-2 max-w-2xl mx-auto">
              स्कूल, कॉलेज, विश्वविद्यालय और कोचिंग संस्थान - सभी की जानकारी एक जगह
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="mt-6 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link to="/education-jobs/institutions">
                संस्थान खोजें <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Video Tutorials Section */}
        {featuredVideos.length > 0 && (
          <section className="py-10 container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Play className="h-6 w-6 text-primary" />
                  वीडियो ट्यूटोरियल
                </h2>
                <p className="text-muted-foreground mt-1">विशेषज्ञों से सीखें</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredVideos.map(video => (
                <VideoCard key={video.id} video={video} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* Education News Section */}
        <section className="py-10 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-primary" />
                शिक्षा समाचार
              </h2>
              <p className="text-muted-foreground mt-1">ताज़ा अपडेट, छात्रवृत्ति और परीक्षा समाचार</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/education-jobs/news">
                सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main News */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
              {examUpdates.map(news => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
            
            {/* Scholarship Sidebar */}
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  छात्रवृत्ति अलर्ट
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scholarshipNews.map(news => (
                    <div key={news.id} className="border-b border-amber-200/50 dark:border-amber-800/50 pb-3 last:border-0 last:pb-0">
                      <Link 
                        to={`/education-jobs/news/${news.slug}`}
                        className="block text-sm hover:text-primary transition-colors"
                      >
                        <Badge variant="secondary" className="text-[10px] mb-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          {news.isImportant ? 'महत्वपूर्ण' : 'छात्रवृत्ति'}
                        </Badge>
                        <span className="block font-medium">{news.titleHindi}</span>
                      </Link>
                    </div>
                  ))}
                </div>
                <Button variant="link" size="sm" className="mt-3 p-0 text-amber-700 dark:text-amber-400" asChild>
                  <Link to="/education-jobs/news?category=scholarship">
                    सभी छात्रवृत्ति देखें <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials Section */}
        {featuredTestimonials.length > 0 && (
          <section className="py-10 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  सफलता की कहानियां
                </h2>
                <p className="text-muted-foreground mt-1">हमारे छात्रों की उपलब्धियां</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {featuredTestimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} variant="featured" />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </>
  );
};

export default EducationHub;