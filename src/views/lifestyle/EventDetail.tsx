"use client";
import { useParams } from '@/lib/router-compat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import ShareButtons from '@/components/ShareButtons';
import ImageGallery from '@/components/ImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Calendar, Clock, IndianRupee, Users, 
  ExternalLink, Navigation, Ticket
} from 'lucide-react';
import { useEventBySlug } from '@/hooks/useExtendedCMS';

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading } = useEventBySlug(slug || '');
  
  const categoryLabels: Record<string, string> = {
    'cultural': 'सांस्कृतिक',
    'religious': 'धार्मिक',
    'sports': 'खेल',
    'educational': 'शैक्षिक',
    'business': 'व्यापार',
    'entertainment': 'मनोरंजन',
    'food': 'खाना',
    'fashion': 'फैशन',
  };
  
  const statusLabels: Record<string, { label: string; className: string }> = {
    'upcoming': { label: 'आगामी', className: 'bg-blue-500' },
    'ongoing': { label: 'चल रहा है', className: 'bg-green-500' },
    'completed': { label: 'समाप्त', className: 'bg-gray-500' },
    'cancelled': { label: 'रद्द', className: 'bg-red-500' },
  };
  
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
  
  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12 text-muted-foreground">इवेंट नहीं मिला</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const breadcrumbs = [
    { label: 'Food & Lifestyle', labelHindi: 'खाना और जीवनशैली', path: '/food-lifestyle' },
    { label: 'Events', labelHindi: 'कार्यक्रम', path: '/food-lifestyle/events' },
    { label: event.title, labelHindi: event.titleHindi, path: `/food-lifestyle/events/${slug}` },
  ];
  
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.title,
    'description': event.description,
    'image': event.image,
    'startDate': event.date,
    ...(event.endDate && { 'endDate': event.endDate }),
    'location': {
      '@type': 'Place',
      'name': event.venue,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': event.address,
        'addressLocality': event.city,
        'addressRegion': event.district,
        'addressCountry': 'IN'
      }
    },
    'organizer': event.organizer ? {
      '@type': 'Organization',
      'name': event.organizer
    } : undefined,
    ...(event.ticketPrice && { 
      'offers': {
        '@type': 'Offer',
        'price': event.ticketPrice,
        'priceCurrency': 'INR'
      }
    })
  };
  
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

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
                {event.image && (
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                    <img 
                      src={event.image} 
                      alt={event.titleHindi}
                      className="w-full h-full object-cover"
                    />
                    <Badge className={`absolute top-4 left-4 ${statusLabels[event.status]?.className}`}>
                      {statusLabels[event.status]?.label}
                    </Badge>
                    {event.isFeatured && (
                      <Badge className="absolute top-4 right-4 bg-primary">विशेष</Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{event.titleHindi}</h1>
                    <p className="text-muted-foreground">{event.title}</p>
                  </div>
                  <Badge variant="outline">{categoryLabels[event.category]}</Badge>
                </div>
                
                {/* Event Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Calendar size={20} className="text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">तारीख</span>
                    <span className="font-medium text-sm text-center">
                      {eventDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  {event.time && (
                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                      <Clock size={20} className="text-primary mb-1" />
                      <span className="text-xs text-muted-foreground">समय</span>
                      <span className="font-medium text-sm">{event.time}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <MapPin size={20} className="text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">स्थान</span>
                    <span className="font-medium text-sm text-center">{event.city}</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                    <Ticket size={20} className="text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">प्रवेश</span>
                    <span className="font-medium text-sm">
                      {event.isFree ? 'निशुल्क' : event.ticketPrice || 'सशुल्क'}
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{event.descriptionHindi}</p>
                
                {/* Organizer */}
                {event.organizerHindi && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">आयोजक:</span>{' '}
                        <span className="font-medium">{event.organizerHindi}</span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t">
                  <ShareButtons 
                    title={event.titleHindi}
                    description={event.descriptionHindi}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>इवेंट विवरण</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{event.venueHindi}</p>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                    <p className="text-sm text-muted-foreground">{event.city}, {event.district}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <span>
                    {eventDate.toLocaleDateString('hi-IN', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                {event.time && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                )}
                
                {!event.isFree && event.ticketPrice && (
                  <div className="flex items-center gap-3">
                    <IndianRupee size={18} className="text-muted-foreground" />
                    <span>टिकट: {event.ticketPrice}</span>
                  </div>
                )}
                
                <div className="space-y-2 pt-2">
                  {isUpcoming && event.registrationLink && (
                    <Button className="w-full gap-2" asChild>
                      <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} />
                        रजिस्टर करें
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full gap-2">
                    <Navigation size={16} />
                    दिशा निर्देश
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>त्वरित जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">श्रेणी</span>
                  <span className="font-medium">{categoryLabels[event.category]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">स्थिति</span>
                  <Badge className={statusLabels[event.status]?.className}>
                    {statusLabels[event.status]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">प्रवेश</span>
                  <span className="font-medium">{event.isFree ? 'निशुल्क' : 'सशुल्क'}</span>
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

export default EventDetail;
