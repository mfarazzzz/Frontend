# Tasks

## Completed

- [x] Task 1: Create extended publisher profile type system (`src/types/publisher-profile.ts`)
  - PublisherProfile interface with all fields (identity, biography, professional, credentials, media, social, E-E-A-T, dates)
  - Beat, EditorialStatus, VerificationStatus, Education, SocialLinks, ProfessionalLinks types
  - `cmsAuthorToPublisherProfile()` adapter function
  - AuthorStats and AuthorArticleSummary types

- [x] Task 2: Create structured data JSON-LD generator (`src/lib/publisher-schema.ts`)
  - `buildPersonSchema()` — Person with sameAs, knowsAbout, alumniOf, hasOccupation, worksFor
  - `buildProfilePageSchema()` — ProfilePage with mainEntity reference
  - `buildBreadcrumbSchema()` — BreadcrumbList (Home > Authors > Name)
  - `buildWebPageSchema()` — WebPage with author, publisher, inLanguage
  - `buildSameAs()` — Priority-ordered sameAs array (Wikipedia/Scholar first)
  - `buildAllAuthorSchemas()` — Combined array of all schemas

- [x] Task 3: Create new `/author/[slug]` route (`src/app/author/[slug]/page.tsx`)
  - Server-side rendered with ISR (revalidate: 60s)
  - Full SEO metadata generation (title, description, OG, Twitter, canonical, robots, keywords)
  - JSON-LD structured data embedding
  - Semantic HTML with ARIA landmarks
  - Fallback biography generation for AI search (150+ chars)
  - Author article fetching with stats computation

- [x] Task 4: Create publisher profile components
  - `ProfileHero.tsx` — Cover image, avatar, name (EN/HI), designation, editorial status, stats badges, verified badge
  - `ProfileAbout.tsx` — Biography section with entity-rich content for AI indexing
  - `ProfileEEAT.tsx` — Expertise tags, experience, education, certifications, awards (hides empty sections)
  - `ProfileSocial.tsx` — Social links (9 platforms) + Professional links (8 platforms) with icons
  - `ArticleSection.tsx` — Tabbed articles (Latest, Popular, Category) with pagination, internal links
  - `Breadcrumb.tsx` — Accessible breadcrumb navigation
  - `AuthorAttribution.tsx` — Reusable byline block for article pages

- [x] Task 5: Add 301 redirect from `/authors/[slug]` to `/author/[slug]` in middleware

## Pending (Future Phases)

- [ ] Task 6: Follow Author system (requires auth + Supabase table for subscriptions)
- [ ] Task 7: AI Biography Assistant (requires LLM API integration)
- [ ] Task 8: CMS Dashboard metrics page (requires admin auth)
- [ ] Task 9: Image processing pipeline (crop, WebP, responsive sizes, OG image generation)
- [ ] Task 10: Push notification system for author follows
- [ ] Task 11: Author statistics real-time tracking (views, CTR from analytics)
- [ ] Task 12: CMS backend — extend author schema in Supabase with all new fields
