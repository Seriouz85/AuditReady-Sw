import { useState, useMemo } from 'react';
import { Assessment, Requirement, RequirementStatus, Standard } from '@/types';
import { requirements as allRequirements, standards as allStandards } from '@/data/mockData';

interface AssessmentStats {
  totalRequirements: number;
  fulfilledCount: number;
  partialCount: number;
  notFulfilledCount: number;
  notApplicableCount: number;
  progress: number;
  complianceScore: number;
}

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
  const [assessmentRequirements, setAssessmentRequirements] = useState<Requirement[]>(
    allRequirements.filter(req => initialAssessment.standardIds.includes(req.standardId))
  );
  const [activeStandardId, setActiveStandardId] = useState<string | undefined>(
    initialAssessment.standardIds.length === 1 ? initialAssessment.standardIds[0] : undefined
  );
  
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
  
  // Calculate stats
  const stats = useMemo(() => {
    const totalRequirements = filteredRequirements.length;
    const fulfilledCount = filteredRequirements.filter(req => req.status === 'fulfilled').length;
    const partialCount = filteredRequirements.filter(req => req.status === 'partially-fulfilled').length;
    const notFulfilledCount = filteredRequirements.filter(req => req.status === 'not-fulfilled').length;
    const notApplicableCount = filteredRequirements.filter(req => req.status === 'not-applicable').length;

    // Calculate progress percentage
    const applicableCount = totalRequirements - notApplicableCount;
    const progress = applicableCount === 0 
      ? 100 
      : Math.round(((fulfilledCount + (partialCount * 0.5)) / applicableCount) * 100);
    
    // Calculate compliance score
    const complianceScore = applicableCount === 0 
      ? 100 
      : Math.round(((fulfilledCount + (partialCount * 0.5)) / applicableCount) * 100);
    
    return {
      totalRequirements,
      fulfilledCount,
      partialCount,
      notFulfilledCount,
      notApplicableCount,
      progress,
      complianceScore,
    };
  }, [filteredRequirements]);
  
  // Update requirement status
  const updateRequirementStatus = (reqId: string, newStatus: RequirementStatus) => {
    const updatedRequirements = assessmentRequirements.map(req => 
      req.id === reqId ? { ...req, status: newStatus } : req
    );
    
    setAssessmentRequirements(updatedRequirements);
    
    // Update assessment progress
    setAssessment(prev => ({
      ...prev,
      progress: stats.progress,
      updatedAt: new Date().toISOString(),
    }));
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