# Rampur News — System Architecture

**Last updated:** 2026-07-20  
**Version:** v2 (Post-Strapi migration)

---

## Overview

Rampur News is a Hindi-language news platform serving रामपुर district and Uttar Pradesh. The system consists of three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                   │
│  Next.js 15 (App Router) — rampurnews.com                        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Pages/Views  │  │  API Routes  │  │  Content Gateway     │   │
│  │  (SSR/ISR)   │──│  (/api/*)    │──│  (single abstraction)│   │
│  └──────────────┘  └──────────────┘  └──────────┬───────────┘   │
└─────────────────────────────────────────────────┬───────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOM CMS (Enterprise Content Platform)        │
│  Next.js + Supabase — cms.rampurnews.com                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Admin UI    │  │  Public API  │  │  Webhook Dispatcher   │   │
│  │  (editorial) │  │  /api/public │  │  (revalidation)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────┬───────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Database + Storage)                 │
│  PostgreSQL — qjnhaazliulyuqngfrkd.supabase.co                   │
│                                                                   │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ cms_*     │  │ Supabase   │  │ RLS       │  │ Realtime    │ │
│  │ tables    │  │ Storage    │  │ Policies  │  │ (future)    │ │
│  └───────────┘  └────────────┘  └───────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Article Page (`/{category}/{slug}`)

```
Browser → Next.js SSR
           ↓
         fetchArticle(slug)
           ↓
         GET cms.rampurnews.com/api/public/articles/{slug}
           ↓
         CMS API → Supabase (cms_articles JOIN cms_categories, cms_authors, cms_media)
           ↓
         Returns: { title, content (HTML), category, author, image, SEO, schema }
           ↓
         Next.js renders page + JSON-LD + OpenGraph
           ↓
         ISR cache (revalidate: 60s)
```

### Homepage

```
Browser → Next.js SSR
           ↓
         getHomepageData()
           ↓
         Content Gateway → getContent('articles', { category: X, pageSize: Y })
           ↓ (parallel for all sections)
         CMS Public API (paginated, filtered by category)
           ↓
         Deduplication engine (cross-section)
           ↓
         Render hero + category sections + sidebar
```

### Publish Flow

```
Editor → CMS Admin → Save + Publish
           ↓
         workflow.ts: transitionContent('article', id, 'published')
           ↓
         Supabase: UPDATE cms_articles SET status='published', published_at=NOW()
           ↓
         webhook.ts: dispatchRevalidation()
           ↓
         POST rampurnews.com/api/revalidate { paths: ['/', '/rampur', '/rampur/slug'] }
           ↓
         Next.js: revalidatePath() → ISR cache purged
           ↓
         Next visitor gets fresh content
```

---

## CMS Data Model

### Core Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `cms_articles` | News articles with editorial workflow | 102 |
| `cms_categories` | Content categories (hierarchical) | 19 |
| `cms_authors` | Author profiles | 3 |
| `cms_tags` | Article tags | 115 |
| `cms_media` | Media assets (images) | 109 |
| `cms_editorials` | Opinion/editorial pieces | 15 |
| `cms_article_tags` | Article ↔ Tag junction | 178 |
| `cms_article_categories` | Article ↔ Category junction (multi-cat) | 0 |
| `cms_content_versions` | Version history (rollback) | 115 |

### Article Schema (key fields)

```sql
cms_articles (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,           -- URL identifier (never changes)
  title TEXT,                 -- Hindi headline
  short_headline TEXT,        -- 65-char SEO headline
  excerpt TEXT,               -- Summary (shown in lists)
  content TEXT,               -- Full HTML body (<p>, <h2>, <strong>)
  category_id UUID FK,        -- Primary category
  author_id UUID FK,          -- Author profile
  featured_image_id UUID FK,  -- Hero image
  status TEXT,                -- draft | pending_review | approved | published | archived
  published_at TIMESTAMPTZ,   -- Publication timestamp
  -- SEO
  seo_title, seo_description, og_title, og_description, canonical_url, schema_json
  -- Flags
  is_featured, is_breaking, is_editors_pick, discover_eligible
  -- Metrics
  views, shares, read_time
)
```

---

## Content Gateway

The Content Gateway (`src/services/content/gateway.ts`) is the single abstraction layer between frontend pages and the CMS.

```typescript
import { getContent, getArticleBySlug } from '@/services/content/gateway';

// List articles by category
const articles = await getContent('articles', { category: 'rampur', pageSize: 10 });

// Fetch single article
const article = await getArticleBySlug('some-article-slug');
```

### Provider switching

The gateway reads from the Custom CMS by default. Set `CONTENT_PROVIDER=strapi` to rollback (requires Strapi infrastructure running).

---

## Homepage Builder

Defined in `src/services/content/homepageConfig.ts`:

```
Hero (8 articles, featured-first strategy)
  ↓
Rampur section (7 articles, featured template)
  ↓
UP section (6 articles, grid template)
  ↓
Nearby (7 articles, two-columns)
  ↓
National (7 articles, compact-list)
  ↓
Sports, Education, International, Religion, Editorials
```

Each section declares: category, article count, visual template, and data source.

---

## Search

Full-text search via CMS API:
```
GET /api/public/articles?search={query}&pageSize=20
```

Backed by PostgreSQL `ILIKE` on title, slug, and short_headline fields.

---

## Media Pipeline

| Stage | Location | Status |
|-------|----------|--------|
| Upload | CMS Admin → Supabase Storage | Active |
| Processing | Sharp (resize, WebP variants) | Active |
| Serving | Supabase CDN (new) / api.rampur.cloud (legacy) | Mixed |
| Legacy images | 100 images on api.rampur.cloud | Pending migration |

After media migration completes, all images will be served from Supabase Storage CDN.

---

## Editorial Workflow

```
Draft → Pending Review → Approved → Published → Archived
  ↑                                      │
  └──────────────────────────────────────┘ (back to draft)
```

- Any status → Draft is always valid
- Publishing: sets `published_at`, creates version snapshot, dispatches revalidation webhook
- RBAC: super_admin, admin, editor, author, contributor roles

---

## Deployment

### Frontend (rampurnews.com)
- **Host:** Hostinger VPS
- **Runtime:** Next.js standalone (PM2)
- **Port:** Behind nginx reverse proxy
- **Cache:** ISR (30–60s revalidation) + CDN

### CMS (cms.rampurnews.com)
- **Host:** Same VPS
- **Runtime:** Next.js (PM2, port 3000)
- **Database:** Supabase (remote PostgreSQL)
- **Storage:** Supabase Storage (remote)

### Revalidation
- On publish: CMS → `POST rampurnews.com/api/revalidate` with paths
- Secret: `REVALIDATION_SECRET` shared between CMS and frontend
- Retry: 5 attempts with exponential backoff

---

## Rollback Strategy

### Content rollback
- All modified articles have version snapshots in `cms_content_versions`
- Backup tables: `cms_articles_backup_20260720`, `cms_editorials_backup_20260720`

### Frontend rollback
- Set `ENABLE_STRAPI_AGGREGATION=true` → aggregator resumes dual-fetch
- All Strapi provider code is retained (disabled, not deleted)
- PM2 restart applies immediately

---

## Migration History

| Date | Event |
|------|-------|
| 2026-02 | Strapi deployed as initial CMS |
| 2026-06 | Custom CMS (Supabase) created |
| 2026-07 | Content reconciliation: 100 articles migrated with full body HTML |
| 2026-07-20 | Frontend switched to single-source CMS (Strapi disabled) |
| Pending | Media migration to Supabase Storage |
| Pending | Strapi full retirement |
