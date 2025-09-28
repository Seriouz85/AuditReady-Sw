/**
 * Unified Card Component
 * Standardized card layouts with consistent patterns across the application
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface UnifiedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
}

export function UnifiedCard({
  title,
  description,
  children,
  icon: Icon,
  badge,
  actions,
  className,
  headerClassName,
  contentClassName,
  variant = 'default'
}: UnifiedCardProps) {
  const cardVariants = {
    default: '',
    bordered: 'border-2',
    elevated: 'shadow-lg',
    ghost: 'border-0 shadow-none bg-transparent'
  };

  return (
    <Card className={cn(cardVariants[variant], className)}>
      <CardHeader className={cn('pb-3', headerClassName)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge && (
                <Badge variant={badge.variant || 'default'} className="ml-2">
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: LucideIcon;
  className?: string;
  variant?: 'default' | 'colorful';
  color?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  className,
  variant = 'default',
  color = 'blue'
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-400 border-blue-500/20',
    green: 'from-green-600 to-green-400 border-green-500/20',
    purple: 'from-purple-600 to-purple-400 border-purple-500/20',
    orange: 'from-orange-600 to-orange-400 border-orange-500/20',
    red: 'from-red-600 to-red-400 border-red-500/20',
  };

  if (variant === 'colorful') {
    return (
      <Card className={cn(
        'bg-gradient-to-br border',
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue,
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{label}</p>
              <p className="text-white text-2xl font-bold mt-1">{value}</p>
              {change && (
                <p className={cn(
                  "text-xs mt-1",
                  change.type === 'increase' ? 'text-white/90' : 'text-white/70'
                )}>
                  {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
                  {change.period && ` ${change.period}`}
                </p>
              )}
            </div>
            {Icon && (
              <Icon className="w-8 h-8 text-white/60" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{label}</p>
            <p className="text-foreground text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={cn(
                "text-xs mt-1",
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              )}>
                {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
                {change.period && ` ${change.period}`}
              </p>
            )}
          </div>
          {Icon && (
            <Icon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  actions: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  icon?: LucideIcon;
  className?: string;
  variant?: 'default' | 'outlined' | 'minimal';
}

export function ActionCard({
  title,
  description,
  actions,
  icon: Icon,
  className,
  variant = 'default'
}: ActionCardProps) {
  const variants = {
    default: '',
    outlined: 'border-2 border-dashed',
    minimal: 'border-0 shadow-none bg-muted/30'
  };

  return (
    <Card className={cn(variants[variant], className)}>
      <CardContent className="p-6 text-center">
        {Icon && (
          <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
          {description}
        </p>
        <div className="flex gap-2 justify-center">
          {actions.secondary && (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.secondary.onClick}
            >
              {actions.secondary.label}
            </Button>
          )}
          {actions.primary && (
            <Button
              size="sm"
              onClick={actions.primary.onClick}
            >
              {actions.primary.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function FeatureCard({
  title,
  description,
  features,
  badge,
  action,
  className
}: FeatureCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {badge && (
            <Badge variant={badge.variant || 'default'}>
              {badge.text}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {action && (
          <Button
            onClick={action.onClick}
            className="w-full"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Export card patterns for convenience
export const CardPatterns = {
  UnifiedCard,
  StatCard,
  ActionCard,
  FeatureCard,
};