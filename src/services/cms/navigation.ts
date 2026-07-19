/**
 * Navigation Service — fetches CMS-managed menus via the Gateway API.
 *
 * Used when USE_NEW_NAVIGATION flag is enabled.
 * Frontend components (Header, Footer, MobileNav) call this instead of using hardcoded menus.
 */

import { fetchNavigation, type NavItem } from './gateway-client';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
  children: MenuItem[];
  openInNewTab: boolean;
}

/**
 * Transform gateway NavItem to frontend MenuItem.
 */
function toMenuItem(item: NavItem, locale = 'hi'): MenuItem {
  return {
    id: item.id,
    label: item.label?.[locale] || item.label?.hi || item.label?.en || '',
    url: item.url || '#',
    icon: item.icon || undefined,
    badge: item.badge_text || undefined,
    children: (item.children || []).map(child => toMenuItem(child, locale)),
    openInNewTab: false,
  };
}

/**
 * Get header navigation menu items.
 */
export async function getHeaderMenu(locale = 'hi'): Promise<MenuItem[]> {
  try {
    const data = await fetchNavigation('header', locale);
    return (data.items || []).map(item => toMenuItem(item, locale));
  } catch {
    return []; // Fallback: empty menu (existing hardcoded menu will be used)
  }
}

/**
 * Get footer navigation menu items.
 */
export async function getFooterMenu(locale = 'hi'): Promise<MenuItem[]> {
  try {
    const data = await fetchNavigation('footer', locale);
    return (data.items || []).map(item => toMenuItem(item, locale));
  } catch {
    return [];
  }
}

/**
 * Get mobile navigation menu items.
 */
export async function getMobileMenu(locale = 'hi'): Promise<MenuItem[]> {
  try {
    const data = await fetchNavigation('mobile', locale);
    return (data.items || []).map(item => toMenuItem(item, locale));
  } catch {
    return [];
  }
}

/**
 * Get sidebar quick links.
 */
export async function getSidebarLinks(locale = 'hi'): Promise<MenuItem[]> {
  try {
    const data = await fetchNavigation('quick_links', locale);
    return (data.items || []).map(item => toMenuItem(item, locale));
  } catch {
    return [];
  }
}

/**
 * Check if CMS-managed navigation should be used.
 */
export function shouldUseCMSNavigation(): boolean {
  return process.env.NEXT_PUBLIC_USE_NEW_NAVIGATION === 'true' ||
    process.env.USE_NEW_NAVIGATION === 'true';
}
