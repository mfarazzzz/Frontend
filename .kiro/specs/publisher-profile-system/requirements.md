# Requirements Document

## Introduction

Transform the existing basic Authors module into an enterprise-grade Publisher & Author Management System for rampurnews.com. The system is optimized for Google Search, Google News, Google Discover, AI Search engines (ChatGPT, Gemini, Claude, Perplexity, Copilot), E-E-A-T signals, Knowledge Graph presence, and structured data compliance. It replaces the current `/authors/[slug]` page with a comprehensive, production-ready publisher profile architecture.

## Glossary

- **Publisher_Profile_System**: The complete system responsible for managing, rendering, and optimizing author/publisher profile data across the frontend, CMS, and structured data layers.
- **Profile_Page**: The public-facing author page rendered at `/author/[slug]` with professional information, articles, statistics, and structured data.
- **Profile_Data_Model**: The extended CMSAuthor data type encompassing all publisher fields including bilingual names, biography, credentials, social links, media, and metadata.
- **Schema_Generator**: The module that produces JSON-LD structured data (Person, ProfilePage, Breadcrumb, Organization, WebPage) from author profile data.
- **Image_Processor**: The component that handles profile/cover image uploads, crops, compresses, converts to WebP, and generates responsive variants and OpenGraph images.
- **SEO_Engine**: The subsystem that auto-generates meta tags, canonical URLs, OpenGraph, Twitter Cards, robots directives, and entity metadata for each profile page.
- **Statistics_Module**: The component that aggregates and displays public author statistics (articles count, categories, views, reading time).
- **Follow_System**: The mechanism allowing readers to follow/subscribe to authors via email or push notifications.
- **Editorial_Workflow**: The status management system tracking author statuses (Active, On Leave, Guest Author, Freelancer, Staff Writer, Editor, Senior Editor, Chief Editor, Inactive).
- **AI_Biography_Assistant**: The module that generates professional biographies, short bios, SEO descriptions, and social descriptions from author data and prompts.
- **Knowledge_Graph_Builder**: The component that constructs sameAs arrays and Person schema from verified social profiles to establish Knowledge Graph entity connections.
- **CMS_Dashboard**: The internal admin interface showing author performance metrics (articles, views, drafts, published counts).
- **Beat**: The topical coverage area assigned to an author (e.g., Politics, Crime, Sports, Education, Business, Health, Technology, Entertainment, Local News).
- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trustworthiness — Google's quality evaluation criteria for content creators.

## Requirements

### Requirement 1: Public Author Profile Page Generation

**User Story:** As a reader, I want to access a professionally designed author profile page at a clean URL, so that I can learn about the journalist and access their work.

#### Acceptance Criteria

1. WHEN a valid author slug is requested, THE Profile_Page SHALL render the author profile at `/author/[slug]` using Server-Side Rendering with a maximum Time to First Byte (TTFB) of 800 milliseconds under normal server load.
2. THE Profile_Page SHALL display the following sections in order from top to bottom: cover image (or a default gradient placeholder if none is set), profile photo (or a default avatar icon if none is set), full name in English, full name in Hindi (if available), designation, department (if available), short biography (maximum 200 characters), expertise tags (if available), coverage areas (if available), languages (if available), experience (if available), education (if available), certifications (if available), awards (if available), contact information (if available), verification badge (if author is verified), join date, and last active date.
3. WHEN an author slug does not match any author record in the system, THE Profile_Page SHALL return an HTTP 404 status code and render a not-found page that includes a message indicating the author was not found and a navigation link back to the authors listing page.
4. WHEN a new author record is created, THE Publisher_Profile_System SHALL auto-generate a URL slug from the author's English name by converting to lowercase, replacing sequences of non-alphanumeric characters with a single hyphen, and removing leading or trailing hyphens, producing a slug between 3 and 80 characters in length.
5. WHEN the author profile is rendered, THE Profile_Page SHALL include breadcrumb navigation displaying the path "Home > Authors > [Author Full Name]" where each ancestor segment is a clickable link to its respective page.
6. IF the author's English name produces a slug that already exists in the system, THEN THE Publisher_Profile_System SHALL append a numeric suffix (e.g., "-2", "-3") to produce a unique slug.
7. WHEN the author profile is rendered, THE Profile_Page SHALL include structured data (JSON-LD) with schema.org Person type containing at minimum the author's name, job title, affiliated organization, and profile URL.

