# Requirements Document

## Introduction

This document defines the requirements for the **Rampur News Enterprise Content Platform (ECP)** — a unified CMS that completely replaces Strapi and becomes the sole source of truth for all content operations. The platform consolidates News, Blog, Editorial, Microsite, Education, Directory, Advertisement, Homepage Builder, Menu Manager, SEO, AI assistance, and Health Diagnostics into a single unified entity model purpose-built for Rampur News.

## Glossary

- **Entity**: The universal content unit. Every piece of content (article, restaurant listing, page, microsite) is an entity differentiated by content_type and sub_type.
- **Content Gateway**: The API layer between the frontend and database. Frontend never queries the database directly.
- **Content Block**: A modular, reusable section within an entity (rich text, gallery, FAQ, video, etc.).
- **Taxonomy**: A classification system including categories, tags, collections, topics, and locations.
- **ECP**: Enterprise Content Platform — the name for the unified CMS.
- **Staging Import**: A record in the import pipeline that has been extracted and transformed but not yet published to production.

## Requirements

### Requirement 1: Unified Entity Schema

**User Story:** As a CMS developer, I want all content types stored in a single `entities` table differentiated by content_type and sub_type, so that I can share infrastructure (SEO, workflow, versioning, media) across all content without duplicating implementations.

#### Acceptance Criteria
- [ ] An `entities` table exists with columns: id (UUID PK), slug, content_type, sub_type, title (JSONB), excerpt (JSONB), body (JSONB), author_id (FK), primary_category_id (FK), featured_media_id (FK), parent_entity_id (self-ref FK), seo (JSONB), metadata (JSONB), status, workflow_notes, is_breaking, is_featured, is_editors_pick, priority, published_at, scheduled_at, expires_at, views, shares, read_time_minutes, word_count, current_version, primary_locale, available_locales (TEXT[]), created_by, updated_by, created_at, updated_at
- [ ] A UNIQUE constraint on (slug, content_type) prevents duplicate slugs within the same type
- [ ] content_type supports: article, editorial, blog, event, directory_listing, exam, result, education_news, holiday, page, microsite
- [ ] sub_type supports article variants (news, opinion, special_report, live_coverage, photo_story), blog variants (food_lifestyle, travel, fashion, health), and directory variants (restaurant, institution, place, hospital, business, government_office, ngo)
- [ ] Multilingual fields use JSONB with locale keys (hi, en, ur)
- [ ] Partial and GIN indexes are created for: slug, content_type, status, published_at DESC (where published), is_featured, is_breaking, primary_category_id, author_id, parent_entity_id, scheduled_at, available_locales, metadata

### Requirement 2: Content Blocks

**User Story:** As an editor, I want to compose content using reusable blocks (text, gallery, video, FAQ, timeline, etc.) that I can arrange in any order, so that I can create rich layouts without developer assistance.

#### Acceptance Criteria
- [ ] An `entity_blocks` table exists with: id, entity_id (FK CASCADE), block_type, position (INT), section (body/sidebar/footer/header), content (JSONB), locale, is_visible, visible_from, visible_until, device_visibility (all/mobile/desktop), created_at, updated_at
- [ ] Supported block types include at minimum: rich_text, image, gallery, video, quote, faq, timeline, table, chart, map, related_articles, poll, embed, advertisement, code, callout, hero, social_embed, author_note
- [ ] Blocks can be attached to any entity regardless of content_type
- [ ] Blocks support visibility scheduling and device targeting
- [ ] Blocks are ordered by position within their section

### Requirement 3: Entity Versioning

**User Story:** As a senior editor, I want to see the full version history of any article and restore previous versions, so that I can recover from mistakes and track changes over time.

