import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RequirementWithStatus } from '@/services/requirements/RequirementsService';
import { toast } from '@/utils/toast';

interface RequirementUpdate {
  id: string;
  requirement_id: string;
  organization_id: string;
  status?: string;
  evidence_summary?: string;
  notes?: string;
  last_edited_by?: string;
  last_edited_at?: string;
  version?: number;
}

interface RequirementActivity {
  id: string;
  requirement_id: string;
  user_id: string;
  activity_type: string;
  old_value?: any;
  new_value?: any;
  description?: string;
  created_at: string;
}

interface RequirementCollaboration {
  id: string;
  requirement_id: string;
  user_id: string;
  action_type: 'viewing' | 'editing' | 'commenting';
  started_at: string;
  metadata?: any;
}

interface UseRequirementsRealTimeProps {
  organizationId: string;
  standardId?: string;
  enabled?: boolean;
}

interface UseRequirementsRealTimeReturn {
  requirements: RequirementWithStatus[];
  activeUsers: Map<string, RequirementCollaboration[]>;
  recentActivities: RequirementActivity[];
  isConnected: boolean;
  conflictedRequirements: Set<string>;
  startCollaboration: (requirementId: string, actionType: RequirementCollaboration['action_type']) => Promise<void>;
  endCollaboration: (requirementId: string) => Promise<void>;
  resolveConflict: (requirementId: string, resolution: 'keep_local' | 'keep_remote' | 'merge') => Promise<void>;
  refreshRequirements: () => Promise<void>;
}

