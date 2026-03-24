/**
 * Google Analytics 4 Configuration
 * 
 * This file centralizes GA4 configuration for the application.
 * Set your GA4 Measurement ID in environment variable:
 * 
 * NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 
 * The format should be like: G-XXXXXXXXXX (e.g., G-XYZ123ABC)
 */

const GA_ID_RAW = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Clean and validate the GA ID
export const GA_MEASUREMENT_ID = GA_ID_RAW
  ? GA_ID_RAW.trim().replace(/^['"]|['"]$/g, "")
  : undefined;

// Validate format (G- followed by uppercase letters and numbers)
export const isValidGA4 = GA_MEASUREMENT_ID && /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID);

// Re-export for convenience
export const GA_ID = GA_MEASUREMENT_ID;

// Check if GA is configured
export const isGAConfigured = Boolean(isValidGA4);

/**
 * Get the GA4 measurement ID
 * Returns undefined if not properly configured
 */
export function getGAId(): string | undefined {
  return isValidGA4 ? GA_MEASUREMENT_ID : undefined;
}
