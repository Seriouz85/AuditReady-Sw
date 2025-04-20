import React, { useEffect } from 'react';
import { Globe, Check, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslation, Language } from '@/lib/i18n';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Language to flag emoji mapping
const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  sv: '🇸🇪',
  no: '🇳🇴',
  da: '🇩🇰',
  fi: '🇫🇮',
};

// Language to BCP 47 language tag mapping for browser translation
const languageToBCP47: Record<Language, string> = {
  en: 'en-GB',
  sv: 'sv-SE',
  no: 'nb-NO',
  da: 'da-DK',
  fi: 'fi-FI',
};

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useTranslation();
  const [useBrowserTranslation, setUseBrowserTranslation] = React.useState<boolean>(
    localStorage.getItem('useBrowserTranslation') === 'true'
  );

  // Trigger browser translation when language changes
  useEffect(() => {
    if (useBrowserTranslation && typeof document !== 'undefined') {
      // Store the preference
      localStorage.setItem('useBrowserTranslation', 'true');
      
      // Check if the Google Translate API is available (common browser translation tool)
      if ((window as Window & { googleTranslateElementInit?: () => void }).googleTranslateElementInit) {
        ((window as Window & { googleTranslateElementInit?: () => void }).googleTranslateElementInit)();
      } else if (navigator.language !== languageToBCP47[language]) {
        // Attempt to use the browser's internal translation feature if available
        try {
          // First set the lang attribute which many browser translation tools use
          document.documentElement.lang = languageToBCP47[language];
          
          // Check for Edge/Chrome translation feature
          if ((document as Document & { webkitStartActivity?: (options: { action: string; data: string }) => void }).webkitStartActivity) {
            (document as Document & { webkitStartActivity?: (options: { action: string; data: string }) => void })
              .webkitStartActivity({
                action: 'translate',
                data: languageToBCP47[language],
              });
          }
          
          // For browsers without automatic translation, we display a message to the user
          console.log(`Browser translation activated for ${languageToBCP47[language]}`);
        } catch (error) {
          console.warn('Browser translation not supported:', error);
        }
      }
    } else {
      localStorage.setItem('useBrowserTranslation', 'false');
    }
  }, [language, useBrowserTranslation]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // If using browser translation, apply translation immediately
    if (useBrowserTranslation) {
      // Create a simple notification to indicate translation is happening
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '4px';
      notification.style.zIndex = '9999';
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      notification.innerText = `Translating to ${t(`language.${newLanguage === 'en' ? 'english' : newLanguage === 'sv' ? 'swedish' : newLanguage === 'no' ? 'norwegian' : newLanguage === 'da' ? 'danish' : 'finnish'}`)}...`;
      
      document.body.appendChild(notification);
      setTimeout(() => { notification.style.opacity = '1'; }, 50);
      setTimeout(() => { 
        notification.style.opacity = '0';
        setTimeout(() => { notification.remove(); }, 300);
      }, 3000);
    }
  };

  const toggleBrowserTranslation = () => {
    setUseBrowserTranslation(!useBrowserTranslation);
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="flex items-center gap-3 h-11 px-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Globe className="h-5 w-5" />
                <span className="text-base font-medium flex items-center gap-2">
                  {languageFlags[language]}
                  {useBrowserTranslation && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400 text-xs rounded-full px-2 py-0.5">
                      Auto
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('language.selector')}</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end" className="w-64 p-2">
          <div className="flex items-center justify-between p-2 mb-2">
            <Label htmlFor="browser-translation" className="text-sm cursor-pointer">
              Use browser translation
            </Label>
            <Switch
              id="browser-translation"
              checked={useBrowserTranslation}
              onCheckedChange={toggleBrowserTranslation}
            />
          </div>
          
          <DropdownMenuSeparator />
          
          {Object.keys(languageFlags).map((lang) => (
            <DropdownMenuItem
              key={lang}
              className="flex items-center justify-between cursor-pointer py-3 px-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => handleLanguageChange(lang as Language)}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{languageFlags[lang as Language]}</span>
                <span className="text-base">{t(`language.${lang === 'en' ? 'english' : lang === 'sv' ? 'swedish' : lang === 'no' ? 'norwegian' : lang === 'da' ? 'danish' : 'finnish'}`)}</span>
              </span>
              {language === lang && <Check className="h-5 w-5" />}
            </DropdownMenuItem>
          ))}
          
          {useBrowserTranslation && (
            <>
              <DropdownMenuSeparator />
              <a 
                href="https://translate.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between text-sm text-muted-foreground px-3 py-2 hover:text-foreground"
              >
                <span>Open Google Translate</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}; 