/**
 * Tests for the homepage deduplication and pipeline.
 *
 * Key editorial rules tested:
 * 1. Hero articles STAY in their own category section (keep-in-own-category policy)
 * 2. Hero articles are REMOVED from unrelated sections
 * 3. Cross-section: first section (by order) wins
 * 4. Policies are configurable: remove-everywhere, allow-everywhere, etc.
 */
import { describe, it, expect } from 'vitest';
import {
  deduplicateHeroFromSections,
  deduplicateAcrossSections,
  runFullDeduplication,
} from './deduplication';
import {
  runDeduplication,
  scoreArticle,
  createPipelineContext,
  recordStage,
  finalizeTelemetry,
  DEFAULT_PIPELINE_CONFIG,
} from './pipeline';
import type { DedupConfig } from './pipeline';
import type { CMSArticle } from '@/services/cms/types';
import type { HomepageSectionConfig } from './homepageConfig';

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
    category: overrides.category || 'rampur',
    categoryHindi: 'रामपुर',
    author: 'Test Author',
    publishedAt: '2026-07-20T10:00:00Z',
    status: 'published',
    ...overrides,
  };
}

function makeConfig(id: string, category: string | null): HomepageSectionConfig {
  return {
    id,
    title: id,
    category,
    contentType: 'articles',
    preferredSource: 'aggregated',
    articleCount: 7,
    template: 'featured',
    viewAllLink: `/${category || id}`,
    enabled: true,
    order: 0,
    duplicatePolicy: 'remove',
  };
}

// ─── Legacy dedup functions (backwards compat) ────────────────────────────────

describe('deduplicateHeroFromSections (legacy)', () => {
  it('keeps hero article in its own category section', () => {
    const heroArticle = makeArticle({ slug: 'rampur-latest', category: 'rampur' });
    const rampurArticles = [
      heroArticle,
      makeArticle({ slug: 'rampur-2', category: 'rampur' }),
    ];

    const sectionMap = new Map([['rampur', rampurArticles]]);
    const configs = [makeConfig('rampur', 'rampur')];

    const { result } = deduplicateHeroFromSections([heroArticle], sectionMap, configs);
    expect(result.get('rampur')).toHaveLength(2);
  });

  it('removes hero article from unrelated section', () => {
    const heroArticle = makeArticle({ slug: 'rampur-latest', category: 'rampur' });
    const nationalArticles = [heroArticle, makeArticle({ slug: 'n1', category: 'national' })];

    const sectionMap = new Map([['national', nationalArticles]]);
    const configs = [makeConfig('national', 'national')];

    const { result } = deduplicateHeroFromSections([heroArticle], sectionMap, configs);
    expect(result.get('national')).toHaveLength(1);
    expect(result.get('national')![0].slug).toBe('n1');
  });
});

describe('deduplicateAcrossSections (legacy)', () => {
  it('first section wins on duplicate slug', () => {
    const shared = makeArticle({ slug: 'shared' });
    const sectionMap = new Map([
      ['rampur', [shared, makeArticle({ slug: 'r2' })]],
      ['up', [{ ...shared, id: 'dup' }, makeArticle({ slug: 'u2' })]],
    ]);

    const { result } = deduplicateAcrossSections(sectionMap, ['rampur', 'up']);
    expect(result.get('rampur')).toHaveLength(2);
    expect(result.get('up')).toHaveLength(1);
  });
});

// ─── Policy-driven dedup (pipeline) ──────────────────────────────────────────

describe('runDeduplication (pipeline, configurable)', () => {
  const defaultDedup: DedupConfig = DEFAULT_PIPELINE_CONFIG.dedup;

  it('keep-in-own-category: keeps hero article in its own section', () => {
    const hero = makeArticle({ slug: 'rampur-hero', category: 'rampur' });
    const sectionMap = new Map([
      ['rampur', [hero, makeArticle({ slug: 'r2', category: 'rampur' })]],
      ['national', [hero, makeArticle({ slug: 'n1', category: 'national' })]],
    ]);

    const output = runDeduplication({
      heroArticles: [hero],
      sectionMap,
      sectionConfigs: [makeConfig('rampur', 'rampur'), makeConfig('national', 'national')],
      sectionOrder: ['rampur', 'national'],
      config: defaultDedup,
      displayedHeroCount: 1,
    });

    // Rampur KEEPS it (own category)
    expect(output.sections.get('rampur')!.some((a) => a.slug === 'rampur-hero')).toBe(true);
    // National REMOVES it (unrelated)
    expect(output.sections.get('national')!.some((a) => a.slug === 'rampur-hero')).toBe(false);
    expect(output.stats.keptInOwnCategory).toBe(1);
    expect(output.stats.heroPassRemoved).toBe(1);
  });

  it('remove-everywhere: removes hero article from ALL sections', () => {
    const hero = makeArticle({ slug: 'rampur-hero', category: 'rampur' });
    const sectionMap = new Map([
      ['rampur', [hero, makeArticle({ slug: 'r2', category: 'rampur' })]],
    ]);

    const output = runDeduplication({
      heroArticles: [hero],
      sectionMap,
      sectionConfigs: [makeConfig('rampur', 'rampur')],
      sectionOrder: ['rampur'],
      config: { ...defaultDedup, heroPolicy: 'remove-everywhere' },
      displayedHeroCount: 1,
    });

    // Rampur LOSES it (remove-everywhere ignores category ownership)
    expect(output.sections.get('rampur')!.some((a) => a.slug === 'rampur-hero')).toBe(false);
    expect(output.stats.heroPassRemoved).toBe(1);
    expect(output.stats.keptInOwnCategory).toBe(0);
  });

  it('allow-everywhere: never removes hero articles', () => {
    const hero = makeArticle({ slug: 'rampur-hero', category: 'rampur' });
    const sectionMap = new Map([
      ['rampur', [hero]],
      ['national', [hero]],
    ]);

    const output = runDeduplication({
      heroArticles: [hero],
      sectionMap,
      sectionConfigs: [makeConfig('rampur', 'rampur'), makeConfig('national', 'national')],
      sectionOrder: ['rampur', 'national'],
      config: { ...defaultDedup, heroPolicy: 'allow-everywhere' },
      displayedHeroCount: 1,
    });

    // Both sections keep it
    expect(output.sections.get('rampur')).toHaveLength(1);
    // Cross-section dedup still applies though
    expect(output.stats.heroPassRemoved).toBe(0);
  });

  it('allow-duplicates: disables cross-section dedup', () => {
    const shared = makeArticle({ slug: 'shared' });
    const sectionMap = new Map([
      ['rampur', [shared]],
      ['up', [shared]],
    ]);

    const output = runDeduplication({
      heroArticles: [],
      sectionMap,
      sectionConfigs: [makeConfig('rampur', 'rampur'), makeConfig('up', 'up')],
      sectionOrder: ['rampur', 'up'],
      config: { ...defaultDedup, categoryPolicy: 'allow-duplicates' },
      displayedHeroCount: 0,
    });

    // Both sections keep the article
    expect(output.sections.get('rampur')).toHaveLength(1);
    expect(output.sections.get('up')).toHaveLength(1);
    expect(output.stats.crossSectionRemoved).toBe(0);
  });
});

