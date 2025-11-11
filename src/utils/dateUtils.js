/**
 * Date Utilities for handling timezone conversions
 * Store dates in UTC, display in Africa/Cairo timezone
 */

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date | string} date - Date object or string
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function formatToISODate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  // Return UTC date as YYYY-MM-DD
  return d.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object (UTC)
 * @param {string} isoString - ISO date string (YYYY-MM-DD or full ISO)
 * @returns {Date} Date object in UTC
 */
export function parseISODate(isoString) {
  if (!isoString) return null;
  
  // Handle YYYY-MM-DD format
  if (typeof isoString === 'string' && isoString.length === 10) {
    return new Date(`${isoString}T00:00:00Z`);
  }
  
  return new Date(isoString);
}

/**
 * Format date for display in Africa/Cairo timezone
 * @param {Date | string} date - Date object or ISO string
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDateCairo(date, locale = 'en-US') {
  if (!date) return '';
  
  const d = typeof date === 'string' ? parseISODate(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  
  try {
    // Format using Africa/Cairo timezone
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return d.toLocaleDateString(locale);
  }
}

/**
 * Format date with full datetime in Cairo timezone
 * @param {Date | string} date - Date object or ISO string
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted datetime string
 */
export function formatDateTimeCairo(date, locale = 'en-US') {
  if (!date) return '';
  
  const d = typeof date === 'string' ? parseISODate(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return d.toLocaleString(locale);
  }
}

/**
 * Get current date in YYYY-MM-DD format (UTC)
 * @returns {string} Today's date in ISO format
 */
export function getTodayISO() {
  return formatToISODate(new Date());
}

/**
 * Format currency amount
 * @param {number | string} amount - Amount to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @param {string} currency - Currency code (default: 'EGP')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, locale = 'en-US', currency = 'EGP') {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(num)) return '0.00';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return amount?.toString() || '0.00';
  }
}

/**
 * Format number with locale-specific formatting
 * @param {number | string} num - Number to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted number
 */
export function formatNumber(num, locale = 'en-US') {
  try {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(n)) return '0';
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num?.toString() || '0';
  }
}

/**
 * Get date range for filters (Today, This week, This month)
 * @param {string} range - 'today' | 'week' | 'month' | 'year'
 * @returns {{startDate: string, endDate: string}} ISO date range
 */
export function getDateRange(range = 'today') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate = new Date(today);
  let endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  switch (range) {
    case 'week': {
      const dayOfWeek = today.getDay();
      startDate.setDate(today.getDate() - dayOfWeek);
      endDate.setDate(today.getDate() + (6 - dayOfWeek));
      break;
    }
    case 'month': {
      startDate.setDate(1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    }
    case 'year': {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
    }
    // 'today' is default
  }
  
  return {
    startDate: formatToISODate(startDate),
    endDate: formatToISODate(endDate)
  };
}

/**
 * Check if date is today
 * @param {Date | string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const d = typeof date === 'string' ? parseISODate(date) : date;
  const today = new Date();
  
  return (
    d.getUTCDate() === today.getUTCDate() &&
    d.getUTCMonth() === today.getUTCMonth() &&
    d.getUTCFullYear() === today.getUTCFullYear()
  );
}

/**
 * Difference in days between two dates
 * @param {Date | string} date1 - First date
 * @param {Date | string} date2 - Second date
 * @returns {number} Difference in days
 */
export function daysDifference(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseISODate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISODate(date2) : date2;
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}
