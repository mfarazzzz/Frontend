/**
 * GA4 Event Tracking Utilities
 * SSR-safe — all functions no-op if window/gtag is unavailable.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type GtagFn = (
  command: "config" | "event" | "js" | "set",
  targetId: string | Date,
  config?: Record<string, unknown>
) => void;

function gtag(...args: Parameters<GtagFn>) {
  if (typeof window === "undefined") return;
  if (typeof (window as Window & { gtag?: GtagFn }).gtag !== "function") return;
  (window as Window & { gtag: GtagFn }).gtag(...args);
}

// ─── Article Events ────────────────────────────────────────────────────────

export interface ArticleViewParams {
  articleId: string;
  title: string;
  category: string;
  author?: string;
  publishedDate?: string;
}

/** Fire once when an article page mounts. */
export function trackArticleView(params: ArticleViewParams) {
  gtag("event", "article_view", {
    send_to: GA_ID,
    article_id: params.articleId,
    article_title: params.title,
    article_category: params.category,
    article_author: params.author ?? "Rampur News Desk",
    article_published_date: params.publishedDate ?? "",
  });
}

// ─── Engagement Time ───────────────────────────────────────────────────────

/**
 * Fire when a user leaves an article page.
 * Call this from a beforeunload / visibilitychange handler.
 * @param seconds - time spent on page in seconds
 */
export function trackEngagementTime(params: {
  articleId: string;
  category: string;
  seconds: number;
}) {
  if (params.seconds < 1) return;
  gtag("event", "engagement_time", {
    send_to: GA_ID,
    article_id: params.articleId,
    article_category: params.category,
    engagement_seconds: params.seconds,
    // GA4 buckets for easy segmentation in reports
    engagement_bucket:
      params.seconds < 15 ? "bounce"
      : params.seconds < 60 ? "skimmer"
      : params.seconds < 180 ? "reader"
      : "engaged",
  });
}

// ─── Session Depth ─────────────────────────────────────────────────────────

// Persisted in sessionStorage so it survives SPA navigations within a tab.
const SESSION_DEPTH_KEY = "rn_session_depth";

function getSessionDepth(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(sessionStorage.getItem(SESSION_DEPTH_KEY) ?? "0", 10);
}

/**
 * Increment session depth and fire an event.
 * Call once per page navigation (e.g. in GA4Tracker after page_view).
 */
export function trackSessionDepth() {
  if (typeof window === "undefined") return;
  const depth = getSessionDepth() + 1;
  sessionStorage.setItem(SESSION_DEPTH_KEY, String(depth));
  gtag("event", "session_depth", {
    send_to: GA_ID,
    depth,
    page_path: window.location.pathname,
  });
}

// ─── Exit Page ─────────────────────────────────────────────────────────────

/**
 * Fire when the user is about to leave the site entirely.
 * Wire this to `visibilitychange` (document.hidden) — more reliable than beforeunload.
 */
export function trackExitPage(pagePath: string) {
  gtag("event", "exit_page", {
    send_to: GA_ID,
    page_path: pagePath,
    transport_type: "beacon", // ensures delivery even as tab closes
  });
}

// ─── Scroll Depth ──────────────────────────────────────────────────────────

const firedDepths = new Set<number>();

/**
 * Call from a scroll listener. Fires once per threshold per page load.
 * Thresholds: 25, 50, 75, 100
 */
export function trackScrollDepth(scrollPercent: number, articleId?: string) {
  const thresholds = [25, 50, 75, 100];
  for (const threshold of thresholds) {
    if (scrollPercent >= threshold && !firedDepths.has(threshold)) {
      firedDepths.add(threshold);
      gtag("event", "scroll_depth", {
        send_to: GA_ID,
        depth_threshold: threshold,
        article_id: articleId ?? "",
        page_path: typeof window !== "undefined" ? window.location.pathname : "",
      });
    }
  }
}

/** Reset fired depths on route change. */
export function resetScrollDepth() {
  firedDepths.clear();
}

// ─── Share Events ──────────────────────────────────────────────────────────

export type ShareMethod = "whatsapp" | "facebook" | "twitter" | "telegram" | "copy_link" | "native";

export interface ShareParams {
  method: ShareMethod;
  articleId: string;
  title: string;
  category?: string;
}

/** Fire when a user shares an article via any channel. */
export function trackShare(params: ShareParams) {
  gtag("event", "share", {
    send_to: GA_ID,
    method: params.method,
    content_type: "article",
    item_id: params.articleId,
    article_title: params.title,
    article_category: params.category ?? "",
  });
}

// ─── Category Events ───────────────────────────────────────────────────────

/** Fire when a category page is viewed. */
export function trackCategoryView(category: string) {
  gtag("event", "category_view", {
    send_to: GA_ID,
    category_name: category,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

// ─── Search Events ─────────────────────────────────────────────────────────

/** Fire when a user performs a search. */
export function trackSearch(query: string, resultsCount?: number) {
  gtag("event", "search", {
    send_to: GA_ID,
    search_term: query,
    results_count: resultsCount ?? 0,
  });
}

// ─── Outbound Link Events ──────────────────────────────────────────────────

/** Fire when a user clicks an outbound link. */
export function trackOutboundLink(url: string, label?: string) {
  gtag("event", "click", {
    send_to: GA_ID,
    event_category: "outbound",
    event_label: label ?? url,
    transport_type: "beacon",
    link_url: url,
  });
}

// ─── Related Article Click ─────────────────────────────────────────────────

/** Fire when a user clicks a related/recommended article. */
export function trackRelatedClick(params: {
  fromArticleId: string;
  toArticleId: string;
  toTitle: string;
  position: number;
}) {
  gtag("event", "related_article_click", {
    send_to: GA_ID,
    from_article_id: params.fromArticleId,
    to_article_id: params.toArticleId,
    to_title: params.toTitle,
    position: params.position,
  });
}
