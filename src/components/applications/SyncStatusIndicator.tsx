import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Calendar,
  Database,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { SyncStatus, AzureSyncMetadata } from '@/types/applications';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusIndicatorProps {
  syncMetadata: AzureSyncMetadata;
  showDetails?: boolean;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRefreshSync?: () => void;
  onViewDetails?: () => void;
}

const syncStatusConfig = {
  synced: {
    icon: CheckCircle,
    label: 'Synced',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeVariant: 'default' as const,
    description: 'Successfully synchronized with Azure resources',
  },
  pending: {
    icon: Clock,
    label: 'Sync Pending',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeVariant: 'secondary' as const,
    description: 'Synchronization is in progress',
  },
  error: {
    icon: XCircle,
    label: 'Sync Error',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeVariant: 'destructive' as const,
    description: 'Synchronization failed - requires attention',
  },
  not_synced: {
    icon: AlertCircle,
    label: 'Not Synced',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeVariant: 'outline' as const,
    description: 'No synchronization configured',
  },
};

const sizeConfig = {
  sm: {
    iconSize: 12,
    textSize: 'text-xs',
    badgeSize: 'text-xs px-1.5 py-0.5',
  },
  md: {
    iconSize: 14,
    textSize: 'text-sm',
    badgeSize: 'text-xs px-2 py-1',
  },
  lg: {
    iconSize: 16,
    textSize: 'text-base',
    badgeSize: 'text-sm px-3 py-1',
  },
};

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncMetadata,
  showDetails = false,
  showActions = false,
  size = 'md',
  className = '',
  onRefreshSync,
  onViewDetails,
}) => {
  const config = syncStatusConfig[syncMetadata.syncStatus];
  const sizeProps = sizeConfig[size];
  const Icon = config.icon;

  const formatSyncTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const BasicIndicator = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon 
        size={sizeProps.iconSize} 
        className={config.color}
      />
      <Badge 
        variant={config.badgeVariant}
        className={`${sizeProps.badgeSize} ${config.bgColor} ${config.color} ${config.borderColor}`}
      >
        {config.label}
      </Badge>
      {size !== 'sm' && (
        <span className={`${sizeProps.textSize} text-muted-foreground`}>
          {formatSyncTime(syncMetadata.lastSyncDate)}
        </span>
      )}
    </div>
  );

  const DetailedIndicator = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon size={16} className={config.color} />
          <Badge 
            variant={config.badgeVariant}
            className={`${config.bgColor} ${config.color} ${config.borderColor}`}
          >
            {config.label}
          </Badge>
        </div>
        {showActions && (
          <div className="flex items-center space-x-2">
            {onRefreshSync && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRefreshSync}
                className="h-7 px-2"
                disabled={syncMetadata.syncStatus === 'pending'}
              >
                <RefreshCw size={12} className={syncMetadata.syncStatus === 'pending' ? 'animate-spin' : ''} />
                Sync Now
              </Button>
            )}
            {onViewDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onViewDetails}
                className="h-7 px-2"
              >
                <ExternalLink size={12} />
                View Details
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Calendar size={12} />
            <span>Last Sync</span>
          </div>
          <div className="font-medium">
            {formatSyncTime(syncMetadata.lastSyncDate)}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Database size={12} />
            <span>Data Source</span>
          </div>
          <div className="font-medium text-xs">
            {syncMetadata.dataSource}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-muted-foreground">Frequency</div>
          <div className="font-medium capitalize">
            {syncMetadata.syncFrequency}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-muted-foreground">Version</div>
          <div className="font-medium">
            {syncMetadata.syncVersion}
          </div>
        </div>
      </div>

      {syncMetadata.syncStatus === 'error' && syncMetadata.syncErrors && syncMetadata.syncErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <div className="font-medium mb-1">Sync Errors:</div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {syncMetadata.syncErrors.slice(0, 3).map((error, index) => (
                <li key={index}>
                  {typeof error === 'string' ? error : error.message}
                </li>
              ))}
              {syncMetadata.syncErrors.length > 3 && (
                <li className="text-muted-foreground">
                  +{syncMetadata.syncErrors.length - 3} more errors
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center space-x-4">
          <span>{syncMetadata.autoAnsweredRequirements} auto-answered</span>
          <span>{syncMetadata.manualOverrides} overrides</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>Resource Group:</span>
          <code className="bg-muted px-1 py-0.5 rounded text-xs">
            {syncMetadata.azureResourceGroup}
          </code>
        </div>
      </div>
    </div>
  );

  if (showDetails) {
    return <DetailedIndicator />;
  }

  // Show tooltip with basic information
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <BasicIndicator />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon size={14} className={config.color} />
              <span className="font-medium">{config.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Last Sync</div>
                <div className="font-medium">{formatSyncTime(syncMetadata.lastSyncDate)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Frequency</div>
                <div className="font-medium capitalize">{syncMetadata.syncFrequency}</div>
              </div>
            </div>
            {syncMetadata.syncStatus === 'error' && (
              <div className="text-xs text-red-600">
                {syncMetadata.syncErrors?.length || 0} sync error(s)
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Compact version for table cells
export const CompactSyncIndicator: React.FC<{
  syncStatus: SyncStatus;
  lastSyncDate: string;
  hasErrors?: boolean;
  className?: string;
}> = ({ syncStatus, lastSyncDate, hasErrors = false, className = '' }) => {
  const config = syncStatusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center space-x-1 cursor-help ${className}`}>
            <Icon size={12} className={config.color} />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {hasErrors && (
              <AlertTriangle size={10} className="text-red-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <div className="font-medium">{config.label}</div>
            <div className="text-muted-foreground mt-1">
              Last sync: {formatDistanceToNow(new Date(lastSyncDate), { addSuffix: true })}
            </div>
            {hasErrors && (
              <div className="text-red-600 mt-1">Has sync errors</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;