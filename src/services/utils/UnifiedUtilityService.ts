/**
 * 🔧 Unified Utility Service - Consolidated Utilities
 * 
 * This service consolidates all duplicate utility functions found across the codebase.
 * Eliminates 50+ duplicate implementations and provides a single source of truth.
 * 
 * BOARD REQUIREMENT: All utility functions centralized for maintainability
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export class UnifiedUtilityService {
  // ==========================================
  // DATE & TIME FORMATTING
  // ==========================================
  
  /**
   * Format date string to localized format
   * Consolidates 20+ duplicate implementations
   */
  static formatDate(dateInput: string | Date | null | undefined, formatStr: string = 'PPP'): string {
    if (!dateInput) return 'N/A';
    
    try {
      const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
      if (!isValid(date)) return 'Invalid Date';
      
      return format(date, formatStr);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format date to relative time (e.g., "2 hours ago")
   * Consolidates duplicate relative time implementations
   */
  static formatRelativeTime(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return 'N/A';
    
    try {
      const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
      if (!isValid(date)) return 'Invalid Date';
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn('Relative time formatting error:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Format timestamp for display
   * Used in audit logs, activity feeds, etc.
   */
  static formatTimestamp(dateInput: string | Date | null | undefined): string {
    return this.formatDate(dateInput, 'PPp'); // Date + time
  }

  // ==========================================
  // FILE SIZE FORMATTING
  // ==========================================

  /**
   * Format file size in bytes to human readable format
   * Consolidates 11+ duplicate implementations
   */
  static formatFileSize(bytes: number | null | undefined): string {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 0) return 'Invalid Size';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    if (i >= units.length) return 'Very Large';
    
    const size = bytes / Math.pow(k, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  /**
   * Format bytes with binary prefixes (1024-based)
   */
  static formatBytes = this.formatFileSize; // Alias for consistency

  /**
   * Parse file size string back to bytes
   */
  static parseFileSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
    if (!match) return 0;

    const [, value, unit] = match;
    const bytes = parseFloat(value);
    const multipliers = { B: 1, KB: 1024, MB: 1024**2, GB: 1024**3, TB: 1024**4 };
    
    return bytes * (multipliers[unit.toUpperCase() as keyof typeof multipliers] || 1);
  }

  // ==========================================
  // STRING UTILITIES
  // ==========================================

  /**
   * Truncate text with ellipsis
   */
  static truncateText(text: string, maxLength: number = 100): string {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  }

  /**
   * Convert string to slug format
   */
  static toSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Capitalize first letter of each word
   */
  static titleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // ==========================================
  // NUMBER FORMATTING
  // ==========================================

  /**
   * Format number with locale-specific thousands separators
   */
  static formatNumber(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(num);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  // ==========================================
  // VALIDATION UTILITIES
  // ==========================================

  /**
   * Check if email is valid
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if URL is valid
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // ==========================================
  // ARRAY & OBJECT UTILITIES
  // ==========================================

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Group array by key
   */
  static groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Remove duplicates from array
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  // ==========================================
  // COLOR UTILITIES
  // ==========================================

  /**
   * Generate random color
   */
  static generateRandomColor(): string {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  }

  /**
   * Check if color is light or dark
   */
  static isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }

  // ==========================================
  // DOWNLOAD UTILITIES
  // ==========================================

  /**
   * Download file from blob
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Download JSON data as file
   */
  static downloadJson(data: any, filename: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    this.downloadBlob(blob, filename);
  }

  // ==========================================
  // PERFORMANCE UTILITIES
  // ==========================================

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Export commonly used functions as standalone exports for easier migration
export const {
  formatDate,
  formatFileSize,
  formatBytes,
  formatRelativeTime,
  formatTimestamp,
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  toSlug,
  titleCase,
  isValidEmail,
  isValidUrl,
  sanitizeHtml,
  deepClone,
  groupBy,
  unique,
  generateRandomColor,
  isLightColor,
  downloadBlob,
  downloadJson,
  debounce,
  throttle
} = UnifiedUtilityService;