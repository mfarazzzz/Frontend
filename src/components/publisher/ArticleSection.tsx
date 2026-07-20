/**
 * Publisher Profile — Article Section
 * Lists the author's articles with Latest, Popular, and Category tabs.
 * Includes internal linking for SEO.
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import type { AuthorArticleSummary } from '@/types/publisher-profile';

interface Props {
  articles: AuthorArticleSummary[];
  categories: { slug: string; name: string; count: number }[];
  authorName: string;
  slug: string;
}

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function PublisherArticleSection({ articles, categories, authorName, slug }: Props) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | string>('latest');

  const sortedByDate = useMemo(
    () => [...articles].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()),
    [articles],
  );

  const sortedByViews = useMemo(
    () => [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)),
    [articles],
  );

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, AuthorArticleSummary[]>();
    for (const article of articles) {
      const key = article.category || 'other';
      const list = map.get(key) || [];
      list.push(article);
      map.set(key, list);
    }
    return map;
  }, [articles]);

  const tabs = useMemo(() => {
    const base = [
      { id: 'latest', label: 'नवीनतम', count: articles.length },
      { id: 'popular', label: 'लोकप्रिय', count: Math.min(articles.length, 20) },
    ];
    const catTabs = categories.slice(0, 8).map((cat) => ({
      id: cat.slug,
      label: cat.name,
      count: cat.count,
    }));
    return [...base, ...catTabs];
  }, [articles, categories]);

  const displayArticles = useMemo(() => {
    if (activeTab === 'latest') return sortedByDate.slice(0, 20);
    if (activeTab === 'popular') return sortedByViews.slice(0, 20);
    return (groupedByCategory.get(activeTab) || []).slice(0, 20);
  }, [activeTab, sortedByDate, sortedByViews, groupedByCategory]);

  if (articles.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12" aria-label="Author Articles">
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
          <p className="text-muted-foreground">इस लेखक के अभी कोई लेख उपलब्ध नहीं हैं।</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 pb-14" aria-labelledby="articles-heading">
      <header className="mb-6">
        <h2 id="articles-heading" className="text-2xl md:text-3xl font-bold text-foreground">
          लेख और समाचार
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          <Link href={`/author/${slug}`} className="text-primary hover:underline" aria-label={`View all articles by ${authorName}`}>
            {authorName}
          </Link>
          {' '}द्वारा लिखे गए सभी लेख
        </p>
      </header>

      {/* Tabs */}
      <nav aria-label="Article filter tabs" className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls="articles-panel"
              onClick={() => setActiveTab(tab.id)}
              className={
                tab.id === activeTab
                  ? 'whitespace-nowrap rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium shadow-sm'
                  : 'whitespace-nowrap rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:shadow-sm'
              }
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Articles Grid */}
      <div id="articles-panel" role="tabpanel" aria-label={`${activeTab} articles`}>
        {displayArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
            इस श्रेणी में अभी कोई लेख उपलब्ध नहीं है।
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {displayArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${article.category}/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  {article.categoryHindi && (
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                      {article.categoryHindi}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    {formatDate(article.publishedDate) && <time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>}
                    {article.readTime && <span>{article.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Internal link anchor */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Written by{' '}
          <Link href={`/author/${slug}`} className="font-medium text-primary hover:underline">
            {authorName}
          </Link>
          {' '}|{' '}
          <Link href={`/author/${slug}`} className="font-medium text-primary hover:underline" aria-label={`View all articles by ${authorName}`}>
            View all articles by {authorName}
          </Link>
        </p>
      </div>
    </section>
  );
}
