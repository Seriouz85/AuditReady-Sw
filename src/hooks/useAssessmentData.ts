import { useState, useMemo, useEffect } from 'react';
import { Assessment, Requirement, RequirementStatus, Standard } from '@/types';
import { standards as allStandards } from '@/data/mockData';
import { assessmentProgressService, AssessmentStats } from '@/services/assessments/AssessmentProgressService';

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
  const [assessment, setAssessment] = useState<Assessment>({...initialAssessment});
  const [assessmentRequirements, setAssessmentRequirements] = useState<Requirement[]>([]);
  const [activeStandardId, setActiveStandardId] = useState<string | undefined>(
    initialAssessment.standardIds.length === 1 ? initialAssessment.standardIds[0] : undefined
  );
  
  // Initialize requirements with stored statuses
  useEffect(() => {
    const requirements = assessmentProgressService.getRequirementsWithStoredStatuses(initialAssessment);
    setAssessmentRequirements(requirements);
  }, [initialAssessment]);
  
  // Get standards information
  const standards = useMemo(() => {
    return allStandards.filter(s => assessment.standardIds.includes(s.id));
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