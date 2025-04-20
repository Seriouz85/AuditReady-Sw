import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { LanguageContext, Language, translations } from '@/lib/i18n';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get the language from localStorage, default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get stored language preference
    const storedLanguage = localStorage.getItem('language') as Language;
    // Validate that it's a supported language
    return storedLanguage && ['en', 'sv', 'no', 'da', 'fi'].includes(storedLanguage)
      ? storedLanguage
      : 'en';
  });

  // Persist language choice to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
    // Set the HTML lang attribute for accessibility and SEO
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Translation function
  const t = (key: string, fallback?: string): string => {
    // Get the translation for the current language
    const translation = translations[language][key];
    
    // If the translation is missing, try the English version, then the fallback, or finally the key itself
    return translation || translations.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}; 