#### Acceptance Criteria
- [ ] An `entity_versions` table exists with: id, entity_id (FK CASCADE), version_number (INT), snapshot (JSONB), blocks_snapshot (JSONB), change_summary, status_at_version, created_by, created_at, with UNIQUE(entity_id, version_number)
- [ ] A new version snapshot is automatically created on every transition to 'published'
- [ ] Version numbers are contiguous per entity (1, 2, 3, ...)
- [ ] An entity can be restored to any previous version number
- [ ] The latest version snapshot matches the current entity state

### Requirement 4: Taxonomy System

**User Story:** As an editor, I want to organize content using hierarchical categories, tags, collections, and topics, so that readers can discover related content and the site maintains logical structure.

#### Acceptance Criteria
- [ ] A `taxonomies` table exists with: id, taxonomy_type (category/tag/collection/topic/location), slug, title (JSONB multilingual), description (JSONB), parent_id (self-ref FK), path (materialized), depth, seo (JSONB), order, is_active, icon, color, score, entity_count, noindex, canonical_id, created_at, updated_at, with UNIQUE(taxonomy_type, slug)
- [ ] An `entity_taxonomies` junction table exists with: entity_id (FK CASCADE), taxonomy_id (FK CASCADE), is_primary, order, PK(entity_id, taxonomy_id)
- [ ] Parent-child hierarchy is supported with automatic path/depth calculation
- [ ] entity_count is automatically maintained when entities are linked/unlinked

### Requirement 5: Media Library with Deduplication

**User Story:** As an editor, I want to upload images and files with automatic deduplication so that the same image is stored only once regardless of how many articles reference it, saving storage and ensuring consistency.

#### Acceptance Criteria
- [ ] A `media_assets` table exists with: id, filename, original_filename, mime_type, size_bytes, width, height, duration_seconds, content_hash (SHA-256), alt_text (JSONB multilingual), caption (JSONB), storage_path, storage_bucket, url, variants (JSONB), variant_status, source_system, source_url, reference_count, copyright, folder, tags (TEXT[]), uploaded_by, created_at, updated_at, with UNIQUE(content_hash, storage_bucket)
- [ ] Uploading a file with an existing SHA-256 hash returns the existing record and increments reference_count
- [ ] Media API supports: list, get, upload (with dedup), bulk upload, update metadata, delete (only if reference_count=0), list orphaned
- [ ] Responsive image variants are stored in variants JSONB field
- [ ] Folder organization is supported via folder TEXT field with index

### Requirement 6: Authors

**User Story:** As an admin, I want to manage author profiles with multilingual bios, social links, and role-based permissions, so that content is properly attributed and authors have appropriate access levels.

#### Acceptance Criteria
- [ ] An `authors` table exists with: id, slug (UNIQUE), name (JSONB), bio (JSONB), designation (JSONB), email (UNIQUE), avatar_id (FK to media_assets), social_links (JSONB), expertise (TEXT[]), role (admin/editor/senior_editor/author/contributor/guest), is_active, article_count, created_at, updated_at
- [ ] article_count is automatically maintained when entities referencing this author are published/unpublished

### Requirement 7: Editorial Workflow

**User Story:** As an editor, I want content to progress through defined workflow states with role-based gates, so that quality control is enforced and only reviewed content reaches readers.

#### Acceptance Criteria
- [ ] Entity status supports states: draft, in_review, legal_review, seo_review, scheduled, published, archived
- [ ] State machine enforces valid transitions: draft→in_review, in_review→[legal_review|seo_review|draft], legal_review→[seo_review|draft], seo_review→[scheduled|published|draft], scheduled→[published|draft], published→[archived|draft], archived→draft
- [ ] Role-based gates: contributors/authors reach in_review; editors reach seo_review; senior_editors/admins reach published/archived
- [ ] Transition to 'scheduled' requires future scheduled_at; system auto-publishes when time arrives
- [ ] Transition to 'published' sets published_at, creates version snapshot, triggers cache revalidation

### Requirement 8: Content Validation

**User Story:** As an editor, I want the system to check my content for completeness before publishing and show me what's missing, so that I can fix issues before they reach the live site.

