# Comprehensive Production Audit Report

**Date:** 2026-07-20  
**Platform:** Rampur News (Frontend + Custom CMS)  
**Production Readiness Score:** 62/100  
**Overall Platform Score:** 6.2/10

---

## Executive Summary

The platform is **functional but has significant technical debt and security gaps** that must be addressed before it can be considered production-grade. The content migration from Strapi is complete and articles render correctly. However, there are critical missing indexes, security vulnerabilities in backup tables, a non-functional search page, and the media pipeline still depends on Strapi infrastructure.

---

## Critical Issues (P0) — Fix Immediately

### 1. 🔴 Missing Database Indexes on `cms_articles`
**Impact:** Every category page query does a sequential scan.  
**Detail:** The `cms_articles` table has only 2 indexes (PK + slug unique). The migration script's indexes were never applied. Missing:
- `idx_cms_articles_status` (status)
- `idx_cms_articles_category` (category_id)
- `idx_cms_articles_published_at` (published_at DESC)
- `idx_cms_articles_featured` (is_featured) WHERE is_featured = true
- `idx_cms_articles_breaking` (is_breaking) WHERE is_breaking = true

**Fix:** Apply the indexes from migration 010.

### 2. 🔴 `/search` Returns 404
**Impact:** Search functionality is broken for visitors.  
**Detail:** `https://rampurnews.com/search?q=rampur` returns HTTP 404.  
**Root cause:** No search page route exists at `src/app/search/page.tsx`.

### 3. 🔴 Backup Tables Exposed Without RLS
**Impact:** Security vulnerability — anyone with the anon key can read backup data.  
**Detail:** 7 tables without RLS: `ads`, `cms_articles_backup_20260720`, `cms_editorials_backup_20260720`, `cms_authors_backup_20260720`, `cms_tags_backup_20260720`, `cms_article_tags_backup_20260720`, `cms_article_categories_backup_20260720`.  
**Fix:** Either drop backup tables (data is in version snapshots) or enable RLS + restrict access.

### 4. 🔴 100 Images Still Hosted on api.rampur.cloud
**Impact:** If Strapi server goes down, all article images break.  
**Detail:** 100 of 109 media records point to `https://api.rampur.cloud/uploads/`. Only 9 are on Supabase Storage.

---

## High Priority Issues (P1) — Fix This Week

