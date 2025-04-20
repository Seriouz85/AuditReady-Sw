import { cn } from "@/lib/utils";
import { RequirementStatus } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface StatusBadgeProps {
  status: RequirementStatus;
  className?: string;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
}

export function StatusBadge({ 
  status, 
  className,
  size = "sm",
  showLabel = true
}: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const statusConfig = {
    "fulfilled": {
      label: t('assessment.status.fulfilled', 'Fulfilled'),
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      icon: "●"
    },
    "partially-fulfilled": {
      label: t('assessment.status.partial', 'Partially Fulfilled'),
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      icon: "◐"
    },
    "not-fulfilled": {
      label: t('assessment.status.notFulfilled', 'Not Fulfilled'),
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      icon: "○"
    },
    "not-applicable": {
      label: t('assessment.status.notApplicable', 'Not Applicable'),
      className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
      icon: "—"
    },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm"
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {!showLabel ? (
        <span className="font-bold">{config.icon}</span>
      ) : (
        config.label
      )}
    </span>
  );
}
