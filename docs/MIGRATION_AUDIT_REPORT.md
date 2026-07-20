# Strapi → Custom CMS Migration Audit Report

**Date:** 2026-07-20  
**Auditor:** Kiro  
**Status:** PRE-MIGRATION — Awaiting approval

---

## 1. System Inventory

### Source: Strapi (api.rampur.cloud)

| Metric | Count |
|--------|-------|
| Total articles (unique) | **100** |
| Reported total (API pagination bug) | 261 |
| Authors | 4 (3 named + 1 empty) |
| Categories used | 5 (up, national, rampur, crime, nearby) |
| Tags (unique) | 100 |
| Articles with tags | 18 |
| Articles with multiple categories | 14 |
| Media files (unique image URLs) | 100 |
| Article status | **ALL draft** (100/100) |
| Articles with body content | **0** (none have content field) |

**Key finding:** Strapi's custom controller reports `total: 261` but returns the same 100 articles on every page. The pagination is broken. There are exactly **100 unique articles** by both slug and ID (IDs 584–829).

**Critical data gap:** All 100 articles in Strapi have `content: ""` (empty body). The excerpt field is the only text content available.

### Target: Custom CMS (Supabase — cms_articles)

| Metric | Count |
|--------|-------|
| Total articles | **102** |
| Published articles | 102 |
| Draft articles | 0 |
| Categories | 19 |
| Authors | 1 (Rampur News Desk) |
| Tags | 0 |
| Media files | 109 (100 Strapi-hosted + 9 Supabase-hosted) |
| Editorials | 15 |
| Article-tag links | 0 |
| Article-category links | 0 |

---

## 2. Overlap / Duplicate Analysis

### Slug-based comparison

| Status | Count | Detail |
|--------|-------|--------|
| In BOTH systems (same slug) | **100** | All Strapi articles already exist in CMS |
| Only in Strapi (need migration) | **0** | Nothing to migrate |
| Only in CMS (native content) | **2** | New articles created directly in CMS |

**The 2 CMS-only articles:**
1. `rampur-azam-khan-saza-barkarar-court-ne-yachika-kharij-ki`
2. `rampur-mein-naye-police-adhikshak-anil-kumar-singh-ne-sambhaala-kaaryabhaar`

### Conclusion on duplicates

All 100 Strapi articles were **already migrated** into `cms_articles` by a previous operation. A prior migration inserted these records. However, the migration was **severely incomplete** — it preserved only partial data.

---

## 3. Data Quality Issues in Existing CMS Records

The 100 articles that were previously migrated from Strapi have the following **missing fields:**

| Field | Missing | Of 102 | Severity |
|-------|---------|--------|----------|
| `category_id` (FK to cms_categories) | 100 | 102 | 🔴 CRITICAL — articles have no category |
| `author_id` (FK to cms_authors) | 102 | 102 | 🔴 CRITICAL — no author linked |
| `content` (body text) | 100 | 102 | 🟡 EXPECTED — Strapi also has empty content |
| `seo_title` | 75 | 102 | 🟠 HIGH — SEO impact |
| `og_title` | 82 | 102 | 🟠 HIGH — social sharing impact |
| `focus_keyword` | 75 | 102 | 🟡 MEDIUM — SEO helper |
| `seo_description` | 2 | 102 | ✅ Mostly populated |
| `published_at` | 0 | 102 | ✅ All populated |
| `featured_image_id` | 0 | 102 | ✅ All have images |

### Root cause
The previous migration copied basic fields (title, slug, excerpt, short_headline, image, schema_json, flags, published_at) but did NOT:
- Resolve category slugs to `category_id` UUIDs
- Create author records and link them
- Copy SEO fields (metaTitle, ogTitle, ogDescription)
- Create tags or article-tag relationships
- Populate content (though Strapi also has empty content)

---

## 4. Strapi Data Completeness Audit

What Strapi actually provides per article:

