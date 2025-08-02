/**
 * Standardized Page Header Component
 * Consistent layout and styling for page headers across the application
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { getTypographyClasses, commonPatterns } from '@/lib/ui-standards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
  children
}: PageHeaderProps) {
  return (
    <div className={cn(commonPatterns.pageHeader, className)}>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <h1 className={getTypographyClasses('page-title')}>{title}</h1>
          {badge && (
            <Badge variant={badge.variant || 'default'}>
              {badge.text}
            </Badge>
          )}
        </div>
        {description && (
          <p className={`${getTypographyClasses('muted')} max-w-2xl`}>
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn(commonPatterns.sectionHeader, className)}>
      <div>
        <h2 className={getTypographyClasses('section-header')}>{title}</h2>
        {description && (
          <p className={`${getTypographyClasses('muted')} mt-1`}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

interface SubsectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SubsectionHeader({
  title,
  description,
  actions,
  className
}: SubsectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <div>
        <h3 className={getTypographyClasses('subsection-header')}>{title}</h3>
        {description && (
          <p className={`${getTypographyClasses('muted')} mt-1`}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Export common header patterns
export const HeaderPatterns = {
  PageHeader,
  SectionHeader,
  SubsectionHeader,
};