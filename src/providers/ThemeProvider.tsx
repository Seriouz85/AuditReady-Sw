import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem {...props}>
      {children}
    </NextThemeProvider>
  );
} 