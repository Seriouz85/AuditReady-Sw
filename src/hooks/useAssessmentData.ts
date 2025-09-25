import { useState, useMemo, useEffect, useCallback } from 'react';
import { Assessment, Requirement, RequirementStatus, Standard, StandardType } from '@/types';
import { standards as allStandards } from '@/data/mockData';
import { assessmentProgressService, AssessmentStats } from '@/services/assessments/AssessmentProgressService';
import { databaseAssessmentService, DatabaseSyncResult, SyncStatus } from '@/services/assessments/DatabaseAssessmentService';
import { StandardsService } from '@/services/standards/StandardsService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';

// Remove duplicate interface as it's now imported from the service

interface UseAssessmentDataReturn {
  assessment: Assessment;
  requirements: Requirement[];
  filteredRequirements: Requirement[];
  standards: Standard[];
  stats: AssessmentStats;
  activeStandardId: string | undefined;
  setActiveStandardId: (id: string | undefined) => void;
  updateRequirementStatus: (reqId: string, newStatus: RequirementStatus) => Promise<void>;
  updateAssessment: (updates: Partial<Assessment>) => Promise<void>;
  groupRequirementsBySection: () => Record<string, Requirement[]>;
  syncStatus: SyncStatus;
  retryFailedSync: () => Promise<void>;
  hasPendingChanges: boolean;
}

