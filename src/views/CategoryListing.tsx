"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryHeader from "@/components/CategoryHeader";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import SEO from "@/components/SEO";
import { getCategoryBySlug, type Category } from "@/data/categories";
import { useArticles } from "@/hooks/useCMS";

const SITE_URL = "https://rampurnews.com";
const PAGE_SIZE = 24;

const buildCategoryIntro = (category: Category) => {
  const name = category.titleHindi;
  const english = category.titleEnglish;
  return `${name} (${english}) सेक्शन में आप रामपुर और उत्तर प्रदेश से जुड़े सबसे भरोसेमंद और समय पर अपडेट पढ़ते हैं। यहां स्थानीय प्रशासन, विकास, कानून व्यवस्था, शिक्षा, रोजगार, स्वास्थ्य, खेल और संस्कृति से संबंधित खबरें नियमित रूप से प्रकाशित होती हैं। हमारी संपादकीय टीम तथ्य-आधारित रिपोर्टिंग, संदर्भ और पृष्ठभूमि के साथ समाचार प्रस्तुत करती है ताकि पाठक आसानी से विषय की समझ बना सकें। इस पेज पर आपको ताज़ा खबरें, ग्राउंड रिपोर्ट, इंटरव्यू, विश्लेषण और उपयोगी सूचनाएं मिलेंगी जो दैनिक जीवन से जुड़ी हैं। हर खबर को आसान भाषा में संक्षिप्त और स्पष्ट रूप से प्रकाशित किया जाता है ताकि पाठक जल्दी निर्णय ले सकें। हम महत्वपूर्ण घोषणाओं, सार्वजनिक सेवाओं और सामुदायिक गतिविधियों को भी कवर करते हैं। यदि आप इस श्रेणी की सभी नई अपडेट्स सबसे पहले पढ़ना चाहते हैं, तो इस पेज को नियमित रूप से देखें और साझा करें।`;
};

const toPageHref = (basePath: string, page: number) =>
  page <= 1 ? basePath : `${basePath}?page=${page}`;

const CategoryListing = ({ categorySlug }: { categorySlug: string }) => {
  const category = getCategoryBySlug(categorySlug);
  const searchParams = useSearchParams();
  const page = useMemo(() => {
    const raw = Number.parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  const offset = (page - 1) * PAGE_SIZE;
  const { data, isLoading } = useArticles({
    category: categorySlug,
    limit: PAGE_SIZE,
    offset,
    orderBy: "publishedDate",
    order: "desc",
    status: "published",
  });

  const news = data?.data || [];
  const total = typeof data?.total === "number" ? data.total : news.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const basePath = category?.path || `/${categorySlug}`;
  const canonical = `${SITE_URL}${basePath}`;
  const introText = category ? buildCategoryIntro(category) : "";

  useEffect(() => {
    const head = document.head;
    const setLink = (rel: "prev" | "next", href?: string) => {
      const existing = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!href) {
        if (existing) existing.remove();
        return;
      }
      const link = existing || document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (!existing) head.appendChild(link);
    };

    const prevHref = page > 1 ? `${SITE_URL}${toPageHref(basePath, page - 1)}` : undefined;
    const nextHref = page < totalPages ? `${SITE_URL}${toPageHref(basePath, page + 1)}` : undefined;
    setLink("prev", prevHref);
    setLink("next", nextHref);
  }, [basePath, page, totalPages]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6">
          <div className="text-center py-12">श्रेणी नहीं मिली</div>
        </main>
        <Footer />
      </div>
    );
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.titleHindi} समाचार`,
    description: introText,
    url: canonical,
    inLanguage: "hi-IN",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: news.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/${category.slug}/${article.slug}`,
        name: article.title,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: category.titleHindi, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${category.titleHindi} समाचार`}
        description={category.description}
        canonical={category.path}
        ogType="website"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header />

      <main className="container py-6">
        <CategoryHeader category={category} />
        <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground mb-6">
          <p>{introText}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="text-center py-12">लोड हो रहा है...</div>
            ) : news.length === 0 ? (
              <div className="text-center py-12">इस श्रेणी में कोई समाचार नहीं मिला</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-8">
                <div className="text-sm text-muted-foreground">
                  पेज {page} / {totalPages}
                </div>
                <div className="flex items-center gap-3">
                  {page > 1 ? (
                    <Link
                      href={toPageHref(basePath, page - 1)}
                      className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
                      prefetch={false}
                    >
                      पिछला
                    </Link>
                  ) : null}
                  {page < totalPages ? (
                    <Link
                      href={toPageHref(basePath, page + 1)}
                      className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
                      prefetch={false}
                    >
                      अगला
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryListing;