| Field | Available | Notes |
|-------|-----------|-------|
| `title` | 100/100 | ✅ |
| `slug` | 100/100 | ✅ |
| `short_headline` | 100/100 | ✅ |
| `excerpt` | 100/100 | ✅ (this IS the article content) |
| `content` (body) | **0/100** | 🔴 Always empty |
| `category` (slug) | 100/100 | ✅ |
| `categoryHindi` | 100/100 | ✅ |
| `author` (name) | 99/100 | ✅ |
| `authorSlug` | 99/100 | ✅ |
| `image` | 100/100 | ✅ |
| `publishedDate` | 100/100 | ✅ |
| `isFeatured` | 100/100 | ✅ |
| `isBreaking` | 100/100 | ✅ |
| `news_category` | 100/100 | ✅ |
| `metaTitle` | 100/100 | ✅ |
| `metaDescription` | 100/100 | ✅ |
| `ogTitle` | 18/100 | ⚠️ Partial |
| `ogDescription` | 18/100 | ⚠️ Partial |
| `focus_keyword` | 25/100 | ⚠️ Partial |
| `tags[]` | 18/100 | ⚠️ Partial |
| `categories[]` | 21/100 | ⚠️ Multi-category partial |
| `jsonLd` | 100/100 | ✅ |
| `newsKeywords` | 26/100 | ⚠️ Partial |
| `videoType` | 100/100 | ✅ |
| `discoverEligible` | 100/100 | ✅ |
| `status` | ALL "draft" | ⚠️ All articles are "draft" in Strapi |

---

## 5. Author Analysis

### Strapi authors
| Author | Articles |
|--------|----------|
| Mohd Zeeshan Raza Khan | 72 |
| Rampur News Desk | 26 |
| Education Desk | 1 |
| (empty) | 1 |

### CMS authors (existing)
| Author | Slug |
|--------|------|
| Rampur News Desk | `rampur-news-desk` |

**Migration required:** Create 2 new authors:
1. "Mohd Zeeshan Raza Khan" (slug: `mohd-zeeshan-raza-khan`)
2. "Education Desk" (slug: `education-desk`)

Author metadata from Strapi: slug, name, authorId (numeric). No profile/bio/avatar available from the API.

---

## 6. Category Analysis

### Strapi categories (used in articles)
| Category | Articles | Exists in CMS? |
|----------|----------|----------------|
| up | 70 | ✅ Yes (slug: `up`) |
| national | 16 | ✅ Yes (slug: `national`) |
| rampur | 11 | ✅ Yes (slug: `rampur`) |
| crime | 2 | ✅ Yes (slug: `crime`) |
| nearby | 1 | ✅ Yes (slug: `nearby`) |

**All 5 Strapi categories already exist in the CMS.** No new categories needed.

### Multi-category articles (14 articles)
These have a `categories[]` array with multiple entries. The `cms_article_categories` junction table is empty — these relationships need to be created.

---

## 7. Media Analysis

| Metric | Count |
|--------|-------|
| Total media records in CMS | 109 |
| Hosted at api.rampur.cloud | 100 |
| Hosted in Supabase Storage | 9 |
| Unique image URLs in Strapi | 100 |

### Media Strategy Evaluation

**Option A: Import all media into Supabase Storage**
- Pros: No runtime dependency on Strapi/api.rampur.cloud; full control; can generate variants
- Cons: ~100 images to download/re-upload; need to update all `cms_media.url` references; temporary URL changes
- Effort: Medium (scripted batch operation)
- Risk: Low (can run in parallel, keep old URLs as fallback)

**Option B: Keep legacy media URLs (point to api.rampur.cloud)**
- Pros: Zero effort now; images already work; no URL changes needed
- Cons: **CRITICAL DEPENDENCY** — if api.rampur.cloud goes down, ALL images break (100 articles affected)
- Risk: HIGH — contradicts the goal of zero runtime dependency on Strapi

**Recommendation: Option A (import into Supabase Storage)**

Rationale: The entire point of this migration is to retire Strapi. If 100 images still point to `api.rampur.cloud`, you cannot shut down that server. The media import should happen BEFORE Strapi retirement, with a fallback period where both URLs work.

**Implementation:** 
1. Download all 100 images from `api.rampur.cloud/uploads/`
2. Upload to Supabase Storage bucket `cms-media` 
3. Update `cms_media.url` to the new Supabase Storage public URL
4. Verify all images load on frontend
5. Only then can api.rampur.cloud be retired

---

## 8. What This Migration Actually Needs To Do

Since all 100 articles already exist in `cms_articles`, this is NOT an INSERT operation. It's an **UPDATE** to repair the incomplete previous migration:

### Required updates (per article):

