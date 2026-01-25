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
import { MapPin, Clock, Star, IndianRupee, Calendar, Navigation, History } from 'lucide-react';
import { useFamousPlaceBySlug } from '@/hooks/useExtendedCMS';

const PlaceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: place, isLoading } = useFamousPlaceBySlug(slug || '');
  
  const typeLabels: Record<string, string> = {
    'historical': 'ऐतिहासिक',
    'religious': 'धार्मिक',
    'recreational': 'मनोरंजन',
    'market': 'बाज़ार',
    'landmark': 'लैंडमार्क',
    'food-hub': 'फूड हब',
  };
  
  const mockReviews: Review[] = [
    {
      id: '1',
      authorName: 'संजय वर्मा',
      rating: 5,
      content: 'रामपुर की शान! ऐतिहासिक महत्व वाली जगह। ज़रूर जाएं।',
      date: '2024-01-05',
      helpful: 15,
      verified: true,
    },
    {
      id: '2',
      authorName: 'नेहा राज',
      rating: 4,
      content: 'बहुत सुंदर जगह है। फोटोग्राफी के लिए परफेक्ट।',
      date: '2024-01-02',
      helpful: 8,
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
  
  if (!place) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">स्थान नहीं मिला</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const breadcrumbs = [
    { label: 'Food & Lifestyle', labelHindi: 'खाना और जीवनशैली', path: '/food-lifestyle' },
    { label: 'Places', labelHindi: 'प्रसिद्ध स्थान', path: '/food-lifestyle/places' },
    { label: place.name, labelHindi: place.nameHindi, path: `/food-lifestyle/places/${slug}` },
  ];
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': place.type === 'religious' ? 'PlaceOfWorship' : 'TouristAttraction',
    'name': place.name,
    'description': place.description,
    'image': place.image || place.gallery?.[0],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': place.address,
      'addressLocality': place.city,
      'addressRegion': place.district,
      'addressCountry': 'IN'
    },
    ...(place.rating && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': place.rating,
        'reviewCount': mockReviews.length
      }
    })
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
                {place.image && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                    <img 
                      src={place.image} 
                      alt={place.nameHindi}
                      className="w-full h-full object-cover"
                    />
                    {place.isFeatured && (
                      <Badge className="absolute top-4 left-4 bg-primary">विशेष</Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{place.nameHindi}</h1>
                    <p className="text-muted-foreground">{place.name}</p>
                  </div>
                  <Badge variant="outline">{typeLabels[place.type]}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {place.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded">
                        <Star size={14} className="fill-white" />
                        <span className="font-medium">{place.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground">{place.descriptionHindi}</p>
                
                <div className="mt-6 pt-4 border-t">
                  <ShareButtons 
                    title={place.nameHindi}
                    description={place.descriptionHindi}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* History Section */}
            {place.historyHindi && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History size={20} />
                    इतिहास
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{place.historyHindi}</p>
                </CardContent>
              </Card>
            )}
            
            {place.gallery && place.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>फोटो गैलरी</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={place.gallery} altPrefix={place.nameHindi} />
                </CardContent>
              </Card>
            )}
            
            <ReviewsSection 
              reviews={mockReviews}
              averageRating={place.rating}
              entityName={place.nameHindi}
            />
          </div>
          
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>विज़िट जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p>{place.addressHindi}</p>
                    <p className="text-sm text-muted-foreground">{place.city}, {place.district}</p>
                  </div>
                </div>
                
                {place.timings && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted-foreground" />
                    <span>{place.timings}</span>
                  </div>
                )}
                
                {place.entryFee && (
                  <div className="flex items-center gap-3">
                    <IndianRupee size={18} className="text-muted-foreground" />
                    <span>प्रवेश: {place.entryFee}</span>
                  </div>
                )}
                
                {place.bestTimeToVisit && (
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-muted-foreground" />
                    <span>बेस्ट टाइम: {place.bestTimeToVisit}</span>
                  </div>
                )}
                
                <Button variant="outline" className="w-full gap-2">
                  <Navigation size={16} />
                  दिशा निर्देश
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>त्वरित जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">प्रकार</span>
                  <span className="font-medium">{typeLabels[place.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">शहर</span>
                  <span className="font-medium">{place.city}</span>
                </div>
                {place.entryFee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">प्रवेश शुल्क</span>
                    <span className="font-medium">{place.entryFee}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlaceDetail;
