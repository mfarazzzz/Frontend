"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams } from "@/lib/router-compat";
import { useResultBySlug } from "@/hooks/useExtendedCMS";
import { Calendar, Building2, ExternalLink } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  declared: "घोषित",
  expected: "अपेक्षित",
  upcoming: "आगामी",
};

export default function ResultDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: result, isLoading } = useResultBySlug(slug);

  const title = result?.titleHindi || "परिणाम विवरण";
  const description =
    result?.descriptionHindi || result?.description || "परिणाम की तारीख, लिंक और महत्वपूर्ण जानकारी।";

  const breadcrumbs = [
    { label: "Education & Jobs", labelHindi: "शिक्षा और नौकरियां", path: "/education-jobs" },
    { label: "Results", labelHindi: "रिजल्ट", path: "/education-jobs/results" },
    { label: title, labelHindi: title, path: `/education-jobs/results/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} canonical={`/education-jobs/results/${slug}`} ogType="article" />
      <Header />

      <main className="container py-6 space-y-6">
        <BreadcrumbNav items={breadcrumbs} />

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">लोड हो रहा है...</div>
        ) : !result ? (
          <div className="text-center py-10 text-muted-foreground">परिणाम नहीं मिला</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-2xl">{result.titleHindi}</CardTitle>
                      {result.title ? <p className="text-sm text-muted-foreground">{result.title}</p> : null}
                    </div>
                    {result.status ? (
                      <Badge>
                        {STATUS_LABELS[result.status] || result.status}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {result.organizationHindi ? (
                      <span className="inline-flex items-center gap-2">
                        <Building2 size={16} />
                        {result.organizationHindi}
                      </span>
                    ) : null}
                    {result.resultDate ? (
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(result.resultDate).toLocaleDateString("hi-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>

                  {result.descriptionHindi || result.description ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold">विवरण</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {result.descriptionHindi || result.description}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>परिणाम लिंक</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.resultLink ? (
                    <Button className="w-full gap-2" asChild>
                      <a href={result.resultLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} />
                        रिजल्ट देखें
                      </a>
                    </Button>
                  ) : null}
                  {!result.resultLink ? (
                    <div className="text-sm text-muted-foreground">कोई लिंक उपलब्ध नहीं है</div>
                  ) : null}
                </CardContent>
              </Card>

              <ShareButtons title={result.titleHindi || result.title} description={description} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