1. **Set `category_id`** — resolve Strapi's `category` slug to the UUID in `cms_categories`
2. **Set `author_id`** — create missing authors, then link by slug
3. **Set `seo_title`** — from Strapi's `metaTitle`
4. **Set `og_title`** — from Strapi's `ogTitle` (where available, fallback to metaTitle)
5. **Set `og_description`** — from Strapi's `ogDescription` (where available, fallback to metaDescription)
6. **Set `focus_keyword`** — from Strapi's `focus_keyword`
7. **Create tags** — insert 100 unique tags into `cms_tags`
8. **Create article-tag links** — for the 18 articles that have tags
9. **Create article-category links** — for the 14 articles with multiple categories
10. **Import media** — download from api.rampur.cloud, upload to Supabase Storage

### NOT required (already complete):
- Title, slug, excerpt, short_headline ✅
- featured_image_id ✅ (already linked)
- published_at ✅
- is_featured, is_breaking ✅
- schema_json ✅
- news_category ✅
- seo_description ✅ (98/100 populated)

---

## 9. Migration Counts (Exact)

| Operation | Count |
|-----------|-------|
| Articles to INSERT | **0** (all exist) |
| Articles to UPDATE (repair fields) | **100** |
| Authors to CREATE | **2** (Mohd Zeeshan Raza Khan, Education Desk) |
| Categories to CREATE | **0** (all exist) |
| Tags to CREATE | **~100** unique tags |
| Article-tag links to CREATE | **~180** (18 articles × avg ~10 tags) |
| Article-category links to CREATE | **~35** (14 articles × avg 2.5 cats) |
| Media to re-host | **100** images (from api.rampur.cloud → Supabase Storage) |
| Editorials needing repair | **15** (missing author_id, category_id) |

---

## 10. Conflict Report

| Conflict Type | Count | Resolution |
|---------------|-------|------------|
| Slug collisions | 0 | N/A |
| Case-variant slugs | 0 | All match exactly |
| Same slug, different content | 0 | Not applicable |
| Articles with changed Strapi IDs | N/A | Strapi IDs not stored in CMS |
| Orphaned categories | 0 | All Strapi categories exist in CMS |
| Orphaned media | 0 | All images have CMS records |

---

## 11. Rollback Strategy

Since this migration is UPDATEs (not INSERTs), rollback approach:

1. **Before migration:** Take a snapshot of all 102 article rows (SELECT * INTO backup table)
2. **Migration script:** Track every UPDATE with before/after values
3. **Rollback:** Restore from backup table if any verification fails
4. **Media:** Keep old Strapi URLs accessible during transition period

SQL for pre-migration backup:
```sql
CREATE TABLE cms_articles_backup_pre_migration AS 
SELECT * FROM cms_articles;
```

---

## 12. Validation Checklist (Post-Migration)

After migration, automatically verify:

- [ ] Article count matches (102 articles)
- [ ] All articles have category_id set (target: 102/102)
- [ ] All articles have author_id set (target: 101/102, 1 has empty author)
- [ ] seo_title populated (target: 100/102)
- [ ] og_title populated where Strapi had it (target: at least 18 additional)
- [ ] Tags table has ~100 entries
- [ ] article_tags junction has ~180 rows
- [ ] article_categories junction has ~35 rows
- [ ] All media URLs resolve (HTTP 200)
- [ ] No broken category_id FKs
- [ ] No broken author_id FKs
- [ ] No duplicate slugs
- [ ] Published_at unchanged for all articles
- [ ] Frontend /rampur page shows articles
- [ ] Frontend homepage shows all sections
- [ ] Article detail pages render correctly
- [ ] Images load on all articles

---

## 13. Frontend Migration Strategy

### Recommended approach: Feature-flagged progressive rollover

**Phase 1: Data repair (this migration)**
- Fix the 100 incomplete articles
- No frontend changes yet
- Strapi remains available as fallback

**Phase 2: Frontend single-source switch**
- Replace aggregator with direct Custom CMS provider
- Test per route:
  - [ ] Homepage
  - [ ] Category pages (/rampur, /up, /national, etc.)
  - [ ] Article detail pages
  - [ ] Search
  - [ ] Sitemap
  - [ ] RSS feeds
  - [ ] Navigation/menus
  - [ ] Author pages
  - [ ] Breadcrumbs
  - [ ] Related articles

**Phase 3: Strapi retirement**
- Only after Phase 2 verification passes
- Remove aggregator, Strapi provider, env vars, dead code

---

## 14. Expected Migration Report (Post-Execution)

