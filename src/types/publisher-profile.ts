/**
 * Publisher Profile System — Extended Author Types
 *
 * Enterprise-grade type definitions for the Publisher & Author Management System.
 * Extends the base CMSAuthor with fields required for E-E-A-T, Knowledge Graph,
 * Google News, Google Discover, and AI Search optimization.
 */

// ─── Beat / Coverage Areas ────────────────────────────────────────────────────

export const BEATS = [
  'Politics',
  'Crime',
  'Sports',
  'Education',
  'Business',
  'Health',
  'Technology',
  'Entertainment',
  'Local News',
] as const;

export type Beat = (typeof BEATS)[number];

// ─── Editorial Statuses ───────────────────────────────────────────────────────

export const EDITORIAL_STATUSES = [
  'Active',
  'On Leave',
  'Guest Author',
  'Freelancer',
  'Staff Writer',
  'Editor',
  'Senior Editor',
  'Chief Editor',
  'Inactive',
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

// ─── Languages ────────────────────────────────────────────────────────────────

export const LANGUAGES = ['Hindi', 'English', 'Urdu'] as const;

export type Language = (typeof LANGUAGES)[number] | string;

// ─── Verification ─────────────────────────────────────────────────────────────

export type VerificationStatus = 'verified' | 'unverified' | 'pending';

// ─── Education ────────────────────────────────────────────────────────────────

export interface Education {
  degree: string;
  institution: string;
  year?: number;
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export interface SocialLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  threads?: string;
  telegram?: string;
  whatsapp?: string;
  koo?: string;
}

export interface ProfessionalLinks {
  website?: string;
  blog?: string;
  wikipedia?: string;
  googleScholar?: string;
  orcid?: string;
  github?: string;
  medium?: string;
  substack?: string;
}

// ─── Publisher Profile (Extended Author) ──────────────────────────────────────

export interface PublisherProfile {
  // ─── Identity ─────────────────────────────────────────────────────────────
  id: string;
  slug: string;
  fullName: string;
  hindiName: string;
  displayName: string;
  email: string;

  // ─── Biography ────────────────────────────────────────────────────────────
  shortBio: string;
  fullBiography: string;

  // ─── Professional ─────────────────────────────────────────────────────────
  designation: string;
  department: string;
  beat: Beat | string;
  experienceYears: number;
  experienceDescription: string;
  languages: Language[];

  // ─── Credentials ──────────────────────────────────────────────────────────
  education: Education[];
  certifications: string[];
  awards: string[];

  // ─── Media ────────────────────────────────────────────────────────────────
  profileImage: string;
  coverImage: string;
  organizationLogo?: string;

  // ─── Social & Professional ────────────────────────────────────────────────
  socialLinks: SocialLinks;
  professionalLinks: ProfessionalLinks;

  // ─── E-E-A-T & Knowledge Graph ────────────────────────────────────────────
  knowsAbout: string[];
  verificationStatus: VerificationStatus;
  editorialStatus: EditorialStatus;

  // ─── Dates ────────────────────────────────────────────────────────────────
  joinDate: string;
  lastActiveDate: string;

  // ─── Contact (optional) ───────────────────────────────────────────────────
  contactEmail?: string;
  contactPhone?: string;
}

// ─── Author Statistics ────────────────────────────────────────────────────────

export interface AuthorStats {
  totalArticles: number;
  categoriesCovered: number;
  totalViews: number;
  averageReadTime: number; // in minutes
  breakingNewsCount: number;
}

export interface AuthorArticleSummary {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryHindi: string;
  image: string;
  excerpt: string;
  publishedDate: string;
  views: number;
  readTime?: string;
}

// ─── Helper: Convert CMSAuthor to PublisherProfile ────────────────────────────

export function cmsAuthorToPublisherProfile(
  author: any,
  overrides?: Partial<PublisherProfile>,
): PublisherProfile {
  const socialLinks: SocialLinks = {
    twitter: author.twitterUrl || author.socialLinks?.twitter || undefined,
    facebook: author.facebookUrl || author.socialLinks?.facebook || undefined,
    instagram: author.instagramUrl || author.socialLinks?.instagram || undefined,
    linkedin: author.linkedinUrl || author.socialLinks?.linkedin || undefined,
    youtube: author.socialLinks?.youtube || undefined,
    threads: author.socialLinks?.threads || undefined,
    telegram: author.socialLinks?.telegram || undefined,
    whatsapp: author.whatsappUrl || author.socialLinks?.whatsapp || undefined,
    koo: author.socialLinks?.koo || undefined,
  };

  const professionalLinks: ProfessionalLinks = {
    website: author.websiteUrl || author.socialLinks?.website || undefined,
    blog: author.socialLinks?.blog || undefined,
    wikipedia: author.socialLinks?.wikipedia || undefined,
    googleScholar: author.socialLinks?.googleScholar || undefined,
    orcid: author.socialLinks?.orcid || undefined,
    github: author.socialLinks?.github || undefined,
    medium: author.socialLinks?.medium || undefined,
    substack: author.socialLinks?.substack || undefined,
  };

  return {
    id: author.id || '',
    slug: author.slug || '',
    fullName: author.name || '',
    hindiName: author.nameHindi || author.name || '',
    displayName: author.name || author.nameHindi || '',
    email: author.email || '',
    shortBio: author.shortBio || (author.bio ? author.bio.slice(0, 300) : ''),
    fullBiography: author.fullBiography || author.bio || '',
    designation: author.designation || '',
    department: author.department || '',
    beat: author.beat || '',
    experienceYears: author.experienceYears || 0,
    experienceDescription: author.experienceDescription || author.experience || '',
    languages: author.languages || ['Hindi'],
    education: author.education || [],
    certifications: author.certifications || [],
    awards: author.awards || [],
    profileImage: author.avatar || author.profileImage || '',
    coverImage: author.coverImage || '',
    organizationLogo: author.organizationLogo || '',
    socialLinks,
    professionalLinks,
    knowsAbout: Array.isArray(author.knowsAbout) ? author.knowsAbout : [],
    verificationStatus: author.verificationStatus || 'unverified',
    editorialStatus: author.editorialStatus || 'Active',
    joinDate: author.joinDate || author.createdAt || '',
    lastActiveDate: author.lastActiveDate || author.updatedAt || '',
    contactEmail: author.contactEmail,
    contactPhone: author.contactPhone,
    ...overrides,
  };
}
