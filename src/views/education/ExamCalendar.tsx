"use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Building2, ExternalLink, Search } from "lucide-react";
import { useExams } from "@/hooks/useExtendedCMS";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

const ExamCalendarPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");
  
  const { data: examsData, isLoading } = useExams({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter as 'upcoming' | 'ongoing' | 'completed' : undefined,
    search: searchQuery || undefined,
    limit: 50,
  });
  
  const exams = examsData?.data || [];
  const governmentExam = exams.find((exam) => exam.category === "government");
  
  const breadcrumbs = [
    { label: "Education & Jobs", labelHindi: "शिक्षा और नौकरियां", path: "/education-jobs" },
    { label: "Exam Calendar", labelHindi: "परीक्षा कैलेंडर", path: "/education-jobs/exams" },
  ];
  
  const categoryLabels: Record<string, string> = {
    board: 'बोर्ड परीक्षा',
    entrance: 'प्रवेश परीक्षा',
    government: 'सरकारी नौकरी',
    university: 'विश्वविद्यालय',
    competitive: 'प्रतियोगी परीक्षा',
  };
  
  const statusLabels: Record<string, string> = {
    upcoming: 'आगामी',
    ongoing: 'चल रही',
    completed: 'समाप्त',
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="परीक्षा कैलेंडर 2026 | शिक्षा और नौकरियां"
        description="यूपी बोर्ड, सरकारी नौकरी और प्रतियोगी परीक्षाओं की तारीखें। परीक्षा कैलेंडर 2026 - रामपुर न्यूज़।"
        canonical="/education-jobs/exams"
        ogType="website"
        jobPosting={governmentExam ? {
          title: governmentExam.seoTitle || governmentExam.titleHindi || governmentExam.title,
          description: governmentExam.seoDescription || governmentExam.descriptionHindi || governmentExam.description,
          datePosted: governmentExam.applicationStartDate || governmentExam.lastUpdated || governmentExam.examDate,
          validThrough: governmentExam.applicationEndDate || governmentExam.examDate,
          employmentType: "FULL_TIME",
          hiringOrganizationName: governmentExam.organizationHindi || governmentExam.organization,
          hiringOrganizationUrl: governmentExam.officialWebsite,
          jobLocation: "Uttar Pradesh, India",
        } : undefined}
      />
      
      <Header />
      
      <main className="container py-6">
        <BreadcrumbNav items={breadcrumbs} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">परीक्षा कैलेंडर 2026</h1>
          <p className="text-muted-foreground">
            बोर्ड परीक्षा, सरकारी नौकरी और प्रतियोगी परीक्षाओं की महत्वपूर्ण तारीखें
          </p>
        </div>
        
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">कैलेंडर व्यू</TabsTrigger>
            <TabsTrigger value="list">सूची व्यू</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <MonthlyCalendar 
              filterType="exam" 
              showAllTypes={false}
            />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="परीक्षा खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="श्रेणी चुनें" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सभी श्रेणियां</SelectItem>
                  <SelectItem value="board">बोर्ड परीक्षा</SelectItem>
                  <SelectItem value="entrance">प्रवेश परीक्षा</SelectItem>
                  <SelectItem value="government">सरकारी नौकरी</SelectItem>
                  <SelectItem value="university">विश्वविद्यालय</SelectItem>
                  <SelectItem value="competitive">प्रतियोगी परीक्षा</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="स्थिति" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">सभी</SelectItem>
                  <SelectItem value="upcoming">आगामी</SelectItem>
                  <SelectItem value="ongoing">चल रही</SelectItem>
                  <SelectItem value="completed">समाप्त</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Exam List */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>
            ) : exams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">कोई परीक्षा नहीं मिली</div>
            ) : (
              <div className="grid gap-4">
                {exams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Date Box */}
                        <div className="shrink-0 w-20 h-20 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {format(new Date(exam.examDate), 'd')}
                          </span>
                          <span className="text-sm text-primary">
                            {format(new Date(exam.examDate), 'MMM', { locale: hi })}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{exam.titleHindi}</h3>
                              <p className="text-sm text-muted-foreground">{exam.title}</p>
                            </div>
                            <Badge className={getStatusColor(exam.status)}>
                              {statusLabels[exam.status]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Building2 size={14} />
                              {exam.organizationHindi}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(exam.examDate), 'dd MMMM yyyy', { locale: hi })}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {categoryLabels[exam.category]}
                            </Badge>
                            {exam.isPopular && (
                              <Badge variant="secondary">लोकप्रिय</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="shrink-0">
                          <Link 
                            to={`/education-jobs/exams/${exam.slug}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            विवरण देखें
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExamCalendarPage;