```
╔══════════════════════════════════════════════════════╗
║  MIGRATION REPORT                                    ║
╚══════════════════════════════════════════════════════╝

Authors created:         2 / 2
Category_id linked:      100 / 100
Author_id linked:        99 / 100 (1 article has no author in Strapi)
SEO title updated:       100 / 100
OG title updated:        18 / 100 (only where Strapi had data)
Focus keyword updated:   25 / 100 (only where Strapi had data)
Tags created:            ~100
Article-tag links:       ~180
Article-category links:  ~35
Media re-hosted:         100 / 100
Editorials repaired:     15 / 15

Records skipped:         0
Validation failures:     0
Broken references:       0
```

---

## 15. Pending Approval Items

Before executing any migration, I need your confirmation on:

1. **Media strategy** — Confirm Option A (import to Supabase Storage)?
2. **Article status** — Strapi has all articles as "draft", but CMS has them as "published". Keep them published in CMS? (Recommended: Yes, keep published)
3. **Content body** — Strapi has empty `content` for all articles. The CMS also has empty content. This means the frontend displays excerpts only. Is this expected/acceptable?
4. **Author metadata** — Strapi only provides name/slug. No bio, avatar, or social links available. Create minimal author records?
5. **Execute migration** — Shall I proceed with the repair migration after your approval?

---

*This report was generated from live data queried from both Strapi (api.rampur.cloud) and Supabase (qjnhaazliulyuqngfrkd.supabase.co) on 2026-07-20.*

---

## 15. CRITICAL CORRECTION: Article Body Content EXISTS

**Previous conclusion was WRONG.** The Strapi list API (`/api/articles`) intentionally strips body content for performance via `{ excludeContent: true }`. But the detail endpoint (`/api/articles/slug/{slug}`) returns **full HTML rich text**.

### Evidence (verified via /api/articles/slug/{slug}):
| Slug | Content Length |
|------|---------------|
| rampur-police-chhetradhikar-tay-kanoon-vyavastha-sudridh | 12,167 chars |
| milak-mein-bullet-car-bhidan-donon-savar-ghayal | 9,252 chars |
| cm-yogi-ne-rampur-ko-di-690-crore-ki-saugaat-sapa-par-sadha-nishana | 11,192 chars |
| article-3 | 2,728 chars |
| asha-bhosle-death-mumbai-cardiac-arrest-news | 2,116 chars |

### Root cause analysis (from Strapi source code at Strapi15feb/src/api/article/controllers/article.ts):
- `LIST_FIELDS` array excludes `content` field for performance
- All list handlers call `normalizeArticle(e, origin, { excludeContent: true })`
- Only `findOne` and `findBySlug` return content without exclusion
- The schema confirms `content` is `"type": "richtext", "required": true`

### Impact on migration:
The CMS has 100 articles with **empty `content` field**. These articles have full HTML body content available in Strapi via the `/api/articles/slug/{slug}` endpoint. **This content MUST be migrated.**

---

## 16. Full Content Type Audit (via API + source code inspection)

### Content types in Strapi (verified):

| Content Type | Strapi Endpoint | Count | Has Body Content? | In CMS? |
|-------------|-----------------|-------|-------------------|---------|
| Articles | /api/articles/slug/{slug} | 100 | ✅ YES (2K–12K chars HTML) | 102 records (missing content) |
| Categories | /api/categories | 15 | N/A (metadata only) | 19 in CMS ✅ |
| Authors | /api/authors | 3 | Profile data (name, bio, email) | 1 in CMS ⚠️ |
| Tags | /api/tags | 115 | N/A (metadata only) | 0 in CMS ❌ |
| Editorials | /api/editorials | 15 | ✅ YES (1,800–6,200 chars) | 15 in CMS (verify body) |
| Pages | /api/pages | 0 | Empty collection | 0 in CMS |
| Upload/Files | /api/upload/files | Accessible | Media library metadata | 109 in CMS |
| Navigations | /api/navigations | 404 (not exposed) | N/A | Not applicable |

### Strapi authors (full detail from /api/authors):
| ID | Slug | Name | Hindi Name | Email | Bio | Role |
|----|------|------|-----------|-------|-----|------|
| 1 | rampur-news-desk | Rampur News Desk | रामपुर न्यूज़ डेस्क | desk@rampurnews.local | "Local reporting and editorial desk." | editor |
| 3 | education-desk | Education Desk | शिक्षा डेस्क | education@rampurnews.local | "Education and jobs coverage." | author |
| 5 | mohd-zeeshan-raza-khan | Mohd Zeeshan Raza Khan | मुहम्मद जीशान रज़ा खां | (empty) | (none) | author |

