"use client";
import { useParams, Link } from "@/lib/router-compat";
import { VALID_NEWS_CATEGORIES, getCategoryHindi } from "@/lib/utils";
import { ArrowLeft, Clock, Share2, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import ShareButtons from "@/components/ShareButtons";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { useArticleBySlug, useArticlesByCategory } from "@/hooks/useCMS";

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

interface NextParams {
  category: string;
  slug: string;
}

const NewsDetail = ({ nextParams }: { nextParams?: NextParams }) => {
  const routerParams = useParams<{ category: string; slug: string }>();
  const category = nextParams?.category ?? routerParams?.category ?? "";
  const slug = nextParams?.slug ?? routerParams?.slug ?? "";
  const isValidCategory = VALID_NEWS_CATEGORIES.includes(category);

  const { data: article, isLoading: isArticleLoading } = useArticleBySlug(isValidCategory ? slug : "");
  const { data: categoryNews = [] } = useArticlesByCategory(isValidCategory ? category : "", 20);

  // Validate category
  if (!isValidCategory) {
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

  if (isArticleLoading) {
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

  if (!article || article.category !== category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">खबर नहीं मिली</h1>
            <p className="text-muted-foreground mb-6">यह खबर मौजूद नहीं है या हटा दी गई है।</p>
            <Link to={`/${category}`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {getCategoryHindi(category)} पर वापस जाएं
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related news from same category
  const relatedNews = categoryNews.filter((a) => a.id !== article.id).slice(0, 4);

  const articleUrl = `/${category}/${slug}`;
  const readingTime = article.readTime || getReadingTime(article.content, article.excerpt);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rampurnews.com";
  const shareUrl = `${siteUrl}${articleUrl}`;
  const embedUrl = article.videoType === "youtube" && article.videoUrl ? getYouTubeEmbedUrl(article.videoUrl) : "";

  const contentWithInternalLinks = (() => {
    const baseHtml = article.content || "";
    const links = relatedNews
      .slice(0, 2)
      .filter((n) => n.slug && n.title)
      .map((n) => ({
        href: `/${category}/${n.slug}`,
        title: n.title,
      }));

    if (links.length === 0) return baseHtml;

    const linksHtml = links
      .map((l) => `<a href="${escapeHtml(l.href)}" class="underline">${escapeHtml(l.title)}</a>`)
      .join(" • ");

    const injection = `<div class="my-6 rounded-lg border border-border bg-muted/40 p-4"><div class="text-sm font-semibold text-foreground mb-2">संबंधित खबरें</div><div class="text-sm">${linksHtml}</div></div>`;

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
          <Link to={`/${category}`} className="hover:text-primary">
            {getCategoryHindi(category)}
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
                to={`/${category}`}
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
              <span className="flex items-center gap-1" itemProp="author" itemScope itemType="https://schema.org/Person">
                <User size={14} />
                <span itemProp="name">{article.author}</span>
              </span>
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

            {article.image ? (
              <figure className="rounded-lg overflow-hidden mb-6">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <meta itemProp="thumbnailUrl" content={article.image} />
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

            {/* Related News */}
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
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Sidebar />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
