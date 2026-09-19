/**
 * Dhabayih Al-Mamlaka Application Configuration
 * Centralized settings for API endpoints, environments, and defaults.
 */

export const APP_CONFIG = {
  /**
   * Base URL for backend API requests (Odoo 17 REST API)
   */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'http://72.62.52.33:8073').replace(/\/+$/, ''),

  /**
   * Application display names
   */
  appName: import.meta.env.VITE_APP_NAME || 'Dhabayih Al-Mamlaka',
  appNameAr: import.meta.env.VITE_APP_NAME_AR || 'ذبائح المملكة',

  /**
   * Network request timeout in milliseconds
   */
  apiTimeout: 30000,

  /**
   * Default fallback language (ar | en)
   */
  defaultLang: 'ar',

  /**
   * Storage Keys
   */
  storageKeys: {
    accessToken: 'dhabayih_access_token',
    refreshToken: 'dhabayih_refresh_token',
    user: 'dhabayih_user',
    language: 'dhabayih_language',
    cart: 'dhabayih_cart',
  },

  /**
   * Currency formatting
   */
  currency: {
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    code: 'SAR',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
