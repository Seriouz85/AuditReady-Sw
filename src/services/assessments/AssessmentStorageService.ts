import { Assessment } from '@/types';
import { assessments as mockAssessments } from '@/data/mockData';

// Storage key for assessments
const ASSESSMENTS_STORAGE_KEY = 'stored_assessments';

// Interface for stored assessment data
interface StoredAssessmentData {
  [assessmentId: string]: Assessment;
}

export class AssessmentStorageService {
  private static instance: AssessmentStorageService;
  
  private constructor() {}
  
  public static getInstance(): AssessmentStorageService {
    if (!AssessmentStorageService.instance) {
      AssessmentStorageService.instance = new AssessmentStorageService();
    }
    return AssessmentStorageService.instance;
  }
  
  /**
   * Get all assessments (stored + mock data)
   */
  public getAllAssessments(): Assessment[] {
    const stored = this.getStoredAssessments();
    const storedIds = Object.keys(stored);
    
    // Merge stored assessments with mock data
    // Stored assessments take precedence over mock data
    const assessments = [...mockAssessments];
    
    // Update assessments with stored data
    const updatedAssessments = assessments.map(assessment => {
      if (storedIds.includes(assessment.id)) {
        return stored[assessment.id];
      }
      return assessment;
    });
    
    // Add any stored assessments that don't exist in mock data
    storedIds.forEach(id => {
      if (!assessments.find(a => a.id === id)) {
        updatedAssessments.push(stored[id]);
      }
    });
    
    return updatedAssessments;
  }
  
  /**
   * Get a specific assessment by ID
   */
  public getAssessment(assessmentId: string): Assessment | null {
    // First check stored assessments
    const stored = this.getStoredAssessments();
    if (stored[assessmentId]) {
      return stored[assessmentId];
    }
    
    // Fallback to mock data
    return mockAssessments.find(a => a.id === assessmentId) || null;
  }
  
  /**
   * Save or update an assessment
   */
  public saveAssessment(assessment: Assessment): void {
    const stored = this.getStoredAssessments();
    stored[assessment.id] = {
      ...assessment,
      updatedAt: new Date().toISOString()
    };
    this.setStoredAssessments(stored);
  }
  
  /**
   * Delete an assessment from storage
   */
  public deleteAssessment(assessmentId: string): void {
    const stored = this.getStoredAssessments();
    delete stored[assessmentId];
    this.setStoredAssessments(stored);
  }
  
  /**
   * Create a new assessment
   */
  public createAssessment(assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Assessment {
    const now = new Date().toISOString();
    const newId = `assessment-${Date.now()}`;
    
    const newAssessment: Assessment = {
      ...assessmentData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    
    this.saveAssessment(newAssessment);
    return newAssessment;
  }
  
  /**
   * Update assessment progress
   */
  public updateAssessmentProgress(assessmentId: string, progress: number): Assessment | null {
    const assessment = this.getAssessment(assessmentId);
    if (!assessment) {
      return null;
    }
    
    const updatedAssessment = {
      ...assessment,
      progress,
      updatedAt: new Date().toISOString()
    };
    
    this.saveAssessment(updatedAssessment);
    return updatedAssessment;
  }
  
  /**
   * Update assessment status
   */
  public updateAssessmentStatus(
    assessmentId: string, 
    status: Assessment['status'],
    additionalFields?: Partial<Assessment>
  ): Assessment | null {
    const assessment = this.getAssessment(assessmentId);
    if (!assessment) {
      return null;
    }
    
    const updates: Partial<Assessment> = {
      status,
      updatedAt: new Date().toISOString(),
      ...additionalFields
    };
    
    // Auto-set progress to 100% when completing
    if (status === 'completed' && !additionalFields?.progress) {
      updates.progress = 100;
      updates.endDate = new Date().toISOString();
    }
    
    const updatedAssessment = {
      ...assessment,
      ...updates
    };
    
    this.saveAssessment(updatedAssessment);
    return updatedAssessment;
  }
  
  /**
   * Get stored assessments from localStorage
   */
  private getStoredAssessments(): StoredAssessmentData {
    try {
      const stored = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored assessments:', error);
      return {};
    }
  }
  
  /**
   * Set stored assessments to localStorage
   */
  private setStoredAssessments(data: StoredAssessmentData): void {
    try {
      localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing assessments:', error);
    }
  }
  
  /**
   * Clear all stored assessments (useful for demo/testing)
   */
  public clearStoredAssessments(): void {
    try {
      localStorage.removeItem(ASSESSMENTS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing stored assessments:', error);
    }
  }
  
  /**
   * Export all data for backup
   */
  public exportData(): {
    assessments: StoredAssessmentData;
    timestamp: string;
  } {
    return {
      assessments: this.getStoredAssessments(),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Import data from backup
   */
  public importData(data: { assessments: StoredAssessmentData }): void {
    this.setStoredAssessments(data.assessments);
  }
}

// Export singleton instance
export const assessmentStorageService = AssessmentStorageService.getInstance();