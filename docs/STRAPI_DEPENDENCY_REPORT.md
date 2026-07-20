# Strapi Dependency Report

**Date:** 2026-07-20  
**Status:** Strapi reads DISABLED. Custom CMS is the single runtime source of truth.  
**Feature Flag:** `ENABLE_STRAPI_AGGREGATION=true` re-enables Strapi for rollback.

---

## Runtime Dependencies (disabled, retained for rollback)

| File | Refs | Status |
|------|------|--------|
| `src/services/cms/aggregator.ts` | 52 | `fetchStrapi()` retained but gated behind feature flag. Never called in production. |
| `src/services/cms/index.ts` | 111 | `createRestCMSProvider()` instantiated but unused. Default provider is `'custom'`. |
| `src/services/content/homepageConfig.ts` | 10 | `fallbackSource: 'strapi'` in config objects. Aggregator ignores when flag is off. |
| `src/services/content/contentResolver.ts` | 3 | Imports `fetchStrapi` — only used when `ENABLE_STRAPI_AGGREGATION=true`. |
| `src/lib/categoryPage.tsx` | 1 | Comment reference only. |

## Non-Runtime (tests, types, deprecated)

| File | Refs | Status |
|------|------|--------|
| `strapiExtendedProvider.ts` | 27 | DEPRECATED — admin-only extended provider |
| `strapiExtendedProvider.test.ts` | 11 | Test file |
| `article-publish-pipeline-fix.*.test.ts` | 58 | Test files |
| `providers.tsx` | 22 | CMS admin UI config (not public pages) |
| `extendedProvider.ts` / `extendedTypes.ts` | 6 | Type definitions |

## Environment Variables (retained, not required)

```env
NEXT_PUBLIC_STRAPI_URL=https://api.rampur.cloud/api
STRAPI_API_URL=https://api.rampur.cloud/api
STRAPI_API_TOKEN=PASTE_YOUR_STRAPI_API_TOKEN_HERE
```

These are read by the Strapi provider code but since the provider is never called (feature flag off), they have zero runtime impact.

## Media Dependency (BLOCKING for full retirement)

**100 images** in `cms_media` table point to `https://api.rampur.cloud/uploads/...`

These images are served to visitors on every article page. If `api.rampur.cloud` is shut down, all article images break.

**Resolution:** Media migration (Phase 3) — download all 100 images → upload to Supabase Storage → update `cms_media.url`.

## Summary

| Category | Count | Blocks Retirement? |
|----------|-------|-------------------|
| Runtime Strapi API calls | **0** | No |
| Code files with "strapi" | 17 | No (dead code / types) |
| Strapi env vars | 3 | No (unused at runtime) |
| Images on api.rampur.cloud | **100** | **YES** |

## Conclusion

- **Zero runtime dependency on Strapi API** after the aggregator switch
- **100 media assets** still hosted on Strapi infrastructure — this is the ONLY remaining blocker
- After media migration to Supabase Storage, Strapi can be fully retired
- Code cleanup (removing dead files/refs) can happen any time after successful burn-in

---

## Rollback Procedure

If any issue is discovered during burn-in:

1. Set `ENABLE_STRAPI_AGGREGATION=true` in production `.env`
2. Restart the frontend (PM2 restart)
3. The aggregator will resume dual-fetching from both CMS and Strapi
4. All existing code paths are intact and functional
