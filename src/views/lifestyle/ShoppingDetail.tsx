"use client";
import { useParams } from '@/lib/router-compat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import ShareButtons from '@/components/ShareButtons';
import ImageGallery from '@/components/ImageGallery';
import ReviewsSection, { Review } from '@/components/ReviewsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Store, Car, CheckCircle, Navigation } from 'lucide-react';
import { useShoppingCentreBySlug } from '@/hooks/useExtendedCMS';

const ShoppingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: centre, isLoading } = useShoppingCentreBySlug(slug || '');
  
  const typeLabels: Record<string, string> = {
    'mall': 'मॉल',
    'market': 'बाज़ार',
    'bazaar': 'बाज़ार',
    'complex': 'कॉम्प्लेक्स',
    'plaza': 'प्लाज़ा',
  };
  
  const mockReviews: Review[] = [
    {
      id: '1',
      authorName: 'विकास कुमार',
      rating: 4,
      content: 'अच्छी जगह है शॉपिंग के लिए। पार्किंग भी उपलब्ध है।',
      date: '2024-01-08',
      helpful: 6,
      verified: true,
    },
  ];
  
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
  
  if (!centre) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">शॉपिंग सेंटर नहीं मिला</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const breadcrumbs = [
    { label: 'Food & Lifestyle', labelHindi: 'खाना और जीवनशैली', path: '/food-lifestyle' },
    { label: 'Shopping', labelHindi: 'शॉपिंग', path: '/food-lifestyle/shopping' },
    { label: centre.name, labelHindi: centre.nameHindi, path: `/food-lifestyle/shopping/${slug}` },
  ];
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ShoppingCenter',
    'name': centre.name,
    'description': centre.description,
    'image': centre.image || centre.gallery?.[0],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': centre.address,
      'addressLocality': centre.city,
      'addressRegion': centre.district,
      'addressCountry': 'IN'
    },
    ...(centre.phone && { 'telephone': centre.phone }),
    ...(centre.openingHours && { 'openingHours': centre.openingHours }),
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      
      <Header />
      
      <main className="container py-6">
        <BreadcrumbNav items={breadcrumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                {centre.image && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                    <img 
                      src={centre.image} 
                      alt={centre.nameHindi}
                      className="w-full h-full object-cover"
                    />
                    {centre.isFeatured && (
                      <Badge className="absolute top-4 left-4 bg-primary">विशेष</Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{centre.nameHindi}</h1>
                    <p className="text-muted-foreground">{centre.name}</p>
                  </div>
                  <Badge variant="outline">{typeLabels[centre.type]}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {centre.storeCount && (
                    <Badge variant="secondary" className="gap-1">
                      <Store size={12} />
                      {centre.storeCount}+ दुकानें
                    </Badge>
                  )}
                  
                  {centre.parkingAvailable && (
                    <Badge variant="secondary" className="gap-1">
                      <Car size={12} />
                      पार्किंग उपलब्ध
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground">{centre.descriptionHindi}</p>
                
                <div className="mt-6 pt-4 border-t">
                  <ShareButtons 
                    title={centre.nameHindi}
                    description={centre.descriptionHindi}
                  />
                </div>
              </CardContent>
            </Card>
            
            {centre.amenitiesHindi && centre.amenitiesHindi.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>सुविधाएं</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {centre.amenitiesHindi.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {centre.gallery && centre.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>फोटो गैलरी</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={centre.gallery} altPrefix={centre.nameHindi} />
                </CardContent>
              </Card>
            )}
            
            <ReviewsSection 
              reviews={mockReviews}
              entityName={centre.nameHindi}
            />
          </div>
          
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>संपर्क जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p>{centre.addressHindi}</p>
                    <p className="text-sm text-muted-foreground">{centre.city}, {centre.district}</p>
                  </div>
                </div>
                
                {centre.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <a href={`tel:${centre.phone}`} className="hover:text-primary">
                      {centre.phone}
                    </a>
                  </div>
                )}
                
                {centre.openingHours && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted-foreground" />
                    <span>{centre.openingHours}</span>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  {centre.phone && (
                    <Button className="w-full gap-2">
                      <Phone size={16} />
                      कॉल करें
                    </Button>
                  )}
                  {centre.mapLink && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={centre.mapLink} target="_blank" rel="noopener noreferrer">
                        <Navigation size={16} />
                        दिशा निर्देश
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>त्वरित जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">प्रकार</span>
                  <span className="font-medium">{typeLabels[centre.type]}</span>
                </div>
                {centre.storeCount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">दुकानें</span>
                    <span className="font-medium">{centre.storeCount}+</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">पार्किंग</span>
                  <span className="font-medium">{centre.parkingAvailable ? 'हाँ' : 'नहीं'}</span>
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

export default ShoppingDetail;
