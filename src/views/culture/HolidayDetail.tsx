"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "@/lib/router-compat";
import { useHolidayBySlug } from "@/hooks/useExtendedCMS";
import { Calendar } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  national: "राष्ट्रीय",
  regional: "क्षेत्रीय",
  religious: "धार्मिक",
  cultural: "सांस्कृतिक",
  bank: "बैंक",
};

const RELIGION_LABELS: Record<string, string> = {
  hindu: "हिंदू",
  muslim: "मुस्लिम",
  christian: "ईसाई",
  sikh: "सिख",
  buddhist: "बौद्ध",
  jain: "जैन",
  secular: "धर्मनिरपेक्ष",
};

export default function HolidayDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: holiday, isLoading } = useHolidayBySlug(slug);

  const title = holiday?.nameHindi || "छुट्टी विवरण";
  const description =
    holiday?.descriptionHindi || holiday?.description || "छुट्टी की तारीख और जानकारी।";

  const breadcrumbs = [
    { label: "Religion & Culture", labelHindi: "धर्म और संस्कृति", path: "/religion-culture" },
    { label: "Holidays", labelHindi: "छुट्टियाँ", path: "/religion-culture/holidays" },
    { label: title, labelHindi: title, path: `/religion-culture/holidays/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} canonical={`/religion-culture/holidays/${slug}`} ogType="article" />
      <Header />

      <main className="container py-6 space-y-6">
        <BreadcrumbNav items={breadcrumbs} />

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">लोड हो रहा है...</div>
        ) : !holiday ? (
          <div className="text-center py-10 text-muted-foreground">छुट्टी नहीं मिली</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{holiday.nameHindi}</CardTitle>
                  {holiday.name ? <p className="text-sm text-muted-foreground">{holiday.name}</p> : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{TYPE_LABELS[holiday.type] || holiday.type}</Badge>
                    {holiday.religion ? (
                      <Badge variant="outline">{RELIGION_LABELS[holiday.religion] || holiday.religion}</Badge>
                    ) : null}
                    {holiday.isPublicHoliday ? <Badge>सार्वजनिक अवकाश</Badge> : null}
                  </div>

                  {holiday.date ? (
                    <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(holiday.date).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {holiday.endDate && holiday.endDate !== holiday.date ? (
                        <>
                          {" "}
                          -{" "}
                          {new Date(holiday.endDate).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {holiday.descriptionHindi || holiday.description ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold">विवरण</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {holiday.descriptionHindi || holiday.description}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <ShareButtons title={holiday.nameHindi || holiday.name} description={description} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
