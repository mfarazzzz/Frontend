"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import SEO from "@/components/SEO";
import ShareButtons from "@/components/ShareButtons";
import NewsCard from "@/components/education/NewsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "@/lib/router-compat";
import { useEducationNews, useEducationNewsBySlug } from "@/hooks/useExtendedCMS";
import { Calendar, ExternalLink } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  "board-news": "बोर्ड समाचार",
  "exam-news": "परीक्षा अपडेट",
  "result-news": "रिजल्ट न्यूज़",
  "admission-news": "एडमिशन",
  scholarship: "छात्रवृत्ति",
  "government-order": "सरकारी आदेश",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const convertPlainContentToHtml = (value: string): string => {
  const raw = (value || "").replace(/\r\n/g, "\n");
  if (!raw.trim()) return "";

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(raw);
  if (hasHtmlTags) return raw;

  let text = raw;

  text = text.replace(
    /!\[([^\]]*)]\(([^)]+)\)/g,
    (_, alt, url) =>
      `<figure class="my-4"><img src="${url.trim()}" alt="${escapeHtml(String(alt || "").trim())}" class="mx-auto rounded-lg" loading="lazy" decoding="async" /></figure>`,
  );

  text = text.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_, label, href) =>
      `<a href="${escapeHtml(String(href || "").trim())}" class="underline" target="_blank" rel="noopener noreferrer">${escapeHtml(String(label || "").trim())}</a>`,
  );

  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const paragraphs = text.split(/\n{2,}/);
  const html = paragraphs
    .map((p) => p.replace(/\n/g, "<br />"))
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  return html || `<p>${escapeHtml(raw)}</p>`;
};

export default function EducationNewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: news, isLoading } = useEducationNewsBySlug(slug);
  const { data: relatedData } = useEducationNews(news?.category ? { category: news.category, limit: 12, orderBy: "publishedAt", order: "desc" } : { limit: 1 });

  const title = news?.seoTitle?.trim() || news?.titleHindi || "शिक्षा समाचार";
  const description = news?.seoDescription?.trim() || news?.excerptHindi || news?.excerpt || "शिक्षा समाचार और अपडेट";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";
  const fallbackImage = `${siteUrl}/api/og?title=${encodeURIComponent(title)}`;
  const displayImage = news?.image || fallbackImage;

  const breadcrumbs = [
    { label: "Home", labelHindi: "होम", path: "/" },
    { label: "Education", labelHindi: "शिक्षा", path: "/education-jobs" },
    { label: "News", labelHindi: "समाचार", path: "/education-jobs/news" },
    { label: title, labelHindi: title, path: `/education-jobs/news/${slug}` },
  ];

  const related = (relatedData?.data ?? []).filter((n) => n.slug !== slug).slice(0, 4);
  const contentHtml = convertPlainContentToHtml(news?.contentHindi || news?.content || "");

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} canonical={`/education-jobs/news/${slug}`} ogType="article" />
      <Header />

      <main className="container py-6 space-y-6">
        <BreadcrumbNav items={breadcrumbs} />

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">लोड हो रहा है...</div>
        ) : !news ? (
          <div className="text-center py-10 text-muted-foreground">समाचार नहीं मिला</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                {displayImage ? (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img src={displayImage} alt={news.titleHindi || news.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                ) : null}
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {news.isBreaking ? (
                      <Badge variant="destructive" className="text-xs">
                        ब्रेकिंग
                      </Badge>
                    ) : null}
                    {news.isImportant && !news.isBreaking ? (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        महत्वपूर्ण
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[news.category] || news.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{news.titleHindi || news.title}</CardTitle>
                  {news.title ? <p className="text-sm text-muted-foreground">{news.title}</p> : null}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-3">
                    {news.publishedAt ? (
                      <span className="inline-flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(news.publishedAt).toLocaleDateString("hi-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    ) : null}
                    {news.source ? (
                      <span className="inline-flex items-center gap-2">
                        {news.source}
                        {news.sourceLink ? <ExternalLink size={14} /> : null}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {news.excerptHindi || news.excerpt ? (
                    <p className="text-muted-foreground">{news.excerptHindi || news.excerpt}</p>
                  ) : null}
                  {contentHtml ? (
                    <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                  ) : null}
                </CardContent>
              </Card>

              {related.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">संबंधित समाचार</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {related.map((item) => (
                      <NewsCard key={item.id} news={item} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <ShareButtons title={news.titleHindi || news.title} description={description} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
