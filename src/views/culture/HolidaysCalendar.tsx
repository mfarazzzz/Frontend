"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHolidays, useHolidaysByMonth } from "@/hooks/useExtendedCMS";
import { Calendar, Star, Moon, Flag } from "lucide-react";
import type { CMSHoliday } from "@/services/cms/extendedTypes";

const RELIGION_LABELS: Record<string, string> = {
  hindu: 'हिंदू',
  muslim: 'मुस्लिम',
  christian: 'ईसाई',
  sikh: 'सिख',
  buddhist: 'बौद्ध',
  jain: 'जैन',
  secular: 'धर्मनिरपेक्ष',
};

const TYPE_LABELS: Record<string, string> = {
  national: 'राष्ट्रीय',
  regional: 'क्षेत्रीय',
  religious: 'धार्मिक',
  cultural: 'सांस्कृतिक',
  bank: 'बैंक',
};

const TYPE_COLORS: Record<string, string> = {
  national: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  regional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  religious: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  cultural: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  bank: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const HolidayCard = ({ holiday }: { holiday: CMSHoliday }) => {
  const holidayDate = new Date(holiday.date);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = holidayDate.toLocaleDateString('hi-IN', options);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
            <span className="text-2xl font-bold">{holidayDate.getDate()}</span>
            <span className="text-xs">{holidayDate.toLocaleDateString('hi-IN', { month: 'short' })}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{holiday.nameHindi}</h3>
            <p className="text-sm text-muted-foreground mb-2">{holiday.name}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={TYPE_COLORS[holiday.type]}>
                {TYPE_LABELS[holiday.type]}
              </Badge>
              {holiday.religion && (
                <Badge variant="outline">{RELIGION_LABELS[holiday.religion]}</Badge>
              )}
              {holiday.isPublicHoliday && (
                <Badge variant="secondary">सार्वजनिक अवकाश</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {holiday.descriptionHindi}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HolidaysCalendarPage = () => {
  const today = new Date();
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { data: holidaysResponse, isLoading } = useHolidays({ limit: 100 });
  const allHolidays = holidaysResponse?.data || [];
  
  const filteredHolidays = selectedType === 'all' 
    ? allHolidays 
    : allHolidays.filter(h => h.type === selectedType);
  
  const upcomingHolidays = filteredHolidays
    .filter(h => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const breadcrumbs = [
    { label: 'Home', labelHindi: 'होम', path: '/' },
    { label: 'Religion & Culture', labelHindi: 'धर्म और संस्कृति', path: '/religion-culture' },
    { label: 'Holidays Calendar', labelHindi: 'छुट्टियों का कैलेंडर', path: '/religion-culture/holidays' },
  ];

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "भारतीय छुट्टियों का कैलेंडर 2026",
          "description": "2026 के सभी धार्मिक और राष्ट्रीय छुट्टियों की सूची",
          "itemListElement": upcomingHolidays.map((holiday, index) => ({
            "@type": "Event",
            "position": index + 1,
            "name": holiday.nameHindi,
            "startDate": holiday.date,
            "endDate": holiday.endDate || holiday.date,
            "description": holiday.descriptionHindi,
          })),
        })}
      </script>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <BreadcrumbNav items={breadcrumbs} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">छुट्टियों का कैलेंडर 2026</h1>
            <p className="text-muted-foreground">
              भारत के सभी धार्मिक त्योहार, राष्ट्रीय अवकाश और सार्वजनिक छुट्टियों की पूरी जानकारी
            </p>
          </div>

          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar size={16} />
                कैलेंडर दृश्य
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <Star size={16} />
                सूची दृश्य
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-6">
              <MonthlyCalendar 
                title="छुट्टियों का कैलेंडर" 
                filterType="holiday"
                showAllTypes={false}
              />
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType('all')}
                >
                  सभी
                </Badge>
                <Badge 
                  variant={selectedType === 'national' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType('national')}
                >
                  <Flag size={12} className="mr-1" />
                  राष्ट्रीय
                </Badge>
                <Badge 
                  variant={selectedType === 'religious' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType('religious')}
                >
                  <Moon size={12} className="mr-1" />
                  धार्मिक
                </Badge>
                <Badge 
                  variant={selectedType === 'cultural' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType('cultural')}
                >
                  सांस्कृतिक
                </Badge>
              </div>

              {/* Upcoming holidays */}
              <Card>
                <CardHeader>
                  <CardTitle>आगामी छुट्टियाँ</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>
                  ) : upcomingHolidays.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">कोई छुट्टी नहीं मिली</div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {upcomingHolidays.map(holiday => (
                        <HolidayCard key={holiday.id} holiday={holiday} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HolidaysCalendarPage;