### Requirement 2: Extended Author Data Model

**User Story:** As a CMS administrator, I want comprehensive author fields available, so that I can capture all professional information needed for E-E-A-T and Knowledge Graph presence.

#### Acceptance Criteria

1. THE Profile_Data_Model SHALL support the following fields: id (unique identifier), slug (URL-safe string, max 100 characters), fullName (string, max 120 characters), hindiName (string, max 120 characters), displayName (string, max 80 characters), email (valid email format, max 254 characters), shortBio (plain text, max 300 characters), fullBiography (rich text, max 5000 characters), designation (string, max 100 characters), department (string, max 100 characters), beat (single selection from allowed beat values), experienceYears (integer, 0 to 60), experienceDescription (string, max 1000 characters), languages (array, max 10 entries), education (array of objects each containing: degree, institution, year; max 10 entries), certifications (array of strings, max 20 entries, each max 200 characters), awards (array of strings, max 30 entries, each max 200 characters), profileImage (image reference), coverImage (image reference), organizationLogo (image reference), joinDate (ISO 8601 date), lastActiveDate (ISO 8601 date), verificationStatus (string), and editorialStatus (single selection from allowed editorial status values).
2. THE Profile_Data_Model SHALL support beat values: Politics, Crime, Sports, Education, Business, Health, Technology, Entertainment, and Local News.
3. THE Profile_Data_Model SHALL support language values: Hindi, English, Urdu, and a custom text entry (max 50 characters per entry) for languages not in the predefined list.
4. THE Profile_Data_Model SHALL support editorial statuses: Active, On Leave, Guest Author, Freelancer, Staff Writer, Editor, Senior Editor, Chief Editor, and Inactive.
5. WHEN a CMS administrator attempts to save a profile, IF fullName, email, or editorialStatus is empty or missing, THEN THE Profile_Data_Model SHALL reject the save operation and display a validation error message indicating which required fields are missing.
6. WHEN a CMS administrator saves a profile with a fullName value, THE Profile_Data_Model SHALL auto-generate the slug field as a URL-safe, lowercase, hyphen-separated transliteration of fullName, unless the administrator has manually provided a slug value.
7. WHEN a CMS administrator provides an email value, IF the value does not conform to a valid email format, THEN THE Profile_Data_Model SHALL reject the save operation and display a validation error message indicating the email is invalid.

### Requirement 3: Profile Image Processing

**User Story:** As an author, I want my uploaded images to be automatically optimized, so that my profile loads quickly and displays correctly across all devices and platforms.

#### Acceptance Criteria

1. WHEN a profile image is uploaded, THE Image_Processor SHALL crop the image to a 1:1 aspect ratio using center crop, compress it to a maximum quality of 80%, and convert the output to WebP format.
2. WHEN a profile image is processed, THE Image_Processor SHALL generate responsive variants at 64px, 128px, 256px, and 512px widths, maintaining the 1:1 aspect ratio.
3. WHEN a cover image is uploaded, THE Image_Processor SHALL crop the image to a 3:1 aspect ratio using center crop, compress it to a maximum quality of 80%, convert the output to WebP format, and generate sizes at 640px, 1200px, and 1920px widths.
4. WHEN a profile image is uploaded, THE Image_Processor SHALL generate an OpenGraph image (1200x630) compositing the author photo, name, designation, and organization branding.
5. IF an uploaded image exceeds 5MB, is not a valid image format (JPEG, PNG, WebP, AVIF), or has dimensions smaller than 200x200 pixels, THEN THE Image_Processor SHALL reject the upload with an error message indicating the specific validation failure.
6. IF image processing fails after upload acceptance, THEN THE Image_Processor SHALL retain the original uploaded file, notify the author that processing failed, and allow the author to re-trigger processing or upload a replacement image.

