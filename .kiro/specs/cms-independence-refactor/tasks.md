# Implementation Plan: CMS Independence Refactor

## Overview

This plan implements the refactoring of the Custom CMS into a fully independent system with its own Supabase Postgres database, REST API, RBAC, media management, webhook revalidation, and Frontend content aggregation. The implementation proceeds in 5 phases: Schema & Infrastructure → Backend Implementation → Admin UI Updates → Frontend Aggregation → Cleanup & Cutover.

**Stack:** Next.js 15 (App Router), Supabase Postgres + Auth + Storage, TypeScript, TipTap, Tailwind/Radix UI, Vitest + fast-check

**Repos:**
- Custom CMS: `rampurnews-cms`
- Frontend: `Frontend`

## Tasks

- [ ] 1. Schema & Infrastructure Setup
  - [ ] 1.1 Create core content tables migration (categories, authors, tags, media, articles, article_tags, pages, editorials)
    - Write Supabase migration SQL for the 8 primary content tables with UUID PKs, timestamps, slug UNIQUE constraints, foreign keys, and CHECK constraints as defined in the design
    - Include `moddatetime` trigger for `updated_at` auto-update
    - _Requirements: 1.1, 1.2, 1.7, 1.8, 1.9_

  - [ ] 1.2 Create secondary content tables migration (events, exams, holidays, institutions, places, restaurants, results, education_news, sitesettings, internal_links, microsite_items)
    - Write Supabase migration SQL for the remaining 11 content tables following the same patterns
    - _Requirements: 1.2, 1.7, 1.8, 1.9_

  - [ ] 1.3 Create RBAC and user management tables migration (cms_users, cms_roles, cms_permissions)
    - Include the `cms_users` table with `supabase_uid` FK to `auth.users`, `cms_role` CHECK constraint, AI fields
    - Include `cms_roles` and `cms_permissions` tables as defined in design
    - _Requirements: 1.5, 5.1_

  - [ ] 1.4 Create version history, audit, and supporting tables migration (cms_content_versions, cms_audit_log, cms_ai_usage, cms_webhook_log, cms_system_config)
    - Include all indexes defined in the design (idx_versions_lookup, idx_audit_created, idx_audit_user, idx_audit_resource)
    - _Requirements: 1.6, 4.4, 13.1_

  - [ ] 1.5 Create ads tables migration (cms_ads, cms_ad_events)
    - Include CHECK constraints for placement, type, device_type, priority range, title length
    - Include indexes for ad_events lookup
    - _Requirements: 1.6, 9.1, 9.6_

  - [ ] 1.6 Create Row Level Security policies and enable RLS on all tables
    - Enable RLS on all content tables
    - Create `service_role_all` policy for service_role
    - Create `anon_read_published` policy for anon on editorial workflow tables
    - _Requirements: 5.2_

  - [ ] 1.7 Seed permissions table with role-permission matrix
    - Insert all permission rows from the design's Permission Matrix (Section 3.3) for all 7 roles
    - Insert `cms_roles` seed data with rank and ai_default values
    - Insert `cms_system_config` row with key `ai_daily_limit`, value `{"limit": 20}`
    - _Requirements: 5.1, 5.2, 10.3_

  - [ ] 1.8 Create Supabase Storage bucket and configure access policies
    - Create `cms-media` bucket with public read access
    - Configure upload size limit to 10 MB
    - _Requirements: 6.1, 6.6_

  - [ ] 1.9 Create pg_cron job for audit log cleanup
    - Schedule daily job at 03:00 UTC to delete audit entries older than 90 days
    - If pg_cron unavailable, create a fallback Next.js API route for Hostinger cron
    - _Requirements: 13.4, 13.5_

  - [ ] 1.10 Write ads data migration script (legacy ads → cms_ads)
    - Script that copies active campaigns from `ads` → `cms_ads` with UUID generation
    - Migrate `ad_impressions` and `ad_clicks` → `cms_ad_events` with updated FK references
    - Include reconciliation check: COUNT(*) matching between old and new tables
    - _Requirements: 9.6_