// ─── Full pipeline integration ────────────────────────────────────────────────

describe('runFullDeduplication (legacy wrapper)', () => {
  it('latest rampur article appears in both hero and rampur section', () => {
    const latestRampur = makeArticle({ slug: 'rampur-breaking', category: 'rampur' });
    const heroArticles = [latestRampur, makeArticle({ slug: 'up-story', category: 'up' })];

    const sectionMap = new Map<string, { sectionId: string; articles: CMSArticle[]; source: string }>([
      ['rampur', { sectionId: 'rampur', articles: [latestRampur, makeArticle({ slug: 'r2', category: 'rampur' })], source: 'aggregated' }],
      ['up', { sectionId: 'up', articles: [makeArticle({ slug: 'up-story', category: 'up' })], source: 'aggregated' }],
    ]);

    const output = runFullDeduplication({
      heroArticles,
      displayedHeroCount: 2,
      sectionMap: sectionMap as any,
      sectionConfigs: [makeConfig('rampur', 'rampur'), makeConfig('up', 'up')],
      sectionOrder: ['rampur', 'up'],
    });

    expect(output.sections.get('rampur')!.articles.some((a) => a.slug === 'rampur-breaking')).toBe(true);
  });
});

// ─── Scoring ──────────────────────────────────────────────────────────────────

describe('scoreArticle', () => {
  it('breaking articles score higher than non-breaking', () => {
    const now = Date.now();
    const breaking = makeArticle({ isBreaking: true, publishedAt: new Date(now - 3600_000).toISOString() });
    const normal = makeArticle({ isBreaking: false, publishedAt: new Date(now - 3600_000).toISOString() });

    const breakingScore = scoreArticle(breaking, now);
    const normalScore = scoreArticle(normal, now);

    expect(breakingScore.score).toBeGreaterThan(normalScore.score);
  });

  it('newer articles score higher than older articles', () => {
    const now = Date.now();
    const fresh = makeArticle({ publishedAt: new Date(now - 1800_000).toISOString() }); // 30 min ago
    const old = makeArticle({ publishedAt: new Date(now - 48 * 3600_000).toISOString() }); // 48h ago

    expect(scoreArticle(fresh, now).score).toBeGreaterThan(scoreArticle(old, now).score);
  });

  it('score factors are transparent', () => {
    const article = makeArticle({ isBreaking: true, isFeatured: true, isEditorsPick: true });
    const result = scoreArticle(article);

    expect(result.factors).toHaveLength(5);
    expect(result.factors.map((f) => f.name)).toEqual(['freshness', 'breaking', 'featured', 'editorsPick', 'views']);
    expect(result.score).toBeGreaterThan(0);
  });
});

// ─── Telemetry ────────────────────────────────────────────────────────────────

describe('Pipeline telemetry', () => {
  it('creates context with correlation ID', () => {
    const ctx = createPipelineContext();
    expect(ctx.correlationId).toHaveLength(7);
    expect(ctx.startedAt).toBeTruthy();
  });

  it('records stage timings', () => {
    const ctx = createPipelineContext();
    const start = Date.now();
    recordStage(ctx, 'fetch', start);

    expect(ctx.telemetry.stages).toHaveLength(1);
    expect(ctx.telemetry.stages[0].stage).toBe('fetch');
    expect(ctx.telemetry.stages[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('finalize computes total duration', () => {
    const ctx = createPipelineContext();
    const start = Date.now();
    recordStage(ctx, 'fetch', start);
    recordStage(ctx, 'dedup', start);
    finalizeTelemetry(ctx);

    expect(ctx.telemetry.totalDurationMs).toBeGreaterThanOrEqual(0);
  });
});
