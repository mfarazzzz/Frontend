
import { CMSArticle } from "@/services/cms/types";

// Centralized API configuration
export const API_URL = (() => {
  if (typeof process !== 'undefined' && process.env) {
    const isBrowser = typeof window !== 'undefined';
    const url = isBrowser
      ? process.env.NEXT_PUBLIC_STRAPI_URL ||
        process.env.NEXT_PUBLIC_STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_BASE_URL
      : process.env.STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_API_URL ||
        process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
        process.env.NEXT_PUBLIC_STRAPI_URL ||
        process.env.STRAPI_URL;
    
    if (url) {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (trimmed.endsWith('/api')) return trimmed;
      return `${trimmed}/api`;
    }
    
    // Fallback for production if env vars are missing
    if (process.env.NODE_ENV === 'production') {
      return 'https://api.rampur.cloud/api';
    }
    
    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:1337/api';
    }
  }
  return '';
})();

/**
 * Safe query builder utility
 * Handles URLSearchParams construction and ensures no undefined values are passed.
 */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Standardized Fetch API wrapper
 * Handles errors, caching (ISR), and response parsing.
 */
export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T | null> {
  const url = `${API_URL}${path}`;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Default ISR revalidation time
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (res.status === 204) {
      return null;
    }

    if (!res.ok) {
      // Log error details for debugging but handle gracefully
      const errorText = await res.text();
      console.error(`Strapi API Error (${res.status}) for ${path}:`, errorText.slice(0, 200));
      return null;
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error(`Fetch failed for ${path}:`, error);
    return null;
  }
}

/**
 * Helper to extract data from Strapi v5 response
 * Strapi v5 often wraps data in { data: ... }
 */
export function unwrapData<T>(response: any): T | null {
  if (!response) return null;
  if (response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}