### 5. 🟠 Security Definer Views
**Detail:** `cms_users_with_permissions` and `v_cms_user_permissions` use SECURITY DEFINER, executing with the view creator's privileges rather than the querying user's.  
**Fix:** Recreate as SECURITY INVOKER or add explicit role checks.  
**Reference:** [Supabase docs](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

### 6. 🟠 Leaked Password Protection Disabled
**Detail:** Supabase Auth's HaveIBeenPwned integration is disabled.  
**Fix:** Enable in Supabase Dashboard → Auth → Settings.

### 7. 🟠 3 Articles Have No Author
**Detail:** 3 articles have `author_id = NULL`. These render without author attribution.  
**Fix:** Assign default author (rampur-news-desk) to orphaned articles.

### 8. 🟠 CMS Revalidation Webhook Points to Wrong URL
**Detail:** CMS `.env.local` has `FRONTEND_URL=http://localhost:3000`. On production this should be `https://rampurnews.com`.  
**Impact:** Publishing new articles doesn't trigger frontend cache invalidation.

### 9. 🟠 Functions with Mutable search_path
**Detail:** 4 functions lack `SET search_path`: `ecp_refresh_search_index`, `ecp_update_taxonomy_entity_count`, `ecp_update_author_article_count`, `update_updated_at`.  
**Fix:** Add `SET search_path = public` to each function.

---

## Medium Priority Issues (P2) — Fix This Sprint

### 10. 🟡 22 Unindexed Foreign Keys
**Detail:** Multiple FK columns lack covering indexes, impacting JOIN performance. Key ones:
- `cms_articles.category_id` (used in EVERY category page query)
- `cms_articles.author_id`
- `cms_articles.featured_image_id`
- `cms_editorials.author_id`, `category_id`, `featured_image_id`

### 11. 🟡 ECP Tables are Legacy Dead Weight
**Detail:** 18+ `ecp_*` tables with ~60 unused indexes consume storage and slow schema operations. They contain duplicate data from a previous migration attempt.  
**Fix:** Drop all `ecp_*` tables after confirming they're unused.

### 12. 🟡 Overly Permissive RLS Policies on ECP Tables
**Detail:** 17 tables have `USING (true)` / `WITH CHECK (true)` policies for ALL operations.  
**Fix:** Either drop the ECP tables or tighten policies.

### 13. 🟡 `STRAPI_API_TOKEN` is Placeholder
**Detail:** `.env.production` has `STRAPI_API_TOKEN=PASTE_YOUR_STRAPI_API_TOKEN_HERE` — Strapi auth won't work in hybrid mode without a real token.

### 14. 🟡 Materialized View `ecp_search_index` Exposed to Anon
**Detail:** The search index materialized view is accessible via the anon key.

---

## Low Priority Issues (P3) — Backlog

### 15. ⚪ RLS `auth_rls_initplan` Performance
**Detail:** 4 RLS policies on `public.users` table re-evaluate `auth.uid()` per row.  
**Fix:** Replace `auth.uid()` with `(select auth.uid())`.

### 16. ⚪ No Active Ads Configured
**Detail:** `cms_ads` table has 0 active records. Ad placements exist but no campaigns are running.

### 17. ⚪ Backup Tables Lack Primary Keys
**Detail:** 6 backup tables have no PK (expected for backup tables, but flagged by Supabase linter).

### 18. ⚪ Multiple Permissive Policies on ECP Tables
**Detail:** 14 tables have duplicate SELECT policies causing unnecessary evaluation overhead.

---

## Frontend Status

| Route | HTTP | Status |
|-------|------|--------|
| Homepage `/` | 200 | ✅ Working |
| Category `/rampur` | 200 | ✅ Working |
| Category `/up` | 200 | ✅ Working |
| Category `/national` | 200 | ✅ Working |
| Article detail | 200 | ✅ Working |
| Sitemap `/sitemap.xml` | 200 | ✅ Working |
| RSS `/rss.xml` | 200 | ✅ Working |
| Robots `/robots.txt` | 200 | ✅ Working |
| API `/api/category-articles` | 200 | ✅ Working |
| 404 page | 404 | ✅ Correct |
| **Search `/search`** | **404** | **❌ BROKEN** |

### SEO Verification
- ✅ `<title>` tag present
- ✅ `og:title` present
- ✅ `canonical` present
- ✅ JSON-LD structured data present
- ✅ `viewport` meta present
- ✅ NewsArticle schema on article pages
- ✅ BreadcrumbList schema on article pages

---

## Database Health

| Metric | Value | Status |
|--------|-------|--------|
| Total articles | 102 | ✅ |
| Published articles | 102 | ✅ |
| Articles with content | 102 | ✅ |
| Articles with category | 102 | ✅ |
| Articles with author | 99 | ⚠️ (3 orphaned) |
| Articles with image | 102 | ✅ |
| Duplicate slugs | 0 | ✅ |
| Orphaned category FKs | 0 | ✅ |
| Orphaned author FKs | 0 | ✅ |
| Orphaned media FKs | 0 | ✅ |
| Categories | 19 | ✅ |
| Authors | 3 | ✅ |
| Tags | 115 | ✅ |
| Article-tag links | 178 | ✅ |
| Editorials | 15 (all published) | ✅ |
| Media on Strapi | 100 | ⚠️ Pending migration |
| Media on Supabase | 9 | ✅ |
| Tables without RLS | 7 | 🔴 Security risk |
| Missing indexes | 5+ critical | 🔴 Performance risk |

---

## Recommended Fix Priority

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Add missing indexes | 5 min (SQL) | High — query perf |
| 2 | Fix /search 404 | 30 min | High — user feature |
| 3 | Drop/secure backup tables | 5 min | High — security |
| 4 | Migrate 100 images | 2 hrs | High — removes Strapi dep |
| 5 | Fix CMS FRONTEND_URL | 1 min (env var) | High — revalidation |
| 6 | Fix security definer views | 15 min | Medium — security |
| 7 | Enable leaked password protection | 1 min | Medium — security |
| 8 | Assign authors to 3 orphaned articles | 5 min | Low — data quality |
| 9 | Drop ECP legacy tables | 10 min | Low — cleanup |
| 10 | Fix function search_path | 10 min | Low — security hardening |

---

## Production Readiness Assessment

| Category | Score | Notes |
|----------|-------|-------|
| Content delivery | 9/10 | Articles render, correct order, categories work |
| SEO | 8/10 | All meta present, schema valid, sitemap works |
| Security | 5/10 | Backup tables exposed, views unsafe, password protection off |
| Performance | 6/10 | Missing indexes, no CDN optimization visible |
| Data integrity | 9/10 | Zero orphans, all FKs valid, proper timestamps |
| Search | 2/10 | Route returns 404 |
| Media | 5/10 | 92% still on Strapi infrastructure |
| Infrastructure | 6/10 | Hybrid mode works but single-source not verified |
| Code quality | 7/10 | Clean architecture, but dead Strapi code remains |
| Monitoring | 4/10 | Debug endpoints exist but no alerting |

**Overall: 62/100 — Functional but not production-certified.**

The top 5 fixes (indexes, search, backup tables, images, webhook URL) would bring this to ~80/100.

---

*Audit completed 2026-07-20 from live data, Supabase security/performance advisors, and endpoint verification.*
