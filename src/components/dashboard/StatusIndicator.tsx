import React from 'react';

interface StatusIndicatorProps {
  color: string;
  label: string;
  value: number;
  percentage: number;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function StatusIndicator({
  color,
  label,
  value,
  percentage,
  isActive,
  onMouseEnter,
  onMouseLeave
}: StatusIndicatorProps) {
  return (
    <div 
      className={`flex items-center p-3 rounded-lg transition-all border border-transparent
        hover:bg-slate-50 dark:hover:bg-slate-800
        hover:border-slate-200 dark:hover:border-slate-700
        hover:translate-x-1 cursor-pointer
        ${isActive ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 translate-x-1 shadow-md' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: color }} />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">({percentage}%)</span>
        </div>
      </div>
    </div>
  );
} 