export function useRequirementsRealTime({ 
  organizationId, 
  standardId,
  enabled = true 
}: UseRequirementsRealTimeProps): UseRequirementsRealTimeReturn {
  const { user, isDemo } = useAuth();
  const [requirements, setRequirements] = useState<RequirementWithStatus[]>([]);
  const [activeUsers, setActiveUsers] = useState<Map<string, RequirementCollaboration[]>>(new Map());
  const [recentActivities, setRecentActivities] = useState<RequirementActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conflictedRequirements, setConflictedRequirements] = useState<Set<string>>(new Set());
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const collaborationSessionRef = useRef<Map<string, string>>(new Map());

  // Handle real-time requirement updates
  const handleRequirementUpdate = useCallback((payload: any) => {
    const update = payload.new as RequirementUpdate;
    
    setRequirements(prev => {
      const existingIndex = prev.findIndex(req => 
        req.organization_requirement_id === update.id
      );
      
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        
        // Check for conflicts (version mismatch)
        if (existing.version !== undefined && 
            update.version !== undefined && 
            update.version > existing.version + 1) {
          setConflictedRequirements(prev => new Set([...prev, update.requirement_id]));
          toast.warning(`Requirement ${existing.code} has been modified by another user`);
        }
        
        // Update the requirement
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          status: update.status || existing.status,
          evidence_summary: update.evidence_summary || existing.evidence_summary,
          notes: update.notes || existing.notes,
          last_edited_by: update.last_edited_by,
          last_edited_at: update.last_edited_at,
          version: update.version || existing.version
        };
        
        return updated;
      }
      
      return prev;
    });
  }, []);

  // Handle real-time activity updates
  const handleActivityUpdate = useCallback((payload: any) => {
    const activity = payload.new as RequirementActivity;
    
    setRecentActivities(prev => {
      const newActivities = [activity, ...prev];
      // Keep only the last 50 activities
      return newActivities.slice(0, 50);
    });
    
    // Show notification for activities from other users
    if (activity.user_id !== user?.id) {
      const activityMessages = {
        'status_changed': 'updated the status',
        'evidence_added': 'added evidence',
        'notes_updated': 'updated notes',
        'assignee_changed': 'changed the assignee'
      };
      
      const message = activityMessages[activity.activity_type as keyof typeof activityMessages] || 'made changes';
      toast.info(`Another user ${message} for a requirement`);
    }
  }, [user?.id]);

  // Handle presence updates
  const handlePresenceUpdate = useCallback((payload: any) => {
    const collaborations = payload.new as RequirementCollaboration;
    
    setActiveUsers(prev => {
      const newMap = new Map(prev);
      const requirementCollabs = newMap.get(collaborations.requirement_id) || [];
      
      // Add or update collaboration
      const existingIndex = requirementCollabs.findIndex(c => c.user_id === collaborations.user_id);
      if (existingIndex >= 0) {
        requirementCollabs[existingIndex] = collaborations;
      } else {
        requirementCollabs.push(collaborations);
      }
      
      newMap.set(collaborations.requirement_id, requirementCollabs);
      return newMap;
    });
  }, []);

  // Start collaboration session
  const startCollaboration = useCallback(async (
    requirementId: string, 
    actionType: RequirementCollaboration['action_type']
  ) => {
    if (isDemo || !user) return;

    try {
      const { data, error } = await supabase
        .from('requirement_collaborations')
        .insert({
          organization_id: organizationId,
          requirement_id: requirementId,
          user_id: user.id,
          action_type: actionType,
          metadata: { timestamp: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;

      collaborationSessionRef.current.set(requirementId, data.id);
    } catch (error) {
      console.error('Error starting collaboration:', error);
    }
  }, [organizationId, user, isDemo]);

  // End collaboration session
  const endCollaboration = useCallback(async (requirementId: string) => {
    if (isDemo || !user) return;

    const sessionId = collaborationSessionRef.current.get(requirementId);
    if (!sessionId) return;

    try {
      await supabase
        .from('requirement_collaborations')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      collaborationSessionRef.current.delete(requirementId);
    } catch (error) {
      console.error('Error ending collaboration:', error);
    }
  }, [user, isDemo]);

  // Resolve conflicts
  const resolveConflict = useCallback(async (
    requirementId: string, 
    resolution: 'keep_local' | 'keep_remote' | 'merge'
  ) => {
    // Implementation for conflict resolution
    setConflictedRequirements(prev => {
      const newSet = new Set(prev);
      newSet.delete(requirementId);
      return newSet;
    });
    
    toast.success('Conflict resolved');
  }, []);

  // Refresh requirements from server
  const refreshRequirements = useCallback(async () => {
    if (isDemo) return;

    try {
      const { data, error } = await supabase
        .from('organization_requirements')
        .select(`
          *,
          requirement:requirements_library(
            id,
            code,
            title,
            description,
            category,
            sub_category,
            standard_id
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequirements: RequirementWithStatus[] = data.map(item => ({
        id: item.requirement.id,
        code: item.requirement.code,
        title: item.requirement.title,
        description: item.requirement.description,
        category: item.requirement.category,
        sub_category: item.requirement.sub_category,
        standard_id: item.requirement.standard_id,
        organization_requirement_id: item.id,
        status: item.status,
        evidence_summary: item.evidence_summary,
        notes: item.notes,
        last_edited_by: item.last_edited_by,
        last_edited_at: item.last_edited_at,
        version: item.version
      }));

      setRequirements(formattedRequirements);
    } catch (error) {
      console.error('Error refreshing requirements:', error);
    }
  }, [organizationId, isDemo]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enabled || isDemo || !organizationId || !user) {
      setIsConnected(false);
      return;
    }

    // Requirements updates channel
    channelRef.current = supabase
      .channel(`org_requirements_${organizationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'organization_requirements',
        filter: `organization_id=eq.${organizationId}`
      }, handleRequirementUpdate)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requirement_activities',
        filter: `organization_id=eq.${organizationId}`
      }, handleActivityUpdate)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requirement_collaborations',
        filter: `organization_id=eq.${organizationId}`
      }, handlePresenceUpdate)
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Initial data load
    refreshRequirements();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
      }
      
      // End all active collaborations
      collaborationSessionRef.current.forEach((sessionId, requirementId) => {
        endCollaboration(requirementId);
      });
    };
  }, [enabled, isDemo, organizationId, user, handleRequirementUpdate, handleActivityUpdate, handlePresenceUpdate, refreshRequirements, endCollaboration]);

  return {
    requirements,
    activeUsers,
    recentActivities,
    isConnected,
    conflictedRequirements,
    startCollaboration,
    endCollaboration,
    resolveConflict,
    refreshRequirements
  };
}