### Requirement 4: Social Media and Professional Links

**User Story:** As a reader, I want to find the author's verified social profiles, so that I can follow them across platforms and verify their identity.

#### Acceptance Criteria

1. THE Profile_Data_Model SHALL store optional social platform link fields for: X (Twitter), Facebook, Instagram, LinkedIn, YouTube, Threads, Telegram, WhatsApp Channel, and Koo, each accepting a single URL value with a maximum length of 2048 characters.
2. THE Profile_Data_Model SHALL store optional professional link fields for: personal Website, Blog, Wikipedia, Google Scholar, ORCID, GitHub, Medium, and Substack, each accepting a single URL value with a maximum length of 2048 characters.
3. WHEN social or professional links are present on a profile, THE Profile_Page SHALL display a platform-specific icon for each linked platform, where each icon includes an accessible text label identifying the platform name conforming to WCAG 2.1 Level AA, and links open in a new browser tab.
4. THE Publisher_Profile_System SHALL validate that all social and professional link values are well-formed URLs beginning with https:// or http:// and not exceeding 2048 characters before saving.
5. IF a social or professional link value fails URL validation, THEN THE Publisher_Profile_System SHALL reject the save operation and display an error message indicating which link field contains the invalid URL.
6. WHEN a profile has more than one social or professional link, THE Profile_Page SHALL display the links grouped by category (social links first, professional links second) in the order listed in criteria 1 and 2.

### Requirement 5: Google Knowledge Graph and SameAs Generation

**User Story:** As an SEO manager, I want the system to build Knowledge Graph entity signals automatically, so that Google can connect the author to their verified identities across the web.

#### Acceptance Criteria

1. WHEN an author profile has social links populated, THE Knowledge_Graph_Builder SHALL generate a `sameAs` array containing all verified profile URLs.
2. THE Knowledge_Graph_Builder SHALL include the `sameAs` array in the Person schema JSON-LD output.
3. THE Knowledge_Graph_Builder SHALL generate `sameAs` entries only for URLs that pass URL validation (HTTPS protocol, valid domain).
4. WHEN an author has a Wikipedia or Google Scholar link, THE Knowledge_Graph_Builder SHALL prioritize those entries at the beginning of the `sameAs` array.
5. IF an author profile has zero social or professional links populated, THEN THE Knowledge_Graph_Builder SHALL omit the `sameAs` property from the Person schema rather than including an empty array.

### Requirement 6: Structured Data Auto-Generation

**User Story:** As an SEO manager, I want structured data generated automatically from profile data, so that search engines can understand author entities without manual JSON-LD authoring.

#### Acceptance Criteria

1. WHEN an author profile page is rendered, THE Schema_Generator SHALL embed a Person schema JSON-LD block containing name, jobTitle, worksFor, url, description, image, sameAs, knowsAbout, hasOccupation, alumniOf, and award fields populated from profile data.
2. WHEN an author profile page is rendered, THE Schema_Generator SHALL embed a ProfilePage schema JSON-LD block with mainEntity referencing the Person schema by @id.
3. WHEN an author profile page is rendered, THE Schema_Generator SHALL embed a BreadcrumbList schema JSON-LD block reflecting the page hierarchy (Home > Authors > Author Name).
4. THE Schema_Generator SHALL embed a WebPage schema JSON-LD block with author, publisher, dateModified, and inLanguage properties.
5. THE Schema_Generator SHALL embed the Organization relationship as `worksFor` with @type NewsMediaOrganization, name, url, and logo properties.
6. THE Schema_Generator SHALL produce valid JSON-LD that passes the Google Rich Results Test without errors.
7. IF a profile field used in structured data is empty or null, THEN THE Schema_Generator SHALL omit that property from the JSON-LD output rather than including an empty value.

