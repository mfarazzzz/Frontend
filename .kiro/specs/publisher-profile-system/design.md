# Design Document — Publisher Profile System

## Overview

The Publisher Profile System transforms the basic Authors module into an enterprise-grade publisher management system. It creates SEO-optimized, AI-search-ready author profile pages at `/author/[slug]` with comprehensive structured data, E-E-A-T signals, and Google News compliance.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                           │
├─────────────────────────────────────────────────────────────┤
│  /author/[slug]  ←  New Publisher Profile Page (SSR/ISR)     │
│  /authors/[slug] →  301 Redirect to /author/[slug]           │
│  /authors        ←  Authors Listing (existing)               │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                  │
│  ├── publisher/ProfileHero.tsx       (Cover + Avatar + Stats)│
│  ├── publisher/ProfileAbout.tsx      (Biography + Entity)    │
│  ├── publisher/ProfileEEAT.tsx       (Expertise + Creds)     │
│  ├── publisher/ProfileSocial.tsx     (Social + Prof Links)   │
│  ├── publisher/ArticleSection.tsx    (Tabbed Articles)       │
│  ├── publisher/Breadcrumb.tsx        (Navigation)            │
│  └── publisher/AuthorAttribution.tsx (Article Byline)        │
├─────────────────────────────────────────────────────────────┤
│  Libraries:                                                   │
│  ├── types/publisher-profile.ts      (Extended Types)        │
│  └── lib/publisher-schema.ts         (JSON-LD Generator)     │
├─────────────────────────────────────────────────────────────┤
│  Middleware:                                                  │
│  └── /authors/[slug] → /author/[slug] (301 Redirect)        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Custom CMS (Supabase-backed)                     │
│              cms.rampurnews.com                               │
│              GET /api/public/authors                          │
│              GET /api/public/articles                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. Reader requests `/author/mohd-zeeshan-raza-khan`
2. Next.js SSR renders the page (revalidate: 60s ISR)
3. `findAuthorBySlug()` fetches from CMS, matches by slug/name
4. `cmsAuthorToPublisherProfile()` maps CMS data → extended profile
5. `getAuthorArticles()` fetches articles by author
6. `buildAllAuthorSchemas()` generates Person + ProfilePage + Breadcrumb + WebPage JSON-LD
7. Components render semantic HTML with ARIA labels
8. Metadata generated via `generateMetadata()` (OG, Twitter, robots, canonical)

## Structured Data Strategy

Each author page embeds 4 JSON-LD blocks:
- **Person** — name, jobTitle, worksFor (NewsMediaOrganization), sameAs, knowsAbout, alumniOf, award
- **ProfilePage** — mainEntity → Person, dateModified
- **BreadcrumbList** — Home > Authors > Author Name
- **WebPage** — author, publisher, inLanguage

## Key Design Decisions

1. **New route `/author/[slug]`** (singular) with 301 from legacy `/authors/[slug]` — preserves SEO equity while establishing a clean URL structure.
2. **`cmsAuthorToPublisherProfile()` adapter** — decouples the extended profile from the CMS data model, allowing gradual backend enrichment.
3. **Fallback biography generation** — ensures every page has 150+ characters of entity-rich content for AI search indexing.
4. **Component composition** — each section is a standalone component for reuse and testability.
5. **Server-side rendering with ISR (60s)** — optimal for freshness while maintaining performance.
