/**
 * Tests for the content resolution layer.
 * Validates: deduplication, category filtering, fallback routing, error handling.
 */
import { describe, it, expect } from 'vitest';
import { deduplicateAcrossSections } from './contentResolver';
import { getHomepageSections, HOMEPAGE_SECTIONS } from './homepageConfig';
import type { SectionData } from './contentResolver';
import type { CMSArticle } from '@/services/cms/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeArticle(overrides: Partial<CMSArticle> = {}): CMSArticle {
  const id = overrides.id || `article-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    title: `Article ${id}`,
    slug: overrides.slug || `slug-${id}`,
    excerpt: 'Test excerpt',
    content: 'Test content',
    image: '/test.jpg',
    category: overrides.category || 'test',
    categoryHindi: 'टेस्ट',
    author: 'Test Author',
    publishedAt: '2025-01-01T00:00:00Z',
    status: 'published',
    ...overrides,
  };
}

function makeSectionData(sectionId: string, articles: CMSArticle[]): SectionData {
  return {
    sectionId,
    articles,
    source: 'aggregated',
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Homepage Configuration', () => {
  it('returns only enabled sections', () => {
    const sections = getHomepageSections();
    expect(sections.every((s) => s.enabled)).toBe(true);
  });

  it('returns sections sorted by order', () => {
    const sections = getHomepageSections();
    for (let i = 1; i < sections.length; i++) {
      expect(sections[i].order).toBeGreaterThanOrEqual(sections[i - 1].order);
    }
  });

  it('includes hero section at order 0', () => {
    const hero = HOMEPAGE_SECTIONS.find((s) => s.id === 'hero');
    expect(hero).toBeDefined();
    expect(hero!.order).toBe(0);
    expect(hero!.category).toBeNull();
  });

  it('every category section has a category slug', () => {
    const categorySections = HOMEPAGE_SECTIONS.filter(
      (s) => s.id !== 'hero' && s.contentType === 'articles',
    );
    expect(categorySections.length).toBeGreaterThan(0);
    for (const section of categorySections) {
      expect(section.category).toBeTruthy();
    }
  });

  it('no two sections have the same ID', () => {
    const ids = HOMEPAGE_SECTIONS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every section has a viewAllLink', () => {
    for (const section of HOMEPAGE_SECTIONS) {
      expect(section.viewAllLink).toBeTruthy();
      expect(section.viewAllLink.startsWith('/')).toBe(true);
    }
  });
});

describe('Cross-Section Deduplication', () => {
  it('removes duplicate slugs across sections', () => {
    const sharedArticle = makeArticle({ slug: 'shared-slug', category: 'rampur' });
    
    const sectionMap = new Map<string, SectionData>();
    sectionMap.set('rampur', makeSectionData('rampur', [
      sharedArticle,
      makeArticle({ slug: 'rampur-only', category: 'rampur' }),
    ]));
    sectionMap.set('up', makeSectionData('up', [
      { ...sharedArticle, id: 'up-version', category: 'up' },
      makeArticle({ slug: 'up-only', category: 'up' }),
    ]));

    const deduped = deduplicateAcrossSections(sectionMap, ['rampur', 'up']);

    // Rampur section keeps the shared article (appears first)
    expect(deduped.get('rampur')!.articles).toHaveLength(2);
    expect(deduped.get('rampur')!.articles.some((a) => a.slug === 'shared-slug')).toBe(true);

    // UP section loses the shared article
    expect(deduped.get('up')!.articles).toHaveLength(1);
    expect(deduped.get('up')!.articles.some((a) => a.slug === 'shared-slug')).toBe(false);
    expect(deduped.get('up')!.articles[0].slug).toBe('up-only');
  });

  it('preserves all articles when no duplicates exist', () => {
    const sectionMap = new Map<string, SectionData>();
    sectionMap.set('rampur', makeSectionData('rampur', [
      makeArticle({ slug: 'a1' }),
      makeArticle({ slug: 'a2' }),
    ]));
    sectionMap.set('sports', makeSectionData('sports', [
      makeArticle({ slug: 'b1' }),
      makeArticle({ slug: 'b2' }),
    ]));

    const deduped = deduplicateAcrossSections(sectionMap, ['rampur', 'sports']);

    expect(deduped.get('rampur')!.articles).toHaveLength(2);
    expect(deduped.get('sports')!.articles).toHaveLength(2);
  });

  it('handles empty sections gracefully', () => {
    const sectionMap = new Map<string, SectionData>();
    sectionMap.set('rampur', makeSectionData('rampur', []));
    sectionMap.set('sports', makeSectionData('sports', [
      makeArticle({ slug: 'sport-1' }),
    ]));

    const deduped = deduplicateAcrossSections(sectionMap, ['rampur', 'sports']);

    expect(deduped.get('rampur')!.articles).toHaveLength(0);
    expect(deduped.get('sports')!.articles).toHaveLength(1);
  });

  it('respects section order for dedup priority', () => {
    const sharedSlug = 'breaking-news';
    
    const sectionMap = new Map<string, SectionData>();
    sectionMap.set('national', makeSectionData('national', [
      makeArticle({ slug: sharedSlug, category: 'national' }),
    ]));
    sectionMap.set('international', makeSectionData('international', [
      makeArticle({ slug: sharedSlug, category: 'international' }),
    ]));

    // National comes first, so it keeps the article
    const deduped = deduplicateAcrossSections(sectionMap, ['national', 'international']);
    expect(deduped.get('national')!.articles).toHaveLength(1);
    expect(deduped.get('international')!.articles).toHaveLength(0);
  });

  it('allows articles without slugs to pass through', () => {
    const sectionMap = new Map<string, SectionData>();
    sectionMap.set('rampur', makeSectionData('rampur', [
      makeArticle({ slug: '' }),
    ]));
    sectionMap.set('up', makeSectionData('up', [
      makeArticle({ slug: '' }),
    ]));

    const deduped = deduplicateAcrossSections(sectionMap, ['rampur', 'up']);

    // Both pass through because slug is empty (can't deduplicate without slug)
    expect(deduped.get('rampur')!.articles).toHaveLength(1);
    expect(deduped.get('up')!.articles).toHaveLength(1);
  });
});

describe('CMS Independence', () => {
  it('homepage config defines fallback sources', () => {
    const categorySections = HOMEPAGE_SECTIONS.filter(
      (s) => s.id !== 'hero' && s.contentType === 'articles',
    );
    
    // Every category section should have a fallback source
    for (const section of categorySections) {
      expect(section.fallbackSource).toBeDefined();
      expect(section.fallbackSource).not.toBe(section.preferredSource);
    }
  });

  it('hero section uses aggregated source (both CMSs)', () => {
    const hero = HOMEPAGE_SECTIONS.find((s) => s.id === 'hero');
    expect(hero!.preferredSource).toBe('aggregated');
  });

  it('hero section has a strategy defined', () => {
    const hero = HOMEPAGE_SECTIONS.find((s) => s.id === 'hero');
    expect(hero!.heroStrategy).toBeDefined();
    expect(['latest', 'featured-first', 'editor-pinned', 'breaking-first']).toContain(hero!.heroStrategy);
  });

  it('all sections have a duplicate policy', () => {
    for (const section of HOMEPAGE_SECTIONS) {
      expect(section.duplicatePolicy).toBeDefined();
    }
  });

  it('sections use diverse templates (not all the same)', () => {
    const templates = new Set(HOMEPAGE_SECTIONS.map((s) => s.template));
    expect(templates.size).toBeGreaterThan(2);
  });
});
