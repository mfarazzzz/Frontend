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
import { 
  MapPin, Phone, Clock, Star, Utensils, IndianRupee, 
  Truck, Leaf, Navigation, CheckCircle
} from 'lucide-react';
import { useRestaurantBySlug } from '@/hooks/useExtendedCMS';

const RestaurantDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurant, isLoading } = useRestaurantBySlug(slug || '');
  
  const typeLabels: Record<string, string> = {
    'restaurant': 'रेस्तरां',
    'cafe': 'कैफे',
    'street-food': 'स्ट्रीट फूड',
    'sweet-shop': 'मिठाई',
    'dhaba': 'ढाबा',
    'fine-dining': 'फाइन डाइनिंग',
  };
  
  const priceLabels: Record<string, { label: string; icon: string }> = {
    'budget': { label: 'सस्ता', icon: '₹' },
    'moderate': { label: 'मध्यम', icon: '₹₹' },
    'expensive': { label: 'महंगा', icon: '₹₹₹' },
    'luxury': { label: 'लक्ज़री', icon: '₹₹₹₹' },
  };
  
  // Mock reviews
  const mockReviews: Review[] = [
    {
      id: '1',
      authorName: 'राहुल शर्मा',
      rating: 5,
      content: 'बहुत ही स्वादिष्ट खाना! सर्विस भी बहुत अच्छी थी। ज़रूर दोबारा आएंगे।',
      date: '2024-01-15',
      helpful: 12,
      verified: true,
    },
    {
      id: '2',
      authorName: 'प्रिया सिंह',
      rating: 4,
      content: 'अच्छा अनुभव रहा। खाना अच्छा था लेकिन थोड़ा इंतज़ार करना पड़ा।',
      date: '2024-01-10',
      helpful: 5,
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
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">रेस्तरां नहीं मिला</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const breadcrumbs = [
    { label: 'Food & Lifestyle', labelHindi: 'खाना और जीवनशैली', path: '/food-lifestyle' },
    { label: 'Restaurants', labelHindi: 'रेस्तरां', path: '/food-lifestyle/restaurants' },
    { label: restaurant.name, labelHindi: restaurant.nameHindi, path: `/food-lifestyle/restaurants/${slug}` },
  ];
  
  // JSON-LD Schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': restaurant.name,
    'description': restaurant.description,
    'image': restaurant.image || restaurant.gallery?.[0],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': restaurant.address,
      'addressLocality': restaurant.city,
      'addressRegion': restaurant.district,
      'addressCountry': 'IN'
    },
    ...(restaurant.phone && { 'telephone': restaurant.phone }),
    'servesCuisine': restaurant.cuisine,
    'priceRange': priceLabels[restaurant.priceRange]?.icon || '₹₹',
    ...(restaurant.rating && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': restaurant.rating,
        'reviewCount': restaurant.reviews || mockReviews.length
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardContent className="p-6">
                {restaurant.image && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.nameHindi}
                      className="w-full h-full object-cover"
                    />
                    {restaurant.isFeatured && (
                      <Badge className="absolute top-4 left-4 bg-primary">विशेष</Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{restaurant.nameHindi}</h1>
                    <p className="text-muted-foreground">{restaurant.name}</p>
                  </div>
                  <Badge variant="outline">{typeLabels[restaurant.type]}</Badge>
                </div>
                
                {/* Rating & Price */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {restaurant.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded">
                        <Star size={14} className="fill-white" />
                        <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {restaurant.reviews || 0} समीक्षाएं
                      </span>
                    </div>
                  )}
                  
                  <Badge variant="secondary" className="gap-1">
                    <IndianRupee size={12} />
                    {priceLabels[restaurant.priceRange]?.label}
                  </Badge>
                </div>
                
                {/* Cuisine Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.cuisine?.map((c, i) => (
                    <Badge key={i} variant="outline">
                      <Utensils size={12} className="mr-1" />
                      {c}
                    </Badge>
                  ))}
                </div>
                
                {/* Features */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {restaurant.isVeg && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Leaf size={16} />
                      <span className="text-sm">शुद्ध शाकाहारी</span>
                    </div>
                  )}
                  {restaurant.hasDelivery && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Truck size={16} />
                      <span className="text-sm">होम डिलीवरी</span>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground">{restaurant.descriptionHindi}</p>
                
                {/* Share Buttons */}
                <div className="mt-6 pt-4 border-t">
                  <ShareButtons 
                    title={restaurant.nameHindi}
                    description={restaurant.descriptionHindi}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Specialties */}
            {restaurant.specialtiesHindi && restaurant.specialtiesHindi.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>विशेष व्यंजन</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {restaurant.specialtiesHindi.map((specialty, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Gallery */}
            {restaurant.gallery && restaurant.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>फोटो गैलरी</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={restaurant.gallery} altPrefix={restaurant.nameHindi} />
                </CardContent>
              </Card>
            )}
            
            {/* Reviews */}
            <ReviewsSection 
              reviews={mockReviews}
              averageRating={restaurant.rating}
              totalReviews={restaurant.reviews}
              entityName={restaurant.nameHindi}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>संपर्क जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p>{restaurant.addressHindi}</p>
                    <p className="text-sm text-muted-foreground">{restaurant.city}, {restaurant.district}</p>
                  </div>
                </div>
                
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <a href={`tel:${restaurant.phone}`} className="hover:text-primary">
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                
                {restaurant.openingHours && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted-foreground" />
                    <span>{restaurant.openingHours}</span>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  <Button className="w-full gap-2">
                    <Phone size={16} />
                    कॉल करें
                  </Button>
                  {restaurant.mapLink && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={restaurant.mapLink} target="_blank" rel="noopener noreferrer">
                        <Navigation size={16} />
                        दिशा निर्देश
                      </a>
                    </Button>
                  )}
                </div>
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
                  <span className="font-medium">{typeLabels[restaurant.type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">मूल्य श्रेणी</span>
                  <span className="font-medium">{priceLabels[restaurant.priceRange]?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">शहर</span>
                  <span className="font-medium">{restaurant.city}</span>
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

export default RestaurantDetail;
