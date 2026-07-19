# Implementation Plan: Rampur News Enterprise Content Platform

## Overview

This plan implements the Rampur News ECP in 56 tasks organized into phases: Database Schema (Tasks 1-14), Service Layer (Tasks 15-22), Content Gateway APIs (Tasks 23-31), AI & Migration (Tasks 32-38), CMS Admin UI (Tasks 40-43, 53-56), Frontend Integration (Tasks 44-48), and Operations (Tasks 49-52).

## Tasks

- [x] 1. Create unified `entities` table migration with all columns, constraints, indexes, and triggers (Requirement 1)
- [x] 2. Create `entity_blocks` table migration for modular content blocks with positioning, visibility, and device targeting (Requirement 2)
- [x] 3. Create `entity_versions` table migration for version snapshots with contiguous numbering (Requirement 3)
- [x] 4. Create `taxonomies` and `entity_taxonomies` tables migration with hierarchy, materialized path, and entity_count trigger (Requirement 4)
- [x] 5. Create `media_assets` table migration with SHA-256 deduplication, variants, folders, and reference counting (Requirement 5)
- [x] 6. Create `authors` table migration with multilingual fields, social links, and role-based access (Requirement 6)
- [x] 7. Create `homepage_sections` and `homepage_audits` tables migration (Requirement 9)
- [x] 8. Create `navigations` and `navigation_items` tables migration with tree hierarchy (Requirement 10)
- [x] 9. Create `ad_campaigns` and `ad_placements` tables migration with scheduling and budget controls (Requirement 11)
- [x] 10. Create `redirects` table migration with hit tracking and status codes (Requirement 13)
- [x] 11. Create `feature_flags` table migration and seed initial migration flags (Requirement 19)
- [x] 12. Create `staging_imports` and `migration_batches` tables migration (Requirement 18)
- [x] 13. Create `search_index` materialized view with GIN-indexed tsvector and refresh function (Requirement 12)
- [x] 14. Create RLS policies for all new tables — public reads only published, CMS requires auth roles (Requirement 24)
- [x] 15. Implement Entity Repository with CRUD, cursor pagination, JSONB multilingual handling (Requirements 1, 15)
- [x] 16. Implement Block Repository with ordering, bulk operations, and reorder logic (Requirements 2, 15)
- [x] 17. Implement Taxonomy Repository with hierarchy management, path calculation, entity_count maintenance (Requirements 4, 15)
- [x] 18. Implement Media Repository and Deduplication Service with SHA-256, Supabase Storage upload, reference counting (Requirements 5, 15)
- [x] 19. Implement Workflow Service enforcing state machine, role gates, auto-versioning on publish (Requirements 7, 3)
- [x] 20. Implement Content Validation Service with critical/warning rules and quality score (Requirement 8)
- [x] 21. Implement Versioning Service with snapshot creation and restore-to-version (Requirement 3)
- [x] 22. Implement Feature Flag Service with per-request evaluation, rollout percentage, caching (Requirements 19, 22)
- [x] 23. Implement Content Gateway — Content API routes (list, get by slug, breaking, featured) (Requirements 15, 1)
- [x] 24. Implement Content Gateway — Search API with full-text query, facets, content_type filtering (Requirements 15, 12)
- [x] 25. Implement Content Gateway — Homepage API with section resolution, deduplication, health (Requirements 15, 9)
- [x] 26. Implement Content Gateway — Menu API returning tree-structured navigation items (Requirements 15, 10)
- [x] 27. Implement Content Gateway — SEO API for sitemaps, structured data, meta retrieval (Requirements 15, 13)
- [x] 28. Implement Content Gateway — Directory API with filtering, sorting, geo-proximity (Requirements 15, 16)
- [x] 29. Implement Content Gateway — Advertisement API with slot serving and click/impression tracking (Requirements 15, 11)
- [x] 30. Implement Content Gateway — Microsite API returning parent, blocks, children, navigation (Requirements 15, 17)
- [x] 31. Implement Content Gateway — Media API with upload, bulk upload, dedup, orphan detection (Requirements 15, 5)
- [x] 32. Implement AI Service with Gemini integration for headlines, SEO, tags, categories, duplicates, FAQ, social captions (Requirement 14)
- [x] 33. Implement Migration — Strapi Extractor fetching and normalizing all content types from Strapi API (Requirement 18)
- [x] 34. Implement Migration — Transformer converting Strapi data to unified entity format with field mapping (Requirement 18)
- [x] 35. Implement Migration — Validator with checksums, field checks, media accessibility, slug collision detection (Requirement 18)
- [x] 36. Implement Migration — Media Migrator downloading Strapi uploads, deduplicating, uploading to Supabase Storage (Requirements 18, 5)
- [x] 37. Implement Migration — Publisher and Rollback moving staged records to production and reversing (Requirement 18)
- [x] 38. Implement Migration Script Orchestrator as CLI running full Strapi import pipeline with dry-run support (Requirement 18)
- [x] 39. Implement Diagnostics Service with health checks for homepage, SEO, media, content (Requirement 20)
- [x] 40. Implement CMS Admin — Entity Editor UI with blocks, workflow panel, validation, SEO, metadata (Requirements 1, 2, 7, 8)
- [x] 41. Implement CMS Admin — Homepage Builder UI with section management, template picker, scheduling (Requirement 9)
- [x] 42. Implement CMS Admin — Navigation Manager UI with nested item editor (Requirement 10)
- [x] 43. Implement CMS Admin — Migration Import UI with batch management, preview, approve/reject, publish/rollback (Requirement 18)
- [x] 44. Implement Frontend Gateway Client replacing aggregator with single-source API calls (Requirements 15, 21)
- [x] 45. Implement Frontend Homepage integration consuming Homepage API with template rendering (Requirements 9, 15)
- [x] 46. Implement Frontend Navigation integration consuming Menu API for header/footer/sidebar (Requirements 10, 15)
- [x] 47. Implement Frontend Redirect Middleware checking redirects table for URL preservation (Requirement 13)
- [x] 48. Implement Legacy Table Data Migration script using import pipeline for existing CMS tables (Requirements 22, 18)
- [x] 49. Implement Scheduled Publishing Cron auto-publishing entities when scheduled_at arrives (Requirement 7)
- [x] 50. Implement Search Index Refresh trigger/cron refreshing materialized view after entity publish (Requirements 12, 23)
- [x] 51. Remove all Strapi code from Frontend after migration verified (aggregator, proxy, env vars, config) (Requirement 21)
- [x] 52. Implement Dual-Write Adapter writing to both legacy and new tables during transition (Requirement 22)
- [x] 53. Implement CMS Admin — Feature Flags UI for admin-only flag management (Requirement 19)
- [x] 54. Implement CMS Admin — Diagnostics Dashboard showing system health across all areas (Requirement 20)
- [x] 55. Implement CMS Admin — Ad Campaign Manager UI with campaign/placement CRUD and analytics (Requirement 11)
- [x] 56. Implement Zod Schemas for entity validation per content_type, block content, and metadata (Requirements 1, 8)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Phase A — Database Schema",
      "tasks": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    },
    {
      "name": "Phase B — Service Layer",
      "tasks": [15, 16, 17, 18, 19, 20, 21, 22, 56],
      "dependsOn": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    },
    {
      "name": "Phase C — Content Gateway APIs",
      "tasks": [23, 24, 25, 26, 27, 28, 29, 30, 31],
      "dependsOn": [15, 16, 17, 18, 19, 20, 21, 22]
    },
    {
      "name": "Phase D — AI and Migration Pipeline",
      "tasks": [32, 33, 34, 35, 36, 37, 38, 39],
      "dependsOn": [15, 17, 18, 22]
    },
    {
      "name": "Phase E — CMS Admin UI",
      "tasks": [40, 41, 42, 43, 53, 54, 55],
      "dependsOn": [19, 20, 21, 22, 25, 26, 29, 37, 39]
    },
    {
      "name": "Phase F — Frontend Integration",
      "tasks": [44, 45, 46, 47, 48, 49, 50, 52],
      "dependsOn": [22, 23, 25, 26, 27, 29]
    },
    {
      "name": "Phase G — Strapi Retirement",
      "tasks": [51],
      "dependsOn": [38, 44, 45, 46, 47, 48]
    }
  ]
}
```

### Phase Execution Order

**Phase A — Schema (Tasks 1-14):** All database migrations. No dependencies between them. Can be applied in sequence as one combined migration or individually.

**Phase B — Services (Tasks 15-22, 56):** Repository and service layer. Depends on Phase A. Tasks 15-18 can run in parallel. Task 19 depends on 15, 21. Task 20 depends on 15. Task 22 depends on 11.

**Phase C — Gateway APIs (Tasks 23-31):** Content Gateway routes. Depends on Phase B services. Can largely run in parallel since each API uses different services.

**Phase D — AI & Migration (Tasks 32-38):** AI service and migration pipeline. Task 32 is independent. Tasks 33-38 form a pipeline dependency chain.

**Phase E — CMS Admin (Tasks 40-43, 53-56):** Admin UI. Depends on Phase B services and Phase C APIs.

**Phase F — Frontend Integration (Tasks 44-48):** Frontend consuming new APIs. Depends on Phase C.

**Phase G — Operations (Tasks 49-52):** Cron jobs, dual-write, Strapi removal. Tasks 49-50 depend on Phase B. Task 51 depends on Phase F being verified in production. Task 52 depends on Phase B.

## Notes

- Tasks 1-14 (database migrations) should be applied to Supabase first, alongside existing tables, before any service code is written.
- Feature flags (Task 11, 22) must be in place before dual-write (Task 52) or frontend integration (Tasks 44-48) to enable safe rollback.
- Task 51 (Strapi removal) is the final task and must only execute after all migration is verified and STRAPI_READ_ENABLED flag is confirmed disabled.
- Tasks within the same phase can be parallelized by different developers.
- The migration pipeline (Tasks 33-38) should be tested in dry-run mode before any production import.
