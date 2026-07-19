# Strapi Retirement Checklist

## Prerequisites
- [ ] STRAPI_READ_ENABLED flag is set to `false` in production
- [ ] All content verified accessible via Content Gateway v2 APIs
- [ ] Frontend homepage, category pages, article pages working without Strapi
- [ ] No 404s on previously-indexed URLs (check Google Search Console)
- [ ] At least 7 days of production monitoring with flag disabled

## Files to DELETE

### Frontend
- `src/services/cms/aggregator.ts` — Replace with gateway-client.ts (already created)
- `src/app/api/cms/strapi/[...path]/route.ts` — Strapi proxy route

### Both projects
- All references to `api.rampur.cloud` in source code

## Files to MODIFY

### Frontend/next.config.js
Remove these remote patterns:
```
{ protocol: "https", hostname: "api.rampur.cloud" }
{ protocol: "http", hostname: "localhost", port: "1337" }
{ protocol: "http", hostname: "127.0.0.1", port: "1337" }
```

Remove these functions:
- `normalizeStrapiApiUrl()`
- `getStrapiApiBaseUrlFromEnv()`
- Dynamic remote pattern addition from Strapi URL

### Frontend/.env.local and .env.example
Remove:
```
NEXT_PUBLIC_STRAPI_URL=...
STRAPI_API_URL=...
STRAPI_API_TOKEN=...
```

### Frontend/src/services/cms/aggregator.ts
If keeping the file for backward compat, remove:
- `fetchStrapi()` function
- `fetchStrapiBySlug()` function
- `getStrapiUrl()` function
- `getStrapiToken()` function
- `normalizeStrapi()` function
- Strapi-related type definitions
- All references to 'strapi' in CONTENT_TYPE_MAP

### Frontend/src/services/content/contentResolver.ts
Remove 'strapi' source handling from `fetchFromSource()`

### Frontend/src/services/content/homepageConfig.ts
Remove any `source: 'strapi'` or `fallbackSource: 'strapi'` configurations

## Verification After Removal
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] `grep -r "strapi\|api\.rampur\.cloud" src/` returns zero results
- [ ] All pages render correctly in development
- [ ] Deploy to staging and verify all routes

## Timeline
Execute this ONLY after Phase F is verified in production for 7+ days.
