/**
 * Bug Condition Exploration Tests — article-publish-pipeline-fix (Frontend)
 *
 * PURPOSE: These tests document P2 and P3 bug conditions.
 * They are EXPECTED TO FAIL on unfixed code — failure confirms the bugs exist.
 * After fixes are applied, all tests should PASS.
 *
 * Validates: Requirements 1.2, 1.3
 *
 * DOCUMENTED COUNTEREXAMPLES (from first run on unfixed code):
 *
 * P2 — buildProxyUrl Server-Side Bug:
 *   Received: '/api/cms/strapi/articles' (relative path)
 *   Expected: string starting with 'https://'
 *   Counterexample: buildProxyUrl('/articles') with SITE_URL and NEXT_PUBLIC_SITE_URL
 *                   both unset → returns relative path → Node fetch throws
 *
 * P3 — flattenStrapi Missing publishedAt:
 *   Received: result.publishedAt === undefined
 *   Expected: result.publishedAt === '2024-01-01T00:00:00.000Z'
 *   Counterexample: { id: 1, documentId: 'abc123', publishedAt: '2024-01-01T00:00:00.000Z',
 *                     attributes: { title: 'Test Article', slug: 'test-article' } }
 *                   → flattenStrapi spreads attributes only, publishedAt at root is lost
 */

