import { Link } from "@/lib/router-compat";
import { Clock } from "lucide-react";
import type { CMSArticle } from "@/services/cms";
import Image from "next/image";

interface NewsCardProps {
  article: CMSArticle;
  variant?: "default" | "featured" | "horizontal" | "compact";
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

const NewsCard = ({ article, variant = "default" }: NewsCardProps) => {
  const articleUrl = `/${article.category}/${article.slug}`;
  const unoptimizedImage = article.image ? isLocalUpstreamImage(article.image) : false;
  const editorialLabel = getEditorialLabel(article);

  if (variant === "featured") {
    return (
      <article className="news-card group relative overflow-hidden rounded-lg">
        <Link to={articleUrl}>
          <div className="relative aspect-[16/10] overflow-hidden">
            {article.image ? (
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                unoptimized={unoptimizedImage}
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                {article.isBreaking && (
                  <span className="live-badge">ब्रेकिंग</span>
                )}
                {article.isEditorsPick && (
                  <span className="category-badge bg-amber-500 text-black">संपादक की पसंद</span>
                )}
                {editorialLabel && (
                  <span className="category-badge bg-primary/90">{editorialLabel}</span>
                )}
                {!editorialLabel && (
                  <span className="category-badge">{article.categoryHindi}</span>
                )}
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-gray-200 line-clamp-2 hidden md:block">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-300">
                <span>{article.author}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelativeTimeHindi(article.publishedDate)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="news-card group flex gap-4 p-3 bg-card rounded-lg border border-border">
        <Link to={articleUrl} className="flex-shrink-0">
          <div className="w-24 h-20 md:w-28 md:h-20 rounded-lg overflow-hidden">
            {article.image ? (
              <Image
                src={article.image}
                alt={article.title}
                width={112}
                height={80}
                unoptimized={unoptimizedImage}
                sizes="(min-width: 768px) 112px, 96px"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 font-semibold">
                {editorialLabel || article.categoryHindi}
              </span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>{formatRelativeTimeHindi(article.publishedDate)}</span>
            </div>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <Link to={articleUrl} className="flex items-start gap-3">
          <div className="w-20 h-16 flex-shrink-0 rounded overflow-hidden">
            {article.image ? (
              <Image
                src={article.image}
                alt={article.title}
                width={80}
                height={64}
                unoptimized={unoptimizedImage}
                sizes="80px"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h4>
            <span className="text-xs text-muted-foreground mt-1 block">
              {formatRelativeTimeHindi(article.publishedDate)}
            </span>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant
  return (
    <article className="news-card group bg-card rounded-lg overflow-hidden border border-border">
      <Link to={articleUrl}>
        <div className="relative aspect-video overflow-hidden">
          {article.image ? (
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
            <span className="text-[11px] font-semibold text-primary hover:underline">
              {editorialLabel || article.categoryHindi}
            </span>
          </Link>
        </div>
        <Link to={articleUrl}>
          <h3 className="text-base font-semibold text-foreground line-clamp-2 mt-2 group-hover:text-primary transition-colors">
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
            {formatRelativeTimeHindi(article.publishedDate)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
