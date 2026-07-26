"use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import ListingCard from "@/components/ListingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamousPlaces } from "@/hooks/useExtendedCMS";
import { Search, MapPin } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  historical: 'ऐतिहासिक',
  religious: 'धार्मिक',
  natural: 'प्राकृतिक',
  recreational: 'मनोरंजन',
  market: 'बाज़ार',
  landmark: 'लैंडमार्क',
  'food-hub': 'फ़ूड हब',
};

const PlacesPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const { data: placesResponse, isLoading } = useFamousPlaces({ limit: 200 });
  const places = placesResponse?.data || [];

  const filteredPlaces = places.filter(p => {
    const matchesSearch = search === '' ||
      p.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesCity = cityFilter === 'all' || p.city === cityFilter;
    return matchesSearch && matchesType && matchesCity;
  });

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Food & Lifestyle', labelHindi: 'खान-पान और लाइफस्टाइल', path: '/food-lifestyle' },
    { label: 'Famous Places', labelHindi: 'प्रसिद्ध स्थान', path: '/food-lifestyle/places' },
  ];

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "प्रसिद्ध स्थान - रामपुर, बरेली, मुरादाबाद, रुद्रपुर, हल्द्वानी",
            description: "50+ ऐतिहासिक, धार्मिक और दर्शनीय स्थलों की सूची",
            numberOfItems: filteredPlaces.length,
            itemListElement: filteredPlaces.slice(0, 20).map((place, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "TouristAttraction",
                name: place.name,
                description: place.description,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: place.address,
                  addressLocality: place.city,
                  addressRegion: place.district,
                  addressCountry: "IN",
                },
                ...(place.rating && { aggregateRating: { "@type": "AggregateRating", ratingValue: place.rating } }),
                url: `https://rampurnews.com/food-lifestyle/places/${place.slug}`,
              },
            })),
          })}
        </script>
        <Header />

        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              प्रसिद्ध स्थान
            </h1>
            <p className="text-muted-foreground">
              रामपुर, बरेली, मुरादाबाद, रुद्रपुर और हल्द्वानी के 50+ ऐतिहासिक, धार्मिक और दर्शनीय स्थल
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="स्थान खोजें..."
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
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">कोई स्थान नहीं मिला</div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{filteredPlaces.length} स्थान मिले</p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlaces.map(place => (
                  <ListingCard
                    key={place.id}
                    title={place.name}
                    titleHindi={place.nameHindi}
                    slug={place.slug}
                    basePath="/food-lifestyle/places"
                    type={place.type}
                    typeLabel={TYPE_LABELS[place.type]}
                    address={place.address}
                    addressHindi={`${place.addressHindi}, ${place.city}`}
                    rating={place.rating}
                    image={place.image}
                    description={place.description}
                    descriptionHindi={place.descriptionHindi}
                    openingHours={place.timings}
                    badges={[
                      ...(place.entryFee ? [{ label: `🎫 ${place.entryFee}` }] : []),
                      ...(place.bestTimeToVisit ? [{ label: `📅 ${place.bestTimeToVisit}` }] : []),
                    ]}
                    isFeatured={place.isFeatured}
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

export default PlacesPage;
