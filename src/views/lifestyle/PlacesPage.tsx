"use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockFamousPlaces } from "@/services/cms/extendedMockData";
import { Search, MapPin, Star, Clock, Ticket } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  historical: 'ऐतिहासिक',
  religious: 'धार्मिक',
  recreational: 'मनोरंजन',
  market: 'बाज़ार',
  landmark: 'लैंडमार्क',
  'food-hub': 'फ़ूड हब',
};

const PlacesPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredPlaces = mockFamousPlaces.filter(p => {
    const matchesSearch = search === '' ||
      p.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
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
            name: "रामपुर के प्रसिद्ध स्थान",
            itemListElement: filteredPlaces.map((place, index) => ({
              "@type": "TouristAttraction",
              position: index + 1,
              name: place.nameHindi,
              address: place.addressHindi,
              description: place.descriptionHindi,
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
              रामपुर के ऐतिहासिक, धार्मिक और दर्शनीय स्थलों की जानकारी
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">कोई स्थान नहीं मिला</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlaces.map(place => (
                <Card key={place.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[place.type]}
                      </Badge>
                      {place.isFeatured && (
                        <Badge className="text-xs bg-amber-100 text-amber-700">
                          लोकप्रिय
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {place.nameHindi}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{place.name}</p>
                    <p className="text-sm mb-3 line-clamp-2">{place.descriptionHindi}</p>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{place.addressHindi}</span>
                      </div>
                      {place.timings && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{place.timings}</span>
                        </div>
                      )}
                      {place.entryFee && (
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          <span>प्रवेश: {place.entryFee}</span>
                        </div>
                      )}
                      {place.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{place.rating}</span>
                        </div>
                      )}
                    </div>

                    {place.history && (
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t line-clamp-2">
                        {place.historyHindi}
                      </p>
                    )}
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

export default PlacesPage;
