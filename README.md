# Rampur News – Next.js application

Rampur News is a Hindi-first digital news portal for Rampur and Uttar Pradesh, built with Next.js, Tailwind CSS, and a pluggable CMS layer. It includes a public news site and an admin panel for managing articles, categories, authors, and site settings.

---

## Project info

- Live site: `https://rampurnews.com` (target URL)
- Framework: Next.js App Router
- Language: TypeScript, React 19

---

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- Embla Carousel
- React Query

---

## Getting started

### Prerequisites

- Node.js 18+ and npm
- Git (to clone the repository)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Enter the project directory
cd rampur-samachar-lovable-vite

# Install dependencies
npm install
```

### Running the development server

```sh
npm run dev
```

The app will start on `http://localhost:3000`.

### Linting

```sh
npm run lint
```

The current codebase includes some demo and legacy code that may still trigger lint errors. These do not prevent running the app, but you can progressively fix them as you evolve the project.

### Building for production

```sh
npm run build
npm start
```

This runs a production build and starts the Next.js server.

---

## Application structure (high level)

- `src/app` – Next.js App Router entrypoints (pages, layouts, admin routes)
- `src/components` – Reusable UI and feature components (header, footer, sliders, cards, etc.)
- `src/views` – Page-level React components for different sections (home, education, lifestyle, admin views)
- `src/services/cms` – CMS abstraction layer and providers (mock, WordPress, Strapi/Django/custom REST)
- `src/data` – Local mock news data used when CMS is not connected
- `src/contexts` – React contexts (admin auth, theme, etc.)
- `public` – Static assets (`favicon.ico`, `atom.xml`, images)

---

## Admin panel

### Accessing the admin

- Admin UI base route: `/admin`
- The admin area is protected by a simple demo auth layer backed by `localStorage`.

Demo credentials (for local/dev use only):

- **Admin**
  - Email: `admin@rampurnews.com`
  - Password: `admin123`
- **Editor**
  - Email: `editor@rampurnews.com`
  - Password: `editor123`

These are defined in [`AdminAuthContext.tsx`](./src/contexts/AdminAuthContext.tsx) and should be replaced by a real authentication system before production use.

### Admin features

From the admin sidebar you can:

- Create, edit, and delete **articles**
- Manage **categories** and **authors**
- Upload and manage **media**
- Configure **site settings**:
  - Site name (Hindi and English)
  - Tagline
  - Logo URL
  - Favicon URL
  - Social media links
  - Contact information
- Configure the **CMS provider** (mock, WordPress, Strapi)

---

## CMS and data layer

The app uses a CMS abstraction so you can switch between different backends without changing the UI code.

### CMS provider interface

The core interface is defined in [`src/services/cms/provider.ts`](./src/services/cms/provider.ts). It includes methods for:

- Articles: list, get by ID, get by slug, create, update, delete
- Categories: list, get by ID/slug, create, update, delete
- Authors: list, get by ID, create, update, delete
- Media: list, upload, delete
- Settings: get and update
- Special queries: featured, breaking, trending, by category, search

Supported provider types:

- `mock` (default)
- `wordpress`
- `strapi`
- `django`
- `sanity`
- `custom`

The main entry point is [`src/services/cms/index.ts`](./src/services/cms/index.ts), which exports:

- `cms.provider` – the active provider
- `cms.configure(config)` – configure the provider
- `cms.getConfig()` – get current config

### Mock data

When the provider is set to `mock`, the app uses local mock data:

- `src/data/mockNews.ts`

This is useful for local development without a backend.

---

## Configuring CMS providers

All CMS-related configuration for the UI is handled in the Admin Settings page:

- Path: `/admin/settings`
- Implementation: [`src/views/admin/SettingsPage.tsx`](./src/views/admin/SettingsPage.tsx)

### 1. Mock provider

- Select provider: **Mock**
- The site will use bundled mock data; no external API is required.

### 2. WordPress provider

When you choose **WordPress**:

- Enter your WordPress site URL (e.g. `https://example.com`)
- Choose an auth method:
  - **None** – for public endpoints only
  - **JWT** – provide an API token
  - **Application password** – provide WordPress username and application password
