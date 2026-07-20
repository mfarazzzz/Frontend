"use client";
import { useMemo } from "react";
import { Zap } from "lucide-react";
import { useBreakingNews } from "@/hooks/useCMS";
import { Link } from "@/lib/router-compat";

type TickerItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
};

/**
 * Breaking News Ticker — horizontal scrolling marquee of active breaking articles.
 *
 * Rules:
 * - Only shows articles explicitly marked as is_breaking=true
 * - Only shows articles published within the last 48 hours
 * - Automatically refreshes every 2 minutes (via useBreakingNews refetchInterval)
 * - Hides completely when no active breaking news exists
 * - No fallback to regular articles (breaking = editorial decision, not default)
 */
const BreakingNewsTicker = () => {
  const { data: breakingNews = [], isLoading } = useBreakingNews(10);

  const tickerItems = useMemo<TickerItem[]>(() => {
    if (breakingNews.length === 0) return [];
    return breakingNews
      .filter((news) => news.id && news.title && news.slug && news.category)
      .map((news) => ({
        id: news.id,
        title: news.title,
        slug: news.slug,
        category: news.category,
      }));
  }, [breakingNews]);

  // Don't render the ticker at all when there's no active breaking news
  if (!isLoading && tickerItems.length === 0) return null;

  // Show a minimal loading state only on initial load
  if (isLoading && tickerItems.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="container flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0 px-3 py-1 bg-news-red-dark rounded">
          <Zap size={16} className="animate-pulse" />
          <span className="font-bold text-sm whitespace-nowrap">ब्रेकिंग न्यूज़</span>
        </div>
        <div className="breaking-ticker flex-1">
          <div className="breaking-ticker-content">
            <div className="breaking-ticker-segment">
              {tickerItems.map((news, index) => (
                <span key={news.id} className="inline-flex items-center">
                  <Link
                    to={`/${news.category}/${news.slug}`}
                    className="inline-block hover:underline"
                  >
                    {news.title}
                  </Link>
                  {index < tickerItems.length - 1 && (
                    <span className="mx-4 text-primary-foreground/50">—</span>
                  )}
                </span>
              ))}
            </div>
            {/* Duplicate for seamless infinite scroll */}
            <div className="breaking-ticker-segment" aria-hidden="true">
              {tickerItems.map((news, index) => (
                <span key={`${news.id}-dup`} className="inline-flex items-center">
                  <Link
                    to={`/${news.category}/${news.slug}`}
                    className="inline-block hover:underline"
                    tabIndex={-1}
                  >
                    {news.title}
                  </Link>
                  {index < tickerItems.length - 1 && (
                    <span className="mx-4 text-primary-foreground/50">—</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