- [ ] 2. Checkpoint - Verify schema infrastructure
  - Ensure all migrations apply cleanly, seed data is correct, RLS policies work. Ask the user if questions arise.

- [ ] 3. Backend Shared Libraries
  - [ ] 3.1 Create Supabase client wrapper (`src/lib/db-client.ts`)
    - Replace/extend existing `db.ts` with typed Supabase client using `@supabase/supabase-js`
    - Export server-side client (service_role) and browser client (anon) factories
    - _Requirements: 1.3, 1.4_

  - [ ] 3.2 Create Zod validation schemas (`src/lib/schemas/`)
    - Create schema files for all 18 content types + users + ads
    - Each schema exports `createSchema`, `updateSchema`, and `responseSchema`
    - Include field-level constraints matching DB CHECK constraints
    - _Requirements: 3.5, 9.4, 14.7_

  - [ ] 3.3 Implement RBAC library (`src/lib/rbac.ts`)
    - Implement `withAuth()` HOF that extracts session from `sb-access-token` cookie, validates via Supabase `getUser()`, looks up `cms_users`, checks permissions from `cms_permissions` table
    - Return 401 for missing/invalid session, 403 for insufficient permissions
    - Return user object with scope ('all' or 'own') to handler
    - Remove all references to `rbacBridge.ts`, `adminSession.ts`, `sessionSecret.ts`
    - _Requirements: 5.2, 5.3, 5.8, 5.9, 11.1, 11.4_

  - [ ]* 3.4 Write property test for RBAC enforcement (Property 5)
    - **Property 5: RBAC enforcement matches the permission matrix**
    - Generate random (role, resource, action) tuples; verify `can()` output matches matrix
    - **Validates: Requirements 5.2, 5.3, 5.8**

  - [ ] 3.5 Implement slug resolution library (`src/lib/slug.ts`)
    - Implement `resolveSlug(baseSlug, tableName)` with normalization (lowercase, Devanagari support, hyphenation)
    - Query Custom CMS DB only (zero Strapi calls)
    - Auto-suffix starting at `-2`, fallback to UUID fragment after 10000 attempts
    - _Requirements: 3.6, 3.7, 3.8_

  - [ ]* 3.6 Write property test for slug resolution (Property 1)
    - **Property 1: Slug resolution always produces a unique, non-colliding slug**
    - Generate random base slugs and existing slug sets; verify output not in existing set and function terminates
    - **Validates: Requirements 3.6, 3.7, 3.8**

  - [ ] 3.7 Implement audit logging library (`src/lib/audit.ts`)
    - `writeAuditLog(entry)` that INSERTs into `cms_audit_log`
    - On write failure: log to stderr, do NOT block the calling operation
    - Include changed-field diff logic for update operations
    - _Requirements: 13.1, 13.2, 13.7_

  - [ ]* 3.8 Write property test for audit logging resilience (Property 20)
    - **Property 20: Audit write failure does not block operations**
    - Simulate audit INSERT failures; verify calling operation still succeeds
    - **Validates: Requirements 13.7**

  - [ ] 3.9 Implement webhook dispatcher (`src/lib/webhook.ts`)
    - `dispatchRevalidation(contentType, item)` — fire-and-forget with retry
    - Derive revalidation paths: detail page, category listing, homepage, author page
    - Exponential backoff: [1s, 2s, 4s, 8s, 16s], max 5 attempts, 10s timeout
    - Abort retry on 401; log to audit on final failure
    - Transmit `x-revalidate-token` header
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [ ]* 3.10 Write property test for webhook retry backoff (Property 11)
    - **Property 11: Webhook retry uses exponential backoff**
    - Verify retry delays follow [1s, 2s, 4s, 8s, 16s] pattern with at most 5 attempts
    - **Validates: Requirements 8.3**

  - [ ] 3.11 Implement versioning library (`src/lib/versioning.ts`)
    - `createVersion(contentType, contentId, snapshot, userId)` — INSERT immutable version row
    - `rollbackToVersion(contentType, contentId, versionId, userId)` — create new version from old snapshot, set status to draft
    - Auto-increment `version_num` per content_type + content_id
    - _Requirements: 4.4, 4.5, 4.7_

  - [ ] 3.12 Implement media processing library (`src/lib/media.ts`)
    - Upload original to Supabase Storage `cms-media` bucket
    - Generate 3 variants (150px, 600px, 1200px width) using streaming `sharp`
    - On variant failure: store original, mark `variant_status = 'failed'`, return success with warning
    - Enforce 10 MB upload limit (return 413 on exceed)
    - Delete operation removes original + all variants from storage + DB record
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.7, 6.8_

  - [ ] 3.13 Implement IP anonymization utility (`src/lib/ip-anonymize.ts`)
    - IPv4: zero the last octet (e.g., 192.168.1.100 → 192.168.1.0)
    - IPv6: zero the last 80 bits
    - _Requirements: 9.3_

  - [ ]* 3.14 Write property test for IP anonymization (Property 12)
    - **Property 12: IP anonymization zeroes correct bits**
    - Generate random IPv4 and IPv6 addresses; verify correct bits zeroed
    - **Validates: Requirements 9.3**

  - [ ] 3.15 Implement editorial workflow state machine (`src/lib/workflow.ts`)
    - Define valid transitions map: `{draft→pending_review, pending_review→approved, approved→published, published→archived, *→draft}`
    - `validateTransition(currentStatus, targetStatus)` returns boolean
    - `transitionContent(contentType, id, targetStatus, userId)` — validate, update status, create version on publish, write audit, dispatch webhook on publish
    - _Requirements: 4.1, 4.2, 4.3, 4.8_

  - [ ]* 3.16 Write property test for editorial state machine (Property 4)
    - **Property 4: Editorial state machine permits only valid transitions**
    - Generate random (currentStatus, targetStatus) pairs; verify only valid pairs succeed
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 4. Checkpoint - Verify shared libraries
  - Ensure all library tests pass, run `vitest --run`. Ask the user if questions arise.

