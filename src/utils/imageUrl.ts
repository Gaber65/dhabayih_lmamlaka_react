import { APP_CONFIG } from '../config';

/**
 * Normalizes image URLs from backend or relative paths to fully qualified URLs.
 */
export const normalizeImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed.endsWith('/null') || trimmed === 'undefined') {
    return '';
  }

  // Replace localhost or internal docker hosts with live backend URL
  let cleanUrl = trimmed.replace(
    /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?/i,
    APP_CONFIG.apiBaseUrl
  );

  // If already absolute URL pointing to http or https, return it
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // If relative path
  if (cleanUrl.startsWith('/')) {
    // Keep local static assets served by frontend
    if (
      cleanUrl.startsWith('/images/') ||
      cleanUrl.startsWith('/assets/') ||
      cleanUrl.startsWith('/icons.svg') ||
      cleanUrl.startsWith('/favicon.svg') ||
      cleanUrl.startsWith('/app_logo.png') ||
      cleanUrl.startsWith('/hero_butcher.jpg')
    ) {
      return cleanUrl;
    }
    // Prefix backend endpoints with Odoo base URL
    return `${APP_CONFIG.apiBaseUrl}${cleanUrl}`;
  }

  return `${APP_CONFIG.apiBaseUrl}/${cleanUrl}`;
};