#### Acceptance Criteria
- [ ] Critical errors block publishing: missing title, missing slug, missing body, missing category, missing author, duplicate slug within content_type
- [ ] Warnings are shown but don't block: missing featured image, missing SEO title/description, missing excerpt, missing alt text on featured media, body under 100 words, missing tags, broken internal links
- [ ] Validation returns a content quality score (0-100) based on field completeness
- [ ] Validation runs automatically before any transition to 'published'

### Requirement 9: Homepage Builder

**User Story:** As an editor, I want to manage the homepage layout through the CMS — creating sections, choosing templates, picking content, and scheduling visibility — without writing any code.

#### Acceptance Criteria
- [ ] A `homepage_sections` table exists with: id, slug (UNIQUE), title (JSONB), template (hero/featured/grid/compact_list/two_columns/timeline/editorial_picks/widget/ad_slot), position, source_type (query/manual/widget/advertisement), source_config (JSONB), is_active, visible_from, visible_until, device_visibility, max_items, show_ad_after, css_class, priority, locale, created_at, updated_at
- [ ] Editors can create, reorder, enable/disable, and schedule sections via CMS admin
- [ ] Homepage API resolves sections executing queries, with cross-section deduplication (no entity appears in more than one section)
- [ ] A `homepage_audits` table tracks health issues (broken sections, missing images, empty sections)
- [ ] Homepage API response includes health status (healthy/degraded/critical) with warnings

### Requirement 10: Navigation System

**User Story:** As an admin, I want to manage all site navigation (header, footer, sidebar, mobile, breadcrumbs) through the CMS with nested menu items, so that navigation changes don't require deployments.

#### Acceptance Criteria
- [ ] A `navigations` table exists with: id, slug (UNIQUE), title (JSONB), nav_type (header/footer/sidebar/mobile/breadcrumb/quick_links/contextual), is_active, locale, created_at, updated_at
- [ ] A `navigation_items` table exists with: id, navigation_id (FK CASCADE), parent_item_id (self-ref FK), label (JSONB multilingual), url, icon, entity_id (FK), taxonomy_id (FK), position, depth, is_active, open_in_new_tab, device_visibility, badge_text, badge_color, created_at, updated_at
- [ ] Items support tree hierarchy via parent_item_id
- [ ] Items can link to entities or taxonomies directly
- [ ] Menu API returns items in tree structure filtered by locale and device

### Requirement 11: Advertisement Engine

**User Story:** As an admin, I want to manage ad campaigns with scheduled placements, budget controls, and analytics tracking, so that advertising is fully CMS-driven without hardcoded ad slots.

#### Acceptance Criteria
- [ ] An `ad_campaigns` table exists with: id, name, slug (UNIQUE), advertiser, start_date, end_date, is_active, budget_type (unlimited/impressions/clicks/days), budget_limit, target_categories (TEXT[]), target_locales (TEXT[]), total_impressions, total_clicks, created_at, updated_at
- [ ] An `ad_placements` table exists with: id, campaign_id (FK CASCADE), slot, ad_type (adsense/image/html/video), creative (JSONB), device_type, priority, weight, visible_from, visible_until, impressions, clicks, created_at, updated_at
- [ ] Ad API serves placements by slot filtering by: campaign active, date range, placement visibility, device, and budget limits
- [ ] Impressions and clicks are tracked atomically per placement and per campaign
- [ ] Priority ordering with weight-based selection within same priority tier

### Requirement 12: Unified Search

**User Story:** As a reader, I want to search across all content types (articles, editorials, directories, education) from a single search box and get relevant results with faceted filtering.

#### Acceptance Criteria
- [ ] A `search_index` materialized view aggregates all published entities with GIN-indexed tsvector combining title + excerpt + body across locales
- [ ] Search API supports: text query (q), content_type filtering, category filtering, date range, faceted results (by content_type, by category), relevance-ranked pagination
- [ ] The materialized view refreshes within 30 seconds of entity publish
- [ ] Search never returns unpublished/draft/archived entities

