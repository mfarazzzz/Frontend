"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents, useUpcomingEvents } from "@/hooks/useExtendedCMS";
import { Search, MapPin, Calendar, Clock, Ticket, Users } from "lucide-react";
import type { CMSEvent } from "@/services/cms/extendedTypes";

const CATEGORY_LABELS: Record<string, string> = {
  cultural: 'सांस्कृतिक',
  religious: 'धार्मिक',
  sports: 'खेल',
  educational: 'शैक्षिक',
  business: 'व्यापार',
  entertainment: 'मनोरंजन',
  food: 'खाना',
  fashion: 'फैशन',
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'आगामी',
  ongoing: 'चल रहा है',
  completed: 'समाप्त',
  cancelled: 'रद्द',
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const EventCard = ({ event }: { event: CMSEvent }) => {
  const eventDate = new Date(event.date);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
            <span className="text-xl font-bold">{eventDate.getDate()}</span>
            <span className="text-xs">{eventDate.toLocaleDateString('hi-IN', { month: 'short' })}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{event.titleHindi}</h3>
            <p className="text-sm text-muted-foreground mb-2">{event.title}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={STATUS_COLORS[event.status]}>
                {STATUS_LABELS[event.status]}
              </Badge>
              <Badge variant="secondary">
                {CATEGORY_LABELS[event.category]}
              </Badge>
              {event.isFree && (
                <Badge className="bg-green-100 text-green-700">निःशुल्क</Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{event.venueHindi}, {event.city}</span>
              </div>
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{event.time}</span>
                </div>
              )}
              {event.ticketPrice && !event.isFree && (
                <div className="flex items-center gap-2">
                  <Ticket size={14} />
                  <span>{event.ticketPrice}</span>
                </div>
              )}
              {event.organizerHindi && (
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>आयोजक: {event.organizerHindi}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EventsPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('upcoming');
  
  const { data: eventsResponse, isLoading } = useEvents({ limit: 100 });
  const { data: upcomingEvents = [] } = useUpcomingEvents(5);
  
  const events = eventsResponse?.data || [];
  
  const filteredEvents = events.filter(e => {
    const matchesSearch = search === '' || 
      e.titleHindi.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venueHindi.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Food & Lifestyle', labelHindi: 'खान-पान और लाइफस्टाइल', path: '/food-lifestyle' },
    { label: 'Events', labelHindi: 'आगामी कार्यक्रम', path: '/food-lifestyle/events' },
  ];

  return (
      <div className="min-h-screen flex flex-col bg-background">
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "रामपुर के आगामी कार्यक्रम",
            itemListElement: upcomingEvents.map((event, index) => ({
              "@type": "Event",
              position: index + 1,
              name: event.titleHindi,
              startDate: event.date,
              endDate: event.endDate || event.date,
              location: {
                "@type": "Place",
                name: event.venueHindi,
                address: event.address,
              },
              organizer: event.organizerHindi,
              offers: event.ticketPrice
                ? {
                    "@type": "Offer",
                    price: event.ticketPrice,
                  }
                : undefined,
            })),
          })}
        </script>
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">आगामी कार्यक्रम</h1>
            <p className="text-muted-foreground">
              रामपुर और आसपास के क्षेत्र में होने वाले सभी कार्यक्रमों की जानकारी
            </p>
          </div>

          {/* Featured Events */}
          {upcomingEvents.length > 0 && (
            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  जल्द होने वाले कार्यक्रम
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {upcomingEvents.slice(0, 3).map(event => (
                    <Card key={event.id} className="flex-shrink-0 w-72">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                            <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
                            <span className="text-xs">{new Date(event.date).toLocaleDateString('hi-IN', { month: 'short' })}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{event.titleHindi}</h4>
                            <p className="text-xs text-muted-foreground">{event.venueHindi}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="कार्यक्रम खोजें..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="स्थिति चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सभी स्थिति</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
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
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">कोई कार्यक्रम नहीं मिला</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
  );
};

export default EventsPage;
