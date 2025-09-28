/**
 * Empty State Component
 * Reusable component for displaying empty states with optional actions
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  illustration?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
  size = 'md',
  illustration
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base'
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizes.container,
      className
    )}>
      {illustration || (Icon && (
        <div className="mb-4">
          <Icon className={cn(
            'text-muted-foreground/60',
            sizes.icon
          )} />
        </div>
      ))}
      
      <h3 className={cn(
        'font-semibold text-foreground mb-2',
        sizes.title
      )}>
        {title}
      </h3>
      
      <p className={cn(
        'text-muted-foreground mb-6 max-w-md',
        sizes.description
      )}>
        {description}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface SearchEmptyStateProps {
  searchTerm: string;
  onClearSearch?: () => void;
  className?: string;
  totalResults?: number;
}

export function SearchEmptyState({
  searchTerm,
  onClearSearch,
  className,
  totalResults = 0
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      title="No results found"
      description={
        searchTerm 
          ? `No items found matching "${searchTerm}". Try adjusting your search terms.`
          : totalResults === 0 
            ? "No items available yet."
            : "Adjust your filters to see more results."
      }
      action={
        searchTerm && onClearSearch 
          ? {
              label: "Clear search",
              onClick: onClearSearch,
              variant: "outline"
            }
          : undefined
      }
      className={className}
    />
  );
}

interface CollectionEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function CollectionEmptyState({
  title,
  description,
  actionLabel = "Get started",
  onAction,
  icon,
  className
}: CollectionEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon}
      action={
        onAction 
          ? {
              label: actionLabel,
              onClick: onAction
            }
          : undefined
      }
      className={className}
      size="lg"
    />
  );
}

// Export individual patterns for convenience
export const EmptyStatePatterns = {
  EmptyState,
  SearchEmptyState,
  CollectionEmptyState,
};