### Requirement 13: SEO and Redirects

**User Story:** As an SEO editor, I want comprehensive SEO controls per entity (meta title, description, OG tags, canonical, schema markup) and a redirect manager for URL changes, so that search rankings are preserved.

#### Acceptance Criteria
- [ ] Every entity's seo JSONB supports: title, description, keywords[], og_title, og_description, og_image, canonical_url, schema_json, robots, twitter_card
- [ ] A `redirects` table exists with: id, from_path (UNIQUE), to_path, status_code (301/302/307/308), is_active, hit_count, last_hit_at, notes, created_by, created_at, updated_at
- [ ] SEO API provides sitemap generation (by type), structured data (JSON-LD per slug), and meta retrieval per slug
- [ ] Frontend middleware performs HTTP redirects for matching active redirect paths

### Requirement 14: AI Platform Service

**User Story:** As an editor, I want AI-powered suggestions for headlines, SEO metadata, tags, and categories while writing, so that I can produce optimized content faster without switching tools.

#### Acceptance Criteria
- [ ] AI Service endpoints exist for: headline suggestions, SEO generation (title + description + keywords), summary/excerpt generation, tag suggestions, category suggestions, duplicate detection (with similarity scores), FAQ generation, social media captions
- [ ] AI operates in the content's locale (primarily Hindi)
- [ ] AI integrates with existing @google/generative-ai (Gemini) dependency
- [ ] Duplicate detection compares against existing published entities and returns similarity scores

### Requirement 15: Content Gateway

**User Story:** As a frontend developer, I want to consume content through stable API contracts that don't change when the backend schema evolves, so that frontend and backend can be developed independently.

