"use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Building2, ExternalLink, Search, Users, TrendingUp } from "lucide-react";
import { useResults } from "@/hooks/useExtendedCMS";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

const ResultCalendarPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { data: resultsData, isLoading } = useResults({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    search: searchQuery || undefined,
    limit: 50,
  });
  
  const results = resultsData?.data || [];
  
  const breadcrumbs = [
    { label: "Education & Jobs", labelHindi: "शिक्षा और नौकरियां", path: "/education-jobs" },
    { label: "Result Calendar", labelHindi: "परिणाम कैलेंडर", path: "/education-jobs/results" },
  ];
  
  const categoryLabels: Record<string, string> = {
    board: 'बोर्ड परीक्षा',
    entrance: 'प्रवेश परीक्षा',
    government: 'सरकारी नौकरी',
    university: 'विश्वविद्यालय',
    competitive: 'प्रतियोगी परीक्षा',
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="परिणाम कैलेंडर 2025-26 | शिक्षा और नौकरियां"
        description="यूपी बोर्ड, सरकारी नौकरी और प्रतियोगी परीक्षाओं के परिणाम। रिजल्ट कैलेंडर - रामपुर न्यूज़।"
        canonical="/education-jobs/results"
        ogType="website"
      />
      
      <Header />
      
      <main className="container py-6">
        <BreadcrumbNav items={breadcrumbs} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">परिणाम कैलेंडर 2025-26</h1>
          <p className="text-muted-foreground">
            बोर्ड परीक्षा, सरकारी नौकरी और प्रतियोगी परीक्षाओं के परिणाम
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="परिणाम खोजें..."
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
        </div>
        
        {/* Results List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">कोई परिणाम नहीं मिला</div>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Date Box */}
                    <div className="shrink-0 w-20 h-20 bg-green-500/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">
                        {format(new Date(result.resultDate), 'd')}
                      </span>
                      <span className="text-sm text-green-600">
                        {format(new Date(result.resultDate), 'MMM', { locale: hi })}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="font-bold text-lg">{result.titleHindi}</h3>
                        <p className="text-sm text-muted-foreground">{result.title}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {result.organizationHindi}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(result.resultDate), 'dd MMMM yyyy', { locale: hi })}
                        </span>
                        {result.totalCandidates && (
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {result.totalCandidates.toLocaleString('hi-IN')} परीक्षार्थी
                          </span>
                        )}
                        {result.passPercentage && (
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {result.passPercentage}% उत्तीर्ण
                          </span>
                        )}
                      </div>
                      
                      <Badge variant="outline">
                        {categoryLabels[result.category]}
                      </Badge>
                    </div>
                    
                    {/* Actions */}
                    <div className="shrink-0 flex flex-col gap-2">
                      <Link 
                        to={`/education-jobs/results/${result.slug}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        विवरण देखें
                        <ExternalLink size={14} />
                      </Link>
                      {result.resultLink && (
                        <a 
                          href={result.resultLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:underline text-sm"
                        >
                          परिणाम देखें
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultCalendarPage;