- Use the “Test connection” button to verify `wp-json/wp/v2/posts` can be reached.
- Save the configuration so it is stored in `localStorage` and applied to the CMS layer.

### 3. Strapi provider

When you choose **Strapi**:

- Enter **API base URL** for your Strapi backend, for example:
  - `https://cms.rampurnews.com/api`
  - or `http://localhost:1337/api` for local Strapi
- Optionally enter an **API key** (Bearer token) if your Strapi endpoints require authentication.

The app expects a REST API roughly matching these paths:

- `GET /articles` – list articles (supports query params: `limit`, `offset`, `category`, `status`, `featured`, `breaking`, `search`, `author`, `orderBy`, `order`)
- `GET /articles/:id` – article by ID
- `GET /articles/slug/:slug` – article by slug
- `POST /articles` – create article
- `PATCH /articles/:id` – update article
- `DELETE /articles/:id` – delete article
- `GET /categories`, `/categories/:id`, `/categories/slug/:slug`
- `GET /authors`, `/authors/:id`
- `GET /media`, `POST /media`, `DELETE /media/:id`
- `GET /settings`, `PATCH /settings`

Use the **Test Strapi connection** button on the settings page:

- It calls `GET /articles?limit=1` with the optional `Authorization: Bearer <API_KEY>` header.
- On success, you will see a success message and the CMS provider is configured to use Strapi.

Strapi and other REST backends are integrated via a shared REST provider defined in [`src/services/cms/index.ts`](./src/services/cms/index.ts), using the `CMSConfig` shape:

```ts
{
  provider: 'strapi',
  baseUrl: 'https://your-strapi-domain/api',
  apiKey: '<optional_api_token>'
}
```

You can also support `django` or `custom` providers if they expose compatible REST endpoints.

---

## SEO, feeds, and sitemaps

### SEO component

SEO tags (title, description, Open Graph, structured data) are handled by the `SEO` component:

- [`src/components/SEO.tsx`](./src/components/SEO.tsx)

It is used throughout the views, including the homepage, to generate localized meta tags for Hindi content.

### RSS and Atom feeds

Feed generation utilities live in:

- [`src/utils/generateFeeds.ts`](./src/utils/generateFeeds.ts)

They currently use mock data and are designed to be wired into API routes for:

- `feed.xml` – RSS 2.0
- `atom.xml` – Atom 1.0

There is also a pre-generated `public/atom.xml` which can be served directly.

### Google News sitemap

`generateNewsSitemap` in `generateFeeds.ts` can be connected to a route such as `/news-sitemap.xml` to serve a Google News–compatible sitemap based on recent articles.

---

## Favicon and branding

- Global metadata and favicon are configured in [`src/app/layout.tsx`](./src/app/layout.tsx).
- The favicon file is located at `public/favicon.ico` (generated from the Rampur News app icon).
- The main app logo file is located at `public/logo.png` (used in SEO and feeds).
- Atom and RSS feeds reference the same favicon and logo URLs.

To change branding:

- Replace `public/favicon.ico` with a favicon generated from your Rampur News logo.
- Replace `public/logo.png` with your latest logo artwork.
- Update logo-related URLs in site settings (`/admin/settings`) or CMS if they are stored there.

---

## Deployment

You can deploy Rampur News to any platform that supports Next.js. A common choice is **Vercel**, but any Node.js host works.

### Example deployment flow

1. Build the app:
   ```sh
   npm run build
   ```
2. Start the production server:
   ```sh
   npm start
   ```

On Vercel:

- Import the Git repository.
- Vercel detects Next.js automatically.
- Default build command: `npm run build`
- Default output: `.next`

Make sure you configure any runtime environment variables you add in the future (for API URLs, keys, etc.) in your hosting provider dashboard.

---

## Notes

- The admin authentication and local mock data are intended for demonstration and development purposes.
- Before going to production, you should:
  - Connect a real CMS backend (WordPress, Strapi, or another REST API)
  - Replace demo admin credentials with a secure auth system
  - Review and tighten ESLint/TypeScript rules as needed
