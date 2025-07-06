import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  isExpanded?: boolean;
  isLoading?: boolean;
  canExpand?: boolean;
  canRefresh?: boolean;
  canConfigure?: boolean;
  canHide?: boolean;
  onExpand?: () => void;
  onRefresh?: () => void;
  onConfigure?: () => void;
  onHide?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  subtitle,
  icon,
  children,
  isExpanded = false,
  isLoading = false,
  canExpand = true,
  canRefresh = false,
  canConfigure = false,
  canHide = false,
  onExpand,
  onRefresh,
  onConfigure,
  onHide,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  const hasActions = canExpand || canRefresh || canConfigure || canHide;

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-md
        ${isExpanded ? 'col-span-full' : ''}
        ${className}
      `}
    >
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 ${headerClassName}`}>
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {hasActions && (
          <div className="flex items-center space-x-2">
            {/* Quick action buttons */}
            {canRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {canExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* More actions menu */}
            {(canConfigure || canHide) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canConfigure && (
                    <DropdownMenuItem onClick={onConfigure}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </DropdownMenuItem>
                  )}
                  {canConfigure && canHide && <DropdownMenuSeparator />}
                  {canHide && (
                    <DropdownMenuItem onClick={onHide}>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Widget
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className={`${contentClassName}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};