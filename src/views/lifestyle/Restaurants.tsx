"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import ListingCard from "@/components/ListingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRestaurants } from "@/hooks/useExtendedCMS";
import { Search, MapPin, Star, Utensils } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'रेस्तरां',
  cafe: 'कैफे',
  'street-food': 'स्ट्रीट फूड',
  'sweet-shop': 'मिठाई की दुकान',
  dhaba: 'ढाबा',
  'fine-dining': 'फाइन डाइनिंग',
};

const PRICE_LABELS: Record<string, string> = {
  budget: '₹ सस्ता',
  moderate: '₹₹ मध्यम',
  expensive: '₹₹₹ महंगा',
  luxury: '₹₹₹₹ लग्जरी',
};

const RestaurantsPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  
  const { data: restaurantsResponse, isLoading } = useRestaurants({ limit: 100 });
  const restaurants = restaurantsResponse?.data || [];
  
  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = search === '' || 
      r.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesPrice = priceFilter === 'all' || r.priceRange === priceFilter;
    return matchesSearch && matchesType && matchesPrice;
  });

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Food & Lifestyle', labelHindi: 'खान-पान और लाइफस्टाइल', path: '/food-lifestyle' },
    { label: 'Restaurants', labelHindi: 'रेस्तरां और खाने की जगहें', path: '/food-lifestyle/restaurants' },
  ];

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "रामपुर के रेस्तरां",
            itemListElement: filteredRestaurants.map((restaurant, index) => ({
              "@type": "Restaurant",
              position: index + 1,
              name: restaurant.nameHindi,
              address: restaurant.addressHindi,
              servesCuisine: restaurant.cuisine,
              priceRange: PRICE_LABELS[restaurant.priceRange],
              aggregateRating: restaurant.rating
                ? {
                    "@type": "AggregateRating",
                    ratingValue: restaurant.rating,
                    reviewCount: restaurant.reviews || 0,
                  }
                : undefined,
            })),
          })}
        </script>
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">रेस्तरां और खाने की जगहें</h1>
            <p className="text-muted-foreground">
              रामपुर के बेहतरीन रेस्तरां, ढाबे और खाने के ठिकानों की जानकारी
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="रेस्तरां या व्यंजन खोजें..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="प्रकार चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी प्रकार</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="बजट चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी बजट</SelectItem>
                    {Object.entries(PRICE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">लोड हो रहा है...</div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">कोई रेस्तरां नहीं मिला</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map(restaurant => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Utensils className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{restaurant.nameHindi}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{restaurant.name}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {TYPE_LABELS[restaurant.type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {PRICE_LABELS[restaurant.priceRange]}
                          </Badge>
                          {restaurant.isVeg && (
                            <Badge className="text-xs bg-green-100 text-green-700">शाकाहारी</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin size={14} />
                          <span className="truncate">{restaurant.addressHindi}</span>
                        </div>
                        {restaurant.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="font-medium">{restaurant.rating}</span>
                            {restaurant.reviews && (
                              <span className="text-muted-foreground">({restaurant.reviews} रिव्यू)</span>
                            )}
                          </div>
                        )}
                        {restaurant.specialties && restaurant.specialties.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            विशेषता: {restaurant.specialties.slice(0, 3).join(', ')}
                          </p>
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

export default RestaurantsPage;
