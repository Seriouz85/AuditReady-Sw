import { Assessment, Requirement, RequirementStatus } from '@/types';
import { requirements as allRequirements } from '@/data/mockData';
import { supabase } from '@/lib/supabase';

// Storage keys for persistence
const ASSESSMENT_PROGRESS_KEY = 'assessment_progress_data';
const REQUIREMENT_STATUS_KEY = 'requirement_status_data';

// Interface for stored progress data
interface StoredProgressData {
  [assessmentId: string]: {
    progress: number;
    lastUpdated: string;
    stats: AssessmentStats;
  };
}

// Interface for stored requirement status data
interface StoredRequirementStatusData {
  [assessmentId: string]: {
    [requirementId: string]: {
      status: RequirementStatus;
      lastUpdated: string;
    };
  };
}

// Assessment statistics interface
export interface AssessmentStats {
  totalRequirements: number;
  fulfilledCount: number;
  partialCount: number;
  notFulfilledCount: number;
  notApplicableCount: number;
  progress: number;
  complianceScore: number;
}

export class AssessmentProgressService {
  private static instance: AssessmentProgressService;
  
  private constructor() {}
  
  public static getInstance(): AssessmentProgressService {
    if (!AssessmentProgressService.instance) {
      AssessmentProgressService.instance = new AssessmentProgressService();
    }
    return AssessmentProgressService.instance;
  }
  
  /**
   * Get requirements for an assessment
   */
  public getAssessmentRequirements(assessment: Assessment): Requirement[] {
    // For now, still use mock data as requirements need to be fetched asynchronously
    // This will be replaced with async version in the future
    return allRequirements.filter(req => 
      assessment.standardIds.includes(req.standardId)
    );
  }

  /**
   * Get requirements for an assessment from database (async version)
   */
  public async getAssessmentRequirementsAsync(assessment: Assessment): Promise<Requirement[]> {
    try {
      // Create a new supabase client without auth for public data
      const { createClient } = await import('@supabase/supabase-js');
      const publicSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      
      const { data, error } = await publicSupabase
        .from('requirements_library')
        .select('*')
        .in('standard_id', assessment.standardIds)
        .eq('is_active', true)
        .order('control_id');

      if (error) {
        console.error('Database error, falling back to mock data:', error);
        throw error;
      }

      // If no data returned from database, use mock data
      if (!data || data.length === 0) {
        console.log('No requirements found in database, using filtered mock data');
        return allRequirements.filter(req => 
          assessment.standardIds.includes(req.standardId)
        );
      }

      // Map database requirements to our Requirement type
      const requirements: Requirement[] = data.map(req => ({
        id: req.id,
        standardId: req.standard_id,
        section: req.section || '',
        code: req.control_id,
        name: req.title,
        description: req.description || '',
        guidance: req.implementation_guidance || '',
        auditReadyGuidance: req.audit_ready_guidance || '',
        status: 'not-fulfilled' as RequirementStatus, // Default status
        priority: req.priority || 'medium',
        tags: req.tags || [],
        categories: req.tags || [],
        createdAt: req.created_at,
        updatedAt: req.updated_at
      }));

      console.log(`Loaded ${requirements.length} requirements from database for standards:`, assessment.standardIds);
      return requirements;
    } catch (error) {
      console.error('Error fetching requirements from database:', error);
      // Fallback to mock data if database fetch fails
      console.log('Falling back to filtered mock data');
      return allRequirements.filter(req => 
        assessment.standardIds.includes(req.standardId)
      );
    }
  }
  
  /**
   * Get stored requirement statuses for an assessment
   */
  public getStoredRequirementStatuses(assessmentId: string): Record<string, RequirementStatus> {
    const stored = this.getStoredRequirementStatusData();
    const assessmentData = stored[assessmentId] || {};
    
    const statuses: Record<string, RequirementStatus> = {};
    Object.keys(assessmentData).forEach(reqId => {
      statuses[reqId] = assessmentData[reqId].status;
    });
    
    return statuses;
  }
  
  /**
   * Get requirements with current stored statuses applied
   */
  public getRequirementsWithStoredStatuses(assessment: Assessment): Requirement[] {
    const requirements = this.getAssessmentRequirements(assessment);
    const storedStatuses = this.getStoredRequirementStatuses(assessment.id);
    
    return requirements.map(req => ({
      ...req,
      status: storedStatuses[req.id] || req.status
    }));
  }

  /**
   * Get requirements with current stored statuses applied (async version)
   */
  public async getRequirementsWithStoredStatusesAsync(assessment: Assessment): Promise<Requirement[]> {
    const requirements = await this.getAssessmentRequirementsAsync(assessment);
    const storedStatuses = this.getStoredRequirementStatuses(assessment.id);
    
    return requirements.map(req => ({
      ...req,
      status: storedStatuses[req.id] || req.status
    }));
  }
  
