"use client";
import { Link, Navigate } from "@/lib/router-compat";
import { getCategoryHindi } from "@/lib/utils";
import { ArrowLeft, Clock, Share2, User } from "lucide-react";
import { lazy, Suspense } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { useArticleBySlug, useArticlesByCategory } from "@/hooks/useCMS";

const Sidebar = lazy(() => import("@/components/Sidebar").then(mod => ({ default: mod.default })));

const formatDateHindi = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getYouTubeEmbedUrl = (input: string): string => {
  const raw = input.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
    }
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/").filter(Boolean)[1] || "";
        return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
      }
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/").filter(Boolean)[1] || "";
        return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
      }
      const id = url.searchParams.get("v") || "";
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
    }
  } catch {
    void 0;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return `https://www.youtube-nocookie.com/embed/${raw}?rel=0`;
  }
  return "";
};

// Calculate reading time in Hindi
const getReadingTime = (content: string | undefined, excerpt: string): string => {
  const text = content || excerpt;
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} मिनट`;
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
      `<figure class="my-4"><img src="${url.trim()}" alt="${alt.trim()}" class="mx-auto rounded-lg" loading="lazy" decoding="async" /></figure>`,
  );

  text = text.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_, label, href) =>
      `<a href="${href.trim()}" class="underline" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );

  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  text = text.replace(
    /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp))/gi,
    (match) =>
      `<figure class="my-4"><img src="${match}" alt="" class="mx-auto rounded-lg" loading="lazy" decoding="async" /></figure>`,
  );

  const paragraphs = text.split(/\n{2,}/);
  const html = paragraphs
    .map((p) => p.replace(/\n/g, "<br />"))
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  return html || `<p>${escapeHtml(raw)}</p>`;
};

interface NextParams {
  category: string;
  slug: string;
}

interface NewsDetailProps {
  nextParams?: NextParams;
  initialArticle?: any; // CMSArticle
}