- [ ] 5. Backend API Routes - Content CRUD
  - [ ] 5.1 Implement generic CRUD route factory (`src/lib/crud-factory.ts`)
    - Factory function that generates GET (list), GET (by id), GET (by slug), POST, PATCH, DELETE handlers for any content type
    - Integrate: withAuth → Zod validation → slug resolution → audit → response envelope
    - Support pagination (page, pageSize), filtering (status, category, search), sorting (sort, order)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.9_

  - [ ]* 5.2 Write property tests for pagination and filtering (Properties 2, 21, 22)
    - **Property 2: Pagination respects limits and response contains required metadata**
    - **Property 21: Filtering returns only matching items**
    - **Property 22: Sorting returns correctly ordered items**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.9**

  - [ ] 5.3 Implement article CRUD routes (`/api/cms/articles/`)
    - Wire the crud-factory for articles with article-specific schema
    - Include status transition endpoint (`/api/cms/articles/[id]/status`)
    - Include versions endpoint (`/api/cms/articles/[id]/versions`)
    - Include rollback endpoint (`/api/cms/articles/[id]/rollback`)
    - Handle article_tags junction table on create/update
    - _Requirements: 3.1, 4.1, 4.6, 4.7_

  - [ ] 5.4 Implement remaining content type CRUD routes
    - Wire crud-factory for: pages, editorials, events, exams, holidays, institutions, places, restaurants, results, education-news, sitesettings, internal-links, microsite-items, categories, authors, tags
    - Each gets list, detail, create, update, delete + status transition where applicable
    - _Requirements: 3.1, 1.2_

  - [ ] 5.5 Implement user management routes (`/api/cms/users/`)
    - CRUD for cms_users (admin/super_admin only for create/update/delete)
    - GET list with pagination and role filter
    - PATCH `/api/cms/users/[id]/ai-permission` for AI permission grant/revoke
    - _Requirements: 5.1, 5.7, 5.9_

  - [ ] 5.6 Implement media routes (`/api/cms/media/`)
    - POST (multipart upload) → process with media.ts library
    - GET list with pagination
    - GET `/api/cms/media/[id]` single item
    - DELETE `/api/cms/media/[id]` → remove from storage + DB
    - GET `/api/cms/media/proxy/[id]` → serve with Cache-Control: max-age=31536000, immutable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 5.7 Implement ads routes (`/api/cms/ads/`)
    - CRUD for campaigns (advertiser role: own scope; admin: all)
    - POST `/api/cms/ads/impression` — anonymous, record with anonymized IP
    - POST `/api/cms/ads/click` — anonymous, record with anonymized IP
    - GET `/api/cms/ads/analytics` — admin only, aggregated stats by campaign/placement/date range (max 365 days)
    - On tracking service failure: return 200 to client, discard event
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.7_

  - [ ]* 5.8 Write property test for ad placement targeting (Property 13)
    - **Property 13: Ad placement targeting returns only matching ads**
    - Generate random ads with various placements/devices/categories; verify queries return only matching
    - **Validates: Requirements 9.2**

  - [ ] 5.9 Implement AI generation route (`/api/cms/ai/generate`)
    - Chain: withAuth → checkAIPermission → rate limit check → Google Generative AI call → return TipTap JSON
    - Reject empty/whitespace prompts with 400
    - Reject over-limit with 429 + reset time
    - Return 503 on AI service unavailable
    - Enforce prompt length 1-5000 chars
    - _Requirements: 10.1, 10.2, 10.3, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 5.10 Write property tests for AI rate limiting and prompt validation (Properties 14, 15)
    - **Property 14: AI rate limiting enforces per-user daily cap**
    - **Property 15: Whitespace-only prompts are rejected**
    - **Validates: Requirements 10.3, 10.5, 10.8**

  - [ ] 5.11 Implement audit log query route (`/api/cms/audit-log`)
    - GET with filtering by user, action, resource type, date range
    - Pagination (page, pageSize, max 100)
    - Restricted to super_admin/admin (403 otherwise)
    - _Requirements: 13.6, 13.8_

  - [ ] 5.12 Implement auth routes (`/api/admin/login`, `/api/admin/logout`, `/api/admin/me`)
    - POST `/api/admin/login` — Supabase Auth signInWithPassword, set HTTP-only Secure SameSite=Lax cookie
    - POST `/api/admin/logout` — clear session cookie, sign out from Supabase
    - GET `/api/admin/me` — return current user from session
    - Session: 24h idle timeout, 7-day absolute max, auto-refresh at >50% idle
    - Return 503 if Supabase Auth unreachable
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ]* 5.13 Write property tests for session validation (Properties 16, 17)
    - **Property 16: Session validation rejects invalid/expired sessions**
    - **Property 17: Session auto-refresh at >50% idle timeout**
    - **Validates: Requirements 11.4, 11.6, 11.8**

  - [ ] 5.14 Implement public API routes (`/api/public/[content-type]`)
    - Unauthenticated read-only endpoints for published content
    - Used by Frontend aggregator
    - Pagination + filtering support
    - Slug lookup: GET `/api/public/[content-type]/[slug]`
    - _Requirements: 7.1, 3.2_

