"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CMSArticle } from "@/services/cms";
import { getCategoryHindi, stripHtmlToText, truncateText } from "@/lib/utils";

type AuthorCategory = {
  slug: string;
  name: string;
  count?: number;
};

type AuthorArticleTabsProps = {
  articles: CMSArticle[];
  categories: AuthorCategory[];
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" });
};

const getExcerpt = (article: CMSArticle) => {
  const raw = article.excerpt || stripHtmlToText(article.content || "");
  return truncateText(raw, 140);
};

const getCategoryLabel = (article: CMSArticle, categories: AuthorCategory[]) => {
  const match = categories.find((category) => category.slug === article.category);
  if (match) return match.name;
  if (article.categoryHindi) return article.categoryHindi;
  return getCategoryHindi(article.category);
};

export default function AuthorArticleTabs({ articles, categories }: AuthorArticleTabsProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, CMSArticle[]>();
    for (const article of articles) {
      const key = article.category || "posts";
      const list = map.get(key) || [];
      list.push(article);
      map.set(key, list);
    }
    return map;
  }, [articles]);

  const tabs = useMemo(() => {
    const base = [{ id: "posts", label: "Posts", articles }];
    const categoryTabs = categories
      .map((category) => ({
        id: category.slug,
        label: category.name,
        articles: grouped.get(category.slug) || [],
      }))
      .filter((tab) => tab.articles.length > 0);
    return [...base, ...categoryTabs];
  }, [articles, categories, grouped]);

  const [activeTabId, setActiveTabId] = useState("posts");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={
                isActive
                  ? "whitespace-nowrap rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm"
                  : "whitespace-nowrap rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              }
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-80">({tab.articles.length})</span>
            </button>
          );
        })}
      </div>

      {activeTab.articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
          इस श्रेणी में अभी कोई लेख उपलब्ध नहीं है।
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {activeTab.articles.map((article) => {
            const imageUrl = article.image || "/og-image.jpg";
            const excerpt = getExcerpt(article);
            const categoryLabel = getCategoryLabel(article, categories);
            const publishedLabel = formatDate(article.publishedDate || article.publishedAt);
            return (
              <Link
                key={article.id}
                href={`/${article.category}/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    {categoryLabel}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                    {article.title}
                  </h3>
                  {excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {excerpt}
                    </p>
                  )}
                  {publishedLabel && (
                    <div className="text-xs text-muted-foreground">
                      {publishedLabel}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
