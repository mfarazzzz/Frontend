"use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Utensils, Shirt, ShoppingBag, MapPin, Calendar, Star,
  ArrowRight, Phone, Clock, TrendingUp, Sparkles, Building2
} from "lucide-react";
import { 
  mockRestaurants, mockFashionStores, mockShoppingCentres, 
  mockFamousPlaces, mockEvents 
} from "@/services/cms/extendedMockData";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

const TABS = [
  { id: 'all', label: 'सभी', icon: Sparkles },
  { id: 'restaurants', label: 'रेस्तरां', icon: Utensils },
  { id: 'fashion', label: 'फैशन', icon: Shirt },
  { id: 'shopping', label: 'शॉपिंग', icon: ShoppingBag },
  { id: 'places', label: 'प्रसिद्ध स्थान', icon: MapPin },
  { id: 'events', label: 'इवेंट्स', icon: Calendar },
];

const PRICE_LABELS: Record<string, string> = {
  budget: '₹',
  moderate: '₹₹',
  expensive: '₹₹₹',
  luxury: '₹₹₹₹',
};

const LifestyleHub = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredRestaurants = mockRestaurants.filter(r => r.isFeatured).slice(0, 4);
  const featuredStores = mockFashionStores.filter(s => s.isFeatured).slice(0, 4);
  const featuredMalls = mockShoppingCentres.filter(s => s.isFeatured).slice(0, 4);
  const featuredPlaces = mockFamousPlaces.filter(p => p.isFeatured).slice(0, 4);
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming').slice(0, 4);

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Food & Lifestyle', labelHindi: 'खान-पान और लाइफस्टाइल', path: '/food-lifestyle' },
  ];

  // Generic listing card for different types
  const ListingMicroCard = ({ 
    title, 
    subtitle, 
    address, 
    rating, 
    badge, 
    link, 
    icon: Icon,
    priceRange 
  }: {
    title: string;
    subtitle?: string;
    address: string;
    rating?: number;
    badge?: string;
    link: string;
    icon: React.ComponentType<{ className?: string }>;
    priceRange?: string;
  }) => (
    <Link to={link} className="block group">
      <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{address}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {rating && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {rating}
                  </span>
                )}
                {priceRange && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {PRICE_LABELS[priceRange]}
                  </Badge>
                )}
                {badge && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {badge}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const EventCard = ({ event }: { event: typeof mockEvents[0] }) => (
    <Link to={`/food-lifestyle/events/${event.slug}`} className="block group">
      <Card className="h-full hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold leading-none">
                {format(new Date(event.date), 'd')}
              </span>
              <span className="text-[10px] uppercase">
                {format(new Date(event.date), 'MMM', { locale: hi })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {event.titleHindi}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {event.venueHindi}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {event.isFree && (
                  <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    मुफ़्त
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px]">
                  {event.category === 'food' ? 'खाद्य' : 
                   event.category === 'cultural' ? 'सांस्कृतिक' : 
                   event.category === 'entertainment' ? 'मनोरंजन' : event.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-10">
            <div className="container mx-auto px-4">
              <BreadcrumbNav items={breadcrumbs} />
              <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">
                खान-पान और लाइफस्टाइल
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                रामपुर के बेहतरीन रेस्तरां, फैशन स्टोर, शॉपिंग मॉल, प्रसिद्ध स्थान और आगामी इवेंट्स - 
                अपने शहर को करीब से जानें
              </p>

              {/* Search */}
              <div className="mt-6 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="रेस्तरां, दुकान या स्थान खोजें..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Quick Nav */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
              {[
                { icon: Utensils, label: 'रेस्तरां', count: mockRestaurants.length, href: '/food-lifestyle/restaurants', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
                { icon: Shirt, label: 'फैशन स्टोर', count: mockFashionStores.length, href: '/food-lifestyle/fashion', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' },
                { icon: ShoppingBag, label: 'शॉपिंग सेंटर', count: mockShoppingCentres.length, href: '/food-lifestyle/shopping', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
                { icon: MapPin, label: 'प्रसिद्ध स्थान', count: mockFamousPlaces.length, href: '/food-lifestyle/places', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
                { icon: Calendar, label: 'इवेंट्स', count: mockEvents.length, href: '/food-lifestyle/events', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.label}
                    to={item.href}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-md transition-all hover:border-primary/50">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mb-2`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">
                          {item.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.count}+ स्थान</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Restaurants Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-500" />
                  लोकप्रिय रेस्तरां
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/food-lifestyle/restaurants">
                    सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredRestaurants.map(restaurant => (
                  <ListingMicroCard
                    key={restaurant.id}
                    title={restaurant.nameHindi}
                    subtitle={restaurant.name}
                    address={restaurant.addressHindi}
                    rating={restaurant.rating}
                    priceRange={restaurant.priceRange}
                    link={`/food-lifestyle/restaurants/${restaurant.slug}`}
                    icon={Utensils}
                  />
                ))}
              </div>
            </section>

            {/* Fashion Stores Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-pink-500" />
                  फैशन स्टोर
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/food-lifestyle/fashion">
                    सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredStores.map(store => (
                  <ListingMicroCard
                    key={store.id}
                    title={store.nameHindi}
                    subtitle={store.name}
                    address={store.addressHindi}
                    rating={store.rating}
                    priceRange={store.priceRange}
                    badge={store.type === 'clothing' ? 'कपड़े' : store.type === 'jewelry' ? 'आभूषण' : store.type}
                    link={`/food-lifestyle/fashion/${store.slug}`}
                    icon={Shirt}
                  />
                ))}
              </div>
            </section>

            {/* Shopping Centres Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                  शॉपिंग सेंटर
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/food-lifestyle/shopping">
                    सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredMalls.map(mall => (
                  <ListingMicroCard
                    key={mall.id}
                    title={mall.nameHindi}
                    subtitle={mall.name}
                    address={mall.addressHindi}
                    badge={mall.storeCount ? `${mall.storeCount}+ दुकानें` : undefined}
                    link={`/food-lifestyle/shopping/${mall.slug}`}
                    icon={Building2}
                  />
                ))}
              </div>
            </section>

            {/* Famous Places Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  प्रसिद्ध स्थान
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/food-lifestyle/places">
                    सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredPlaces.map(place => (
                  <ListingMicroCard
                    key={place.id}
                    title={place.nameHindi}
                    subtitle={place.name}
                    address={place.addressHindi}
                    rating={place.rating}
                    badge={place.type === 'historical' ? 'ऐतिहासिक' : 
                           place.type === 'religious' ? 'धार्मिक' : 
                           place.type === 'recreational' ? 'मनोरंजन' : place.type}
                    link={`/food-lifestyle/places/${place.slug}`}
                    icon={MapPin}
                  />
                ))}
              </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  आगामी इवेंट्स
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/food-lifestyle/events">
                    सभी देखें <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-6 md:p-8 text-center">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-80" />
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  अपना व्यवसाय यहाँ जोड़ें
                </h2>
                <p className="text-sm md:text-base opacity-90 max-w-xl mx-auto mb-4">
                  रामपुर न्यूज़ पर अपने रेस्तरां, दुकान या इवेंट को प्रमोट करें और 
                  हजारों स्थानीय ग्राहकों तक पहुंचें
                </p>
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  अभी संपर्क करें
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default LifestyleHub;