### Requirement 7: E-E-A-T Signal Display

**User Story:** As a reader, I want to see clear signals of the author's expertise and credibility, so that I can trust the content they produce.

#### Acceptance Criteria

1. THE Profile_Page SHALL display an Expertise section listing the author's beats, languages, and knowsAbout topics, showing a maximum of 20 topic items.
2. THE Profile_Page SHALL display an Experience section showing years of experience, education history (institution name, degree, and year for each entry), and experienceDescription as the professional background summary.
3. THE Profile_Page SHALL display a Credentials section listing certifications and awards, showing a maximum of 15 items per category.
4. IF an author has verificationStatus set to "verified", THEN THE Profile_Page SHALL display a verification badge icon immediately before or after the author's displayed name within the same visual line.
5. THE Profile_Page SHALL display an "About the Author" editorial section with the full biography formatted as semantic HTML paragraphs.
6. IF any E-E-A-T section (Expertise, Experience, or Credentials) has no data populated, THEN THE Profile_Page SHALL hide that section entirely rather than displaying an empty container.
7. IF the fullBiography field is empty, THEN THE Profile_Page SHALL display the shortBio field in the "About the Author" section as a fallback.

### Requirement 8: AI Search Optimization

**User Story:** As an SEO manager, I want profile pages optimized for AI search engines, so that AI assistants can accurately cite and reference our journalists.

#### Acceptance Criteria

1. THE Profile_Page SHALL use semantic HTML5 elements (article, section, header, aside, nav) to structure content regions, with the author biography wrapped in an `<article>` element and each logical content block (bio, publication list, social links) wrapped in a `<section>` element.
2. THE Profile_Page SHALL include a JSON-LD script of @type "Person" containing at minimum: name, url, jobTitle, worksFor (with organization name and url), description, and sameAs (array of social profile URLs), and SHALL include Open Graph meta tags with og:type set to "profile" and properties for og:title, og:description, og:url, and og:image.
3. THE Profile_Page SHALL maintain a consistent entity identity such that the author's display name, canonical URL, and profile image URL are identical values across the JSON-LD structured data, the visible page content, and the Open Graph meta tags.
4. THE Profile_Page SHALL include a prose biography of at least 150 characters that contains the author's full name, role, organization name, and at least one expertise area or beat, rendered as visible text within the page body.
5. IF the author data source does not provide a biography or expertise areas, THEN THE Profile_Page SHALL generate a fallback prose description using the author's name, role, and organization that meets the 150-character minimum length.
6. THE Profile_Page SHALL include a self-referencing canonical URL in both the HTML `<link rel="canonical">` tag and the JSON-LD "url" property, using the pattern `/author/{slug}`.

### Requirement 9: Google News Article Attribution

**User Story:** As a news editor, I want every published article to automatically display complete author attribution, so that articles comply with Google News publisher requirements.

#### Acceptance Criteria

1. WHEN a news article is rendered and the article has associated author data, THE Publisher_Profile_System SHALL display the author's name, profile photo (minimum 64x64 pixels rendered), designation, department, and a hyperlink to the author profile page at `/author/[slug]`.
2. IF the article's author data is missing or the author field is empty, THEN THE Publisher_Profile_System SHALL display "Rampur News Desk" as the default author name with the organization logo in place of a profile photo.
3. WHEN a news article is rendered, THE Publisher_Profile_System SHALL display the article's published date in ISO 8601 format and, if a last updated date exists and differs from the published date, display the last updated date in ISO 8601 format.
4. WHEN a news article is rendered, THE Publisher_Profile_System SHALL display the publishing organization name and logo visibly within the attribution block and include a matching `publisher` object with type `Organization`, name, and logo in the article's NewsArticle JSON-LD structured data.
5. WHEN a news article is rendered, THE Publisher_Profile_System SHALL populate the author attribution block from the article's stored metadata without requiring manual entry by the editor.
6. IF the author's profile photo is unavailable, THEN THE Publisher_Profile_System SHALL display a generated initial-based avatar placeholder derived from the author's name.