- [ ] 6. Checkpoint - Verify backend API
  - Ensure all API tests pass, all routes respond correctly. Ask the user if questions arise.

- [ ] 7. Admin UI Updates (Custom CMS)
  - [ ] 7.1 Replace cmsApi client with direct Supabase API calls
    - Remove all imports of the old `cmsApi` client
    - Create new API client module (`src/lib/api-client.ts`) that calls `/api/cms/` routes
    - Update all components that used `cmsApi` (e.g., WorkflowActions) to use new client
    - _Requirements: 2.2, 2.6_

  - [ ] 7.2 Create admin list/form pages for new content types
    - Add paginated table views + create/edit forms for: events, exams, holidays, institutions, places, restaurants, results, education-news, internal-links, microsite-items
    - Use TipTap for rich text fields, integrate media picker
    - 25 items per page default
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 7.3 Update editorial workflow UI
    - Show current status badge in list views and edit forms
    - Render status transition buttons limited to transitions permitted by user's role
    - Integrate version history panel (list versions, view snapshot, rollback button)
    - _Requirements: 14.6, 4.6, 4.7_

  - [ ] 7.4 Update RBAC enforcement in admin UI
    - Gate all views/actions based on current user's permissions
    - Show access-denied message for unauthorized navigation attempts
    - Hide actions the user cannot perform (instead of showing disabled)
    - _Requirements: 14.4, 14.5_

  - [ ] 7.5 Add AI permission management UI
    - Admin panel to grant/revoke AI generation permission per user
    - Admin panel to configure daily rate limit (1-500 range)
    - _Requirements: 5.7, 10.4_

  - [ ] 7.6 Update media manager to use Supabase Storage
    - Upload component calls `/api/cms/media` (POST multipart)
    - Display variant thumbnails from Supabase Storage URLs
    - Delete media with confirmation dialog
    - Show variant_status indicator (complete/failed/pending)
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ] 7.7 Add form validation with field-level error display
    - Integrate Zod client-side validation matching server schemas
    - Display field-level errors on failed submission
    - Preserve user data on validation failure (no navigation away)
    - _Requirements: 14.7_