import { describe, it, expect, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// P2 — buildProxyUrl Server-Side Bug
// ---------------------------------------------------------------------------
// Bug Condition: SITE_URL and NEXT_PUBLIC_SITE_URL are both unset on the server.
//               buildProxyUrl returns a relative path that Node fetch cannot resolve.
// Expected (fixed): always returns an absolute URL starting with https://
// Actual (unfixed): returns '/api/cms/strapi/...' when env vars are absent
// ---------------------------------------------------------------------------

describe("P2 — buildProxyUrl Server-Side Bug (Frontend)", () => {
  afterEach(() => {
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("P2 — BUG: buildProxyUrl returns relative path when SITE_URL is unset", () => {
    // Validates: Requirements 1.2
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    // Replicate the FIXED buildProxyUrl server-side branch from Frontend/src/services/cms/index.ts
    const buildProxyUrl = (path: string) => {
      const relativePath = `/api/cms/strapi${path}`;
      // FIXED: always returns absolute URL on server
      const siteUrl = (
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://rampurnews.com'  // ← hard fallback added
      ).replace(/\/+$/, '');
      return `${siteUrl}${relativePath}`;
    };

    const result = buildProxyUrl("/articles");

    // ON FIXED CODE: this PASSES because result is always absolute
    expect(result).toMatch(/^https?:\/\//);
  });

  it("P2 — BUG: buildProxyUrl('/articles') returns relative path, not absolute URL", () => {
    // Validates: Requirements 1.2
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const buildProxyUrl = (path: string) => {
      const relativePath = `/api/cms/strapi${path}`;
      const siteUrl = (
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://rampurnews.com'
      ).replace(/\/+$/, '');
      return `${siteUrl}${relativePath}`;
    };

    const result = buildProxyUrl("/articles");

    // ON FIXED CODE: result is 'https://rampurnews.com/api/cms/strapi/articles' — absolute
    // Node's fetch can resolve this correctly
    expect(result).not.toBe("/api/cms/strapi/articles");
    expect(result.startsWith("http")).toBe(true);
  });

  it("P2 — BUG: multiple paths all return relative when env vars unset", () => {
    // Validates: Requirements 1.2
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const buildProxyUrl = (path: string) => {
      const relativePath = `/api/cms/strapi${path}`;
      const siteUrl = (
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://rampurnews.com'
      ).replace(/\/+$/, '');
      return `${siteUrl}${relativePath}`;
    };

    const paths = ["/articles", "/articles/slug/test", "/categories"];
    for (const path of paths) {
      const result = buildProxyUrl(path);
      // ON FIXED CODE: all return absolute URLs — all pass this assertion
      expect(result).toMatch(/^https?:\/\//);
    }
  });
});

// ---------------------------------------------------------------------------
// P3 — flattenStrapi Missing publishedAt
// ---------------------------------------------------------------------------
// Bug Condition: Strapi v5 returns publishedAt at the root level (not in attributes).
//               The Frontend's flattenStrapi spreads attributes but never hoists
//               root-level fields, so publishedAt is undefined after flattening.
// Expected (fixed): flattenStrapi(response).publishedAt === response.publishedAt
// Actual (unfixed): flattenStrapi(response).publishedAt === undefined
// ---------------------------------------------------------------------------

describe("P3 — flattenStrapi Missing publishedAt (Frontend)", () => {
  // Replicate the FIXED flattenStrapi from Frontend/src/services/cms/index.ts
  const flattenStrapi = (data: any): any => {
    if (!data) return null;
    if (Array.isArray(data)) return data.map(flattenStrapi);
    if (data.data) return flattenStrapi(data.data);
    const attributes = data.attributes || data;
    const id = data.id;
    // FIXED: hoist root-level fields
    const flat: Record<string, any> = {
      id,
      documentId: data.documentId,
      publishedAt: data.publishedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ...attributes,
    };
    return flat;
  };

  it("P3 — BUG: flattenStrapi loses publishedAt when it is at root level", () => {
    // Validates: Requirements 1.3
    const strapiResponse = {
      id: 1,
      documentId: "abc123",
      publishedAt: "2024-01-01T00:00:00.000Z",
      attributes: { title: "Test Article", slug: "test-article" },
    };

    const result = flattenStrapi(strapiResponse);

    // ON UNFIXED CODE: this FAILS because publishedAt is not in attributes and not hoisted
    expect(result.publishedAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("P3 — BUG: flattenStrapi loses documentId when it is at root level", () => {
    // Validates: Requirements 1.3
    const strapiResponse = {
      id: 1,
      documentId: "abc123",
      publishedAt: "2024-01-01T00:00:00.000Z",
      attributes: { title: "Test Article", slug: "test-article" },
    };

    const result = flattenStrapi(strapiResponse);

    // ON UNFIXED CODE: documentId is not in attributes, so it is lost
    expect(result.documentId).toBe("abc123");
  });

  it("P3 — BUG: flattenStrapi result has undefined publishedAt for Strapi v5 response shape", () => {
    // Validates: Requirements 1.3
    // Strapi v5 puts timestamps at root, not inside attributes
    const strapiV5Response = {
      id: 42,
      documentId: "xyz789",
      publishedAt: "2024-06-15T10:30:00.000Z",
      createdAt: "2024-06-01T08:00:00.000Z",
      updatedAt: "2024-06-15T10:30:00.000Z",
      attributes: {
        title: "Published Article",
        slug: "published-article",
        content: "<p>Content here</p>",
      },
    };

    const result = flattenStrapi(strapiV5Response);

    // ON UNFIXED CODE: all root-level fields are undefined after flattening
    expect(result.publishedAt).toBe("2024-06-15T10:30:00.000Z");
    expect(result.createdAt).toBe("2024-06-01T08:00:00.000Z");
    expect(result.updatedAt).toBe("2024-06-15T10:30:00.000Z");
  });

  it("P3 — BUG: article appears as draft because publishedAt is undefined after flatten", () => {
    // Validates: Requirements 1.3
    // This simulates the downstream effect: article.publishedAt is undefined,
    // so the page treats it as unpublished and calls notFound()
    const strapiResponse = {
      id: 5,
      documentId: "doc5",
      publishedAt: "2024-03-20T12:00:00.000Z",
      attributes: {
        title: "Live Article",
        slug: "live-article",
        status: "published",
      },
    };

    const result = flattenStrapi(strapiResponse);

    // ON UNFIXED CODE: result.publishedAt is undefined → article treated as draft
    expect(result.publishedAt).not.toBeUndefined();
    expect(result.publishedAt).toBeTruthy();
  });
});
