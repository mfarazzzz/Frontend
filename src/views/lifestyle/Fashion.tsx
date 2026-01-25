"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFashionStores } from "@/hooks/useExtendedCMS";
import { Search, MapPin, Star, Shirt } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  clothing: 'कपड़े',
  jewelry: 'ज्वेलरी',
  footwear: 'जूते-चप्पल',
  accessories: 'एक्सेसरीज',
  tailor: 'दर्जी',
  boutique: 'बुटीक',
};

const CATEGORY_LABELS: Record<string, string> = {
  men: 'पुरुष',
  women: 'महिला',
  kids: 'बच्चे',
  all: 'सभी के लिए',
};

const PRICE_LABELS: Record<string, string> = {
  budget: '₹ सस्ता',
  moderate: '₹₹ मध्यम',
  expensive: '₹₹₹ महंगा',
  luxury: '₹₹₹₹ लग्जरी',
};

const FashionPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { data: storesResponse, isLoading } = useFashionStores({ limit: 100 });
  const stores = storesResponse?.data || [];
  
  const filteredStores = stores.filter(s => {
    const matchesSearch = search === '' || 
      s.nameHindi.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter || s.category === 'all';
    return matchesSearch && matchesType && matchesCategory;
  });

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Food & Lifestyle', labelHindi: 'खान-पान और लाइफस्टाइल', path: '/food-lifestyle' },
    { label: 'Fashion', labelHindi: 'कपड़े और फैशन', path: '/food-lifestyle/fashion' },
  ];

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">कपड़े और फैशन</h1>
            <p className="text-muted-foreground">
              रामपुर की बेहतरीन कपड़े की दुकानें, बुटीक और फैशन स्टोर
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="दुकान खोजें..."
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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="श्रेणी चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी श्रेणी</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
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
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">कोई दुकान नहीं मिली</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map(store => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Shirt className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{store.nameHindi}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{store.name}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {TYPE_LABELS[store.type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[store.category]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {PRICE_LABELS[store.priceRange]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin size={14} />
                          <span className="truncate">{store.addressHindi}</span>
                        </div>
                        {store.rating && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="font-medium">{store.rating}</span>
                          </div>
                        )}
                        {store.brands && store.brands.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ब्रांड: {store.brands.slice(0, 3).join(', ')}
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

export default FashionPage;
