/**
 * Content services — public API for homepage and content resolution.
 */

export { getHomepageSections, HOMEPAGE_SECTIONS, fetchHomepageConfigFromCMS } from './homepageConfig';
export type {
  HomepageSectionConfig,
  ContentSource,
  SectionTemplate,
  HeroStrategy,
  DuplicatePolicy,
} from './homepageConfig';

export {
  fetchSectionContent,
  fetchAllHomepageSections,
  deduplicateAcrossSections,
  getContentLogs,
  clearContentLogs,
} from './contentResolver';
export type { SectionData } from './contentResolver';
