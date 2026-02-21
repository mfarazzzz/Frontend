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
import { useExamBySlug } from "@/hooks/useExtendedCMS";
import { Calendar, Clock, Building2, ExternalLink, FileText } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  upcoming: "आगामी",
  ongoing: "चल रही",
  completed: "समाप्त",
};

const STATUS_CLASS: Record<string, string> = {
  upcoming: "bg-blue-500",
  ongoing: "bg-green-500",
  completed: "bg-gray-500",
};

export default function ExamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: exam, isLoading } = useExamBySlug(slug);

  const title = exam?.seoTitle?.trim() || exam?.titleHindi || "परीक्षा विवरण";
  const description =
    exam?.seoDescription?.trim() ||
    exam?.descriptionHindi ||
    exam?.description ||
    "परीक्षा की महत्वपूर्ण तारीखें, पात्रता और आधिकारिक लिंक।";

  const breadcrumbs = [
    { label: "Education & Jobs", labelHindi: "शिक्षा और नौकरियां", path: "/education-jobs" },
    { label: "Exam Calendar", labelHindi: "परीक्षा कैलेंडर", path: "/education-jobs/exams" },
    { label: title, labelHindi: title, path: `/education-jobs/exams/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} canonical={`/education-jobs/exams/${slug}`} ogType="article" />
      <Header />

      <main className="container py-6 space-y-6">
        <BreadcrumbNav items={breadcrumbs} />

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">लोड हो रहा है...</div>
        ) : !exam ? (
          <div className="text-center py-10 text-muted-foreground">परीक्षा नहीं मिली</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-2xl">{exam.titleHindi}</CardTitle>
                      {exam.title ? <p className="text-sm text-muted-foreground">{exam.title}</p> : null}
                    </div>
                    {exam.examStatus ? (
                      <Badge className={STATUS_CLASS[exam.examStatus] || "bg-gray-500"}>
                        {STATUS_LABELS[exam.examStatus] || exam.examStatus}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {exam.organizationHindi ? (
                      <span className="inline-flex items-center gap-2">
                        <Building2 size={16} />
                        {exam.organizationHindi}
                      </span>
                    ) : null}
                    {exam.examDate ? (
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(exam.examDate).toLocaleDateString("hi-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                    {exam.lastUpdated ? (
                      <span className="inline-flex items-center gap-2">
                        <Clock size={16} />
                        अपडेट:{" "}
                        {new Date(exam.lastUpdated).toLocaleDateString("hi-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                  </div>

                  {exam.descriptionHindi || exam.description ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold">विवरण</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {exam.descriptionHindi || exam.description}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {exam.eligibilityHindi || exam.eligibility ? (
                <Card>
                  <CardHeader>
                    <CardTitle>पात्रता</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground whitespace-pre-line">
                    {exam.eligibilityHindi || exam.eligibility}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>महत्वपूर्ण लिंक</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exam.officialWebsite ? (
                    <Button className="w-full gap-2" asChild>
                      <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} />
                        ऑफिशियल वेबसाइट
                      </a>
                    </Button>
                  ) : null}
                  {exam.applicationLink ? (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={exam.applicationLink} target="_blank" rel="noopener noreferrer">
                        <FileText size={16} />
                        आवेदन लिंक
                      </a>
                    </Button>
                  ) : null}
                  {!exam.officialWebsite && !exam.applicationLink ? (
                    <div className="text-sm text-muted-foreground">कोई लिंक उपलब्ध नहीं है</div>
                  ) : null}
                </CardContent>
              </Card>

              <ShareButtons title={exam.titleHindi || exam.title} description={description} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
