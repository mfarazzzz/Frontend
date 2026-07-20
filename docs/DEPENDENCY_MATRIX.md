# Strapi Dependency Matrix — Final Classification

**Date:** 2026-07-20  
**Purpose:** Classify every remaining Strapi reference before retirement

---

## Classification Key

| Status | Meaning |
|--------|---------|
| 🔴 ACTIVE RUNTIME | Called during normal page renders (BLOCKS retirement) |
| 🟡 ROLLBACK-ONLY | Code exists but gated behind `ENABLE_STRAPI_AGGREGATION=true` |
| ⚪ DEAD CODE | Never executed, safe to remove |
| 📄 DOCUMENTATION | Comments, type names, test files |

---

## Pattern: `fetchStrapi` (5 files, 10 occurrences)

| File | Classification | Notes |
|------|---------------|-------|
| aggregator.ts (4) | 🟡 ROLLBACK-ONLY | Function defined + exported; only called when `ENABLE_STRAPI_AGGREGATION=true` |
| contentResolver.ts (2) | 🟡 ROLLBACK-ONLY | Imported but execution path gated by aggregator |
| route.ts — debug/cms-validation (2) | ⚪ DEAD CODE | Debug endpoint, not public |
| route.ts — debug/data-flow (1) | ⚪ DEAD CODE | Debug endpoint |
| page.tsx (1) | 📄 DOCUMENTATION | Comment reference only |

**Runtime impact:** ZERO. All execution paths are gated.

---

## Pattern: `resolveBySlug` (2 files, 3 occurrences)

| File | Classification | Notes |
|------|---------------|-------|
| aggregator.ts (1) | 🟡 ROLLBACK-ONLY | Function definition; Strapi path gated |
| page.tsx — [category]/[slug] (2) | 🟡 ROLLBACK-ONLY | Import + call inside `ENABLE_STRAPI_AGGREGATION` check |

**Runtime impact:** ZERO. Custom CMS fetch resolves first.

---

## Pattern: `getAggregatedList` (13 files, 32 occurrences)

| File | Classification | Notes |
|------|---------------|-------|
| aggregator.ts (1) | 🟡 ROLLBACK-ONLY | Function definition — now single-source |
| categoryPage.tsx (2) | 🔴→🟡 MIGRATION DONE | Calls aggregator which is now single-source CMS |
| contentResolver.ts (2) | 🔴→🟡 MIGRATION DONE | Same — aggregator is pass-through to CMS |
| homepageService.ts (3) | 🔴→🟡 MIGRATION DONE | Same |
| route.ts — category-articles (2) | 🔴→🟡 MIGRATION DONE | API route uses aggregator (now CMS-only) |
| route.ts — debug/* (6) | ⚪ DEAD CODE | Debug endpoints |
| page.tsx — various (16) | 📄 DOCUMENTATION | Comment in debug routes |

**Runtime impact:** `getAggregatedList` IS called at runtime, but it now only fetches from Custom CMS. The function name is legacy but the behavior is single-source.

**Recommendation:** Rename to use Content Gateway in future cleanup.

---

## Pattern: `STRAPI` (27 files, 378 occurrences)

| Category | Files | Classification |
|----------|-------|---------------|
| aggregator.ts | 52 | 🟡 ROLLBACK-ONLY (type names, function defs, feature-flagged paths) |
| index.ts (cms service) | 111 | 🟡 ROLLBACK-ONLY (provider factory, REST client — never called) |
| homepageConfig.ts | 10 | 📄 DOCUMENTATION (ContentSource type, config values) |
| Test files (*.test.ts) | 69 | 📄 TEST (not runtime) |
| strapiExtendedProvider.ts | 27 | ⚪ DEAD CODE (admin-only extended provider) |
| providers.tsx | 22 | ⚪ DEAD CODE (CMS admin config UI) |
| route.ts (debug, api/cms/strapi) | 56 | ⚪ DEAD CODE (debug + proxy endpoints) |
| Others (types, gateway) | 31 | 📄 DOCUMENTATION |

**Runtime impact:** ZERO. The `currentConfig.provider = 'custom'` means the Strapi provider instance is never accessed.

---

## Pattern: `api.rampur.cloud` (4 files, 5 occurrences)

| File | Classification | Notes |
|------|---------------|-------|
| index.ts (1) | 🟡 ROLLBACK-ONLY | Default Strapi URL in env fallback |
| page.tsx (1) | ⚪ DEAD CODE | Inside disabled Strapi fallback block |
| route.ts — api/cms/strapi proxy (3) | ⚪ DEAD CODE | CMS admin Strapi proxy (unused) |

**Runtime impact:** ZERO in production. However, **100 images** in the database still reference this domain.

---

## Pattern: `normalizeStrapi` (5 files, 23 occurrences)

| File | Classification | Notes |
|------|---------------|-------|
| aggregator.ts (3) | 🟡 ROLLBACK-ONLY | Strapi response normalizer |
| index.ts (8) | 🟡 ROLLBACK-ONLY | URL normalizer utility |
| providers.tsx (4) | ⚪ DEAD CODE | Admin UI |
| strapiExtendedProvider.* (8) | ⚪ DEAD CODE | Deprecated provider |

---

## Summary

| Classification | Occurrences | Files | Action |
|---------------|-------------|-------|--------|
| 🔴 ACTIVE RUNTIME | **0** | 0 | None needed |
| 🟡 ROLLBACK-ONLY | ~200 | 8 | Keep during burn-in, remove at retirement |
| ⚪ DEAD CODE | ~120 | 6 | Safe to delete any time |
| 📄 DOCUMENTATION/TEST | ~100 | 13 | Archive with Strapi code |

### Critical Finding

**Zero active runtime dependencies on Strapi.** The frontend operates entirely from the Custom CMS. All remaining Strapi code is either:
- Gated behind `ENABLE_STRAPI_AGGREGATION=true` (rollback path)
- Dead code in unused files
- Documentation/comments/tests

### Remaining Blocker for Full Retirement

**100 media assets** in `cms_media` table reference `https://api.rampur.cloud/uploads/...`. These are served to visitors. This is the only runtime dependency on Strapi infrastructure (not code, but data).

---

## Retirement Sequence (when ready)

```
1. Migrate 100 images → Supabase Storage
2. Verify all images load
3. Remove files:
   - src/services/cms/aggregator.ts (replace imports with gateway.ts)
   - src/services/cms/strapiExtendedProvider.ts
   - src/services/cms/strapiExtendedProvider.test.ts
   - src/app/api/cms/strapi/[...path]/route.ts
   - src/app/api/debug/cms-validation/route.ts
   - src/app/api/debug/data-flow/route.ts
4. Remove from index.ts:
   - createRestCMSProvider
   - normalizeStrapiBaseUrl
   - Strapi provider registration
5. Remove env vars:
   - NEXT_PUBLIC_STRAPI_URL
   - STRAPI_API_URL
   - STRAPI_API_TOKEN
6. Remove from homepageConfig.ts:
   - fallbackSource: 'strapi'
   - 'strapi' from ContentSource type
7. Remove test files referencing Strapi
8. Tag repository: v2-custom-cms
```
