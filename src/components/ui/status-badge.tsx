/**
 * Standardized Status Badge Component
 * Consistent status indicators across the application
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClasses, getIconClasses } from '@/lib/ui-standards';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Info,
  Minus,
  LucideIcon
} from 'lucide-react';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  icon?: LucideIcon | boolean;
  className?: string;
}

// Default icons for each status variant
const defaultIcons: Record<StatusVariant, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  neutral: Minus,
  primary: Info,
};

export function StatusBadge({ 
  variant, 
  children, 
  icon = true, 
  className 
}: StatusBadgeProps) {
  const IconComponent = typeof icon === 'boolean' 
    ? (icon ? defaultIcons[variant] : null)
    : icon;

  return (
    <span className={cn(getStatusBadgeClasses(variant), className)}>
      {IconComponent && (
        <IconComponent className={cn(getIconClasses('xs'), "mr-1")} />
      )}
      {children}
    </span>
  );
}

// Predefined status badges for common use cases
export const ComplianceStatusBadge = ({ status }: { status: 'fulfilled' | 'partially-fulfilled' | 'not-fulfilled' | 'not-applicable' }) => {
  const statusConfig = {
    'fulfilled': { variant: 'success' as const, text: 'Fulfilled' },
    'partially-fulfilled': { variant: 'warning' as const, text: 'Partially Fulfilled' },
    'not-fulfilled': { variant: 'danger' as const, text: 'Not Fulfilled' },
    'not-applicable': { variant: 'neutral' as const, text: 'Not Applicable' },
  };

  const config = statusConfig[status];
  return (
    <StatusBadge variant={config.variant}>
      {config.text}
    </StatusBadge>
  );
};

export const AssessmentStatusBadge = ({ status }: { status: 'completed' | 'in-progress' | 'not-started' | 'overdue' }) => {
  const statusConfig = {
    'completed': { variant: 'success' as const, text: 'Completed' },
    'in-progress': { variant: 'info' as const, text: 'In Progress' },
    'not-started': { variant: 'neutral' as const, text: 'Not Started' },
    'overdue': { variant: 'danger' as const, text: 'Overdue' },
  };

  const config = statusConfig[status];
  return (
    <StatusBadge variant={config.variant}>
      {config.text}
    </StatusBadge>
  );
};

export const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' | 'critical' }) => {
  const priorityConfig = {
    'low': { variant: 'neutral' as const, text: 'Low' },
    'medium': { variant: 'info' as const, text: 'Medium' },
    'high': { variant: 'warning' as const, text: 'High' },
    'critical': { variant: 'danger' as const, text: 'Critical' },
  };

  const config = priorityConfig[priority];
  return (
    <StatusBadge variant={config.variant}>
      {config.text}
    </StatusBadge>
  );
};