  /**
   * Calculate assessment statistics
   */
  public calculateAssessmentStats(requirements: Requirement[]): AssessmentStats {
    const totalRequirements = requirements.length;
    const fulfilledCount = requirements.filter(req => req.status === 'fulfilled').length;
    const partialCount = requirements.filter(req => req.status === 'partially-fulfilled').length;
    const notFulfilledCount = requirements.filter(req => req.status === 'not-fulfilled').length;
    const notApplicableCount = requirements.filter(req => req.status === 'not-applicable').length;
    
    // Calculate progress percentage
    const applicableCount = totalRequirements - notApplicableCount;
    const progress = applicableCount === 0 
      ? 100 
      : Math.round(((fulfilledCount + (partialCount * 0.5)) / applicableCount) * 100);
    
    // Calculate compliance score (same as progress for now)
    const complianceScore = progress;
    
    return {
      totalRequirements,
      fulfilledCount,
      partialCount,
      notFulfilledCount,
      notApplicableCount,
      progress,
      complianceScore,
    };
  }
  
  /**
   * Update requirement status and recalculate progress
   */
  public updateRequirementStatus(
    assessmentId: string, 
    requirementId: string, 
    newStatus: RequirementStatus
  ): AssessmentStats {
    // Store the requirement status
    this.storeRequirementStatus(assessmentId, requirementId, newStatus);
    
    // Get the assessment and recalculate stats
    const assessment = this.getAssessmentFromStorage(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }
    
    const requirements = this.getRequirementsWithStoredStatuses(assessment);
    const stats = this.calculateAssessmentStats(requirements);
    
    // Store the updated progress
    this.storeAssessmentProgress(assessmentId, stats);
    
    return stats;
  }
  
  /**
   * Get current progress for an assessment
   */
  public getAssessmentProgress(assessment: Assessment): AssessmentStats {
    // Check if we have stored progress data
    const stored = this.getStoredProgressData();
    const assessmentProgress = stored[assessment.id];
    
    if (assessmentProgress) {
      return assessmentProgress.stats;
    }
    
    // No stored data, calculate from current requirements
    const requirements = this.getRequirementsWithStoredStatuses(assessment);
    const stats = this.calculateAssessmentStats(requirements);
    
    // Store for future use
    this.storeAssessmentProgress(assessment.id, stats);
    
    return stats;
  }
  
  /**
   * Store requirement status
   */
  private storeRequirementStatus(
    assessmentId: string, 
    requirementId: string, 
    status: RequirementStatus
  ): void {
    const stored = this.getStoredRequirementStatusData();
    
    if (!stored[assessmentId]) {
      stored[assessmentId] = {};
    }
    
    stored[assessmentId][requirementId] = {
      status,
      lastUpdated: new Date().toISOString()
    };
    
    this.setStoredRequirementStatusData(stored);
  }
  
  /**
   * Store assessment progress
   */
  private storeAssessmentProgress(assessmentId: string, stats: AssessmentStats): void {
    const stored = this.getStoredProgressData();
    
    stored[assessmentId] = {
      progress: stats.progress,
      lastUpdated: new Date().toISOString(),
      stats
    };
    
    this.setStoredProgressData(stored);
  }
  
  /**
   * Get stored progress data from localStorage
   */
  private getStoredProgressData(): StoredProgressData {
    try {
      const stored = localStorage.getItem(ASSESSMENT_PROGRESS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored progress data:', error);
      return {};
    }
  }
  
  /**
   * Set stored progress data to localStorage
   */
  private setStoredProgressData(data: StoredProgressData): void {
    try {
      localStorage.setItem(ASSESSMENT_PROGRESS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing progress data:', error);
    }
  }
  
  /**
   * Get stored requirement status data from localStorage
   */
  private getStoredRequirementStatusData(): StoredRequirementStatusData {
    try {
      const stored = localStorage.getItem(REQUIREMENT_STATUS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored requirement status data:', error);
      return {};
    }
  }
  
  /**
   * Set stored requirement status data to localStorage
   */
  private setStoredRequirementStatusData(data: StoredRequirementStatusData): void {
    try {
      localStorage.setItem(REQUIREMENT_STATUS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing requirement status data:', error);
    }
  }
  
  /**
   * Get assessment from storage service
   */
  private getAssessmentFromStorage(assessmentId: string): Assessment | null {
    try {
      // Import storage service to avoid circular dependencies
      const { assessmentStorageService } = require('./AssessmentStorageService');
      return assessmentStorageService.getAssessment(assessmentId);
    } catch (error) {
      console.error('Error getting assessment from storage:', error);
      return null;
    }
  }
  
  /**
   * Clear all stored data (useful for demo/testing)
   */
  public clearStoredData(): void {
    try {
      localStorage.removeItem(ASSESSMENT_PROGRESS_KEY);
      localStorage.removeItem(REQUIREMENT_STATUS_KEY);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }
  
  /**
   * Get all stored progress data for debugging
   */
  public getDebugInfo(): {
    progressData: StoredProgressData;
    requirementData: StoredRequirementStatusData;
  } {
    return {
      progressData: this.getStoredProgressData(),
      requirementData: this.getStoredRequirementStatusData()
    };
  }
}

// Export singleton instance
export const assessmentProgressService = AssessmentProgressService.getInstance();