### Tags in Strapi: 115 unique tags
Available via `/api/tags` endpoint. Includes Hindi and English tags with slug, tagType, score, and articleCount fields.

---

## 17. Revised Migration Scope (Content Reconciliation)

### Phase 1: Content Reconciliation (data repair)
1. **Fetch body content** for all 100 articles via `/api/articles/slug/{slug}` endpoint (one-by-one)
2. **UPDATE `cms_articles.content`** with the HTML body for each article
3. **Set `category_id`** for all 100 articles currently missing it
4. **Create 2 missing authors** (with full metadata from Strapi) and set `author_id` for all articles
5. **Create 115 tags** from Strapi and create article-tag relationships for articles that have tags
6. **Set SEO fields** (seo_title, og_title, og_description, focus_keyword) where available in Strapi
7. **Create article-category junction** records for the 14 multi-category articles
8. **Verify editorials** have body content in CMS matching Strapi

### Phase 2: Media Migration (staged)
1. Download all 100 images from api.rampur.cloud to local/temp
2. Verify checksum + file size after download
3. Upload to Supabase Storage bucket
4. Verify new public URLs resolve correctly
5. Update `cms_media.url` references
6. Keep old Strapi URLs accessible during verification period
7. Only remove Strapi dependency after all images verified

### Phase 3: Frontend Switch (feature-flagged, route-by-route)
- Replace aggregator with single-source Custom CMS
- Verify each route independently (homepage, categories, articles, search, sitemap, RSS, nav)
- Only disable Strapi reads after all routes pass

### Phase 4: Strapi Retirement
- Remove aggregator, providers, env vars, dead code
- Only after full browser-level verification confirms zero regressions

---

## 18. Reconciliation Engine Design

```
Strapi (source of truth for missing fields)
    ↓
    ↓ For each of 100 articles:
    ↓   1. Fetch full article via /api/articles/slug/{slug}
    ↓   2. Compare with CMS record field-by-field
    ↓   3. Identify NULL/empty CMS fields that have Strapi data
    ↓   4. UPDATE only missing fields (never overwrite non-null CMS values)
    ↓
Reconciliation Report (per-article diff)
    ↓
Verified CMS (single source of truth)
    ↓
Frontend → Custom CMS only
    ↓
Retire Strapi
```

### Rules:
- CMS is authoritative for: status, published_at, is_featured, is_breaking
- Strapi is authoritative for: content body, SEO metadata, tags, category relationships
- Never overwrite non-empty CMS values
- Log every field update with before/after
- Generate conflict report for any disagreements

---

## 19. Updated Pending Approval Items

1. ✅ **Media strategy** — Option A confirmed (staged, verified import to Supabase Storage)
2. ✅ **Article status** — CMS is authoritative. No status changes.
3. ✅ **Content body** — **RESOLVED.** Full HTML content exists in Strapi via detail endpoint. Must be migrated.
4. ✅ **Author metadata** — Create records with full available data (name, nameHindi, email, bio, slug, role)
5. ⏳ **Execute migration** — Awaiting approval after this corrected audit

---

## 20. Estimated Migration Counts (Revised)

| Operation | Count | Method |
|-----------|-------|--------|
| Articles: content body UPDATE | 100 | Fetch via /api/articles/slug/{slug} |
| Articles: category_id UPDATE | 100 | Resolve slug → UUID |
| Articles: author_id UPDATE | 99 | Create authors first, then link |
| Articles: seo_title UPDATE | 75 | From Strapi metaTitle |
| Articles: og_title UPDATE | 18 | From Strapi ogTitle |
| Articles: focus_keyword UPDATE | 25 | From Strapi focus_keyword |
| Authors to CREATE | 2 | mohd-zeeshan-raza-khan, education-desk |
| Tags to CREATE | 115 | From /api/tags |
| Article-tag links | ~180 | 18 articles × avg 10 tags |
| Article-category links | ~35 | 14 articles with multi-category |
| Media to re-host | 100 | From api.rampur.cloud → Supabase Storage |
| Editorials: verify content | 15 | Compare lengths |

---

*Report updated 2026-07-20 after Strapi source code inspection revealed body content IS available.*
*Endpoint confirmed: GET /api/articles/slug/{slug} returns full HTML content.*