### Requirement 10: Author Statistics Display

**User Story:** As a reader, I want to see the author's publishing track record on their profile page, so that I can gauge their activity and expertise.

#### Acceptance Criteria

1. THE Statistics_Module SHALL display on the Profile_Page: total articles published, number of categories covered, the latest articles (up to 10, ordered by publication date descending), and a most-read articles section showing up to 5 articles ranked by view count within the last 30 days.
2. THE Statistics_Module SHALL compute and display the average reading time across the author's published articles, expressed in whole minutes (rounded to the nearest minute, minimum 1 minute).
3. THE Statistics_Module SHALL group articles by category with article counts per category, sorted by article count descending.
4. WHEN the author has zero published articles, THE Statistics_Module SHALL display a placeholder message instead of empty statistics.
5. IF the statistics data source is unavailable, THEN THE Statistics_Module SHALL display a fallback message indicating that statistics are temporarily unavailable and SHALL NOT render partial or stale data.

### Requirement 11: CMS Dashboard Metrics

**User Story:** As a CMS administrator, I want an internal dashboard showing author performance metrics, so that I can manage editorial output and track productivity.

#### Acceptance Criteria

1. THE CMS_Dashboard SHALL display per-author metrics: total articles, published count, draft count, pending review count, articles published today (based on server timezone, 00:00-23:59), and articles published in the current calendar month.
2. THE CMS_Dashboard SHALL display the total cumulative page views count per author.
3. THE CMS_Dashboard SHALL provide a paginated list of all authors (default 20 per page) sortable by total articles, last published date, and editorial status.
4. WHEN the CMS_Dashboard author list is loaded without an explicit sort selection, THE CMS_Dashboard SHALL sort authors by last published date in descending order.
5. IF an author has zero articles, THEN THE CMS_Dashboard SHALL display that author in the list with all metric counts shown as zero.
6. WHEN the CMS_Dashboard is accessed, THE CMS_Dashboard SHALL load and display all metrics within 3 seconds for up to 200 authors.

### Requirement 12: AI Biography Assistant

**User Story:** As an editor, I want to generate professional author biographies from structured data, so that I can quickly produce consistent, high-quality profile content.

#### Acceptance Criteria

1. WHEN the AI Biography Assistant is invoked with an author's structured profile data (fullName, designation, department, beat, experienceYears, education, certifications, awards, languages), THE AI_Biography_Assistant SHALL generate a Professional Biography between 200 and 400 words.
2. WHEN the AI Biography Assistant is invoked, THE AI_Biography_Assistant SHALL generate a Short Bio of no more than 160 characters suitable for meta descriptions.
3. WHEN the AI Biography Assistant is invoked, THE AI_Biography_Assistant SHALL generate a Social Description of no more than 200 characters suitable for social sharing.
4. WHEN the AI Biography Assistant is invoked, THE AI_Biography_Assistant SHALL generate an Author Introduction paragraph between 50 and 100 words for article bylines.
5. THE AI_Biography_Assistant SHALL accept optional editorial prompts to adjust tone and emphasis of generated content.
6. IF required input fields (fullName, designation) are missing, THEN THE AI_Biography_Assistant SHALL return an error indicating which fields are needed before generation can proceed.
7. THE AI_Biography_Assistant SHALL complete generation and return results within 10 seconds of invocation.

### Requirement 13: Author SEO Meta Generation

**User Story:** As an SEO manager, I want all SEO metadata auto-generated from author profile data, so that no manual meta entry is required for any author page.

