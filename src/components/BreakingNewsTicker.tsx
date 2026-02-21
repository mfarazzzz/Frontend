"use client";
import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { useBreakingNews } from "@/hooks/useCMS";
import { Link } from "@/lib/router-compat";

type CachedBreakingNewsItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
};

type TickerItem = {
  id: string;
  title: string;
  slug?: string;
  category?: string;
};

const CACHE_KEY = "breaking_news_cache_v1";

const BreakingNewsTicker = () => {
  const [cached, setCached] = useState<CachedBreakingNewsItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => ({
          id: String(item?.id ?? ""),
          title: String(item?.title ?? ""),
          slug: String(item?.slug ?? ""),
          category: String(item?.category ?? ""),
        }))
        .filter((item) => item.id && item.title && item.slug && item.category);
    } catch {
      return [];
    }
  });

  const { data: breakingNews = [] } = useBreakingNews(10);

  const fresh = useMemo<CachedBreakingNewsItem[]>(() => {
    if (breakingNews.length === 0) return [];
    return breakingNews.map((news) => ({
      id: news.id,
      title: news.title,
      slug: news.slug,
      category: news.category,
    }));
  }, [breakingNews]);

  useEffect(() => {
    if (fresh.length === 0) return;
    const nextCache = fresh;
    setCached(nextCache);
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(nextCache));
    } catch {
      // ignore write failures
    }
  }, [fresh]);

  const displayNews: TickerItem[] = fresh.length > 0 ? fresh : cached;

  const renderedItems = useMemo(() => {
    if (displayNews.length > 0) return displayNews;
    return [
      { id: "loading", title: "ब्रेकिंग न्यूज़ लोड हो रही है…" },
      { id: "loading2", title: "ताज़ा अपडेट्स के लिए बने रहें…" },
    ] satisfies TickerItem[];
  }, [displayNews]);

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
              {renderedItems.map((news, index) => (
                <span key={news.id} className="inline-flex items-center">
                  {news.category && news.slug ? (
                    <Link
                      to={`/${news.category}/${news.slug}`}
                      className="inline-block hover:underline"
                    >
                      {news.title}
                    </Link>
                  ) : (
                    <span className="inline-block">{news.title}</span>
                  )}
                  {index < renderedItems.length - 1 && (
                    <span className="mx-4 text-primary-foreground/50">•</span>
                  )}
                </span>
              ))}
            </div>
            <div className="breaking-ticker-segment" aria-hidden="true">
              {renderedItems.map((news, index) => (
                <span key={`${news.id}-dup`} className="inline-flex items-center">
                  {news.category && news.slug ? (
                    <Link
                      to={`/${news.category}/${news.slug}`}
                      className="inline-block hover:underline"
                      tabIndex={-1}
                    >
                      {news.title}
                    </Link>
                  ) : (
                    <span className="inline-block">{news.title}</span>
                  )}
                  {index < renderedItems.length - 1 && (
                    <span className="mx-4 text-primary-foreground/50">•</span>
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
