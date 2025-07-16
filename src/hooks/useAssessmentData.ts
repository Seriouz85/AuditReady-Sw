import { useState, useMemo, useEffect } from 'react';
import { Assessment, Requirement, RequirementStatus, Standard } from '@/types';
import { standards as allStandards } from '@/data/mockData';
import { assessmentProgressService, AssessmentStats } from '@/services/assessments/AssessmentProgressService';
import { StandardsService } from '@/services/standards/StandardsService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Remove duplicate interface as it's now imported from the service

interface UseAssessmentDataReturn {
  assessment: Assessment;
  requirements: Requirement[];
  filteredRequirements: Requirement[];
  standards: Standard[];
  stats: AssessmentStats;
  activeStandardId: string | undefined;
  setActiveStandardId: (id: string | undefined) => void;
  updateRequirementStatus: (reqId: string, newStatus: RequirementStatus) => void;
  updateAssessment: (updates: Partial<Assessment>) => void;
  groupRequirementsBySection: () => Record<string, Requirement[]>;
}

export function useAssessmentData(initialAssessment: Assessment): UseAssessmentDataReturn {
  const { isDemo } = useAuth();
  const [assessment, setAssessment] = useState<Assessment>({...initialAssessment});
  const [assessmentRequirements, setAssessmentRequirements] = useState<Requirement[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [activeStandardId, setActiveStandardId] = useState<string | undefined>(
    initialAssessment.standardIds.length === 1 ? initialAssessment.standardIds[0] : undefined
  );
  
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
            type: 'compliance' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setStandards(minimalStandards);
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
  
  // Update requirement status
  const updateRequirementStatus = (reqId: string, newStatus: RequirementStatus) => {
    try {
      // Update the requirement status using the progress service
      const updatedStats = assessmentProgressService.updateRequirementStatus(
        assessment.id, 
        reqId, 
        newStatus
      );
      
      // Update local requirements state
      const updatedRequirements = assessmentRequirements.map(req => 
        req.id === reqId ? { ...req, status: newStatus } : req
      );
      setAssessmentRequirements(updatedRequirements);
      
      // Update assessment with new progress
      setAssessment(prev => ({
        ...prev,
        progress: updatedStats.progress,
        updatedAt: new Date().toISOString(),
      }));
      
    } catch (error) {
      console.error('Error updating requirement status:', error);
      // Could show a toast error here if needed
    }
  };
  
  // Update assessment data
  const updateAssessment = (updates: Partial<Assessment>) => {
    setAssessment(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };
  
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
  };
} 