#### Acceptance Criteria

1. THE SEO_Engine SHALL auto-generate for each Profile_Page: SEO title in format "[Name] – [Designation] | रामपुर न्यूज़", meta description derived from the shortBio field (max 160 characters), canonical URL at `/author/[slug]`, OpenGraph tags with og:type set to "profile", Twitter Card with card type "summary_large_image", and robots directives set to "index, follow".
2. THE SEO_Engine SHALL generate keywords from the author's beats, expertise areas, and organization name, producing between 3 and 10 keyword entries.
3. THE SEO_Engine SHALL set the canonical URL to `https://rampurnews.com/author/[slug]`.
4. THE SEO_Engine SHALL include hreflang annotations when an author has content in multiple languages, with appropriate language-region codes (hi-IN, en-IN, ur-IN).
5. IF the author's shortBio is empty, THEN THE SEO_Engine SHALL generate a meta description from the author's name, designation, and organization in the format "[Name] is a [Designation] at रामपुर न्यूज़ covering [Beat]."

### Requirement 14: Internal Linking Between Articles and Authors

**User Story:** As an SEO manager, I want bidirectional links between articles and author profiles, so that link equity flows between content and author entities.

#### Acceptance Criteria

1. WHEN a news article is displayed, THE Publisher_Profile_System SHALL include a byline block containing "Written by [Author Name] | View all articles by [Author Name]" where each instance of [Author Name] is a crawlable HTML anchor element linking to the author's Profile_Page URL.
2. WHEN the Profile_Page is rendered, THE Profile_Page SHALL list the author's published articles as crawlable HTML anchor links organized by Latest (sorted by publish date descending), Popular (sorted by total view count descending), and Category tabs, displaying a maximum of 20 articles per tab with pagination controls when the total exceeds 20.
3. THE Publisher_Profile_System SHALL use identical anchor text in the format "[Author Full Name]" for all internal links pointing to that author's Profile_Page across the site.
4. IF the author data is unavailable for a news article, THEN THE Publisher_Profile_System SHALL omit the byline block and SHALL NOT render a broken or empty link.

### Requirement 15: Follow Author Functionality

**User Story:** As a reader, I want to follow my favorite authors, so that I receive notifications when they publish new content.

#### Acceptance Criteria

1. WHILE a reader is authenticated, THE Follow_System SHALL display a "Follow" button on each Profile_Page where the reader is not already following the author, and an "Unfollow" button where the reader is already following the author.
2. IF a reader is not authenticated and attempts to follow an author, THEN THE Follow_System SHALL prompt the reader to log in before proceeding.
3. WHEN a reader clicks Follow, THE Follow_System SHALL present subscription options including email notifications and push notifications, requiring at least one option to be selected before confirming.
4. WHEN a reader confirms subscription options, THE Follow_System SHALL store the selected preferences associated with the specific author and display a confirmation indicating the follow was successful within 2 seconds.
5. WHEN a followed author publishes a new article, THE Follow_System SHALL deliver notifications to all subscribed followers via their selected channels within 5 minutes of publication.
6. WHEN a reader clicks Unfollow, THE Follow_System SHALL remove the subscription association with that author, cease future notifications for that author, and update the button state to "Follow" within 2 seconds.
7. IF a reader attempts to follow an author they already follow, THEN THE Follow_System SHALL retain the existing subscription and display the current follow status without creating a duplicate entry.

### Requirement 16: Editorial Workflow Status

**User Story:** As an editor-in-chief, I want to manage editorial status for all publishers, so that I can track team composition and display appropriate badges.

#### Acceptance Criteria

