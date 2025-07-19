import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tag, 
  GitBranch, 
  Calendar, 
  Package,
  Info,
  ChevronRight
} from 'lucide-react';

// Import package.json version
const packageInfo = {
  version: '1.1.0',
  name: 'audit-readiness-hub'
};

interface VersionInfoProps {
  compact?: boolean;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ compact = false }) => {
  const buildInfo = {
    version: packageInfo.version,
    buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
    commit: import.meta.env.VITE_COMMIT_SHA || 'development',
    branch: import.meta.env.VITE_BRANCH || 'main',
    environment: import.meta.env.MODE || 'development'
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Package className="w-4 h-4" />
        <span>v{buildInfo.version}</span>
        <Badge variant="outline" className="text-xs">
          {buildInfo.environment}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Version Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="w-4 h-4 mr-2" />
              Version
            </div>
            <div className="font-semibold">v{buildInfo.version}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <GitBranch className="w-4 h-4 mr-2" />
              Branch
            </div>
            <div className="font-mono text-sm">{buildInfo.branch}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Build Date
            </div>
            <div className="text-sm">
              {new Date(buildInfo.buildDate).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="w-4 h-4 mr-2" />
              Environment
            </div>
            <Badge variant={buildInfo.environment === 'production' ? 'default' : 'secondary'}>
              {buildInfo.environment}
            </Badge>
          </div>
        </div>

        {buildInfo.commit !== 'development' && (
          <div className="pt-2 border-t">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              Commit SHA
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {buildInfo.commit.substring(0, 7)}
            </code>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full">
            View Release Notes
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};