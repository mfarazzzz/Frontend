 "use client";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Clock } from "lucide-react";
import type { CMSArticle } from "@/services/cms";
import Image from "next/image";

interface NewsCardProps {
  article: CMSArticle;
  variant?: "default" | "featured" | "horizontal" | "compact" | "hero" | "stacked" | "mini";
  imagePriority?: boolean;
  asHero?: boolean;
}

const formatRelativeTimeHindi = (dateString: string) => {
  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return "";
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) return "अभी";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} मिनट पहले`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} घंटे पहले`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} हफ्ते पहले`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} महीने पहले`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} साल पहले`;
};

const getEditorialLabel = (article: CMSArticle) => {
  if (!article.contentType) return null;
  if (article.contentType === "editorial") return "संपादकीय";
  if (article.contentType === "opinion") return "विचार";
  if (article.contentType === "review") return "रिव्यू";
  if (article.contentType === "interview") return "इंटरव्यू";
  if (article.contentType === "special-report") return "स्पेशल रिपोर्ट";
  return null;
};

const isLocalUpstreamImage = (src: string) => {
  try {
    const url = new URL(src);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
  } catch {
    return false;
  }
};

const hasRealImage = (src?: string | null) => {
  if (!src) return false;
  const lowered = src.toLowerCase();
  if (lowered.includes("placeholder")) return false;
  if (lowered.includes("news-placeholder")) return false;
  return true;
};

const NewsCard = ({ article, variant = "default", imagePriority = false, asHero = false }: NewsCardProps) => {
  const articleUrl = `/${article.category}/${article.slug}`;
  const [isPortrait, setIsPortrait] = useState(false);
  const unoptimizedImage = article.image ? isLocalUpstreamImage(article.image) : false;
  const showImage = hasRealImage(article.image);
  const editorialLabel = getEditorialLabel(article);
  // Use the best available date — publishedAt is the canonical field from the CMS API
  const displayDate = article.publishedAt || article.publishedDate || "";

  if (variant === "hero") {
    return (
      <article className="news-card group relative overflow-hidden rounded-lg">
        <Link to={articleUrl}>
          <div className={`relative ${isPortrait ? "aspect-[3/4]" : "aspect-[4/3]"} md:aspect-[16/9] overflow-hidden bg-black`}>
            {showImage ? (
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority={imagePriority}
                unoptimized={unoptimizedImage}
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onLoadingComplete={(img) => {
                  try {
                    setIsPortrait(img.naturalHeight > img.naturalWidth);
                  } catch {
                    // ignore
                  }
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                {article.isBreaking && <span className="live-badge">ब्रेकिंग</span>}
                {article.isEditorsPick && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black">
                    संपादक की पसंद
                  </span>
                )}
                {editorialLabel && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">
                  {editorialLabel}
                </span>}
                {!editorialLabel && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground">
                    {article.categoryHindi}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white mb-2 line-clamp-2">
                {article.title}
              </h1>
              <p className="text-sm text-gray-200 line-clamp-2 hidden md:block">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-300">
                <span>{article.author}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelativeTimeHindi(displayDate)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="news-card group relative overflow-hidden rounded-md">
        <Link to={articleUrl}>
          <div className={`relative ${isPortrait ? "aspect-[3/4]" : "aspect-[4/3]"} md:aspect-[16/9] overflow-hidden bg-black`}>
            {showImage ? (
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority={imagePriority}
                unoptimized={unoptimizedImage}
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onLoadingComplete={(img) => {
                  try {
                    setIsPortrait(img.naturalHeight > img.naturalWidth);
                  } catch {
                    // ignore
                  }
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                {article.isBreaking && (
                  <span className="live-badge">ब्रेकिंग</span>
                )}
                {article.isEditorsPick && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black">
                    संपादक की पसंद
                  </span>
                )}
                {editorialLabel && <span className="text-[10px] px-2 py-1 rounded-sm bg-muted text-foreground">
                  {editorialLabel}
                </span>}
                {!editorialLabel && (
                  <span className="text-[10px] px-2 py-1 rounded-sm bg-red-700 text-white font-semibold">
                    {article.categoryHindi}
                  </span>
                )}
              </div>
              {asHero ? (
  <h1 className="font-extrabold leading-tight tracking-tight text-white mb-2 text-[clamp(22px,3.2vw,40px)] line-clamp-2">
    {article.title}
  </h1>
) : (
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
              )}
              <p className="text-sm text-gray-200 line-clamp-2 hidden md:block">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-300">
                <span>{article.author}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelativeTimeHindi(displayDate)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "stacked") {
    return (
      <article className="news-card group rounded-lg overflow-hidden border border-border">
        <Link to={articleUrl}>
          <div className="relative aspect-[4/3] overflow-hidden">
            {showImage ? (
              <Image
                src={article.image}
                alt={article.title}
                fill
                unoptimized={unoptimizedImage}
                sizes="(min-width: 1024px) 26vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
            {article.isBreaking && <span className="live-badge absolute top-2 left-2">ब्रेकिंग</span>}
          </div>
        </Link>
        <div className="p-3">
          <Link to={articleUrl}>
            <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="line-clamp-1">{article.author}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTimeHindi(displayDate)}
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 p-3 rounded-md hover:shadow-md transition-all duration-300">
        <Link to={articleUrl} className="flex-shrink-0">
          <div className="relative w-32 md:w-36 aspect-[16/9] rounded-md overflow-hidden bg-muted">
            {showImage ? (
              <Image
                src={article.image}
                alt={article.title}
                fill
                unoptimized={unoptimizedImage}
                sizes="(min-width: 768px) 144px, 128px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={articleUrl}>
            <div className="flex items-center gap-2">
              {article.isBreaking && (
                <span className="rounded-full bg-red-600 text-white text-[10px] px-2 py-0.5">
                  ब्रेकिंग
                </span>
              )}
              {article.isEditorsPick && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black">
                  संपादक की पसंद
                </span>
              )}
              <span className="text-[10px] px-2 py-1 rounded-sm bg-muted text-foreground">
                {editorialLabel || article.categoryHindi}
              </span>
            </div>
            <h3 className="text-[15px] md:text-base font-semibold leading-snug text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{formatRelativeTimeHindi(displayDate)}</span>
            </div>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "mini") {
    return (
      <article className="news-card group flex gap-3 p-3 bg-card rounded-lg border border-border">
        <Link to={articleUrl} className="flex-shrink-0">
          <div className="w-20 h-14 rounded-md overflow-hidden">
            {showImage ? (
              <Image
                src={article.image}
                alt={article.title}
                width={80}
                height={56}
                unoptimized={unoptimizedImage}
                sizes="80px"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={articleUrl}>
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{formatRelativeTimeHindi(displayDate)}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group hover:shadow-md transition-all duration-300 rounded-md p-1">
        <Link to={articleUrl} className="flex items-start gap-3">
          <div className="w-16 h-14 md:w-20 md:h-16 flex-shrink-0 rounded-md overflow-hidden">
            {showImage ? (
              <Image
                src={article.image}
                alt={article.title}
                width={96}
                height={72}
                unoptimized={unoptimizedImage}
                sizes="96px"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <span className="text-xs text-muted-foreground mt-1 block">
              {formatRelativeTimeHindi(displayDate)}
            </span>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant
  return (
    <article className="news-card group bg-card rounded-md overflow-hidden shadow-sm">
      <Link to={articleUrl}>
        <div className="relative aspect-video overflow-hidden">
          {showImage ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              unoptimized={unoptimizedImage}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          {article.isBreaking && (
            <span className="live-badge absolute top-2 left-2">ब्रेकिंग</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {article.isBreaking && (
            <span className="live-badge text-[10px] px-1.5 py-0.5">ब्रेकिंग</span>
          )}
          {article.isEditorsPick && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-black">
              संपादक की पसंद
            </span>
          )}
          <Link to={`/${article.category}`}>
            <span className="text-[11px] font-semibold text-muted-foreground hover:text-red-700">
              {editorialLabel || article.categoryHindi}
            </span>
          </Link>
        </div>
        <Link to={articleUrl}>
          <h3 className="text-lg font-semibold leading-snug text-foreground line-clamp-2 mt-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {article.excerpt}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{article.author}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {formatRelativeTimeHindi(displayDate)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
