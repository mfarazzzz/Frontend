import { useParams } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, Clock, Star, CheckCircle, Building2 } from "lucide-react";
import { useInstitutionBySlug } from "@/hooks/useExtendedCMS";

const InstitutionDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: institution, isLoading } = useInstitutionBySlug(slug || '');
  
  const typeLabels: Record<string, string> = {
    college: 'कॉलेज',
    school: 'स्कूल',
    university: 'विश्वविद्यालय',
    coaching: 'कोचिंग',
    vocational: 'व्यावसायिक',
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">लोड हो रहा है...</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!institution) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">संस्थान नहीं मिला</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const breadcrumbs = [
    { label: "Education & Jobs", labelHindi: "शिक्षा और नौकरियां", path: "/education-jobs" },
    { label: "Institutions", labelHindi: "शैक्षणिक संस्थान", path: "/education-jobs/institutions" },
    { label: institution.name, labelHindi: institution.nameHindi, path: `/education-jobs/institutions/${slug}` },
  ];
  
  // JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": institution.name,
    "description": institution.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": institution.address,
      "addressLocality": institution.city,
      "addressRegion": institution.district,
      "postalCode": institution.pincode,
      "addressCountry": "IN"
    },
    ...(institution.phone && { "telephone": institution.phone }),
    ...(institution.email && { "email": institution.email }),
    ...(institution.website && { "url": institution.website }),
    ...(institution.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": institution.rating,
        "reviewCount": institution.reviews || 0
      }
    })
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${institution.nameHindi} | ${typeLabels[institution.type]} - रामपुर`}
        description={institution.descriptionHindi}
        canonical={`/education-jobs/institutions/${slug}`}
        ogType="website"
      />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      <Header />
      
      <main className="container py-6">
        <BreadcrumbNav items={breadcrumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold">{institution.nameHindi}</h1>
                      {institution.isVerified && (
                        <CheckCircle className="text-green-500" size={24} />
                      )}
                    </div>
                    <p className="text-muted-foreground">{institution.name}</p>
                  </div>
                  <Badge>{typeLabels[institution.type]}</Badge>
                </div>
                
                {/* Rating */}
                {institution.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded">
                      <Star size={14} className="fill-white" />
                      <span className="font-medium">{institution.rating.toFixed(1)}</span>
                    </div>
                    {institution.reviews && (
                      <span className="text-muted-foreground">{institution.reviews} समीक्षाएं</span>
                    )}
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {institution.affiliation && (
                    <Badge variant="outline">{institution.affiliation}</Badge>
                  )}
                  {institution.establishedYear && (
                    <Badge variant="secondary">स्थापित {institution.establishedYear}</Badge>
                  )}
                  {institution.isFeatured && (
                    <Badge className="bg-primary">विशेष</Badge>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground">{institution.descriptionHindi}</p>
              </CardContent>
            </Card>
            
            {/* Courses */}
            {institution.courses && institution.courses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>पाठ्यक्रम</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {institution.courses.map((course, index) => (
                      <Badge key={index} variant="outline">{course}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Facilities */}
            {institution.facilities && institution.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>सुविधाएं</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {institution.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>संपर्क जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p>{institution.addressHindi}</p>
                    <p className="text-sm text-muted-foreground">{institution.city}, {institution.district} - {institution.pincode}</p>
                  </div>
                </div>
                
                {institution.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <a href={`tel:${institution.phone}`} className="hover:text-primary">
                      {institution.phone}
                    </a>
                  </div>
                )}
                
                {institution.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-muted-foreground" />
                    <a href={`mailto:${institution.email}`} className="hover:text-primary">
                      {institution.email}
                    </a>
                  </div>
                )}
                
                {institution.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-muted-foreground" />
                    <a 
                      href={institution.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      वेबसाइट देखें
                    </a>
                  </div>
                )}
                
                <Button className="w-full mt-4">
                  <Phone size={16} className="mr-2" />
                  संपर्क करें
                </Button>
              </CardContent>
            </Card>
            
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>त्वरित जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">प्रकार</span>
                  <span className="font-medium">{typeLabels[institution.type]}</span>
                </div>
                {institution.affiliation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">संबद्धता</span>
                    <span className="font-medium">{institution.affiliation}</span>
                  </div>
                )}
                {institution.establishedYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">स्थापित</span>
                    <span className="font-medium">{institution.establishedYear}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">शहर</span>
                  <span className="font-medium">{institution.city}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InstitutionDetailPage;
