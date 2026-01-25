"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import ListingCard from "@/components/ListingCard";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useInstitutions } from "@/hooks/useExtendedCMS";

const InstitutionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: institutionsData, isLoading } = useInstitutions({
    type: typeFilter !== "all" ? typeFilter : undefined,
    search: searchQuery || undefined,
    limit: 50,
  });
  
  const institutions = institutionsData?.data || [];
  
  const breadcrumbs = [
    { label: "Education & Jobs", labelHindi: "शिक्षा और नौकरियां", path: "/education-jobs" },
    { label: "Institutions", labelHindi: "शैक्षणिक संस्थान", path: "/education-jobs/institutions" },
  ];
  
  const typeLabels: Record<string, string> = {
    college: 'कॉलेज',
    school: 'स्कूल',
    university: 'विश्वविद्यालय',
    coaching: 'कोचिंग',
    vocational: 'व्यावसायिक',
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="शैक्षणिक संस्थान | कॉलेज, स्कूल, विश्वविद्यालय - रामपुर"
        description="रामपुर और आस-पास के शैक्षणिक संस्थान - कॉलेज, स्कूल, विश्वविद्यालय की जानकारी। रामपुर न्यूज़।"
        canonical="/education-jobs/institutions"
        ogType="website"
      />
      
      <Header />
      
      <main className="container py-6">
        <BreadcrumbNav items={breadcrumbs} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">शैक्षणिक संस्थान</h1>
          <p className="text-muted-foreground">
            रामपुर और आस-पास के कॉलेज, स्कूल और विश्वविद्यालय
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="संस्थान खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="प्रकार चुनें" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सभी संस्थान</SelectItem>
              <SelectItem value="school">स्कूल</SelectItem>
              <SelectItem value="college">कॉलेज</SelectItem>
              <SelectItem value="university">विश्वविद्यालय</SelectItem>
              <SelectItem value="coaching">कोचिंग</SelectItem>
              <SelectItem value="vocational">व्यावसायिक</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Quick Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setTypeFilter("all")}>सभी</TabsTrigger>
            <TabsTrigger value="school" onClick={() => setTypeFilter("school")}>स्कूल</TabsTrigger>
            <TabsTrigger value="college" onClick={() => setTypeFilter("college")}>कॉलेज</TabsTrigger>
            <TabsTrigger value="university" onClick={() => setTypeFilter("university")}>विश्वविद्यालय</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Institutions Grid */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">कोई संस्थान नहीं मिला</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((institution) => (
              <ListingCard
                key={institution.id}
                title={institution.name}
                titleHindi={institution.nameHindi}
                slug={institution.slug}
                basePath="/education-jobs/institutions"
                type={institution.type}
                typeLabel={typeLabels[institution.type]}
                addressHindi={`${institution.addressHindi}, ${institution.city}`}
                phone={institution.phone}
                rating={institution.rating}
                reviews={institution.reviews}
                image={institution.image}
                descriptionHindi={institution.descriptionHindi}
                badges={[
                  ...(institution.affiliation ? [{ label: institution.affiliation }] : []),
                  ...(institution.establishedYear ? [{ label: `स्थापित ${institution.establishedYear}` }] : []),
                ]}
                isFeatured={institution.isFeatured}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default InstitutionsPage;
