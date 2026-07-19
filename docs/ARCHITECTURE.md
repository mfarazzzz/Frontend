# Homepage & Category Architecture Documentation

## Data Flow — Single Source of Truth

```
All listing pages (Homepage, Category, Tags, City)
  └── Aggregator (src/services/cms/aggregator.ts)
        ├── fetchCustomCms() → cms.rampurnews.com/api/public/articles
        └── fetchStrapi() → api.rampur.cloud/api/articles
              └── Client-side category filtering (workaround for Strapi custom controller)
```

### Why One Pipeline?

Strapi's custom controller ignores `filters[category][slug][$eq]`. The aggregator
applies client-side category filtering after fetch. Any code path that calls
`getCMSProvider().getArticles()` directly with a category filter will get ZERO results
for most categories. The aggregator is the ONLY correct path for category-filtered listings.

## Request Flows

### Homepage
```
GET /
  └── page.tsx (Server Component)
        └── getHomepageData() (homepageService.ts)
              ├── homepageConfig.ts → Section definitions (templates, sources, categories)
              ├── contentResolver.ts → Fetches each section via aggregator
              │     └── fetchFromSource()
              │           ├── 'aggregated' → getAggregatedList()
              │           ├── 'custom-cms' → fetchCustomCms()
              │           └── 'strapi' → fetchStrapi()
              ├── Hero strategy (featured-first, breaking-first, latest)
              ├── Hero dedup (first 5 displayed slugs removed from later sections)
              └── Cross-section dedup (earlier sections win)
                    └── Index.tsx → Renders with varied templates per section
```

### Category Page (e.g., /rampur, /up, /national)
```
GET /rampur
  └── src/app/rampur/page.tsx (Static route)
        └── CategoryPageServer (src/lib/categoryPage.tsx)
              └── getAggregatedList('articles', { category: 'rampur' })
                    └── Passes initialArticles to CategoryListing

CategoryListing (Client Component)
  ├── Page 1: Uses server-provided initialArticles (no refetch)
  └── Page 2+: Fetches from /api/category-articles?category=rampur&page=2
                  └── getAggregatedList() (same aggregator pipeline)
```

### Dynamic Category Route ([category])
```
GET /politics (or any slug matching categories.ts)
  └── src/app/[category]/page.tsx
        └── getAggregatedList('articles', { category: slug })
              └── Falls back to getCMSProvider() ONLY if aggregator throws
                    └── CategoryListing
```

### Article Detail Page
```
GET /rampur/article-slug
  └── src/app/[category]/[slug]/page.tsx
        └── resolveBySlug('articles', slug)
              ├── Custom CMS first → /api/public/articles/{slug}
              └── Strapi fallback → /api/articles?filters[slug][$eq]={slug}
```

### Tags Page
```
GET /tags/some-tag
  └── getAggregatedList('articles', { search: decoded })
        └── CategoryListing
```

### City Hub
```
GET /city/shahjahanpur
  └── getAggregatedList('articles', { search: cityNameHindi })
        └── CategoryListing
```

## CMS Sources

### Custom CMS (Supabase)
- URL: `cms.rampurnews.com/api/public/*`
- Auth: None (public API)
- Content: New articles (active CMS)
- Status: Active

### Strapi (Legacy)
- URL: `api.rampur.cloud/api/*`
- Auth: Optional Bearer token
- Content: Historical articles (~100 across 9 categories)
- Known Bug: Custom controller ignores category filters
- Workaround: Client-side filtering in aggregator's `fetchStrapi()`

## Homepage Configuration

Edit `src/services/content/homepageConfig.ts` to change sections.

### Section Templates (visual layouts)
- `featured` → 1 large card + sidebar list
- `grid` → 3-column equal cards
- `compact-list` → Horizontal cards stacked vertically
- `two-columns` → 2 stacked cards + 3 compact below
- `timeline` → Numbered timeline with dots
- `editorial-picks` → For editorials

### Current Layout Order
1. Hero (aggregated, all categories, featured-first strategy)
2. रामपुर → featured
3. उत्तर प्रदेश → grid
4. आस-पास → two-columns
5. राष्ट्रीय → compact-list
6. खेल → grid
7. शिक्षा-नौकरी → featured
8. अंतर्राष्ट्रीय → compact-list
9. धर्म-संस्कृति → two-columns
10. संपादकीय → editorial-picks (compact-list rendering)

### Ad Placement
Ads appear after every 3rd section (not every section).
Configurable via `showAdAfter` flag on section config.

## Deduplication

Three levels:
1. **Within-source** (Aggregator): Dedup by slug, Custom CMS wins
2. **Hero exclusion**: First 5 displayed hero slugs removed from category sections
3. **Cross-section**: Articles in earlier sections removed from later ones

## Error Handling

- `Promise.allSettled` for all section fetches
- Individual section failure → hidden (not crash)
- Aggregator: if one CMS is down, serve from the other
- Both CMSs down → empty section (no crash), error logged

## Files & Responsibilities

| File | Purpose |
|------|---------|
| `src/services/cms/aggregator.ts` | Dual-CMS fetch, merge, normalize, deduplicate |
| `src/services/content/homepageConfig.ts` | Section definitions (templates, sources, counts) |
| `src/services/content/contentResolver.ts` | Fetches sections using aggregator, logs results |
| `src/services/content/homepageService.ts` | Orchestrates homepage (hero, sections, sidebar) |
| `src/lib/categoryPage.tsx` | Shared server component for all category routes |
| `src/app/api/category-articles/route.ts` | Client-side pagination via aggregator |
| `src/views/CategoryListing.tsx` | Category page UI (client, trusts server data) |
| `src/views/Index.tsx` | Homepage rendering with varied templates |
| `src/components/CategorySection.tsx` | Section component with 6 template variants |
| `src/components/Sidebar.tsx` | Sidebar with trending, most-read, social |
| `src/hooks/useCMS.ts` | Client hooks (used for article detail, NOT listings) |
| `src/services/cms/index.ts` | CMS provider (Strapi REST adapter) |

## Debug Endpoint

`GET /api/debug/data-flow?category=rampur`

Returns comparison of:
- Aggregator pipeline (correct)
- Custom CMS directly
- Strapi directly (with client-side filter)
- getCMSProvider().getArticles() (broken for category filter)

## Future: CMS-Controlled Homepage

`fetchHomepageConfigFromCMS()` is a stub ready for:
```
GET cms.rampurnews.com/api/public/homepage-config
Response: { sections: HomepageSectionConfig[] }
```

When implemented, editors can reorder/add/remove sections without code changes.
