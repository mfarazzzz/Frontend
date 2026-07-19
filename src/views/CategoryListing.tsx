"use client";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryHeader from "@/components/CategoryHeader";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import AdSlotLazy from "@/components/AdSlotLazy";
import { getCategoryBySlug, type Category } from "@/data/categories";
import { CATEGORY_PAGE_SIZE, SITE_URL } from "@/lib/constants";
import type { CMSArticle, PaginatedResponse } from "@/services/cms";

const buildCategoryIntro = (category: Category) => {
  const name = category.titleHindi;
  const english = category.titleEnglish;
  return `${name} (${english}) सेक्शन में आप रामपुर और उत्तर प्रदेश से जुड़े सबसे भरोसेमंद और समय पर अपडेट पढ़ते हैं। यहां स्थानीय प्रशासन, विकास, कानून व्यवस्था, शिक्षा, रोजगार, स्वास्थ्य, खेल और संस्कृति से संबंधित खबरें नियमित रूप से प्रकाशित होती हैं।`;
};

const toPageHref = (basePath: string, page: number) =>
  page <= 1 ? basePath : `${basePath}?page=${page}`;

const CategoryListingInner = ({ 
  categorySlug, 
  initialArticles 
}: { 
  categorySlug: string;
  initialArticles?: PaginatedResponse<CMSArticle>;
}) => {
  const category = getCategoryBySlug(categorySlug);
  const searchParams = useSearchParams();
  const page = useMemo(() => {
    const raw = Number.parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  // Use server-provided data directly — no client-side refetch that breaks category filtering
  const [articles, setArticles] = useState<PaginatedResponse<CMSArticle> | undefined>(initialArticles);
  const [isLoading, setIsLoading] = useState(!initialArticles);

  // Only fetch client-side when navigating to a different page (pagination)
  const fetchPage = useCallback(async (pageNum: number) => {
    if (pageNum === 1 && initialArticles) {
      setArticles(initialArticles);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category: categorySlug,
        page: String(pageNum),
        pageSize: String(CATEGORY_PAGE_SIZE),
      });
      const res = await fetch(`/api/category-articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error("[CategoryListing] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, initialArticles]);

  useEffect(() => {
    if (page > 1 || !initialArticles) {
      fetchPage(page);
    }
  }, [page, fetchPage, initialArticles]);

  const news = articles?.data || [];
  const total = typeof articles?.total === "number" ? articles.total : news.length;
  const totalPages = Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE));

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

  // Split articles for category layout: hero + grid + list
  const heroArticle = news[0];
  const gridArticles = news.slice(1, 7);
  const listArticles = news.slice(7);

  return (
    <div className="min-h-screen bg-background">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-24" />
                ))}
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-lg text-muted-foreground">इस श्रेणी में अभी कोई समाचार उपलब्ध नहीं है</p>
                <p className="text-sm text-muted-foreground">कृपया बाद में पुनः देखें या अन्य श्रेणियां देखें</p>
                <Link href="/" className="inline-block mt-4 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors">
                  होम पेज पर जाएं
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero article for category */}
                {heroArticle && (
                  <section>
                    <NewsCard article={heroArticle} variant="featured" imagePriority />
                  </section>
                )}

                {/* Grid section */}
                {gridArticles.length > 0 && (
                  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gridArticles.map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </section>
                )}

                {/* Ad between grid and list */}
                {listArticles.length > 0 && (
                  <AdSlotLazy placement="infeed" />
                )}

                {/* Remaining articles as compact list */}
                {listArticles.length > 0 && (
                  <section className="space-y-1">
                    {listArticles.map((article) => (
                      <NewsCard key={article.id} article={article} variant="horizontal" />
                    ))}
                  </section>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border" aria-label="पेजिनेशन">
                <div className="text-sm text-muted-foreground">
                  पेज {page} / {totalPages} ({total} समाचार)
                </div>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Link
                      href={toPageHref(basePath, page - 1)}
                      className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                      prefetch={false}
                    >
                      ← पिछला
                    </Link>
                  )}
                  {/* Page numbers (show max 5) */}
                  {(() => {
                    const start = Math.max(1, page - 2);
                    const end = Math.min(totalPages, start + 4);
                    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                      <Link
                        key={p}
                        href={toPageHref(basePath, p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                          p === page
                            ? "bg-red-700 text-white font-bold"
                            : "border border-border hover:bg-muted"
                        }`}
                        prefetch={false}
                      >
                        {p}
                      </Link>
                    ));
                  })()}
                  {page < totalPages && (
                    <Link
                      href={toPageHref(basePath, page + 1)}
                      className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                      prefetch={false}
                    >
                      अगला →
                    </Link>
                  )}
                </div>
              </nav>
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

const CategoryListing = ({ 
  categorySlug, 
  initialArticles 
}: { 
  categorySlug: string;
  initialArticles?: PaginatedResponse<CMSArticle>;
}) => (
  <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <CategoryListingInner 
      categorySlug={categorySlug} 
      initialArticles={initialArticles} 
    />
  </Suspense>
);

export default CategoryListing;
