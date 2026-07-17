/**
 * SEO Keyword generation system.
 *
 * Generates city-specific, category-specific, and long-tail keywords
 * from the location taxonomy. Used by:
 * - Article page generateMetadata()
 * - Gemini AI pipeline (seed keywords)
 * - City hub page metadata
 * - Sitemap news:keywords
 */

import { type Location, getLocationBySlug, LOCATIONS } from '@/data/locations';

export interface ArticleKeywordContext {
  /** Primary city tags (slugs) from the article */
  cities: string[];
  /** Article category slug */
  category?: string;
  /** Article title */
  title?: string;
  /** Optional additional tags from CMS */
  tags?: string[];
}

// ─── Category keyword patterns ───────────────────────────────────────────────

const CATEGORY_PATTERNS: Record<string, (city: string) => string[]> = {
  politics: (city) => [
    `${city} विधानसभा समाचार`,
    `${city} सांसद समाचार`,
    `${city} नगर निगम समाचार`,
    `${city} राजनीति`,
  ],
  crime: (city) => [
    `${city} पुलिस समाचार`,
    `${city} अपराध न्यूज़`,
    `${city} क्राइम न्यूज़`,
    `${city} FIR`,
  ],
  'education-jobs': (city) => [
    `${city} में सरकारी नौकरी`,
    `यूपी बोर्ड परीक्षा ${city}`,
    `${city} शिक्षा समाचार`,
    `${city} भर्ती`,
  ],
  business: (city) => [
    `${city} मंडी भाव आज`,
    `${city} व्यापार समाचार`,
    `${city} बाज़ार`,
    `${city} अर्थव्यवस्था`,
  ],
  health: (city) => [
    `${city} स्वास्थ्य समाचार`,
    `${city} अस्पताल`,
    `${city} चिकित्सा`,
  ],
  sports: (city) => [
    `${city} खेल समाचार`,
    `${city} क्रिकेट`,
  ],
  weather: (city) => [
    `${city} मौसम अपडेट`,
    `${city} का मौसम कैसा रहेगा`,
    `${city} में बारिश`,
    `${city} तापमान आज`,
  ],
};

// ─── Long-tail "today/latest" patterns ───────────────────────────────────────

const TODAY_PATTERNS = (city: string): string[] => [
  `${city} में आज की ताज़ा खबर`,
  `${city} की मुख्य खबरें आज`,
  `आज का ${city} समाचार हिंदी में`,
  `${city} न्यूज़ टुडे`,
];

// ─── Question-style patterns (for AI answer engines) ─────────────────────────

const QUESTION_PATTERNS = (city: string, category?: string): string[] => {
  const base = [
    `${city} में आज क्या हुआ?`,
    `${city} की ताज़ा खबर क्या है?`,
  ];
  if (category === 'weather') {
    base.push(`${city} का मौसम कैसा रहेगा?`);
  }
  if (category === 'crime') {
    base.push(`${city} में कौन गिरफ्तार हुआ?`);
  }
  if (category === 'politics') {
    base.push(`${city} के सांसद कौन हैं?`);
  }
  return base;
};

// ─── Short-tail city+news patterns ───────────────────────────────────────────

const SHORT_TAIL = (city: string): string[] => [
  `${city} न्यूज़`,
  `${city} समाचार`,
  `${city} ताज़ा खबर`,
  `${city} ब्रेकिंग न्यूज़`,
];

// ─── Main keyword generator ──────────────────────────────────────────────────

/**
 * Generate a full keyword set for an article based on its city tags and category.
 * Returns both Hindi and transliterated keywords.
 */
