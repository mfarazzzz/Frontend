"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import ListingCard from "@/components/ListingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRestaurants } from "@/hooks/useExtendedCMS";
import { Search } from "lucide-react";

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
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  const { data: restaurantsResponse, isLoading } = useRestaurants({ limit: 200 });
  const restaurants = restaurantsResponse?.data || [];
  
  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = search === '' || 
      r.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesPrice = priceFilter === 'all' || r.priceRange === priceFilter;
    const matchesCity = cityFilter === 'all' || r.city === cityFilter;
    return matchesSearch && matchesType && matchesPrice && matchesCity;
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
            name: "रेस्तरां - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी",
            description: "100+ रेस्तरां, कैफे, ढाबे और मिठाई की दुकानों की सूची",
            numberOfItems: filteredRestaurants.length,
            itemListElement: filteredRestaurants.slice(0, 20).map((restaurant, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Restaurant",
                name: restaurant.name,
                description: restaurant.description,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: restaurant.address,
                  addressLocality: restaurant.city,
                  addressRegion: restaurant.district,
                  addressCountry: "IN",
                },
                servesCuisine: restaurant.cuisine,
                priceRange: PRICE_LABELS[restaurant.priceRange],
                ...(restaurant.rating && {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: restaurant.rating,
                    reviewCount: restaurant.reviews || 0,
                  },
                }),
                ...(restaurant.phone && { telephone: restaurant.phone }),
                url: `https://rampurnews.com/food-lifestyle/restaurants/${restaurant.slug}`,
              },
            })),
          })}
        </script>
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">रेस्तरां और खाने की जगहें</h1>
            <p className="text-muted-foreground">
              रामपुर, बरेली, मुरादाबाद, रुद्रपुर और हल्द्वानी के 100+ बेहतरीन रेस्तरां, ढाबे, कैफे और मिठाई की दुकानें
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-4">
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
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="शहर चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी शहर</SelectItem>
                    <SelectItem value="Rampur">रामपुर</SelectItem>
                    <SelectItem value="Bareilly">बरेली</SelectItem>
                    <SelectItem value="Moradabad">मुरादाबाद</SelectItem>
                    <SelectItem value="Rudrapur">रुद्रपुर</SelectItem>
                    <SelectItem value="Haldwani">हल्द्वानी</SelectItem>
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
            <>
              <p className="text-sm text-muted-foreground mb-4">{filteredRestaurants.length} रेस्तरां मिले</p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants.map(restaurant => (
                  <ListingCard
                    key={restaurant.id}
                    title={restaurant.name}
                    titleHindi={restaurant.nameHindi}
                    slug={restaurant.slug}
                    basePath="/food-lifestyle/restaurants"
                    type={restaurant.type}
                    typeLabel={TYPE_LABELS[restaurant.type]}
                    address={restaurant.address}
                    addressHindi={`${restaurant.addressHindi}, ${restaurant.city}`}
                    phone={restaurant.phone}
                    rating={restaurant.rating}
                    reviews={restaurant.reviews}
                    image={restaurant.image}
                    description={restaurant.description}
                    descriptionHindi={restaurant.descriptionHindi}
                    priceRange={restaurant.priceRange}
                    openingHours={restaurant.openingHours}
                    badges={[
                      ...restaurant.cuisine.slice(0, 2).map(c => ({ label: c })),
                      ...(restaurant.isVeg ? [{ label: '🌱 शाकाहारी' }] : []),
                      ...(restaurant.hasDelivery ? [{ label: '🛵 डिलीवरी' }] : []),
                    ]}
                    isFeatured={restaurant.isFeatured}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
  );
};

export default RestaurantsPage;
