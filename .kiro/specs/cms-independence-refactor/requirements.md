# Requirements Document

## Introduction

This specification defines the requirements for refactoring the Custom CMS (rampurnews-cms) into a fully independent system with its own Supabase Postgres database, removing all dependency on the Strapi CMS proxy. The Strapi CMS remains untouched and continues serving existing historical content. The Frontend becomes CMS-agnostic, querying both backends and merging results for display. All new content going forward is created and lives exclusively in the new independent Custom CMS.

## Glossary

- **Custom_CMS**: The Next.js 15 (App Router) admin application being refactored to operate independently with its own Supabase Postgres database
- **Strapi_CMS**: The original CMS that remains untouched and continues serving existing historical content
- **Frontend**: The Next.js public-facing application that consumes content from both Custom_CMS and Strapi_CMS
- **Content_Item**: Any record belonging to one of the 18 content types managed by the system
- **Content_Type**: One of: article, author, category, tag, media, page, event, exam, holiday, institution, place, restaurant, result, education-news, editorial, sitesetting, internal-link, microsite-item
- **Editorial_Status**: One of: draft, pending_review, approved, published, archived
- **Version**: A full content snapshot of a Content_Item stored as an immutable row in the version history table
- **Audit_Entry**: A log record capturing who performed what action, when, and on which resource
- **RBAC**: Role-Based Access Control system governing which users can perform which actions on which resources
- **CMS_Role**: One of: super_admin, admin, editor, author, reporter, contributor, advertiser
- **Slug**: A URL-friendly identifier for a Content_Item, unique within the Custom_CMS namespace
- **Media_Variant**: An automatically generated image size variant (thumbnail, medium, large) derived from an uploaded original
- **Webhook**: An HTTP callback triggered by a publish event in the Custom_CMS to notify the Frontend for cache revalidation
- **AI_Generation**: Google Generative AI integration producing TipTap-compatible content, gated by RBAC permissions and per-user rate limits
- **Supabase_Storage**: The object storage service used for all new media uploads in the Custom_CMS
- **Source_Indicator**: A metadata field on merged content items identifying the origin backend (strapi or custom-cms)

## Requirements

### Requirement 1: Independent Database Schema

**User Story:** As a system administrator, I want the Custom CMS to have its own fully independent Supabase Postgres database schema, so that it operates without any runtime dependency on the Strapi database.

#### Acceptance Criteria

1. THE Custom_CMS database schema SHALL use UUID primary keys for all tables.
2. THE Custom_CMS database schema SHALL contain tables for all 18 Content_Types: article, author, category, tag, media, page, event, exam, holiday, institution, place, restaurant, result, education-news, editorial, sitesetting, internal-link, microsite-item.
3. THE Custom_CMS database schema SHALL have zero foreign key references to any Strapi_CMS table.
4. THE Custom_CMS database schema SHALL have zero runtime queries or connections to the Strapi_CMS database.
5. THE Custom_CMS database schema SHALL include tables for admin-user and cms-user management.
6. THE Custom_CMS database schema SHALL include tables for version history, audit logging, ad campaigns, and RBAC permissions.
7. THE Custom_CMS database schema SHALL define foreign key relationships between Content_Type tables within the Custom_CMS schema (article→author, article→category, article→tags via junction table, article→media, and equivalent relationships for other Content_Types that reference authors, categories, tags, or media).
8. THE Custom_CMS database schema SHALL include created_at and updated_at timestamp columns on all Content_Type tables, and a published_at timestamp column on all Content_Type tables that participate in the editorial workflow.
9. THE Custom_CMS database schema SHALL enforce a unique constraint on the slug column within each Content_Type table that supports slug-based lookup.

### Requirement 2: Remove Strapi Proxy Dependency

**User Story:** As a developer, I want all Strapi proxy routes and clients removed from the Custom CMS, so that the Custom CMS has no code path calling Strapi.

#### Acceptance Criteria

