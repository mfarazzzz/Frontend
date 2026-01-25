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
import { MapPin, Phone, Star, IndianRupee, CheckCircle, Tag } from 'lucide-react';
import { useFashionStoreBySlug } from '@/hooks/useExtendedCMS';

const FashionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading } = useFashionStoreBySlug(slug || '');
  
  const typeLabels: Record<string, string> = {
    'clothing': 'कपड़े',
    'jewelry': 'ज्वेलरी',
    'footwear': 'जूते-चप्पल',
    'accessories': 'एक्सेसरीज़',
    'tailor': 'दर्जी',
    'boutique': 'बुटीक',
  };
  
  const categoryLabels: Record<string, string> = {
    'men': 'पुरुष',
    'women': 'महिला',
    'kids': 'बच्चे',
    'all': 'सभी',
  };
  
  const priceLabels: Record<string, string> = {
    'budget': 'सस्ता',
    'moderate': 'मध्यम',
    'expensive': 'महंगा',
    'luxury': 'लक्ज़री',
  };
  
  const mockReviews: Review[] = [
    {
      id: '1',
      authorName: 'अंजली गुप्ता',
      rating: 5,
      content: 'बहुत अच्छा कलेक्शन है। कीमत भी उचित है।',
      date: '2024-01-12',
      helpful: 8,
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
  
  if (!store) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">स्टोर नहीं मिला</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const breadcrumbs = [
    { label: 'Food & Lifestyle', labelHindi: 'खाना और जीवनशैली', path: '/food-lifestyle' },
    { label: 'Fashion', labelHindi: 'फैशन', path: '/food-lifestyle/fashion' },
    { label: store.name, labelHindi: store.nameHindi, path: `/food-lifestyle/fashion/${slug}` },
  ];
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    'name': store.name,
    'description': store.description,
    'image': store.image || store.gallery?.[0],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': store.address,
      'addressLocality': store.city,
      'addressRegion': store.district,
      'addressCountry': 'IN'
    },
    ...(store.phone && { 'telephone': store.phone }),
    ...(store.rating && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': store.rating,
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
                {store.image && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                    <img 
                      src={store.image} 
                      alt={store.nameHindi}
                      className="w-full h-full object-cover"
                    />
                    {store.isFeatured && (
                      <Badge className="absolute top-4 left-4 bg-primary">विशेष</Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{store.nameHindi}</h1>
                    <p className="text-muted-foreground">{store.name}</p>
                  </div>
                  <Badge variant="outline">{typeLabels[store.type]}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {store.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded">
                        <Star size={14} className="fill-white" />
                        <span className="font-medium">{store.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  
                  <Badge variant="secondary">
                    {categoryLabels[store.category]} के लिए
                  </Badge>
                  
                  <Badge variant="secondary" className="gap-1">
                    <IndianRupee size={12} />
                    {priceLabels[store.priceRange]}
                  </Badge>
                </div>
                
                {/* Brands */}
                {store.brands && store.brands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {store.brands.map((brand, i) => (
                      <Badge key={i} variant="outline">
                        <Tag size={12} className="mr-1" />
                        {brand}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-muted-foreground">{store.descriptionHindi}</p>
                
                <div className="mt-6 pt-4 border-t">
                  <ShareButtons 
                    title={store.nameHindi}
                    description={store.descriptionHindi}
                  />
                </div>
              </CardContent>
            </Card>
            
            {store.specialtiesHindi && store.specialtiesHindi.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>विशेषताएं</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {store.specialtiesHindi.map((specialty, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {store.gallery && store.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>फोटो गैलरी</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={store.gallery} altPrefix={store.nameHindi} />
                </CardContent>
              </Card>
            )}
            
            <ReviewsSection 
              reviews={mockReviews}
              averageRating={store.rating}
              entityName={store.nameHindi}
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
                    <p>{store.addressHindi}</p>
                    <p className="text-sm text-muted-foreground">{store.city}, {store.district}</p>
                  </div>
                </div>
                
                {store.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <a href={`tel:${store.phone}`} className="hover:text-primary">
                      {store.phone}
                    </a>
                  </div>
                )}
                
                <Button className="w-full gap-2">
                  <Phone size={16} />
                  कॉल करें
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
                  <span className="font-medium">{typeLabels[store.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">श्रेणी</span>
                  <span className="font-medium">{categoryLabels[store.category]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">मूल्य श्रेणी</span>
                  <span className="font-medium">{priceLabels[store.priceRange]}</span>
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

export default FashionDetail;