#### Acceptance Criteria
- [ ] Frontend consumes all content exclusively through Content Gateway API endpoints
- [ ] Gateway exposes stable contracts for: Content API, Search API, Homepage API, Menu API, SEO API, Widget API, Directory API, Advertisement API, Microsite API, Media API
- [ ] Gateway is implemented as Next.js API routes at cms.rampurnews.com/api/public/*
- [ ] Responses follow consistent envelope format: {data, meta: {pagination?}} for lists, {data} for single items

### Requirement 16: Directory Framework

**User Story:** As an editor, I want to manage restaurants, institutions, hospitals, and businesses using a unified directory system with shared infrastructure (address, contact, ratings) and type-specific fields.

#### Acceptance Criteria
- [ ] All directory content uses content_type='directory_listing' with sub_type (restaurant/institution/place/hospital/business/government_office/ngo)
- [ ] Directory-specific fields (address, contact, rating, operating_hours, features, gallery) are stored in metadata JSONB
- [ ] Directory API supports filtering by: sub_type, city, district, category, rating_min, is_verified, is_featured
- [ ] Directory API supports sorting by: rating, name, created_at, distance (geo-proximity)

### Requirement 17: Microsite Framework

**User Story:** As an editor, I want to create themed microsites (Election, Festival, Budget) as CMS-managed collections with their own landing page, navigation, and child content.

#### Acceptance Criteria
- [ ] Microsites are entities with content_type='microsite'
- [ ] Child content references microsite via parent_entity_id
- [ ] Microsite API returns: parent entity, landing page blocks, paginated children, microsite-specific navigation
- [ ] Microsites support contextual navigation (nav_type='contextual') separate from site-wide menus

### Requirement 18: Migration and Import Pipeline

**User Story:** As an admin, I want to import content from Strapi through a validated pipeline where editors can preview, approve, and rollback imported content, so that no bad data reaches production.

#### Acceptance Criteria
- [ ] `staging_imports` and `migration_batches` tables exist for staging pipeline
- [ ] Pipeline flow: Extract → Validate (checksums, fields, media accessibility, word count, slug collision) → Transform → Stage → Editor preview → Senior editor approval → Publish → Verification
- [ ] Validation compares: title, slug, author, SEO, media URLs, body word count (±5 tolerance), body checksum, tags, categories, publish dates
- [ ] Publishing requires senior_editor or admin approval; self-approval is blocked
- [ ] Rollback archives entities and updates staging status; never deletes data
- [ ] Strapi import preserves: all slugs exactly, all published_at timestamps, deduplicates media, rewrites URLs, maps relationships

### Requirement 19: Feature Flags

**User Story:** As an admin, I want granular feature flags to gradually enable new platform features, so that I can roll out changes safely with instant rollback capability.

#### Acceptance Criteria
- [ ] A `feature_flags` table exists with: id, key (UNIQUE), is_enabled, rollout_percentage (0-100), allowed_users (UUID[]), allowed_roles (TEXT[]), description, category, created_at, updated_at
- [ ] Required flags: USE_UNIFIED_ENTITY, USE_HOMEPAGE_BUILDER, USE_NEW_SEARCH, USE_NEW_ADS, USE_NEW_DIRECTORY, USE_CONTENT_GATEWAY, USE_NEW_NAVIGATION, STRAPI_READ_ENABLED
- [ ] Flags are evaluated per-request; disabled flag routes to legacy behavior
- [ ] Only admin role can modify flags

### Requirement 20: Health and Diagnostics

**User Story:** As an admin, I want a health dashboard showing content quality issues, SEO gaps, orphaned media, and broken links, so that I can proactively maintain site quality.

#### Acceptance Criteria
- [ ] Diagnostics Service checks: Homepage (empty sections, broken ads), SEO (missing titles/descriptions, broken redirects), Media (orphaned assets, missing alt text, failed variants), Content (missing featured images, empty categories, broken links, overdue schedules)
- [ ] API returns aggregate status (healthy/degraded/critical) per area with individual issues by severity
- [ ] Homepage health is included in every Homepage API response

### Requirement 21: Strapi Retirement

**User Story:** As a developer, I want all Strapi-related code removed from the codebase after migration is verified, so that the system has zero runtime dependency on legacy infrastructure.

#### Acceptance Criteria
- [ ] After migration: aggregator dual-source logic removed, Strapi proxy routes deleted, Strapi remote patterns removed from next.config.js, all STRAPI_* env vars removed, CMS provider Strapi adapter removed
- [ ] No HTTP calls to api.rampur.cloud exist in the codebase
- [ ] STRAPI_READ_ENABLED flag set to false gates code removal

### Requirement 22: Schema Evolution

**User Story:** As a developer, I want to introduce the new unified schema without breaking existing functionality, using a phased dual-write approach controlled by feature flags.

#### Acceptance Criteria
- [ ] New tables created alongside legacy tables; no existing table dropped or altered during transition
- [ ] During dual-write (USE_UNIFIED_ENTITY enabled): CMS writes go to both legacy and new tables; reads from new tables
- [ ] Legacy data migrated through same import pipeline as Strapi (staging → validate → approve → publish)
- [ ] Legacy tables dropped only after full content verification in new model

### Requirement 23: Performance

**User Story:** As a reader, I want pages to load fast with content served from cache, so that the site feels responsive even on slow mobile connections.

#### Acceptance Criteria
- [ ] Search index materialized view refreshes in under 5 seconds
- [ ] Homepage API cacheable via ISR (revalidate=30s); individual section failure doesn't crash response
- [ ] Gateway responses include Cache-Control headers for CDN
- [ ] Entity list queries support cursor-based pagination
- [ ] GIN indexes on JSONB fields; denormalized counts via triggers

### Requirement 24: Security

**User Story:** As an admin, I want proper access controls so that only authorized users can publish content, only published content is visible publicly, and no credentials are leaked.

#### Acceptance Criteria
- [ ] Row-Level Security enabled on all tables; public API returns only status='published' content
- [ ] Media uploads validate file type whitelist and max size (10MB)
- [ ] All Strapi credentials removed from environment files post-migration
- [ ] Migration approval workflow prevents unauthorized publishing
