"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShoppingCentres, useFamousPlaces } from "@/hooks/useExtendedCMS";
import { Search, MapPin, Store, Clock, Car, Landmark } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  mall: 'मॉल',
  market: 'मार्केट',
  bazaar: 'बाज़ार',
  complex: 'कॉम्प्लेक्स',
  plaza: 'प्लाज़ा',
};

const PLACE_TYPE_LABELS: Record<string, string> = {
  historical: 'ऐतिहासिक',
  religious: 'धार्मिक',
  recreational: 'मनोरंजन',
  market: 'बाजार',
  landmark: 'लैंडमार्क',
  'food-hub': 'खाने का हब',
};

const ShoppingPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { data: centresResponse, isLoading: loadingCentres } = useShoppingCentres({ limit: 100 });
  const { data: placesResponse, isLoading: loadingPlaces } = useFamousPlaces({ limit: 100 });
  
  const shoppingCentres = centresResponse?.data || [];
  const famousPlaces = placesResponse?.data || [];
  
  const filteredCentres = shoppingCentres.filter(c => {
    const matchesSearch = search === '' || 
      c.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredPlaces = famousPlaces.filter(p => {
    const matchesSearch = search === '' || 
      p.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Food & Lifestyle', labelHindi: 'खान-पान और लाइफस्टाइल', path: '/food-lifestyle' },
    { label: 'Shopping', labelHindi: 'शॉपिंग सेंटर और प्रसिद्ध स्थान', path: '/food-lifestyle/shopping' },
  ];

  const isLoading = loadingCentres || loadingPlaces;

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">शॉपिंग सेंटर और प्रसिद्ध स्थान</h1>
            <p className="text-muted-foreground">
              रामपुर के मॉल, बाजार और प्रमुख दर्शनीय स्थल
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

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">लोड हो रहा है...</div>
          ) : (
            <div className="space-y-8">
              {/* Shopping Centres */}
              {filteredCentres.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    शॉपिंग सेंटर
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCentres.map(centre => (
                      <Card key={centre.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Store className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{centre.nameHindi}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{centre.name}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {TYPE_LABELS[centre.type]}
                                </Badge>
                                {centre.storeCount && (
                                  <Badge variant="outline" className="text-xs">
                                    {centre.storeCount}+ दुकानें
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <MapPin size={14} />
                                <span className="truncate">{centre.addressHindi}</span>
                              </div>
                              {centre.openingHours && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                  <Clock size={14} />
                                  <span>{centre.openingHours}</span>
                                </div>
                              )}
                              {centre.parkingAvailable && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <Car size={14} />
                                  <span>पार्किंग उपलब्ध</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Famous Places */}
              {filteredPlaces.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Landmark className="h-5 w-5" />
                    प्रसिद्ध स्थान
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlaces.map(place => (
                      <Card key={place.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Landmark className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{place.nameHindi}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{place.name}</p>
                              <Badge variant="secondary" className="text-xs mb-2">
                                {PLACE_TYPE_LABELS[place.type]}
                              </Badge>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <MapPin size={14} />
                                <span className="truncate">{place.addressHindi}</span>
                              </div>
                              {place.timings && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock size={14} />
                                  <span>{place.timings}</span>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {place.descriptionHindi}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {filteredCentres.length === 0 && filteredPlaces.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">कोई स्थान नहीं मिला</div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
  );
};

export default ShoppingPage;
