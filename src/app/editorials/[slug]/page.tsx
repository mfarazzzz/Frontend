import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCMSProvider } from "@/services/cms";
import type { EditorialType } from "@/services/cms/types";

// ISR: revalidate every 10 minutes for individual editorial pages
export const revalidate = 600;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://rampurnews.com";

const editorialTypeLabel: Record<EditorialType, string> = {
  editorial: "संपादकीय",
  opinion: "विचार",
  review: "रिव्यू",
  interview: "इंटरव्यू",
  "special-report": "स्पेशल रिपोर्ट",
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const provider = getCMSProvider();
  const editorial = await provider.getEditorialBySlug(slug);

  if (!editorial) {
    return {
      title: "Editorial Not Found | Rampur News",
    };
  }

  const title = editorial.seoTitle || editorial.titleHindi || editorial.title;
  const description =
    editorial.seoDescription ||
    editorial.excerptHindi ||
    editorial.excerpt ||
    "";
  const canonicalUrl =
    editorial.canonicalUrl || `${SITE_URL}/editorials/${editorial.slug}`;

  return {
    title: `${title} | Rampur News`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: editorial.publishedAt,
      modifiedTime: editorial.modifiedDate,
      images: editorial.image ? [{ url: editorial.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: editorial.image ? [editorial.image] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EditorialDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const provider = getCMSProvider();
  const editorial = await provider.getEditorialBySlug(slug);

  if (!editorial) {
    notFound();
  }

  const canonicalUrl =
    editorial.canonicalUrl || `${SITE_URL}/editorials/${editorial.slug}`;

  // JSON-LD structured data — prefer backend-generated schemaJson, fall back to frontend build
  const jsonLd = editorial.schemaJson && typeof editorial.schemaJson === "object"
    ? editorial.schemaJson
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
        headline: editorial.titleHindi || editorial.title,
        name: editorial.titleHindi || editorial.title,
        description:
          editorial.seoDescription ||
          editorial.excerptHindi ||
          editorial.excerpt,
        image: editorial.image && editorial.image !== "/placeholder.svg"
          ? {
              "@type": "ImageObject",
              url: editorial.image,
              width: 1200,
              height: 630,
            }
          : undefined,
        thumbnailUrl:
          editorial.image && editorial.image !== "/placeholder.svg"
            ? editorial.image
            : undefined,
        datePublished: editorial.publishedAt,
        dateModified: editorial.modifiedDate || editorial.publishedAt,
        author: editorial.author
          ? [{ "@type": "Person", name: editorial.author }]
          : undefined,
        publisher: {
          "@type": "Organization",
          name: "रामपुर न्यूज़ | Rampur News",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`,
            width: 768,
            height: 768,
          },
        },
        articleSection: editorialTypeLabel[editorial.editorialType],
        inLanguage: "hi-IN",
        isAccessibleForFree: true,
        keywords: editorial.newsKeywords,
      };

  const formattedDate = editorial.publishedDate
    ? new Date(editorial.publishedDate).toLocaleDateString("hi-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            होम
          </Link>
          <span>/</span>
          <Link
            href="/editorials"
            className="hover:text-primary transition-colors"
          >
            संपादकीय
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">
            {editorial.titleHindi || editorial.title}
          </span>
        </nav>

        {/* Article header */}
        <header className="space-y-4">
          {/* Type badge */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {editorialTypeLabel[editorial.editorialType]}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
            {editorial.titleHindi || editorial.title}
          </h1>

          {/* English title if different */}
          {editorial.titleHindi && editorial.title !== editorial.titleHindi && (
            <p className="text-base text-muted-foreground italic">
              {editorial.title}
            </p>
          )}

          {/* Excerpt */}
          {(editorial.excerptHindi || editorial.excerpt) && (
            <p className="text-base text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4">
              {editorial.excerptHindi || editorial.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {editorial.authorSlug ? (
              <Link
                href={`/authors/${editorial.authorSlug}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {editorial.author}
              </Link>
            ) : (
              <span className="font-medium text-foreground">
                {editorial.author}
              </span>
            )}
            {formattedDate && (
              <>
                <span>·</span>
                <time dateTime={editorial.publishedDate}>{formattedDate}</time>
              </>
            )}
            {editorial.readTime && (
              <>
                <span>·</span>
                <span>{editorial.readTime} पढ़ने का समय</span>
              </>
            )}
          </div>
        </header>

        {/* Cover image */}
        {editorial.image && editorial.image !== "/placeholder.svg" && (
          <figure className="rounded-xl overflow-hidden">
            <div className="relative w-full aspect-video">
              <Image
                src={editorial.image}
                alt={editorial.titleHindi || editorial.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </figure>
        )}

        {/* Article content */}
        <article
          className="prose prose-lg prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: editorial.contentHindi || editorial.content,
          }}
        />

        {/* Tags / keywords */}
        {editorial.newsKeywords && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {editorial.newsKeywords
              .split(",")
              .map((kw) => kw.trim())
              .filter(Boolean)
              .slice(0, 8)
              .map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {kw}
                </span>
              ))}
          </div>
        )}

        {/* Author card */}
        {editorial.author && (
          <div className="border border-border rounded-xl p-5 flex items-start gap-4 bg-card">
            {editorial.authorAvatar && (
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={editorial.authorAvatar}
                  alt={editorial.author}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                लेखक
              </div>
              {editorial.authorSlug ? (
                <Link
                  href={`/authors/${editorial.authorSlug}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {editorial.author}
                </Link>
              ) : (
                <span className="font-semibold">{editorial.author}</span>
              )}
              {editorial.authorRole && (
                <span className="text-xs text-muted-foreground capitalize">
                  {editorial.authorRole}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Related articles section */}
        {editorial.relatedArticles && editorial.relatedArticles.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold">संबंधित समाचार</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {editorial.relatedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${article.category}/${article.slug}`}
                  className="group flex gap-3 border rounded-lg p-3 hover:border-primary hover:bg-muted/40 transition-colors"
                >
                  {article.image && article.image !== "/placeholder.svg" && (
                    <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.titleHindi || article.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    {article.categoryHindi && (
                      <span className="text-xs text-primary font-medium">
                        {article.categoryHindi}
                      </span>
                    )}
                    <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {article.titleHindi || article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-border">
          <Link
            href="/editorials"
            className="text-sm text-primary hover:underline"
          >
            ← सभी संपादकीय देखें
          </Link>
        </div>
      </main>
    </>
  );
}
