import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ConfidenceLevel } from '@/types/applications';

interface ConfidenceLevelIndicatorProps {
  confidenceLevel: ConfidenceLevel;
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const confidenceConfig = {
  high: {
    value: 85,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'High Confidence',
    description: 'AI assessment shows strong evidence supporting this requirement status with multiple validation sources.',
    badgeVariant: 'default' as const,
  },
  medium: {
    value: 60,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertTriangle,
    label: 'Medium Confidence',
    description: 'AI assessment has moderate confidence. Manual review recommended to validate findings.',
    badgeVariant: 'secondary' as const,
  },
  low: {
    value: 35,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
    label: 'Low Confidence',
    description: 'AI assessment has limited confidence. Manual verification required before accepting this status.',
    badgeVariant: 'destructive' as const,
  },
};

const sizeConfig = {
  sm: {
    progressHeight: 'h-1',
    iconSize: 12,
    textSize: 'text-xs',
    badgeSize: 'text-xs px-1.5 py-0.5',
  },
  md: {
    progressHeight: 'h-2',
    iconSize: 14,
    textSize: 'text-sm',
    badgeSize: 'text-xs px-2 py-1',
  },
  lg: {
    progressHeight: 'h-3',
    iconSize: 16,
    textSize: 'text-base',
    badgeSize: 'text-sm px-3 py-1',
  },
};

export const ConfidenceLevelIndicator: React.FC<ConfidenceLevelIndicatorProps> = ({
  confidenceLevel,
  showLabel = true,
  showTooltip = true,
  size = 'md',
  className = '',
}) => {
  const config = confidenceConfig[confidenceLevel];
  const sizeProps = sizeConfig[size];
  const Icon = config.icon;

  const ProgressBar = () => (
    <div className="flex items-center space-x-2 flex-1">
      <div className="flex-1">
        <Progress 
          value={config.value} 
          className={`${sizeProps.progressHeight} ${className}`}
          style={{
            '--progress-background': config.color,
          } as React.CSSProperties}
        />
      </div>
      <span className={`${sizeProps.textSize} font-medium ${config.textColor} min-w-[2rem] text-right`}>
        {config.value}%
      </span>
    </div>
  );

  const IndicatorContent = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon 
        size={sizeProps.iconSize} 
        className={config.textColor}
      />
      
      {showLabel && size !== 'sm' && (
        <div className="flex flex-col space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <Badge 
              variant={config.badgeVariant}
              className={`${sizeProps.badgeSize} ${config.bgColor} ${config.textColor} ${config.borderColor}`}
            >
              {config.label}
            </Badge>
          </div>
          <ProgressBar />
        </div>
      )}
      
      {showLabel && size === 'sm' && (
        <Badge 
          variant={config.badgeVariant}
          className={`${sizeProps.badgeSize} ${config.bgColor} ${config.textColor} ${config.borderColor}`}
        >
          {config.label}
        </Badge>
      )}
      
      {!showLabel && (
        <ProgressBar />
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <IndicatorContent />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon size={14} className={config.textColor} />
                <span className="font-medium">{config.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {config.description}
              </p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Info size={10} />
                <span>Confidence Score: {config.value}%</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <IndicatorContent />;
};

// Compact version for table cells and inline usage
export const CompactConfidenceIndicator: React.FC<{
  confidenceLevel: ConfidenceLevel;
  className?: string;
}> = ({ confidenceLevel, className = '' }) => {
  const config = confidenceConfig[confidenceLevel];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center space-x-1 cursor-help ${className}`}>
            <Icon size={12} className={config.textColor} />
            <span className={`text-xs font-medium ${config.textColor}`}>
              {config.value}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <div className="font-medium">{config.label}</div>
            <div className="text-muted-foreground mt-1">
              AI Confidence: {config.value}%
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConfidenceLevelIndicator;