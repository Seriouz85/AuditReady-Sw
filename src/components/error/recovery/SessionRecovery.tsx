/**
 * Session Recovery Component
 * Handles session restoration and data persistence during errors
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  RefreshCw, 
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  HardDrive
} from 'lucide-react';

interface SessionData {
  id: string;
  timestamp: string;
  route: string;
  formData?: Record<string, any>;
  scrollPosition?: { x: number; y: number };
  userState?: Record<string, any>;
  applicationState?: Record<string, any>;
  errorContext?: {
    error: string;
    component: string;
    stack?: string;
  };
}

interface SessionRecoveryProps {
  onRestore?: (sessionData: SessionData) => Promise<void>;
  onDiscard?: () => void;
  className?: string;
}

export function SessionRecovery({ onRestore, onDiscard, className = "" }: SessionRecoveryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [availableSessions, setAvailableSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  React.useEffect(() => {
    loadAvailableSessions();
  }, []);

  const loadAvailableSessions = useCallback(() => {
    try {
      const stored = localStorage.getItem('recovery_sessions');
      if (stored) {
        const sessions: SessionData[] = JSON.parse(stored);
        // Filter sessions from last 24 hours
        const recent = sessions.filter(session => {
          const sessionTime = new Date(session.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);
          return hoursDiff < 24;
        });
        setAvailableSessions(recent);
        
        // Auto-select most recent session
        if (recent.length > 0) {
          setSelectedSession(recent[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load recovery sessions:', error);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    if (!selectedSession || !onRestore) return;

    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session) return;

    setIsLoading(true);
    setRestoreProgress(0);

    try {
      // Simulate progress steps
      const steps = [
        { progress: 20, message: 'Validating session data...' },
        { progress: 40, message: 'Restoring form data...' },
        { progress: 60, message: 'Restoring application state...' },
        { progress: 80, message: 'Restoring navigation state...' },
        { progress: 100, message: 'Finalizing recovery...' }
      ];

      for (const step of steps) {
        setRestoreProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await onRestore(session);
      
      // Clean up restored session
      const remaining = availableSessions.filter(s => s.id !== selectedSession);
      localStorage.setItem('recovery_sessions', JSON.stringify(remaining));
      
    } catch (error) {
      console.error('Session restore failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setRestoreProgress(0);
    }
  }, [selectedSession, availableSessions, onRestore]);

  const handleDiscard = useCallback(() => {
    if (selectedSession) {
      const remaining = availableSessions.filter(s => s.id !== selectedSession);
      localStorage.setItem('recovery_sessions', JSON.stringify(remaining));
      setAvailableSessions(remaining);
      setSelectedSession(remaining.length > 0 ? remaining[0].id : null);
    }
    onDiscard?.();
  }, [selectedSession, availableSessions, onDiscard]);

  const handleDiscardAll = useCallback(() => {
    localStorage.removeItem('recovery_sessions');
    setAvailableSessions([]);
    setSelectedSession(null);
    onDiscard?.();
  }, [onDiscard]);

  const handleExportSession = useCallback(() => {
    if (!selectedSession) return;

    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session) return;

    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-recovery-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedSession, availableSessions]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffHours * 60);
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  const getSessionSummary = (session: SessionData) => {
    const items = [];
    if (session.formData && Object.keys(session.formData).length > 0) {
      items.push(`${Object.keys(session.formData).length} form fields`);
    }
    if (session.userState) {
      items.push('user preferences');
    }
    if (session.applicationState) {
      items.push('app state');
    }
    return items.length > 0 ? items.join(', ') : 'basic session data';
  };

  if (availableSessions.length === 0) {
    return (
      <Card className={`border-gray-200 bg-gray-50 ${className}`}>
        <CardContent className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">No recovery sessions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-blue-800">Session Recovery</CardTitle>
            <p className="text-sm text-blue-600">
              {availableSessions.length} recovery session{availableSessions.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress indicator during restore */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Restoring session...</span>
              <span>{restoreProgress}%</span>
            </div>
            <Progress value={restoreProgress} className="h-2" />
          </div>
        )}

        {/* Session selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-blue-800">Available Sessions:</h4>
          
          {availableSessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedSession === session.id
                  ? 'border-blue-300 bg-blue-100'
                  : 'border-blue-200 bg-white hover:bg-blue-50'
              }`}
              onClick={() => setSelectedSession(session.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {session.route}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(session.timestamp)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    Contains: {getSessionSummary(session)}
                  </p>
                  
                  {session.errorContext && (
                    <div className="mt-2">
                      <Alert className="py-2">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription className="text-xs">
                          Error in {session.errorContext.component}: {session.errorContext.error}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
                
                {selectedSession === session.id && (
                  <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            onClick={handleRestore}
            disabled={!selectedSession || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Restore Session
              </>
            )}
          </Button>

          <Button
            onClick={handleDiscard}
            variant="outline"
            disabled={!selectedSession || isLoading}
            className="w-full"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Discard Selected
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-blue-200">
          <Button
            onClick={handleExportSession}
            variant="ghost"
            size="sm"
            disabled={!selectedSession}
            className="flex-1 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export Session
          </Button>

          <Button
            onClick={handleDiscardAll}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="flex-1 text-xs text-red-600 hover:text-red-700"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Discard All
          </Button>
        </div>

        <Alert className="border-blue-200 bg-blue-100">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Privacy Notice</AlertTitle>
          <AlertDescription className="text-blue-700 text-xs">
            Recovery sessions are stored locally on your device and automatically expire after 24 hours.
            No sensitive data is included in recovery sessions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Hook for managing session recovery
export function useSessionRecovery() {
  const saveSession = useCallback((
    sessionData: Partial<SessionData>,
    context?: { error: string; component: string; stack?: string }
  ) => {
    try {
      const session: SessionData = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        route: window.location.pathname + window.location.search,
        scrollPosition: { x: window.scrollX, y: window.scrollY },
        errorContext: context,
        ...sessionData
      };

      const existing = JSON.parse(localStorage.getItem('recovery_sessions') || '[]');
      const updated = [session, ...existing].slice(0, 10); // Keep max 10 sessions
      
      localStorage.setItem('recovery_sessions', JSON.stringify(updated));
      
      return session.id;
    } catch (error) {
      console.error('Failed to save recovery session:', error);
      return null;
    }
  }, []);

  const hasRecoverySessions = useCallback(() => {
    try {
      const sessions = JSON.parse(localStorage.getItem('recovery_sessions') || '[]');
      return sessions.length > 0;
    } catch {
      return false;
    }
  }, []);

  const clearAllSessions = useCallback(() => {
    localStorage.removeItem('recovery_sessions');
  }, []);

  return {
    saveSession,
    hasRecoverySessions,
    clearAllSessions
  };
}