/**
 * Shared time formatting utilities.
 * Single source of truth — previously duplicated in Index.tsx, Sidebar.tsx, and NewsCard.tsx.
 */

/**
 * Format a date string as relative time in Hindi.
 * Returns empty string for invalid/missing dates.
 */
export function formatRelativeTimeHindi(dateString?: string | null): string {
  if (!dateString) return "";
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
}

/**
 * Check if an image URL is a real image (not a placeholder).
 */
export function hasRealImage(src?: string | null): boolean {
  if (!src) return false;
  const lowered = src.toLowerCase();
  if (lowered.includes("placeholder")) return false;
  if (lowered.includes("news-placeholder")) return false;
  return true;
}
