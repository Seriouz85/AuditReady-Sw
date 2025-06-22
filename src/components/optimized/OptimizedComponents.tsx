import React, { memo, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Optimized versions of frequently used components
 */

// Optimized Card component
export const OptimizedCard = memo(forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Card>
>(({ children, className, ...props }, ref) => (
  <Card ref={ref} className={className} {...props}>
    {children}
  </Card>
)));

OptimizedCard.displayName = 'OptimizedCard';

// Optimized Button component
export const OptimizedButton = memo(forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ children, onClick, disabled, variant, size, className, ...props }, ref) => (
  <Button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    variant={variant}
    size={size}
    className={className}
    {...props}
  >
    {children}
  </Button>
)));

OptimizedButton.displayName = 'OptimizedButton';

// Optimized Badge component
export const OptimizedBadge = memo<React.ComponentProps<typeof Badge>>(({ 
  children, 
  variant, 
  className,
  ...props 
}) => (
  <Badge variant={variant} className={className} {...props}>
    {children}
  </Badge>
));

OptimizedBadge.displayName = 'OptimizedBadge';

// Optimized List Item component
interface OptimizedListItemProps {
  id: string | number;
  title: string;
  description?: string;
  status?: string;
  onClick?: (id: string | number) => void;
  className?: string;
}

export const OptimizedListItem = memo<OptimizedListItemProps>(({ 
  id, 
  title, 
  description, 
  status, 
  onClick,
  className = ''
}) => (
  <div 
    className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${className}`}
    onClick={() => onClick?.(id)}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {status && (
        <OptimizedBadge variant="secondary">{status}</OptimizedBadge>
      )}
    </div>
  </div>
));

OptimizedListItem.displayName = 'OptimizedListItem';

// Optimized Table Row component
interface OptimizedTableRowProps {
  id: string | number;
  cells: React.ReactNode[];
  onClick?: (id: string | number) => void;
  className?: string;
}

export const OptimizedTableRow = memo<OptimizedTableRowProps>(({ 
  id, 
  cells, 
  onClick,
  className = ''
}) => (
  <tr 
    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={() => onClick?.(id)}
  >
    {cells.map((cell, index) => (
      <td key={index} className="px-4 py-2">
        {cell}
      </td>
    ))}
  </tr>
));

OptimizedTableRow.displayName = 'OptimizedTableRow';

// Optimized Status Card component
interface OptimizedStatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

export const OptimizedStatusCard = memo<OptimizedStatusCardProps>(({ 
  title, 
  value, 
  description, 
  trend,
  className = ''
}) => (
  <OptimizedCard className={className}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      )}
      {trend && (
        <div className={`text-xs ${
          trend === 'up' ? 'text-green-600' :
          trend === 'down' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} Trend
        </div>
      )}
    </CardContent>
  </OptimizedCard>
));

OptimizedStatusCard.displayName = 'OptimizedStatusCard';