- [ ] 8. Checkpoint - Verify admin UI
  - Ensure admin UI renders correctly, forms validate, workflow transitions work. Ask the user if questions arise.

- [ ] 9. Frontend Aggregation Layer
  - [ ] 9.1 Create content aggregator service (`src/services/cms/aggregator.ts`)
    - Implement `fetchCustomCms()` utility pointing at Custom CMS public API with 5s timeout
    - Implement `fetchStrapi()` utility for Strapi reads with 5s timeout
    - Implement `getAggregatedList(contentType, params)` — parallel fetch, merge, deduplicate by slug (Custom CMS wins), sort by publishedAt desc, paginate
    - Tag each item with `_source: 'custom-cms' | 'strapi'`
    - Handle single-source failure gracefully (serve available source only)
    - Handle both-sources-down with error message
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8_

  - [ ]* 9.2 Write property test for content merge logic (Property 7)
    - **Property 7: Frontend merge produces correct ordering, deduplication, and source tagging**
    - Generate random article lists with overlapping slugs; verify dedup, ordering, tagging
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 9.3 Write property test for slug resolution priority (Property 8)
    - **Property 8: Frontend slug resolution checks Custom CMS first**
    - Generate slugs present in one or both sources; verify resolution order
    - **Validates: Requirements 7.4, 7.5**

  - [ ]* 9.4 Write property test for single-source failure resilience (Property 9)
    - **Property 9: Frontend resilience to single-source failure**
    - Simulate source unavailability; verify graceful degradation
    - **Validates: Requirements 7.7**

  - [ ] 9.5 Update Frontend content listing pages to use aggregator
    - Replace direct Strapi calls in category pages, homepage, author pages with `getAggregatedList()`
    - Pass source indicator for routing detail-page links
    - _Requirements: 7.1, 7.5_

  - [ ] 9.6 Update Frontend slug resolution for detail pages
    - Implement `resolveBySlug(contentType, slug)` — check Custom CMS first, Strapi fallback
    - Update `[category]/[slug]` dynamic routes to use new resolution
    - Route revalidation calls to correct backend based on source
    - _Requirements: 7.4, 7.5_

  - [ ] 9.7 Update Frontend `/api/revalidate` endpoint
    - Accept `x-revalidate-token` header and verify against `REVALIDATION_SECRET` env var
    - Call `revalidatePath()` for each path in payload
    - Return 401 on bad token, 200 on success
    - Ensure Strapi's existing webhooks continue working independently
    - _Requirements: 8.1, 8.5, 8.6_

