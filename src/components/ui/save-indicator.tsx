import React from 'react';
import { CheckCircle, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  isDemo?: boolean;
  className?: string;
  showText?: boolean;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  isDemo = false,
  className,
  showText = true
}) => {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Clock className="h-4 w-4 animate-pulse" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return isDemo ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />;
    }
  };

  const getText = () => {
    if (!showText) return null;
    
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return isDemo ? 'Saved locally' : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return isDemo ? 'Demo mode' : 'Ready';
    }
  };

  const getColor = () => {
    switch (status) {
      case 'saving':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'saved':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return isDemo ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm', getColor(), className)}>
      {getIcon()}
      {showText && <span>{getText()}</span>}
    </div>
  );
};