export function generateArticleKeywords(context: ArticleKeywordContext): string[] {
  const keywords = new Set<string>();

  // Get location objects for tagged cities
  const locations: Location[] = context.cities
    .map(slug => getLocationBySlug(slug))
    .filter((l): l is Location => !!l);

  // If no explicit city tags, default to Rampur
  if (locations.length === 0) {
    const rampur = getLocationBySlug('rampur');
    if (rampur) locations.push(rampur);
  }

  for (const loc of locations) {
    const cityHindi = loc.nameHindi;

    // Short-tail
    for (const kw of SHORT_TAIL(cityHindi)) keywords.add(kw);

    // Today/latest patterns (pick 2)
    for (const kw of TODAY_PATTERNS(cityHindi).slice(0, 2)) keywords.add(kw);

    // Category-specific
    if (context.category && CATEGORY_PATTERNS[context.category]) {
      for (const kw of CATEGORY_PATTERNS[context.category](cityHindi)) keywords.add(kw);
    }

    // Question patterns (pick 1-2)
    for (const kw of QUESTION_PATTERNS(cityHindi, context.category).slice(0, 2)) keywords.add(kw);

    // English variants
    keywords.add(`${loc.nameEnglish} News`);
    keywords.add(`${loc.nameEnglish} News Today`);
    keywords.add(`${loc.nameEnglish} Latest News Hindi`);
  }

  // Add region/state level keywords
  keywords.add('रोहिलखंड न्यूज़');
  keywords.add('उत्तर प्रदेश न्यूज़');
  keywords.add('Rampur News');

  // Add CMS tags if provided
  if (context.tags) {
    for (const tag of context.tags.slice(0, 5)) {
      keywords.add(tag);
    }
  }

  return Array.from(keywords).slice(0, 30);
}

/**
 * Generate seed keywords for the Gemini AI pipeline.
 * Returns a prompt-friendly string of keyword patterns to guide the AI.
 */
export function generateGeminiKeywordSeed(citySlugs: string[], category?: string): string {
  const cities = citySlugs
    .map(s => getLocationBySlug(s))
    .filter((l): l is Location => !!l);

  if (cities.length === 0) return '';

  const lines: string[] = [
    'Generate Hindi SEO keywords using these patterns:',
    '',
    '## Short-tail (must include):',
    ...cities.map(c => `- ${c.nameHindi} न्यूज़, ${c.nameHindi} समाचार`),
    '',
    '## Long-tail "today" patterns:',
    ...cities.map(c => `- ${c.nameHindi} में आज की ताज़ा खबर`),
    ...cities.map(c => `- ${c.nameHindi} की मुख्य खबरें आज`),
  ];

  if (category && CATEGORY_PATTERNS[category]) {
    lines.push('', '## Category-specific:');
    for (const c of cities) {
      lines.push(...CATEGORY_PATTERNS[category](c.nameHindi).map(k => `- ${k}`));
    }
  }

  lines.push('', '## Question-style (for AI search):');
  for (const c of cities) {
    lines.push(`- ${c.nameHindi} में आज क्या हुआ?`);
    lines.push(`- ${c.nameHindi} की ताज़ा खबर क्या है?`);
  }

  return lines.join('\n');
}

/**
 * Generate meta title for a city hub page.
 */
export function buildCityHubTitle(citySlug: string): string {
  const loc = getLocationBySlug(citySlug);
  if (!loc) return 'समाचार | रामपुर न्यूज़';
  return `${loc.nameHindi} समाचार | ${loc.nameEnglish} News Today | RampurNews.com`;
}

/**
 * Generate meta description for a city hub page.
 */
export function buildCityHubDescription(citySlug: string): string {
  const loc = getLocationBySlug(citySlug);
  if (!loc) return 'ताज़ा खबरें पढ़ें रामपुर न्यूज़ पर।';
  return `${loc.nameHindi} की ताज़ा खबरें, ब्रेकिंग न्यूज़, अपराध, राजनीति, शिक्षा और स्थानीय समाचार। ${loc.nameEnglish} News in Hindi - RampurNews.com`;
}

/**
 * Build article title with city context for SEO.
 * Pattern: "{ArticleTitle} | {City} की ताज़ा खबर | RampurNews.com"
 */
export function buildArticleSeoTitle(articleTitle: string, citySlugs: string[]): string {
  const city = citySlugs.length > 0 ? getLocationBySlug(citySlugs[0]) : undefined;
  const title = articleTitle.trim();
  if (!city) return `${title} | RampurNews.com`;

  const suffix = `${city.nameHindi} की ताज़ा खबर`;
  // Keep total under ~65 chars for SERP display
  if (title.length + suffix.length > 55) {
    return `${title} | RampurNews.com`;
  }
  return `${title} | ${suffix} | RampurNews.com`;
}