- [ ] 10. Checkpoint - Verify frontend aggregation
  - Ensure aggregator works with both sources, slug resolution correct, revalidation functional. Ask the user if questions arise.

- [ ] 11. Cleanup & Cutover
  - [ ] 11.1 Delete Strapi proxy routes and cmsApi client from Custom CMS
    - Delete `/api/cms/strapi/[...path]` route handler
    - Delete `/api/cms/strapi-extended/[...path]` if exists
    - Delete `src/lib/cmsApi.ts`
    - _Requirements: 2.1, 2.2_

  - [ ] 11.2 Delete legacy auth modules and routes
    - Delete `src/lib/rbacBridge.ts`
    - Delete `src/lib/adminSession.ts`
    - Delete `src/lib/sessionSecret.ts`
    - Delete `/api/auth/strapi-refresh` route
    - Delete `/api/admin/login` legacy Strapi-only login route (if separate from new one)
    - Remove `admin_session` and `strapi_jwt` cookie handling from middleware
    - _Requirements: 2.1, 2.4, 11.3_

  - [ ] 11.3 Remove Strapi environment variables from Custom CMS
    - Remove `STRAPI_API_URL`, `STRAPI_API_TOKEN`, `NEXT_PUBLIC_STRAPI_*` from .env files and config
    - Verify no source file references these env vars
    - _Requirements: 2.5_

  - [ ] 11.4 Verify zero Strapi calls from Custom CMS
    - Grep entire Custom CMS codebase for any remaining Strapi URL patterns, imports, or env var references
    - Run full test suite to confirm no runtime Strapi calls
    - _Requirements: 2.3, 2.4_

  - [ ] 11.5 ⛔ MANUAL CHECKPOINT — Legacy ads table drop
    - This is NOT automated. Confirm: (a) Phase 1 reconciliation passed, (b) cms_ads operational in production, (c) explicit owner confirmation received
    - Once confirmed: `DROP TABLE ads, ad_impressions, ad_clicks CASCADE;`
    - _Requirements: 9.6_

- [ ] 12. Final Checkpoint - Full verification
  - Run complete test suite across both repos. Verify zero Strapi dependencies in Custom CMS, aggregation works, revalidation fires correctly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between phases
- Property tests validate universal correctness properties from the design document
- The implementation uses TypeScript throughout (Next.js 15 App Router)
- Strapi is NEVER modified — it continues serving historical content unchanged
- The manual ads DROP (task 11.5) requires explicit human confirmation before execution
- `rbacBridge.ts`, `adminSession.ts`, `sessionSecret.ts` are deleted with no replacement — auth is Supabase-only
- Slug resolution checks only Custom CMS DB — no Strapi calls for collision detection

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["1.6", "1.7", "1.8", "1.9", "1.10"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.5", "3.7", "3.9", "3.11", "3.12", "3.13", "3.15"] },
    { "id": 4, "tasks": ["3.4", "3.6", "3.8", "3.10", "3.14", "3.16"] },
    { "id": 5, "tasks": ["5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.9", "5.11", "5.12", "5.14"] },
    { "id": 7, "tasks": ["5.8", "5.10", "5.13"] },
    { "id": 8, "tasks": ["7.1"] },
    { "id": 9, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "7.7"] },
    { "id": 10, "tasks": ["9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3", "9.4", "9.5", "9.6", "9.7"] },
    { "id": 12, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 13, "tasks": ["11.4", "11.5"] }
  ]
}
```
