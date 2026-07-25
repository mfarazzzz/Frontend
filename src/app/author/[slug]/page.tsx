/**
 * Publisher Profile Page — /author/[slug]
 *
 * Enterprise-grade author profile page optimized for:
 * - Google Search, News, Discover
 * - AI Search (ChatGPT, Gemini, Claude, Perplexity, Copilot)
 * - E-E-A-T signals and Knowledge Graph
 * - Structured data (Person, ProfilePage, BreadcrumbList, WebPage)
 * - Accessibility (WCAG 2.1 AA)
 * - Core Web Vitals
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getCMSProvider } from '@/services/cms';
import type { CMSAuthor, CMSArticle } from '@/services/cms';
import { stripHtmlToText, truncateText } from '@/lib/utils';
import { buildAllAuthorSchemas } from '@/lib/publisher-schema';
import {
  cmsAuthorToPublisherProfile,
  type PublisherProfile,
  type AuthorStats,
  type AuthorArticleSummary,
} from '@/types/publisher-profile';
import PublisherProfileHero from '@/components/publisher/ProfileHero';
import PublisherProfileAbout from '@/components/publisher/ProfileAbout';
import PublisherProfileEEAT from '@/components/publisher/ProfileEEAT';
import PublisherProfileSocial from '@/components/publisher/ProfileSocial';
import PublisherArticleSection from '@/components/publisher/ArticleSection';
import PublisherBreadcrumb from '@/components/publisher/Breadcrumb';

const SITE_URL = 'https://rampurnews.com';

export const revalidate = 60;

type PageParams = { slug: string };

// ─── Data Fetching ────────────────────────────────────────────────────────────

const toSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const findAuthorBySlug = cache(async (slug: string): Promise<CMSAuthor | null> => {
  const provider = getCMSProvider();
  try {
    const authors = await provider.getAuthors();
    const normalized = slug.toLowerCase();

    const direct = authors.find((a) => a.slug && a.slug.toLowerCase() === normalized);
    if (direct) return direct;

    const byEnglish = authors.find((a) => a.name && toSlug(a.name) === normalized);
    if (byEnglish) return byEnglish;

    const byHindi = authors.find((a) => a.nameHindi && toSlug(a.nameHindi) === normalized);
    if (byHindi) return byHindi;

    return null;
  } catch {
    return null;
  }
});

const getAuthorArticles = cache(async (author: CMSAuthor): Promise<{
  articles: AuthorArticleSummary[];
  stats: AuthorStats;
  categories: { slug: string; name: string; count: number }[];
}> => {
  const provider = getCMSProvider();
  try {
    const page = await provider.getArticles({
      author: author.email || author.name,
      limit: 50,
      orderBy: 'publishedDate',
      order: 'desc',
    });

    const allArticles = (page?.data ?? []).filter(
      (a) => a.author === author.name || a.author === author.nameHindi,
    );

    const articles: AuthorArticleSummary[] = allArticles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      categoryHindi: a.categoryHindi || '',
      image: a.image || '/og-image.png',
      excerpt: a.excerpt || stripHtmlToText(a.content || '').slice(0, 140),
      publishedDate: a.publishedAt || a.publishedDate || '',
      views: a.views || 0,
      readTime: a.readTime,
    }));

    // Compute stats
    const categoriesMap = new Map<string, { name: string; count: number }>();
    let totalViews = 0;
    let totalReadMinutes = 0;
    let breakingCount = 0;

    for (const a of allArticles) {
      totalViews += a.views || 0;
      if (a.isBreaking) breakingCount++;
      const rt = a.readTime ? parseInt(a.readTime, 10) : 0;
      if (rt > 0) totalReadMinutes += rt;

      const catSlug = a.category?.trim();
      if (catSlug) {
        const existing = categoriesMap.get(catSlug);
        if (existing) {
          existing.count++;
        } else {
          categoriesMap.set(catSlug, { name: a.categoryHindi || catSlug, count: 1 });
        }
      }
    }

    const categories = Array.from(categoriesMap.entries())
      .map(([slug, { name, count }]) => ({ slug, name, count }))
      .sort((a, b) => b.count - a.count);

    const stats: AuthorStats = {
      totalArticles: allArticles.length,
      categoriesCovered: categories.length,
      totalViews,
      averageReadTime: allArticles.length > 0 ? Math.max(1, Math.round(totalReadMinutes / allArticles.length)) : 0,
      breakingNewsCount: breakingCount,
    };

    return { articles, stats, categories };
  } catch {
    return {
      articles: [],
      stats: { totalArticles: 0, categoriesCovered: 0, totalViews: 0, averageReadTime: 0, breakingNewsCount: 0 },
      categories: [],
    };
  }
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(props: { params: Promise<PageParams> }): Promise<Metadata> {
  const { slug } = await props.params;
  const author = await findAuthorBySlug(slug);

  if (!author) {
    return {
      title: 'Author Not Found | रामपुर न्यूज़',
      robots: { index: false, follow: false },
    };
  }

  const profile = cmsAuthorToPublisherProfile(author);
  const name = profile.fullName || profile.hindiName;
  const designation = profile.designation || 'Author';

  const title = `${name} – ${designation} | रामपुर न्यूज़`;
  const description = profile.shortBio
    || `${name} is a ${designation} at रामपुर न्यूज़ covering ${profile.beat || 'news'}.`;
  const canonicalUrl = `${SITE_URL}/author/${slug}`;
  const image = profile.profileImage || `${SITE_URL}/og-image.png`;

  const keywords = [
    name,
    profile.hindiName !== name ? profile.hindiName : '',
    designation,
    profile.beat,
    'रामपुर न्यूज़',
    'Rampur News',
    ...profile.knowsAbout.slice(0, 5),
  ].filter(Boolean);

  return {
    title,
    description: truncateText(description, 160),
    alternates: { canonical: `/author/${slug}` },
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'profile',
      title,
      description: truncateText(description, 160),
      url: canonicalUrl,
      siteName: 'रामपुर न्यूज़ | Rampur News',
      locale: 'hi_IN',
      images: [{ url: image, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateText(description, 160),
      images: [image],
    },
    other: {
      'ai-content-declaration': 'human-written',
      'perplexity-indexable': 'true',
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function AuthorProfilePage(props: { params: Promise<PageParams> }) {
  const { slug } = await props.params;
  const author = await findAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const profile = cmsAuthorToPublisherProfile(author);
  const { articles, stats, categories } = await getAuthorArticles(author);
  const schemas = buildAllAuthorSchemas(profile);

  // Generate fallback bio if empty
  const biography = profile.fullBiography || profile.shortBio || generateFallbackBio(profile, stats);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <main className="bg-background min-h-screen" role="main" aria-label={`${profile.fullName} Author Profile`}>
        {/* Breadcrumb Navigation */}
        <PublisherBreadcrumb authorName={profile.fullName} slug={slug} />

        {/* Hero Section */}
        <PublisherProfileHero profile={profile} stats={stats} />

        {/* About / E-E-A-T Section */}
        <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* About the Author */}
            <PublisherProfileAbout profile={profile} biography={biography} />

            {/* E-E-A-T Signals */}
            <PublisherProfileEEAT profile={profile} />
          </div>

          {/* Sidebar: Social & Professional Links */}
          <aside className="space-y-6" aria-label="Author Links and Information">
            <PublisherProfileSocial profile={profile} />
          </aside>
        </div>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="border-t border-border/70" />
        </div>

        {/* Articles Section */}
        <PublisherArticleSection
          articles={articles}
          categories={categories}
          authorName={profile.fullName}
          slug={slug}
        />
      </main>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateFallbackBio(profile: PublisherProfile, stats: AuthorStats): string {
  const parts: string[] = [];
  const name = profile.fullName || profile.hindiName;
  const designation = profile.designation || 'पत्रकार';

  parts.push(`${name} (${designation}) रामपुर न्यूज़ के लिए समाचार कवरेज करते हैं।`);

  if (profile.beat) {
    parts.push(`उनकी विशेषज्ञता ${profile.beat} क्षेत्र में है।`);
  }

  if (profile.experienceYears > 0) {
    parts.push(`उनके पास ${profile.experienceYears} वर्षों का अनुभव है।`);
  }

  if (stats.totalArticles > 0) {
    parts.push(`अब तक उन्होंने ${stats.totalArticles} से अधिक लेख प्रकाशित किए हैं।`);
  }

  if (profile.languages.length > 0) {
    parts.push(`भाषाएं: ${profile.languages.join(', ')}।`);
  }

  // Ensure minimum 150 characters for AI Search
  let bio = parts.join(' ');
  if (bio.length < 150) {
    bio += ` लेखक का विस्तृत परिचय शीघ्र अपडेट किया जाएगा।`;
  }

  return bio;
}
