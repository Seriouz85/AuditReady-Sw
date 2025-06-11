import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';

interface TableStatus {
  name: string;
  accessible: boolean;
  error?: string;
}

export const DatabaseStatus: React.FC = () => {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const requiredTables = [
    'organizations',
    'organization_users',
    'standards',
    'standards_library',
    'requirements_library',
    'assessments',
    'audit_logs',
    'platform_administrators'
  ];

  const checkTableAccess = async (tableName: string): Promise<TableStatus> => {
    try {
      const { error } = await supabaseAdmin
        .from(tableName)
        .select('count')
        .limit(1);
      
      return {
        name: tableName,
        accessible: !error,
        error: error?.message
      };
    } catch (error) {
      return {
        name: tableName,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkDatabaseStatus = async () => {
    setLoading(true);
    setConnectionStatus('checking');
    
    try {
      // Test basic connection
      const { error: connectionError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (connectionError) {
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }

      // Check each required table
      const statuses = await Promise.all(
        requiredTables.map(table => checkTableAccess(table))
      );
      
      setTableStatuses(statuses);
    } catch (error) {
      console.error('Database status check failed:', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const accessibleTables = tableStatuses.filter(t => t.accessible).length;
  const totalTables = tableStatuses.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Status</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkDatabaseStatus}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
        <CardDescription>
          Supabase database connectivity and table access status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <span className="font-medium">Connection:</span>
          {connectionStatus === 'checking' && (
            <Badge variant="secondary">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Checking...
            </Badge>
          )}
          {connectionStatus === 'connected' && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
          {connectionStatus === 'error' && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Connection Error
            </Badge>
          )}
        </div>

        {/* Tables Summary */}
        <div className="flex items-center gap-3">
          <span className="font-medium">Tables:</span>
          <Badge variant={accessibleTables === totalTables ? "default" : "secondary"}>
            {accessibleTables}/{totalTables} accessible
          </Badge>
        </div>

        {/* Individual Table Status */}
        <div className="grid grid-cols-2 gap-2">
          {tableStatuses.map((table) => (
            <div
              key={table.name}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <span className="text-sm font-mono">{table.name}</span>
              {table.accessible ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" title={table.error} />
              )}
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        {accessibleTables < totalTables && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Database Setup Required</p>
                <p className="text-amber-700 mt-1">
                  Some database tables are missing or inaccessible. Run the Supabase migrations to create the required tables:
                </p>
                <code className="block mt-2 p-2 bg-amber-100 rounded text-xs">
                  npx supabase db reset --local
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};