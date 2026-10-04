/**
 * Utility functions for Saudi Mobile Numbers and Dual-channel Authentication.
 */

export const normalizeDigits = (input: string): string => {
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(arabic[i], `${i}`);
    result = result.replaceAll(persian[i], `${i}`);
  }
  return result;
};

/**
 * Formats user input on the fly:
 * - Converts Arabic/Persian numerals
 * - Strips +966 / 00966 / 966 prefixes
 * - Limits max digits to 10 (for 05XXXXXXXX) or 9 (for 5XXXXXXXX)
 */
export const formatSaudiPhoneInput = (input: string): string => {
  if (!input) return '';

  let cleaned = normalizeDigits(input).replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+966')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('00966')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('966')) {
    cleaned = cleaned.substring(3);
  }

  // Keep only digits
  cleaned = cleaned.replace(/\D/g, '');

  const maxLen = cleaned.startsWith('0') ? 10 : 9;
  if (cleaned.length > maxLen) {
    cleaned = cleaned.substring(0, maxLen);
  }

  return cleaned;
};

/**
 * Normalizes input phone to international E.164 Saudi format (+9665XXXXXXXX)
 */
export const normalizeSaudiPhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) return null;

  let cleaned = normalizeDigits(phone).replace(/[\s\-\(\)\.]+/g, '');

  if (cleaned.startsWith('00966')) {
    cleaned = '+' + cleaned.substring(2);
  } else if (cleaned.startsWith('966')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '+966' + cleaned.substring(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    cleaned = '+966' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
};

/**
 * Strictly validates Saudi mobile phone format (+9665XXXXXXXX)
 */
export const isValidSaudiPhone = (phone: string): boolean => {
  const normalized = normalizeSaudiPhone(phone);
  if (!normalized) return false;
  return /^\+9665\d{8}$/.test(normalized);
};

/**
 * Simple email validation
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || !email.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
};