const NewsDetail = ({ nextParams, initialArticle }: NewsDetailProps) => {
  const category = nextParams?.category ?? "";
  const slug = nextParams?.slug ?? "";
  const normalizedCategory = category.trim();

  const { data: articleData, isLoading: isArticleLoading } = useArticleBySlug(slug);
  
  // Use initial data if available, otherwise use client-fetched data
  const article = initialArticle || articleData;
  const isLoading = !initialArticle && isArticleLoading;

  const effectiveCategory = (article?.category || normalizedCategory).trim();
  const { data: categoryNews = [] } = useArticlesByCategory(effectiveCategory, 20);

  if (!slug.trim()) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">पेज नहीं मिला</h1>
            <p className="text-muted-foreground mb-6">यह पेज मौजूद नहीं है।</p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                होम पर जाएं
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">लोड हो रहा है...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">खबर नहीं मिली</h1>
            <p className="text-muted-foreground mb-6">यह खबर मौजूद नहीं है या हटा दी गई है।</p>
            <Link to={effectiveCategory ? `/${effectiveCategory}` : "/"}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {effectiveCategory ? `${getCategoryHindi(effectiveCategory)} पर वापस जाएं` : "होम पर जाएं"}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (normalizedCategory && article.category && article.category !== normalizedCategory) {
    return <Navigate to={`/${article.category}/${article.slug || slug}`} replace />;
  }

  const moreFromAuthor =
    article.author && categoryNews.length > 0
      ? categoryNews
          .filter((a) => a.id !== article.id && a.author === article.author)
          .slice(0, 4)
      : [];

  const authorSlug = article.authorSlug && article.authorSlug.trim() ? article.authorSlug.trim() : "";
  const articleUrl = `/${effectiveCategory}/${slug}`;
  const readingTime = article.readTime || getReadingTime(article.content, article.excerpt);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";
  const shareUrl = `${siteUrl}${articleUrl}`;
  const embedUrl = article.videoType === "youtube" && article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : "";
  const buildOgImageUrl = (title: string) => `${siteUrl}/api/og?title=${encodeURIComponent(title)}`;
  const toAbsoluteUrl = (value: string) => {
    const raw = (value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${siteUrl}${raw}`;
    return `${siteUrl}/${raw}`;
  };
  const displayImage = toAbsoluteUrl(article.image || buildOgImageUrl(article.title));

  const stopWords = new Set([
    "और",
    "या",
    "में",
    "का",
    "की",
    "के",
    "से",
    "पर",
    "है",
    "था",
    "थे",
    "थी",
    "इस",
    "उस",
    "ये",
    "वे",
    "भी",
    "तो",
    "ही",
    "का",
    "की",
    "कर",
    "करके",
    "रहा",
    "रही",
    "रहे",
  ]);

  const extractKeywords = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 4 && !stopWords.has(w));

  const keywordPool = Array.from(
    new Set([
      ...extractKeywords(article.title || ""),
      ...extractKeywords(article.excerpt || ""),
      ...(Array.isArray(article.tags) ? article.tags.map((t) => String(t).toLowerCase()) : []),
    ]),
  ).slice(0, 12);

  const keywordMatches = categoryNews.filter((item) => {
    if (item.id === article.id) return false;
    const hay = `${item.title || ""} ${item.excerpt || ""}`.toLowerCase();
    return keywordPool.some((k) => hay.includes(k));
  });

  const relatedNews = Array.from(
    new Map(
      [...keywordMatches, ...categoryNews]
        .filter((item) => item.id !== article.id)
        .map((item) => [item.id, item]),
    ).values(),
  ).slice(0, 6);

  const contentWithInternalLinks = (() => {
    const baseHtml = convertPlainContentToHtml(article.content || "");
    const internalLinks: Array<{ href: string; title: string }> = [];

    if (effectiveCategory) {
      internalLinks.push({
        href: `/${effectiveCategory}`,
        title: `${getCategoryHindi(effectiveCategory)} की सभी खबरें`,
      });
    }
    if (authorSlug) {
      internalLinks.push({
        href: `/authors/${authorSlug}`,
        title: `${article.author} की प्रोफाइल`,
      });
    }
    if (Array.isArray(article.tags) && article.tags.length > 0) {
      for (const tag of article.tags.slice(0, 3)) {
        const label = String(tag).trim();
        if (!label) continue;
        internalLinks.push({
          href: `/search?q=${encodeURIComponent(label)}`,
          title: `${label} से जुड़ी खबरें`,
        });
      }
    }
    if (article.location && String(article.location).trim()) {
      const locationLabel = String(article.location).trim();
      internalLinks.push({
        href: `/search?q=${encodeURIComponent(locationLabel)}`,
        title: `${locationLabel} अपडेट`,
      });
    }

    relatedNews
      .filter((n) => n.slug && n.title)
      .slice(0, 4)
      .forEach((n) => {
        internalLinks.push({
          href: `/${effectiveCategory}/${n.slug}`,
          title: n.title,
        });
      });

    const fallbackLinks = [
      { href: "/", title: "मुख्य समाचार" },
      { href: "/rampur", title: "रामपुर समाचार" },
      { href: "/up", title: "उत्तर प्रदेश समाचार" },
    ];

    for (const link of fallbackLinks) {
      if (internalLinks.length >= 3) break;
      if (!internalLinks.find((l) => l.href === link.href)) internalLinks.push(link);
    }

    const uniqueLinks = Array.from(new Map(internalLinks.map((l) => [l.href, l])).values()).slice(0, 6);

    if (uniqueLinks.length === 0) return baseHtml;

    const linksHtml = uniqueLinks
      .map((l) => `<a href="${escapeHtml(l.href)}" class="underline">${escapeHtml(l.title)}</a>`)
      .join(" • ");

    const injection = `<div class="my-6 rounded-lg border border-border bg-muted/40 p-4"><div class="text-sm font-semibold text-foreground mb-2">इस विषय पर और पढ़ें</div><div class="text-sm">${linksHtml}</div></div>`;

    const marker = "</p>";
    const idx = baseHtml.toLowerCase().indexOf(marker);
    if (idx === -1) return injection + baseHtml;
    return baseHtml.slice(0, idx + marker.length) + injection + baseHtml.slice(idx + marker.length);
  })();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">होम</Link>
          <span>/</span>
          <Link to={`/${effectiveCategory}`} className="hover:text-primary">
            {getCategoryHindi(effectiveCategory)}
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2" itemScope itemType="https://schema.org/NewsArticle">
            {/* Category & Breaking Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Link 
                to={`/${effectiveCategory}`}
                className="text-sm font-semibold text-primary hover:underline"
                itemProp="articleSection"
              >
                {article.categoryHindi}
              </Link>
              {article.isBreaking && (
                <span className="live-badge">ब्रेकिंग</span>
              )}
            </div>

            {/* Title */}
            <h1 
              className="article-headline text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight"
              itemProp="headline"
            >
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              {article.author && (
                <span className="flex items-center gap-1" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <User size={14} />
                  {authorSlug ? (
                    <Link
                      to={`/authors/${authorSlug}`}
                      className="hover:underline"
                      itemProp="url"
                    >
                      <span itemProp="name">{article.author}</span>
                    </Link>
                  ) : (
                    <span itemProp="name">{article.author}</span>
                  )}
                </span>
              )}
              <time 
                className="flex items-center gap-1"
                dateTime={article.publishedDate}
                itemProp="datePublished"
              >
                <Clock size={14} />
                {formatDateHindi(article.publishedDate)}
              </time>
              <span>पढ़ने का समय: {readingTime}</span>
              {article.views && (
                <span>{article.views.toLocaleString('hi-IN')} बार पढ़ा गया</span>
              )}
            </div>

            {displayImage ? (
              <figure className="rounded-lg overflow-hidden mb-6">
                <Image
                  src={displayImage}
                  alt={article.title}
                  width={1200}
                  height={630}
                  priority
                  className="w-full h-auto object-cover"
                  sizes="(min-width: 1024px) 1200px, 100vw"
                />
                <meta itemProp="thumbnailUrl" content={displayImage} />
              </figure>
            ) : null}

            {embedUrl ? (
              <div className="rounded-lg overflow-hidden mb-6 border border-border">
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={article.videoTitle || article.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}

            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-6">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Share2 size={16} />
                शेयर करें:
              </span>
              <ShareButtons url={shareUrl} title={article.title} />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none text-foreground" itemProp="articleBody">
              <p className="article-summary text-lg font-medium leading-relaxed mb-6">
                {article.excerpt}
              </p>
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: contentWithInternalLinks }} />
              ) : (
                <>
                  <p>
                    {article.excerpt} यह खबर {getCategoryHindi(category)} श्रेणी से संबंधित है और इसमें विस्तृत जानकारी दी गई है।
                  </p>
                  <p>
                    स्थानीय प्रशासन और संबंधित अधिकारियों ने इस मामले पर अपनी प्रतिक्रिया दी है। आगे की जानकारी के लिए हमारे साथ जुड़े रहें।
                  </p>
                  <p>
                    इस खबर से जुड़े किसी भी अपडेट के लिए रामपुर न्यूज़ को फॉलो करें। हम आपको हर खबर से अवगत कराते रहेंगे।
                  </p>
                </>
              )}
            </div>

            {/* Hidden metadata for schema */}
            <meta itemProp="dateModified" content={article.publishedDate} />
            <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" style={{ display: 'none' }}>
              <meta itemProp="name" content="रामपुर न्यूज़" />
              <div itemProp="logo" itemScope itemType="https://schema.org/ImageObject">
                <meta itemProp="url" content="https://rampurnews.com/logo.png" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
              <span className="text-sm font-medium text-foreground">टैग:</span>
              <Link 
                to={`/${category}`}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {article.categoryHindi}
              </Link>
              <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                रामपुर न्यूज़
              </span>
              <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                उत्तर प्रदेश
              </span>
            </div>

            {relatedNews.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  संबंधित खबरें
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedNews.map((news) => (
                    <NewsCard key={news.id} article={news} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}

            {moreFromAuthor.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  इसी लेखक की और खबरें
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {moreFromAuthor.map((news) => (
                    <NewsCard key={news.id} article={news} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<div className="animate-pulse bg-muted h-96 rounded-lg" />}>
              <Sidebar />
            </Suspense>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