1. THE Publisher_Profile_System SHALL support the following editorial statuses: Active, On Leave, Guest Author, Freelancer, Staff Writer, Editor, Senior Editor, Chief Editor, and Inactive.
2. IF an author's editorial status is Inactive, THEN THE Profile_Page SHALL display a notice indicating the author is no longer active and THE Publisher_Profile_System SHALL exclude the author from active author listings and search results.
3. THE CMS_Dashboard SHALL allow users with editorial management permissions to change an author's editorial status and SHALL display a confirmation message upon successful status change.
4. THE Profile_Page SHALL display the editorial role (e.g., "Senior Editor", "Staff Writer") as part of the author's designation area, visible immediately below or beside the author's name.
5. WHEN an author's editorial status is changed, THE Publisher_Profile_System SHALL record a timestamp of the change and the user who made it.

### Requirement 17: SEO-Friendly URL Structure

**User Story:** As an SEO manager, I want author pages to use clean, SEO-friendly URLs, so that search engines can easily crawl and rank them.

#### Acceptance Criteria

1. THE Publisher_Profile_System SHALL serve author profiles at `/author/[slug]` where slug is a lowercase, hyphen-separated string of at most 80 characters, containing only characters [a-z], [0-9], and hyphens, derived from the author's English name by replacing spaces with hyphens and removing all other characters.
2. THE Publisher_Profile_System SHALL redirect legacy `/authors/[slug]` URLs to the new `/author/[slug]` path with a 301 permanent redirect.
3. IF a generated slug matches an existing slug, THEN THE Publisher_Profile_System SHALL append a hyphen followed by an incrementing integer starting at 2 (e.g., `author-name-2`, `author-name-3`) to produce a unique slug.
4. WHILE an author profile is in a published state, THE Publisher_Profile_System SHALL reject any slug modification unless the requesting user holds an administrator role, in which case a new slug SHALL be accepted and a 301 redirect from the previous slug to the new slug SHALL be created.
5. IF a request is made to a `/author/[slug]` path that does not match any existing or redirected author profile, THEN THE Publisher_Profile_System SHALL respond with a 404 status page within 1 second.

### Requirement 18: Google Discover Optimization

**User Story:** As a content strategist, I want author pages to be optimized for Google Discover, so that author-linked content has higher eligibility for Discover surfacing.

#### Acceptance Criteria

1. THE Profile_Page SHALL include a hero image with a minimum rendered width of 1200px and a minimum aspect ratio of 16:9 in the page header area, sourced from the author's cover image or a site-default fallback image when no cover image is available.
2. THE Profile_Page SHALL include a biography section of at least 50 words in natural prose format containing at minimum the author's full name, role/designation, affiliated organization, and area of expertise as distinct textual mentions.
3. THE Profile_Page SHALL include a "Latest Stories" section displaying up to the 5 most recent published articles ordered by publication date descending, where each article entry includes a thumbnail image with a minimum width of 1200px.
4. THE Profile_Page SHALL include max-image-preview:large and max-snippet:-1 robots meta directives in the page's metadata.
5. IF an author has fewer than 5 published articles, THEN THE Profile_Page SHALL display all available articles in the "Latest Stories" section without placeholder entries.
6. IF the author's cover image is unavailable or has a width below 1200px, THEN THE Profile_Page SHALL render the site-default Open Graph image (minimum 1200px width) as the hero image.

### Requirement 19: Accessibility Compliance

**User Story:** As a user with disabilities, I want the author profile pages to be fully accessible, so that I can navigate and consume the content using assistive technologies.

#### Acceptance Criteria

