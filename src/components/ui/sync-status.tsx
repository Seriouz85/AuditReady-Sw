import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  WifiOff, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { SyncStatus } from '@/services/assessments/DatabaseAssessmentService';

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus;
  onRetry?: () => Promise<void>;
  className?: string;
  showDetails?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncStatus,
  onRetry,
  className,
  showDetails = true
}) => {
  const getSyncStatusInfo = () => {
    if (!syncStatus.isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        variant: 'secondary' as const,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100'
      };
    }

    if (syncStatus.isSyncing) {
      return {
        icon: Loader2,
        text: 'Syncing...',
        variant: 'secondary' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        animate: 'animate-spin'
      };
    }

    if (syncStatus.syncError) {
      return {
        icon: AlertCircle,
        text: 'Sync failed',
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }

    if (syncStatus.hasPendingChanges) {
      return {
        icon: Clock,
        text: 'Pending sync',
        variant: 'secondary' as const,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    }

    return {
      icon: CheckCircle2,
      text: 'Synced',
      variant: 'secondary' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  };

  const statusInfo = getSyncStatusInfo();
  const IconComponent = statusInfo.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={statusInfo.variant}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1",
          statusInfo.bgColor,
          statusInfo.color,
          "border border-current/20"
        )}
      >
        <IconComponent 
          size={12} 
          className={cn(
            statusInfo.color,
            statusInfo.animate
          )} 
        />
        <span className="text-xs font-medium">{statusInfo.text}</span>
      </Badge>

      {showDetails && (
        <>
          {syncStatus.syncError && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw size={12} className="mr-1" />
              Retry
            </Button>
          )}

          {syncStatus.lastSyncAt && !syncStatus.syncError && (
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(syncStatus.lastSyncAt).toLocaleTimeString()}
            </span>
          )}
        </>
      )}
    </div>
  );
};

interface SyncStatusBannerProps {
  syncStatus: SyncStatus;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  syncStatus,
  onRetry,
  onDismiss
}) => {
  // Only show banner for important status updates
  if (!syncStatus.syncError && !(!syncStatus.isOnline && syncStatus.hasPendingChanges)) {
    return null;
  }

  const getStatusInfo = () => {
    if (!syncStatus.isOnline && syncStatus.hasPendingChanges) {
      return {
        icon: WifiOff,
        title: 'You are offline',
        message: 'Your changes are saved locally and will sync when you reconnect.',
        variant: 'warning' as const,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800'
      };
    }

    if (syncStatus.syncError) {
      return {
        icon: AlertCircle,
        title: 'Sync failed',
        message: syncStatus.syncError,
        variant: 'error' as const,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const IconComponent = statusInfo.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-lg border",
      statusInfo.bgColor,
      statusInfo.borderColor,
      statusInfo.textColor
    )}>
      <IconComponent size={20} className="flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{statusInfo.title}</h4>
        <p className="text-sm opacity-90 mt-1">{statusInfo.message}</p>
      </div>

      <div className="flex items-center gap-2">
        {syncStatus.syncError && onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="bg-white/50 hover:bg-white/80"
          >
            <RefreshCw size={14} className="mr-1" />
            Retry Sync
          </Button>
        )}
        
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-current opacity-70 hover:opacity-100"
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};

interface SyncProgressProps {
  isSyncing: boolean;
  progress?: number;
  message?: string;
}

export const SyncProgress: React.FC<SyncProgressProps> = ({
  isSyncing,
  progress,
  message = "Syncing changes..."
}) => {
  if (!isSyncing) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Loader2 size={16} className="text-blue-600 animate-spin flex-shrink-0" />
      
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-800">{message}</p>
        
        {progress !== undefined && (
          <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};