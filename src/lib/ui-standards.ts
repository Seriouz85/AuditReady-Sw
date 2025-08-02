/**
 * UI Standards and Design System
 * Consistent styling utilities for titles, headers, icons, and spacing
 */

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================================
// Typography Standards
// ============================================================================

export const typographyVariants = cva("", {
  variants: {
    variant: {
      // Page Titles (h1 equivalent)
      "page-title": "text-2xl sm:text-3xl font-bold tracking-tight text-foreground",
      
      // Section Headers (h2 equivalent)
      "section-header": "text-xl sm:text-2xl font-semibold text-foreground",
      
      // Subsection Headers (h3 equivalent)
      "subsection-header": "text-lg sm:text-xl font-semibold text-foreground",
      
      // Card Titles
      "card-title": "text-base sm:text-lg font-semibold text-foreground",
      
      // Small Titles
      "small-title": "text-sm sm:text-base font-medium text-foreground",
      
      // Body Text
      "body": "text-sm sm:text-base text-foreground",
      
      // Muted Text
      "muted": "text-xs sm:text-sm text-muted-foreground",
      
      // Captions
      "caption": "text-xs text-muted-foreground",
      
      // Labels
      "label": "text-sm font-medium text-foreground",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    }
  },
  defaultVariants: {
    variant: "body",
  },
});

// ============================================================================
// Icon Standards
// ============================================================================

export const iconVariants = cva("", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4", 
      base: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
      "2xl": "h-10 w-10",
    },
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground", 
      primary: "text-primary",
      success: "text-green-600 dark:text-green-400",
      warning: "text-amber-600 dark:text-amber-400",
      danger: "text-red-600 dark:text-red-400",
      info: "text-blue-600 dark:text-blue-400",
    }
  },
  defaultVariants: {
    size: "base",
    variant: "default",
  },
});

// ============================================================================
// Spacing Standards
// ============================================================================

export const spacingStandards = {
  // Consistent spacing utilities
  pageContainer: "px-3 sm:px-4 lg:px-6 py-4 sm:py-6",
  sectionSpacing: "space-y-4 sm:space-y-6",
  cardSpacing: "p-4 sm:p-6",
  cardInnerSpacing: "space-y-3 sm:space-y-4",
  formSpacing: "space-y-4",
  buttonSpacing: "gap-2",
  gridSpacing: "gap-3 sm:gap-4 lg:gap-6",
  
  // Margins
  marginTop: {
    sm: "mt-2 sm:mt-3",
    base: "mt-3 sm:mt-4", 
    lg: "mt-4 sm:mt-6",
    xl: "mt-6 sm:mt-8",
  },
  marginBottom: {
    sm: "mb-2 sm:mb-3",
    base: "mb-3 sm:mb-4",
    lg: "mb-4 sm:mb-6", 
    xl: "mb-6 sm:mb-8",
  },
  
  // Padding
  padding: {
    sm: "p-2 sm:p-3",
    base: "p-3 sm:p-4",
    lg: "p-4 sm:p-6",
    xl: "p-6 sm:p-8",
  }
} as const;

// ============================================================================
// Card Standards
// ============================================================================

export const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-border shadow-md hover:shadow-lg transition-shadow",
        interactive: "border-border shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer",
        success: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20",
        warning: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20", 
        danger: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
        info: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20",
      },
      size: {
        sm: spacingStandards.padding.sm,
        base: spacingStandards.padding.base,
        lg: spacingStandards.padding.lg,
        xl: spacingStandards.padding.xl,
      }
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  }
);

// ============================================================================
// Button Standards
// ============================================================================

export const buttonIconSizes = {
  sm: "h-3 w-3",
  default: "h-4 w-4", 
  lg: "h-5 w-5",
} as const;

// ============================================================================
// Layout Standards
// ============================================================================

export const layoutVariants = cva("", {
  variants: {
    container: {
      page: spacingStandards.pageContainer,
      section: spacingStandards.sectionSpacing, 
      card: spacingStandards.cardSpacing,
    },
    grid: {
      responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      cards: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      stats: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      sidebar: "grid grid-cols-1 lg:grid-cols-4",
    },
    flex: {
      between: "flex items-center justify-between",
      center: "flex items-center justify-center",
      start: "flex items-center justify-start",
      end: "flex items-center justify-end",
      column: "flex flex-col",
      wrap: "flex flex-wrap items-center",
    }
  }
});

// ============================================================================
// Status Badge Standards
// ============================================================================

export const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        primary: "bg-primary/10 text-primary",
      }
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

// ============================================================================
// Utility Functions
// ============================================================================

export type TypographyVariants = VariantProps<typeof typographyVariants>;
export type IconVariants = VariantProps<typeof iconVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type StatusBadgeVariants = VariantProps<typeof statusBadgeVariants>;

/**
 * Get typography classes
 */
export function getTypographyClasses(variant: TypographyVariants['variant'], size?: TypographyVariants['size']) {
  return cn(typographyVariants({ variant, size }));
}

/**
 * Get icon classes
 */
export function getIconClasses(size: IconVariants['size'] = 'base', variant: IconVariants['variant'] = 'default') {
  return cn(iconVariants({ size, variant }));
}

/**
 * Get card classes
 */
export function getCardClasses(variant: CardVariants['variant'] = 'default', size: CardVariants['size'] = 'base') {
  return cn(cardVariants({ variant, size }));
}

/**
 * Get status badge classes
 */
export function getStatusBadgeClasses(variant: StatusBadgeVariants['variant'] = 'neutral') {
  return cn(statusBadgeVariants({ variant }));
}

// ============================================================================
// Common Component Patterns
// ============================================================================

export const commonPatterns = {
  // Page Header Pattern
  pageHeader: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6",
  
  // Section Header Pattern  
  sectionHeader: "flex items-center justify-between mb-4",
  
  // Stats Grid Pattern
  statsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
  
  // Card Grid Pattern
  cardGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
  
  // Form Pattern
  formContainer: spacingStandards.formSpacing,
  
  // Loading Pattern
  loadingContainer: "flex items-center justify-center h-64",
  loadingSpinner: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary",
  
  // Error Pattern
  errorContainer: "flex items-center justify-center h-64 text-center",
  
  // Empty State Pattern
  emptyState: "flex flex-col items-center justify-center h-64 text-center space-y-3",
} as const;

// ============================================================================
// Export all standards
// ============================================================================

export default {
  typography: typographyVariants,
  icons: iconVariants, 
  spacing: spacingStandards,
  cards: cardVariants,
  layout: layoutVariants,
  statusBadges: statusBadgeVariants,
  patterns: commonPatterns,
  utils: {
    getTypographyClasses,
    getIconClasses, 
    getCardClasses,
    getStatusBadgeClasses,
  }
};