1. THE Profile_Page SHALL provide alt text for all images (profile photo, cover image, social icons) where alt text is non-empty, contains at least 5 characters, and describes the image content or purpose.
2. THE Profile_Page SHALL include non-empty ARIA labels on all interactive elements (Follow button, navigation links, social link icons, tabs) where each label describes the element's action or destination.
3. THE Profile_Page SHALL support keyboard navigation through all interactive elements in a logical reading order (top-to-bottom, left-to-right) with visible focus indicators that have a minimum contrast ratio of 3:1 against adjacent colors and a minimum outline or border thickness of 2px.
4. THE Profile_Page SHALL render responsively across viewport widths from 320px to 2560px without horizontal scrollbar appearing on the page body.
5. THE Profile_Page SHALL maintain a minimum contrast ratio of 4.5:1 for body text (below 18.66px bold or below 24px regular) and 3:1 for large text (at or above 18.66px bold or at or above 24px regular) as measured against the immediate background color.
6. THE Profile_Page SHALL use a single h1 heading for the author name and organize remaining content with sequential heading levels (h2, h3) without skipping levels.
7. IF an image on the Profile_Page fails to load, THEN THE Profile_Page SHALL display the alt text in place of the image and SHALL NOT display a broken image icon.
8. THE Profile_Page SHALL define landmark regions (banner, navigation, main, contentinfo) so that assistive technologies can identify and skip to major page sections.

### Requirement 20: Performance Optimization

**User Story:** As a reader on a slow connection, I want author pages to load quickly, so that I can access the content without excessive wait times.

#### Acceptance Criteria

1. THE Profile_Page SHALL lazy-load images that appear below the initial viewport (article thumbnails and social icons within the articles section) by applying the `loading="lazy"` attribute or equivalent framework mechanism.
2. THE Profile_Page SHALL use Next.js Image component with responsive srcset and WebP/AVIF format negotiation for all author images including the author avatar and article thumbnail images.
3. THE Profile_Page SHALL be rendered with Server-Side Rendering and support Incremental Static Regeneration with a revalidation period of no more than 60 seconds.
4. THE Profile_Page SHALL serve static assets (images, fonts, CSS, JS bundles) with a Cache-Control header specifying a minimum TTL of 30 days (2,592,000 seconds).
5. THE Profile_Page SHALL achieve Core Web Vitals scores of LCP under 2.5 seconds, CLS under 0.1, and INP under 200 milliseconds when measured on a simulated mobile device with a 4G connection (1.6 Mbps throughput, 150 ms RTT) using Lighthouse or equivalent lab tooling.
6. IF the CMS data source is unreachable during Server-Side Rendering, THEN THE Profile_Page SHALL return a cached version from the previous successful ISR cycle rather than displaying an error page to the reader.

### Requirement 21: Security

**User Story:** As a platform operator, I want author profile data to be securely handled, so that the system is protected from injection attacks and data corruption.

#### Acceptance Criteria

1. THE Publisher_Profile_System SHALL validate all URL fields (social links, website) as HTTPS URLs conforming to RFC 3986 with a maximum length of 2048 characters before storage.
2. THE Publisher_Profile_System SHALL sanitize all biography and free-text fields (maximum 5000 characters) to prevent XSS by stripping all HTML tags and attributes except the allowed set (p, br, strong, em, a with href attribute, ul, ol, li) while preserving the allowed formatting.
3. THE Publisher_Profile_System SHALL validate uploaded images by confirming that the MIME type, file extension, and magic bytes all match one of the accepted formats (JPEG, PNG, WebP) and that the file size does not exceed 5 MB before processing.
4. THE Publisher_Profile_System SHALL rate-limit profile update API calls to a maximum of 10 updates per author per minute.
5. IF a biography field contains HTML tags or attributes not in the allowed set (p, br, strong, em, a with href attribute, ul, ol, li), THEN THE Publisher_Profile_System SHALL strip the disallowed tags and attributes and save only the sanitized version.
6. IF a URL field value fails HTTPS URL validation, THEN THE Publisher_Profile_System SHALL reject the profile update request and return an error message indicating which URL field is invalid.
7. IF an uploaded image fails MIME type, extension, magic byte, or file size validation, THEN THE Publisher_Profile_System SHALL reject the upload and return an error message indicating the validation failure reason.
8. IF an author exceeds 10 profile update API calls within a 1-minute window, THEN THE Publisher_Profile_System SHALL reject subsequent requests until the window resets and return an error message indicating the rate limit has been exceeded.