export function useAssessmentData(initialAssessment: Assessment): UseAssessmentDataReturn {
  const { isDemo: _isDemo } = useAuth();
  const [assessment, setAssessment] = useState<Assessment>({...initialAssessment});
  const [assessmentRequirements, setAssessmentRequirements] = useState<Requirement[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [activeStandardId, setActiveStandardId] = useState<string | undefined>(
    initialAssessment.standardIds.length === 1 ? initialAssessment.standardIds[0] : undefined
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    syncError: null,
    hasPendingChanges: false,
    isOnline: navigator.onLine
  });
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  // Initialize requirements from database (for all accounts including demo in assessment flow)
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        console.log('Loading requirements from database for standards:', initialAssessment.standardIds);
        const requirements = await assessmentProgressService.getRequirementsWithStoredStatusesAsync(initialAssessment);
        
        console.log(`Loaded ${requirements.length} requirements for assessment ${initialAssessment.id}`);
        console.log('Standards breakdown:', requirements.reduce((acc, req) => {
          acc[req.standardId] = (acc[req.standardId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        setAssessmentRequirements(requirements);
      } catch (error) {
        console.error('Error fetching requirements:', error);
        // Final fallback to mock data with stored statuses
        const requirements = assessmentProgressService.getRequirementsWithStoredStatuses(initialAssessment);
        setAssessmentRequirements(requirements);
      }
    };

    fetchRequirements();
  }, [initialAssessment]);
  
  // Fetch standards from database (for all accounts including demo in assessment flow)
  useEffect(() => {
    const fetchStandards = async () => {
      try {
        // Create instance of StandardsService
        const standardsService = new StandardsService();
        
        // Fetch all available standards from database
        const availableStandards = await standardsService.getAvailableStandards();
        
        // Filter to only include standards that are part of this assessment
        const assessmentStandards = availableStandards.filter(s => 
          assessment.standardIds.includes(s.id)
        );
        
        setStandards(assessmentStandards);
      } catch (error) {
        console.error('Error fetching standards from database:', error);
        // Fallback to mock data if database fetch fails
        const fallbackStandards = allStandards.filter(s => assessment.standardIds.includes(s.id));
        
        // If no mock standards match either, create minimal standard objects
        if (fallbackStandards.length === 0 && assessment.standardIds.length > 0) {
          const minimalStandards = assessment.standardIds.map(id => ({
            id,
            name: `Standard ${id.substring(0, 8)}...`,
            version: 'Unknown',
            description: 'Standard details not available',
            category: 'General',
            requirements: [],
            type: 'compliance' as StandardType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setStandards(minimalStandards as Standard[]);
        } else {
          setStandards(fallbackStandards);
        }
      }
    };

    if (assessment.standardIds.length > 0) {
      fetchStandards();
    }
  }, [assessment.standardIds]);
  
  // Filter requirements based on active standard if selected
  const filteredRequirements = useMemo(() => {
    return activeStandardId 
      ? assessmentRequirements.filter(req => req.standardId === activeStandardId)
      : assessmentRequirements;
  }, [assessmentRequirements, activeStandardId]);
  
  // Calculate stats using the progress service
  const stats = useMemo(() => {
    return assessmentProgressService.calculateAssessmentStats(filteredRequirements);
  }, [filteredRequirements]);
  
  // Update requirement status with database-first approach and proper error handling
  const updateRequirementStatus = useCallback(async (reqId: string, newStatus: RequirementStatus) => {
    const operationId = `${reqId}-${Date.now()}`;
    
    try {
      // Add to pending operations
      setPendingOperations(prev => new Set(prev).add(operationId));
      setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

      // Optimistically update local state first for immediate UI response
      const previousRequirements = assessmentRequirements;
      setAssessmentRequirements(prev => 
        prev.map(req => req.id === reqId ? { ...req, status: newStatus } : req)
      );
      
      // Calculate stats from the optimistically updated requirements
      const optimisticRequirements = assessmentRequirements.map(req => 
        req.id === reqId ? { ...req, status: newStatus } : req
      );
      const quickStats = assessmentProgressService.calculateAssessmentStats(optimisticRequirements);
      
      // Update assessment progress immediately
      setAssessment(prev => ({
        ...prev,
        progress: quickStats.progress,
        updatedAt: new Date().toISOString(),
      }));

      // Persist to database with proper error handling
      const result: DatabaseSyncResult = await databaseAssessmentService.updateRequirementStatus(
        assessment.id, 
        reqId, 
        newStatus
      );

      if (result.success) {
        // Success - update sync status
        setSyncStatus(prev => ({
          ...prev,
          lastSyncAt: new Date(),
          syncError: null
        }));
        
        // Also update localStorage as backup (but database is primary)
        assessmentProgressService.updateRequirementStatus(assessment.id, reqId, newStatus);
        
        toast.success('Requirement status updated', { duration: 2000 });
      } else {
        // Database update failed - revert optimistic changes
        console.error('Database sync failed:', result.error);
        
        setAssessmentRequirements(previousRequirements);
        setAssessment(prev => ({
          ...prev,
          progress: assessmentProgressService.calculateAssessmentStats(previousRequirements).progress,
        }));

        setSyncStatus(prev => ({
          ...prev,
          syncError: result.error || 'Failed to save changes',
          hasPendingChanges: true
        }));

        if (result.error?.includes('Offline')) {
          toast.warning('You are offline. Changes will be saved when connection is restored.');
        } else {
          toast.error(`Failed to save: ${result.error}. Click retry to try again.`);
        }
      }
      
    } catch (error) {
      console.error('Unexpected error updating requirement status:', error);
      
      // Revert optimistic update on error
      setAssessmentRequirements(prev => 
        prev.map(req => req.id === reqId ? { ...req, status: req.status } : req)
      );

      setSyncStatus(prev => ({
        ...prev,
        syncError: 'Unexpected error occurred',
        hasPendingChanges: true
      }));

      toast.error('Failed to update requirement status. Please try again.');
    } finally {
      // Remove from pending operations
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
      
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: prev.isSyncing && pendingOperations.size > 1
      }));
    }
  }, [assessment.id, assessmentRequirements, pendingOperations.size]);
  
  // Update assessment data with database persistence
  const updateAssessment = useCallback(async (updates: Partial<Assessment>) => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

      // Optimistically update local state
      const previousAssessment = assessment;
      setAssessment(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));

      // Persist to database
      const result = await databaseAssessmentService.updateAssessmentProgress(
        assessment.id,
        updates
      );

      if (result.success) {
        setSyncStatus(prev => ({
          ...prev,
          lastSyncAt: new Date(),
          syncError: null,
          isSyncing: false
        }));
        toast.success('Assessment updated');
      } else {
        // Revert on failure
        setAssessment(previousAssessment);
        setSyncStatus(prev => ({
          ...prev,
          syncError: result.error || 'Failed to update assessment',
          hasPendingChanges: true,
          isSyncing: false
        }));
        toast.error(`Failed to update assessment: ${result.error}`);
      }

    } catch (error) {
      console.error('Error updating assessment:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncError: 'Unexpected error occurred',
        hasPendingChanges: true,
        isSyncing: false
      }));
      toast.error('Failed to update assessment');
    }
  }, [assessment]);
  
  // Group requirements by section
  const groupRequirementsBySection = () => {
    return filteredRequirements.reduce((acc, req) => {
      const section = req.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(req);
      return acc;
    }, {} as Record<string, Requirement[]>);
  };

  // Retry failed sync operations
  const retryFailedSync = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));
      await databaseAssessmentService.processQueuedOperations();
      setSyncStatus(prev => ({
        ...prev,
        syncError: null,
        hasPendingChanges: false,
        isSyncing: false
      }));
      toast.success('Sync retry completed');
    } catch (error) {
      console.error('Retry failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncError: 'Retry failed. Please try again.',
        isSyncing: false
      }));
      toast.error('Retry failed. Please try again.');
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Auto-retry pending operations when back online
      if (syncStatus.hasPendingChanges) {
        retryFailedSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryFailedSync, syncStatus.hasPendingChanges]);
  
  return {
    assessment,
    requirements: assessmentRequirements,
    filteredRequirements,
    standards,
    stats,
    activeStandardId,
    setActiveStandardId,
    updateRequirementStatus,
    updateAssessment,
    groupRequirementsBySection,
    syncStatus,
    retryFailedSync,
    hasPendingChanges: pendingOperations.size > 0 || syncStatus.hasPendingChanges,
  };
} 