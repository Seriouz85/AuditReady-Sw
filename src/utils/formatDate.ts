/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Get language from localStorage or default to 'en'
  const language = localStorage.getItem('language') || 'en';
  
  // Map the language code to appropriate locale
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'sv': 'sv-SE',
    'no': 'nb-NO', // Norwegian Bokmål
    'da': 'da-DK',
    'fi': 'fi-FI'
  };
  
  const locale = localeMap[language] || 'en-US';
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 