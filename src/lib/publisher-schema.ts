/**
 * Publisher Profile — Structured Data (JSON-LD) Generator
 *
 * Generates Person, ProfilePage, BreadcrumbList, WebPage, and
 * NewsMediaOrganization schemas for author profile pages.
 *
 * Optimized for Google Rich Results, Knowledge Graph, and AI Search.
 */

import type { PublisherProfile } from '@/types/publisher-profile';

const SITE_URL = 'https://rampurnews.com';
const ORG_NAME = 'रामपुर न्यूज़ | Rampur News';
const ORG_LOGO = `${SITE_URL}/logo.png`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Remove undefined/null/empty values from an object */
function pruneEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const entries = Object.entries(obj).filter(([, v]) => {
    if (v === undefined || v === null) return false;
    if (typeof v === 'string' && v.trim() === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
  return Object.fromEntries(entries);
}

// ─── SameAs Builder ───────────────────────────────────────────────────────────

export function buildSameAs(profile: PublisherProfile): string[] {
  const urls: string[] = [];

  // Priority: Wikipedia and Google Scholar first
  if (profile.professionalLinks.wikipedia) {
    urls.push(profile.professionalLinks.wikipedia);
  }
  if (profile.professionalLinks.googleScholar) {
    urls.push(profile.professionalLinks.googleScholar);
  }

  // Social links
  const socialOrder: (keyof typeof profile.socialLinks)[] = [
    'linkedin', 'twitter', 'facebook', 'instagram',
    'youtube', 'threads', 'telegram', 'whatsapp', 'koo',
  ];
  for (const key of socialOrder) {
    const url = profile.socialLinks[key];
    if (url && url.startsWith('http')) urls.push(url);
  }

  // Professional links (excluding already-added Wikipedia/Scholar)
  const profOrder: (keyof typeof profile.professionalLinks)[] = [
    'website', 'blog', 'orcid', 'github', 'medium', 'substack',
  ];
  for (const key of profOrder) {
    const url = profile.professionalLinks[key];
    if (url && url.startsWith('http')) urls.push(url);
  }

  return urls;
}

// ─── Person Schema ────────────────────────────────────────────────────────────

export function buildPersonSchema(profile: PublisherProfile) {
  const url = `${SITE_URL}/author/${profile.slug}`;
  const sameAs = buildSameAs(profile);

  const alumniOf = profile.education.length > 0
    ? profile.education.map((edu) => pruneEmpty({
        '@type': 'EducationalOrganization',
        name: edu.institution,
      }))
    : undefined;

  const hasOccupation = profile.designation
    ? [{ '@type': 'Occupation', name: profile.designation }]
    : undefined;

  const schema = pruneEmpty({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: profile.fullName,
    alternateName: profile.hindiName !== profile.fullName ? profile.hindiName : undefined,
    jobTitle: profile.designation,
    description: profile.shortBio || profile.fullBiography?.slice(0, 300),
    url,
    image: profile.profileImage || `${SITE_URL}/og-image.png`,
    worksFor: {
      '@type': 'NewsMediaOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: ORG_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: ORG_LOGO,
        width: 768,
        height: 768,
      },
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: profile.knowsAbout.length > 0 ? profile.knowsAbout : undefined,
    hasOccupation,
    alumniOf,
    award: profile.awards.length > 0 ? profile.awards : undefined,
    knowsLanguage: profile.languages.length > 0 ? profile.languages : undefined,
  });

  return schema;
}

// ─── ProfilePage Schema ───────────────────────────────────────────────────────

export function buildProfilePageSchema(profile: PublisherProfile) {
  const url = `${SITE_URL}/author/${profile.slug}`;

  return pruneEmpty({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profilepage`,
    name: `${profile.fullName} – ${profile.designation || 'Author'} | ${ORG_NAME}`,
    url,
    mainEntity: { '@id': `${url}#person` },
    dateModified: profile.lastActiveDate || undefined,
    inLanguage: 'hi-IN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
  });
}

// ─── BreadcrumbList Schema ────────────────────────────────────────────────────

export function buildBreadcrumbSchema(profile: PublisherProfile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Authors',
        item: `${SITE_URL}/authors`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile.fullName,
        item: `${SITE_URL}/author/${profile.slug}`,
      },
    ],
  };
}

// ─── WebPage Schema ───────────────────────────────────────────────────────────

export function buildWebPageSchema(profile: PublisherProfile) {
  const url = `${SITE_URL}/author/${profile.slug}`;

  return pruneEmpty({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: `${profile.fullName} – ${profile.designation || 'Author'} | ${ORG_NAME}`,
    description: profile.shortBio || `${profile.fullName} is a ${profile.designation || 'journalist'} at ${ORG_NAME}.`,
    inLanguage: 'hi-IN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${url}#person` },
    author: { '@id': `${url}#person` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    dateModified: profile.lastActiveDate || undefined,
    breadcrumb: { '@id': `${url}#breadcrumb` },
  });
}

// ─── Combined Schema (all schemas in one array) ──────────────────────────────

export function buildAllAuthorSchemas(profile: PublisherProfile) {
  return [
    buildPersonSchema(profile),
    buildProfilePageSchema(profile),
    buildBreadcrumbSchema(profile),
    buildWebPageSchema(profile),
  ];
}