1. WHEN the refactoring is complete, THE Custom_CMS SHALL NOT contain the `/api/cms/strapi/[...path]` route handler file or directory.
2. WHEN the refactoring is complete, THE Custom_CMS SHALL NOT contain the `cmsApi` client module or any source file that constructs HTTP requests to a URL matching the Strapi API base path (e.g., `/api/cms/strapi` or a `STRAPI_API_URL` environment variable value).
3. THE Custom_CMS backend SHALL perform all content CRUD operations (create, read, update, delete for articles, categories, authors, tags, editorials, and settings) against its own Supabase Postgres database without routing through an intermediary API.
4. THE Custom_CMS backend SHALL make zero outbound HTTP calls to any Strapi_CMS host or endpoint during any content operation, verifiable by confirming no source file imports or invokes a Strapi URL and no Strapi-bound network request is issued at runtime.
5. WHEN the refactoring is complete, THE Custom_CMS SHALL NOT require any Strapi-specific environment variables (STRAPI_API_URL, STRAPI_API_TOKEN, or equivalents prefixed with NEXT_PUBLIC_STRAPI_) to start or operate.
6. WHEN the refactoring is complete, all components that previously imported the `cmsApi` client (such as WorkflowActions) SHALL invoke the Custom_CMS's own Supabase-backed API endpoints for workflow transitions instead.

### Requirement 3: Content CRUD API

**User Story:** As a CMS user, I want REST API endpoints for all content types with pagination, filtering, sorting, and validation, so that I can manage content efficiently.

#### Acceptance Criteria

1. THE Custom_CMS SHALL expose REST API endpoints supporting create, read, update, and delete operations for all 18 Content_Types plus admin-user and cms-user.
2. THE Custom_CMS API SHALL support pagination parameters (page, pageSize) on all list endpoints, with a default page size of 25 and a maximum page size of 100.
3. THE Custom_CMS API SHALL support filtering by field values on all list endpoints using query parameters (e.g., ?status=published&category=news).
4. THE Custom_CMS API SHALL support sorting by any sortable field with ascending or descending order on all list endpoints using query parameters (e.g., ?sort=published_at&order=desc).
5. THE Custom_CMS API SHALL validate all input payloads using Zod schemas and return 400 status with descriptive error messages indicating which fields failed validation for invalid input.
6. WHEN a new Content_Item is created with a slug that collides with an existing slug in the Custom_CMS namespace, THE Custom_CMS SHALL auto-suffix the slug with an incrementing number (e.g., my-article-2, my-article-3).
7. WHEN a new Content_Item is created with a slug that collides with a known Strapi_CMS slug, THE Custom_CMS SHALL auto-suffix the slug with an incrementing number to avoid collision.
8. THE Custom_CMS SHALL NOT block content creation due to a slug collision; slug resolution SHALL always succeed automatically.
9. THE Custom_CMS API list endpoints SHALL return a response containing: data (array of items), meta.pagination.page, meta.pagination.pageSize, meta.pagination.pageCount, and meta.pagination.total.

### Requirement 4: Editorial Workflow

**User Story:** As an editor, I want a structured editorial workflow with version history, so that content goes through review stages and prior versions are recoverable.

#### Acceptance Criteria

1. THE Custom_CMS SHALL enforce the editorial lifecycle: draft → pending_review → approved → published → archived.
2. WHEN a Content_Item transitions to a new Editorial_Status, THE Custom_CMS SHALL validate that the transition is permitted (draft→pending_review, pending_review→approved, approved→published, published→archived, and any status back to draft).
3. IF an invalid status transition is requested, THEN THE Custom_CMS SHALL reject the request with 400 Bad Request and return an error message listing the valid transitions from the current status.
4. WHEN a Content_Item is published or updated after publication, THE Custom_CMS SHALL create a new Version row containing a full content snapshot (all fields of the Content_Item at that point in time) rather than mutating the existing record in place.
5. THE Custom_CMS SHALL serve the most recent published Version as the current content for public consumption.
6. THE Custom_CMS API SHALL provide an endpoint to retrieve all Versions of a given Content_Item, ordered by creation date descending (newest first), with pagination support.
7. WHEN a rollback is requested to a specific Version, THE Custom_CMS SHALL restore the Content_Item to the state captured in that Version by creating a new Version row with the restored content (preserving the full version chain) and setting the Content_Item's status to draft.
8. THE Custom_CMS SHALL record editorial status transitions in the Audit_Entry log (who, when, what action, which Content_Item, previous status, new status) rather than duplicating change tracking in the version table.

