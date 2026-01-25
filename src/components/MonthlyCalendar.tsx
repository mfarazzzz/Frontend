import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCalendarEvents } from "@/hooks/useExtendedCMS";
import { Link } from "@/lib/router-compat";
import type { CalendarEvent } from "@/services/cms/extendedTypes";

interface MonthlyCalendarProps {
  title?: string;
  filterType?: 'exam' | 'result' | 'holiday' | 'event';
  showAllTypes?: boolean;
}

const HINDI_MONTHS = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const HINDI_DAYS = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

const TYPE_LABELS: Record<string, string> = {
  exam: 'परीक्षा',
  result: 'परिणाम',
  holiday: 'छुट्टी',
  event: 'कार्यक्रम',
};

const MonthlyCalendar = ({ title, filterType, showAllTypes = true }: MonthlyCalendarProps) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  
  const { data: events = [], isLoading } = useCalendarEvents(currentYear, currentMonth);
  
  const filteredEvents = filterType 
    ? events.filter(e => e.type === filterType) 
    : events;
  
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };
  
  // Calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get events for a specific day
  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === dateStr);
  };
  
  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {title || `${HINDI_MONTHS[currentMonth]} ${currentYear}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              आज
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span className="min-w-[120px] text-center font-medium">
              {HINDI_MONTHS[currentMonth]} {currentYear}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">लोड हो रहा है...</div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {HINDI_DAYS.map(day => (
                <div 
                  key={day} 
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div
                    key={index}
                    className={`min-h-[80px] md:min-h-[100px] p-1 border rounded-md ${
                      day ? 'bg-card' : 'bg-muted/30'
                    } ${isToday(day!) ? 'border-primary border-2' : 'border-border'}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-primary' : ''
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <Link
                              key={event.id}
                              to={event.link || '#'}
                              className="block"
                            >
                              <Badge 
                                variant="secondary"
                                className="w-full justify-start text-xs truncate cursor-pointer hover:opacity-80"
                                style={{ backgroundColor: event.color + '20', color: event.color }}
                              >
                                {event.titleHindi}
                              </Badge>
                            </Link>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} और
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            {showAllTypes && (
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                  <span className="text-sm text-muted-foreground">परीक्षा</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                  <span className="text-sm text-muted-foreground">परिणाम</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                  <span className="text-sm text-muted-foreground">राष्ट्रीय छुट्टी</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                  <span className="text-sm text-muted-foreground">त्योहार</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                  <span className="text-sm text-muted-foreground">कार्यक्रम</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyCalendar;
