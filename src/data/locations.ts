/**
 * Location taxonomy for Rampur News.
 *
 * Structured as: City → Parent Region → State
 * Used for geo-tagging articles, generating city hub pages,
 * keyword derivation, and structured data (areaServed).
 *
 * To add a new city: just add a row to LOCATIONS — no template changes needed.
 */

export interface Location {
  /** URL-safe slug (used in routes, sitemaps, meta) */
  slug: string;
  /** Hindi display name */
  nameHindi: string;
  /** English display name */
  nameEnglish: string;
  /** Parent region slug */
  region: string;
  /** State slug */
  state: string;
  /** Whether this is a primary coverage city (shows in nav/hubs) */
  isPrimary: boolean;
  /** District name (for schema.org PostalAddress) */
  district?: string;
  /** Latitude for GeoCoordinates schema */
  lat?: number;
  /** Longitude for GeoCoordinates schema */
  lng?: number;
}

export interface Region {
  slug: string;
  nameHindi: string;
  nameEnglish: string;
  state: string;
}

export interface State {
  slug: string;
  nameHindi: string;
  nameEnglish: string;
  country: string;
}

// ─── States ──────────────────────────────────────────────────────────────────

export const STATES: State[] = [
  { slug: 'uttar-pradesh', nameHindi: 'उत्तर प्रदेश', nameEnglish: 'Uttar Pradesh', country: 'IN' },
  { slug: 'uttarakhand', nameHindi: 'उत्तराखंड', nameEnglish: 'Uttarakhand', country: 'IN' },
];

// ─── Regions ─────────────────────────────────────────────────────────────────

export const REGIONS: Region[] = [
  { slug: 'rohilkhand', nameHindi: 'रोहिलखंड', nameEnglish: 'Rohilkhand', state: 'uttar-pradesh' },
  { slug: 'western-up', nameHindi: 'पश्चिमी उत्तर प्रदेश', nameEnglish: 'Western UP', state: 'uttar-pradesh' },
];

// ─── Locations (Cities/Towns) ────────────────────────────────────────────────

export const LOCATIONS: Location[] = [
  // Primary cities
  { slug: 'rampur', nameHindi: 'रामपुर', nameEnglish: 'Rampur', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: true, district: 'Rampur', lat: 28.7951, lng: 79.0248 },
  { slug: 'moradabad', nameHindi: 'मुरादाबाद', nameEnglish: 'Moradabad', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: true, district: 'Moradabad', lat: 28.8386, lng: 78.7733 },
  { slug: 'bareilly', nameHindi: 'बरेली', nameEnglish: 'Bareilly', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: true, district: 'Bareilly', lat: 28.3670, lng: 79.4304 },

  // Extended Rohilkhand region
  { slug: 'amroha', nameHindi: 'अमरोहा', nameEnglish: 'Amroha', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: false, district: 'Amroha', lat: 28.9030, lng: 78.4676 },
  { slug: 'sambhal', nameHindi: 'संभल', nameEnglish: 'Sambhal', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: false, district: 'Sambhal', lat: 28.5847, lng: 78.5708 },
  { slug: 'bijnor', nameHindi: 'बिजनौर', nameEnglish: 'Bijnor', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: false, district: 'Bijnor', lat: 29.3724, lng: 78.1358 },
  { slug: 'rudrapur', nameHindi: 'रुद्रपुर', nameEnglish: 'Rudrapur', region: 'rohilkhand', state: 'uttarakhand', isPrimary: false, district: 'Udham Singh Nagar', lat: 28.9748, lng: 79.4000 },
  { slug: 'pilibhit', nameHindi: 'पीलीभीत', nameEnglish: 'Pilibhit', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: false, district: 'Pilibhit', lat: 28.6316, lng: 79.8039 },
  { slug: 'shahjahanpur', nameHindi: 'शाहजहाँपुर', nameEnglish: 'Shahjahanpur', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: false, district: 'Shahjahanpur', lat: 27.8818, lng: 79.9058 },
  { slug: 'budaun', nameHindi: 'बदायूं', nameEnglish: 'Budaun', region: 'rohilkhand', state: 'uttar-pradesh', isPrimary: false, district: 'Budaun', lat: 28.0484, lng: 79.1200 },
  { slug: 'haldwani', nameHindi: 'हल्द्वानी', nameEnglish: 'Haldwani', region: 'rohilkhand', state: 'uttarakhand', isPrimary: false, district: 'Nainital', lat: 29.2183, lng: 79.5130 },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export const getLocationBySlug = (slug: string): Location | undefined =>
  LOCATIONS.find(l => l.slug === slug);

export const getLocationsByRegion = (regionSlug: string): Location[] =>
  LOCATIONS.filter(l => l.region === regionSlug);

export const getPrimaryLocations = (): Location[] =>
  LOCATIONS.filter(l => l.isPrimary);

export const getRegionBySlug = (slug: string): Region | undefined =>
  REGIONS.find(r => r.slug === slug);

export const getStateBySlug = (slug: string): State | undefined =>
  STATES.find(s => s.slug === slug);

/** Get all location slugs (used for sitemap generation) */
export const getAllLocationSlugs = (): string[] =>
  LOCATIONS.map(l => l.slug);

/** Get location Hindi name — returns slug as fallback */
export const getLocationHindi = (slug: string): string => {
  const loc = getLocationBySlug(slug);
  return loc?.nameHindi || slug;
};

/** Check if a string matches any known location */
export const isKnownLocation = (value: string): boolean => {
  const lower = value.toLowerCase().trim();
  return LOCATIONS.some(l =>
    l.slug === lower ||
    l.nameEnglish.toLowerCase() === lower ||
    l.nameHindi === value.trim()
  );
};

/** Extract location tags from article text/tags */
export const extractLocationTags = (tags: string[] | undefined, title?: string, content?: string): Location[] => {
  if (!tags && !title && !content) return [];
  const corpus = [
    ...(tags || []),
    title || '',
    (content || '').slice(0, 500), // Only scan first 500 chars for performance
  ].join(' ').toLowerCase();

  return LOCATIONS.filter(loc =>
    corpus.includes(loc.slug) ||
    corpus.includes(loc.nameEnglish.toLowerCase()) ||
    corpus.includes(loc.nameHindi)
  );
};

/** Build areaServed array for Organization schema */
export const buildAreaServed = (): object[] => [
  ...LOCATIONS.map(loc => ({
    '@type': 'City',
    name: `${loc.nameEnglish}, ${loc.district || loc.nameEnglish}`,
    'name@hi': loc.nameHindi,
  })),
  ...REGIONS.map(r => ({
    '@type': 'AdministrativeArea',
    name: r.nameEnglish,
    'name@hi': r.nameHindi,
  })),
  ...STATES.map(s => ({
    '@type': 'State',
    name: s.nameEnglish,
    'name@hi': s.nameHindi,
  })),
];
