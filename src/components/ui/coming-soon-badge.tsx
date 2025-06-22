import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Construction, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComingSoonBadgeProps {
  variant?: 'coming-soon' | 'beta' | 'development';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({
  variant = 'coming-soon',
  size = 'sm',
  className
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'beta':
        return <Zap className="h-3 w-3" />;
      case 'development':
        return <Construction className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getText = () => {
    switch (variant) {
      case 'beta':
        return 'Beta';
      case 'development':
        return 'In Development';
      default:
        return 'Coming Soon';
    }
  };

  const getVariant = () => {
    switch (variant) {
      case 'beta':
        return 'secondary';
      case 'development':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant={getVariant() as any}
      className={cn(
        'flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        variant === 'coming-soon' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        variant === 'beta' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        variant === 'development' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        className
      )}
    >
      {getIcon()}
      {getText()}
    </Badge>
  );
};