### Requirement 5: Role-Based Access Control

**User Story:** As an administrator, I want granular role-based access control with 7 roles and resource-level permissions, so that each user has appropriate system access.

#### Acceptance Criteria

1. THE Custom_CMS SHALL support exactly 7 CMS_Roles: super_admin, admin, editor, author, reporter, contributor, advertiser, where each user is assigned exactly one CMS_Role at any time.
2. THE Custom_CMS SHALL enforce resource-level and action-level permissions (create, read, update, delete, publish, manage_users) with scope enforcement (all: applies to any user's resources, own: applies only to resources created by the acting user) for each CMS_Role.
3. IF the authenticated user lacks the required permission for the requested resource and action, THEN THE Custom_CMS API SHALL reject the request with 403 Forbidden and return an error response indicating insufficient permissions.
4. WHILE a user has the super_admin or admin CMS_Role, THE Custom_CMS SHALL grant AI_Generation access by default, and this access SHALL remain active unless explicitly revoked by a super_admin.
5. WHILE a user has the editor, author, reporter, contributor, or advertiser CMS_Role, THE Custom_CMS SHALL require an explicit per-user or per-role AI_Generation permission grant before allowing AI content generation.
6. IF a user without AI_Generation permission submits an AI generation request, THEN THE Custom_CMS API SHALL reject the request with 403 Forbidden and return an error response indicating that AI generation permission is required.
7. THE Custom_CMS SHALL allow super_admin and admin users to grant or revoke AI_Generation permission for any other user or role.
8. IF a user has no CMS_Role assigned, THEN THE Custom_CMS SHALL deny all resource access and reject requests with 403 Forbidden until a CMS_Role is assigned by a super_admin or admin.
9. WHEN a user's CMS_Role or permissions are changed, THE Custom_CMS SHALL enforce the updated permissions on all subsequent API requests made by that user within 5 seconds of the change.

### Requirement 6: Media Management with Supabase Storage

**User Story:** As a content creator, I want to upload media files with automatic variant generation, so that images are optimized for different display contexts.

#### Acceptance Criteria

1. WHEN a media file is uploaded, THE Custom_CMS SHALL store the original file in Supabase_Storage with a maximum file size of 10 MB.
2. WHEN an image file (MIME types: image/jpeg, image/png, image/webp, image/gif) is uploaded, THE Custom_CMS SHALL generate three Media_Variants: thumbnail (150px width), medium (600px width), and large (1200px width), preserving the original aspect ratio.
3. THE Custom_CMS SHALL store metadata (filename, mime type, size in bytes, dimensions in pixels, variant URLs, alt text, upload timestamp) for each uploaded media item in the database.
4. THE Custom_CMS SHALL provide an image proxy endpoint that serves media with Cache-Control headers set to a maximum of 1 year for immutable variant URLs.
5. WHEN a media item is deleted, THE Custom_CMS SHALL remove the original file and all Media_Variants from Supabase_Storage and delete the database metadata record.
6. THE Custom_CMS media system SHALL operate independently of the Strapi_CMS media library with zero shared storage.
7. IF a media upload exceeds the 10 MB file size limit, THEN THE Custom_CMS SHALL reject the upload with 413 Payload Too Large and return an error message indicating the maximum allowed size.
8. IF variant generation fails for an uploaded image, THEN THE Custom_CMS SHALL still store the original file and metadata, mark variant generation as failed in the database record, and return a success response with a warning indicating which variants could not be generated.

### Requirement 7: Frontend Content Aggregation

**User Story:** As a frontend visitor, I want to see content from both Strapi and the Custom CMS merged seamlessly, so that the transition to the new CMS is transparent.

#### Acceptance Criteria

1. WHEN the Frontend renders a content listing, THE Frontend SHALL query both the Strapi_CMS API and the Custom_CMS API for the relevant Content_Type, with a per-source timeout of 5 seconds.
2. THE Frontend SHALL merge results from both sources ordered by publication date (newest first), deduplicating by slug with the Custom_CMS version taking precedence when the same slug exists in both sources.
3. THE Frontend SHALL include a Source_Indicator field (value: "strapi" or "custom-cms") on each merged Content_Item.
4. WHEN the Frontend resolves a Content_Item by slug, THE Frontend SHALL check the Custom_CMS first, then fall back to the Strapi_CMS if not found.
5. THE Frontend SHALL route detail-page requests, links, and revalidation calls to the correct backend based on the Source_Indicator.
6. THE Frontend content aggregation SHALL NOT modify, write to, or interfere with the Strapi_CMS in any way (read-only access).
7. IF either the Strapi_CMS API or the Custom_CMS API is unreachable or returns an error, THEN THE Frontend SHALL serve results from the available source alone and render the listing without indicating a partial failure to the visitor.
8. IF both the Strapi_CMS API and the Custom_CMS API are unreachable, THEN THE Frontend SHALL display an error message indicating that content is temporarily unavailable.

### Requirement 8: Revalidation and Webhooks

**User Story:** As a content publisher, I want published content to appear on the Frontend immediately via cache revalidation, so that visitors see fresh content without manual cache purging.

#### Acceptance Criteria

1. WHEN a Content_Item is published in the Custom_CMS, THE Custom_CMS SHALL send a webhook HTTP POST to the Frontend revalidation endpoint containing the Content_Item slug, Content_Type, category, and an array of derived URL paths to revalidate (including the item detail path, category listing path, and the homepage path).
2. WHEN a Content_Item is published in the Custom_CMS, THE Custom_CMS SHALL complete the publish operation and persist the Content_Item regardless of whether the webhook delivery succeeds or fails.
3. IF a webhook delivery fails (defined as: connection timeout exceeding 10 seconds, HTTP response status 4xx other than 401, or HTTP response status 5xx), THEN THE Custom_CMS SHALL retry delivery with exponential backoff (delays: 1s, 2s, 4s, 8s, 16s) up to 5 retry attempts.
4. IF all webhook retry attempts fail, THEN THE Custom_CMS SHALL log the failure in the Audit_Entry log with the Content_Item identifier, the target endpoint URL, the HTTP status code or error reason, and the timestamp of the final failed attempt.
5. THE Custom_CMS webhook system SHALL NOT interfere with or modify the Strapi_CMS existing webhook behavior.
6. THE Custom_CMS SHALL transmit the shared secret via the `x-revalidate-token` HTTP header in webhook requests so the Frontend can verify authenticity.

### Requirement 9: Ads Module

**User Story:** As an advertiser, I want a complete ads management system with campaign CRUD, placement targeting, and analytics, so that I can run and track ad campaigns.

#### Acceptance Criteria

1. THE Custom_CMS SHALL provide REST API endpoints for creating, reading, updating, and deleting ad campaigns, where each campaign requires at minimum a title (1–200 characters), a type (one of: adsense, image, html), a placement, an isActive flag, and a priority (integer 1–100).
2. THE Custom_CMS SHALL support placement targeting by allowing each ad campaign to specify one placement from the defined set (header, sidebar, infeed, article_top, article_middle, article_bottom, footer, mobile_sticky, banner_1 through banner_10), an optional device type (all, mobile, or desktop), and an optional content category filter.
3. WHEN an ad impression or click event occurs, THE Custom_CMS SHALL record the event with a UTC timestamp, the IP address anonymized by zeroing the last octet (IPv4) or last 80 bits (IPv6), and page context consisting of the page URL path and the placement identifier.
4. IF a campaign create or update request is missing required fields or contains invalid values, THEN THE Custom_CMS SHALL reject the request and return an error response indicating which fields failed validation, without persisting any changes.
5. THE Custom_CMS SHALL provide analytics endpoints returning impression counts, click counts, and click-through rate (calculated as clicks divided by impressions, expressed as a percentage) aggregated by campaign, placement, and date range, where the date range shall not exceed 365 days per query.
6. THE Custom_CMS ads module SHALL store all data in its own Supabase Postgres tables, independent of any Strapi_CMS data.
7. IF the tracking service is unavailable when an impression or click event is submitted, THEN THE Custom_CMS SHALL return a success response to the client without blocking the user interaction, and the event data SHALL be discarded.

### Requirement 10: AI Content Generation

**User Story:** As a content author, I want AI-assisted content generation that produces editor-compatible output, so that I can accelerate content creation.

#### Acceptance Criteria

1. THE Custom_CMS SHALL integrate with Google Generative AI to produce content based on user-provided prompts, where the prompt length must be between 1 and 5000 characters.
2. THE Custom_CMS SHALL format AI-generated content as TipTap-editor-compatible JSON output.
3. THE Custom_CMS SHALL enforce a per-user daily rate limit on AI generation requests, with a default cap of 20 requests per user per day, where the daily window resets at midnight UTC.
4. THE Custom_CMS SHALL allow super_admin and admin users to configure the daily rate limit cap to a value between 1 and 500 requests per user per day.
5. WHEN a user exceeds the daily AI generation rate limit, THE Custom_CMS SHALL reject the request with 429 Too Many Requests and include a message indicating when the limit resets.
6. THE Custom_CMS SHALL enforce the AI_Generation RBAC permission gate (as defined in Requirement 5) before processing any AI generation request.
7. IF the Google Generative AI service is unavailable or returns an error, THEN THE Custom_CMS SHALL return a 503 Service Unavailable response with a message indicating the AI service is temporarily unavailable.
8. IF the user-provided prompt is empty or contains only whitespace, THEN THE Custom_CMS SHALL reject the request with 400 Bad Request and a message indicating that a non-empty prompt is required.

### Requirement 11: Authentication

**User Story:** As a CMS administrator, I want secure authentication using Supabase Auth with session cookies, so that only authorized users can access the admin interface.

#### Acceptance Criteria

1. THE Custom_CMS SHALL authenticate users exclusively via Supabase Auth.
2. THE Custom_CMS SHALL manage user sessions using HTTP-only, Secure, SameSite=Lax session cookies.
3. THE Custom_CMS SHALL NOT implement or support JWT-based authentication as a fallback mechanism.
4. WHEN a session cookie is missing, expired, malformed, or fails signature verification, THE Custom_CMS API SHALL return 401 Unauthorized.
5. WHEN a user's session expires after 24 hours of inactivity, THE Custom_CMS SHALL redirect to the login page in the admin UI.
6. WHEN a session has been active for more than 50% of the idle timeout and the user makes a request, THE Custom_CMS SHALL automatically refresh the session to extend it without requiring re-authentication, up to a maximum absolute session lifetime of 7 days.
7. IF the Supabase Auth service is unreachable during an authentication or session validation request, THEN THE Custom_CMS SHALL return 503 Service Unavailable with an error message indicating a temporary authentication service outage.
8. THE Custom_CMS SHALL enforce a maximum absolute session lifetime of 7 days, after which re-authentication is required regardless of activity.

### Requirement 12: Hosting Compatibility

**User Story:** As a DevOps engineer, I want the Custom CMS to run within Hostinger Node.js hosting constraints, so that it deploys reliably on the target infrastructure.

#### Acceptance Criteria

1. THE Custom_CMS SHALL operate within a 1024 MB maximum heap memory constraint under peak load conditions.
2. THE Custom_CMS SHALL NOT require Docker for deployment.
3. THE Custom_CMS SHALL function as stateless application instances (no local file system state between requests beyond the Next.js build cache).
4. WHEN a media upload exceeds 5 MB or a bulk export exceeds 100 records, THE Custom_CMS SHALL use streaming or chunked processing to keep per-operation memory allocation below 100 MB.
5. THE Custom_CMS build process SHALL complete successfully with NODE_OPTIONS='--max-old-space-size=1024' within 300 seconds.
6. THE Custom_CMS SHALL be compatible with Node.js LTS versions 18.x and 20.x as supported by Hostinger Node.js hosting.
7. IF heap memory usage exceeds 900 MB during a request, THEN THE Custom_CMS SHALL reject new incoming requests with 503 Service Unavailable until memory usage drops below 900 MB, rather than crashing the process.

### Requirement 13: Audit Logging

**User Story:** As an administrator, I want comprehensive audit logging of all system actions, so that I can review user activity and investigate issues.

#### Acceptance Criteria

1. WHEN a CRUD operation is performed on any content type or a user management action occurs (create user, change role, deactivate user), THE Custom_CMS SHALL insert an Audit_Entry into the cms_audit_log table containing: user_id, user_email, CMS_Role, action performed, resource type, resource_id, metadata (JSON), IP address, and timestamp in UTC.
2. WHEN a Content_Item is updated, THE Custom_CMS Audit_Entry SHALL include a snapshot of the changed fields (previous and new values) in the metadata JSON field.
3. THE Custom_CMS SHALL retain Audit_Entry records for a minimum of 90 days.
4. WHEN an Audit_Entry record is older than 90 days, THE Custom_CMS cleanup job SHALL delete the record from the cms_audit_log table.
5. THE Custom_CMS SHALL run the audit log cleanup job once every 24 hours.
6. THE Custom_CMS SHALL provide an API endpoint for querying audit logs with filtering by user, action, resource type, and date range, supporting pagination via `page` and `pageSize` parameters with a maximum page size of 100 records.
7. IF an Audit_Entry fails to be written to the database, THEN THE Custom_CMS SHALL still complete the original user action and log the audit failure to the application error log.
8. WHEN an audit log query is requested, THE Custom_CMS SHALL restrict access to users with the super_admin or admin CMS_Role and return a 403 status code for unauthorized users.

### Requirement 14: Admin UI for All Content Types

**User Story:** As a CMS administrator, I want paginated tables and forms with rich text editing for all content types, so that I can manage all content through the admin interface.

#### Acceptance Criteria

1. THE Custom_CMS admin UI SHALL provide paginated list views (tables) for all 18 Content_Types, displaying 25 items per page by default with navigation controls to move between pages.
2. THE Custom_CMS admin UI SHALL provide create and edit forms for all 18 Content_Types.
3. THE Custom_CMS admin UI SHALL use TipTap editor for all rich text content fields.
4. THE Custom_CMS admin UI SHALL enforce RBAC permission gating on all views and actions, showing only resources and actions the current user is permitted to access.
5. IF a user attempts to access a UI view or action beyond their permissions, THEN THE Custom_CMS admin UI SHALL display an access-denied message indicating the required permission and SHALL NOT render the restricted content.
6. THE Custom_CMS admin UI SHALL display the current Editorial_Status of each Content_Item in list views and edit forms, and provide status transition controls limited to transitions permitted by the user's CMS_Role.
7. IF a form submission fails Zod schema validation, THEN THE Custom_CMS admin UI SHALL display field-level error messages indicating which fields failed validation and SHALL preserve the user's entered data without navigating away from the form.
