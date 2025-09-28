import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock } from 'lucide-react';
import { formatDate } from '../shared/AdminUtilities';
import type { StandardSummary } from '../shared/AdminSharedTypes';

interface StandardsManagementProps {
  standards: StandardSummary[];
  loading: boolean;
  onCreateStandard: () => void;
  onViewStandard: (standardId: string) => void;
}

export const StandardsManagement: React.FC<StandardsManagementProps> = ({
  standards,
  loading,
  onCreateStandard,
  onViewStandard
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Standards Library</h2>
            <p className="text-muted-foreground">Manage compliance standards and frameworks</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Standards Library</h2>
          <p className="text-muted-foreground">Manage compliance standards and frameworks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onCreateStandard} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Add Standard
          </Button>
        </div>
      </div>

      {standards.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Standards Found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first compliance standard to get started.
            </p>
            <Button 
              onClick={onCreateStandard} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Add Your First Standard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {standards.map((standard) => (
            <Card key={standard.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{standard.name}</CardTitle>
                    <CardDescription>
                      Version {standard.version} • {standard.type}
                      {standard.requirementCount > 0 && (
                        <span> • {standard.requirementCount} requirements</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{standard.organizationCount} organizations</div>
                      <div>Updated {formatDate(standard.lastUpdated)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Created {formatDate(standard.lastUpdated)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewStandard(standard.id)}
                    >
                      View Requirements
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewStandard(standard.id)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};