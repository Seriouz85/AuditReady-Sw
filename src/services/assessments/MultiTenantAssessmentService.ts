import { supabase } from '@/lib/supabase';
import { Assessment } from '@/types';
import { assessments as mockAssessments } from '@/data/mockData';

export interface CreateAssessmentData {
  name: string;
  description?: string;
  standardIds: string[];
  assessorName: string;
  assessorId: string;
  assessorNames?: string[];
  assessorIds?: string[];
  isRecurring?: boolean;
  recurrenceSettings?: any;
  organizationId: string;
}

export class MultiTenantAssessmentService {
  private static instance: MultiTenantAssessmentService;
  
  private constructor() {}
  
  public static getInstance(): MultiTenantAssessmentService {
    if (!MultiTenantAssessmentService.instance) {
      MultiTenantAssessmentService.instance = new MultiTenantAssessmentService();
    }
    return MultiTenantAssessmentService.instance;
  }

  /**
   * Get all assessments for an organization (use localStorage for demo, database for production)
   */
  public async getAssessments(organizationId: string, isDemo: boolean = false): Promise<Assessment[]> {
    if (isDemo) {
      // Demo accounts use localStorage only
      return this.getDemoAssessments();
    }

    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(this.mapDatabaseToAssessment) || [];
    } catch (error) {
      console.error('Error fetching assessments from database:', error);
      return [];
    }
  }

  /**
   * Create a new assessment (use localStorage for demo, database for production)
   */
  public async createAssessment(
    assessmentData: CreateAssessmentData, 
    isDemo: boolean = false
  ): Promise<Assessment> {
    if (isDemo) {
      // Demo accounts use localStorage only
      return this.createDemoAssessment(assessmentData);
    }

    try {
      const dbData = {
        organization_id: assessmentData.organizationId,
        name: assessmentData.name,
        description: assessmentData.description || '',
        standard_ids: assessmentData.standardIds,
        status: 'draft',
        progress: 0,
        start_date: new Date().toISOString(),
        assessor_name: assessmentData.assessorName,
        assessor_id: assessmentData.assessorId,
        assessor_names: assessmentData.assessorNames || [assessmentData.assessorName],
        assessor_ids: assessmentData.assessorIds || [assessmentData.assessorId],
        is_recurring: assessmentData.isRecurring || false,
        recurrence_pattern: assessmentData.recurrenceSettings || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('assessments')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToAssessment(data);
    } catch (error) {
      console.error('Error creating assessment in database:', error);
      throw error;
    }
  }

  /**
   * Update an assessment
   */
  public async updateAssessment(
    assessmentId: string, 
    updates: Partial<Assessment>,
    organizationId: string,
    isDemo: boolean = false
  ): Promise<Assessment | null> {
    if (isDemo) {
      return this.updateDemoAssessment(assessmentId, updates);
    }

    try {
      const dbUpdates = this.mapAssessmentToDatabase(updates);
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('assessments')
        .update(dbUpdates)
        .eq('id', assessmentId)
        .eq('organization_id', organizationId) // Ensure organization boundary
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToAssessment(data);
    } catch (error) {
      console.error('Error updating assessment in database:', error);
      return this.updateDemoAssessment(assessmentId, updates);
    }
  }

  /**
   * Delete an assessment
   */
  public async deleteAssessment(
    assessmentId: string, 
    organizationId: string,
    isDemo: boolean = false
  ): Promise<boolean> {
    if (isDemo) {
      return this.deleteDemoAssessment(assessmentId);
    }

    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId)
        .eq('organization_id', organizationId); // Ensure organization boundary

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting assessment from database:', error);
      return this.deleteDemoAssessment(assessmentId);
    }
  }

  /**
   * Get a single assessment by ID
   */
  public async getAssessment(
    assessmentId: string, 
    organizationId: string,
    isDemo: boolean = false
  ): Promise<Assessment | null> {
    if (isDemo) {
      const demoAssessments = this.getDemoAssessments();
      return demoAssessments.find(a => a.id === assessmentId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .eq('organization_id', organizationId) // Ensure organization boundary
        .single();

      if (error) throw error;

      return this.mapDatabaseToAssessment(data);
    } catch (error) {
      console.error('Error fetching assessment from database:', error);
      const demoAssessments = this.getDemoAssessments();
      return demoAssessments.find(a => a.id === assessmentId) || null;
    }
  }

  // --- PRIVATE HELPER METHODS ---

  /**
   * Map database row to Assessment type
   */
  private mapDatabaseToAssessment(dbRow: any): Assessment {
    return {
      id: dbRow.id,
      name: dbRow.name,
      description: dbRow.description || '',
      standardIds: dbRow.standard_ids || [],
      status: dbRow.status || 'draft',
      progress: dbRow.progress || 0,
      startDate: dbRow.start_date || new Date().toISOString(),
      endDate: dbRow.end_date || undefined,
      assessorName: dbRow.assessor_name || '',
      assessorId: dbRow.assessor_id || '',
      assessorNames: dbRow.assessor_names || [],
      assessorIds: dbRow.assessor_ids || [],
      notes: dbRow.notes || '',
      evidence: dbRow.evidence || '',
      isRecurring: dbRow.is_recurring || false,
      recurrenceSettings: dbRow.recurrence_pattern || undefined,
      nextDueDate: dbRow.next_due_date || undefined,
      createdAt: dbRow.created_at || new Date().toISOString(),
      updatedAt: dbRow.updated_at || new Date().toISOString()
    };
  }

  /**
   * Map Assessment type to database format
   */
  private mapAssessmentToDatabase(assessment: Partial<Assessment>): any {
    const dbData: any = {};
    
    if (assessment.name !== undefined) dbData.name = assessment.name;
    if (assessment.description !== undefined) dbData.description = assessment.description;
    if (assessment.standardIds !== undefined) dbData.standard_ids = assessment.standardIds;
    if (assessment.status !== undefined) dbData.status = assessment.status;
    if (assessment.progress !== undefined) dbData.progress = assessment.progress;
    if (assessment.startDate !== undefined) dbData.start_date = assessment.startDate;
    if (assessment.endDate !== undefined) dbData.end_date = assessment.endDate;
    if (assessment.assessorName !== undefined) dbData.assessor_name = assessment.assessorName;
    if (assessment.assessorId !== undefined) dbData.assessor_id = assessment.assessorId;
    if (assessment.assessorNames !== undefined) dbData.assessor_names = assessment.assessorNames;
    if (assessment.assessorIds !== undefined) dbData.assessor_ids = assessment.assessorIds;
    if (assessment.notes !== undefined) dbData.notes = assessment.notes;
    if (assessment.evidence !== undefined) dbData.evidence = assessment.evidence;
    if (assessment.isRecurring !== undefined) dbData.is_recurring = assessment.isRecurring;
    if (assessment.recurrenceSettings !== undefined) dbData.recurrence_pattern = assessment.recurrenceSettings;
    if (assessment.nextDueDate !== undefined) dbData.next_due_date = assessment.nextDueDate;

    return dbData;
  }

  // --- DEMO MODE METHODS (localStorage-based) ---

  private migrateOldStandardIds(assessments: Assessment[]): Assessment[] {
    // Migration mapping from old string IDs to new UUIDs
    const idMapping: Record<string, string> = {
      'iso-27001': '55742f4e-769b-4efe-912c-1371de5e1cd6',
      'nis2': 'f4e13e2b-1bcc-4865-913f-084fb5599a00',
      'gdpr': '73869227-cd63-47db-9981-c0d633a3d47b',
      'iso-27002-2022': '8508cfb0-3457-4226-b39a-851be52ef7ea',
      'cis-controls': 'afe9728d-2084-4b6b-8653-b04e1e92cdff',
      'nist-csf': 'b1d9e82f-b0c3-40e2-89d7-4c51e216214e'
    };

    return assessments.map(assessment => ({
      ...assessment,
      standardIds: assessment.standardIds.map(oldId => idMapping[oldId] || oldId)
    }));
  }

  private getDemoAssessments(): Assessment[] {
    try {
      const stored = localStorage.getItem('demo_assessments');
      const demoAssessments = stored ? JSON.parse(stored) : [];
      
      // Check if we need to clear old localStorage data that doesn't have isRecurring
      const needsMigration = demoAssessments.length > 0 && 
        demoAssessments.some((a: Assessment) => a.isRecurring === undefined);
      
      if (needsMigration) {
        console.log('Clearing old localStorage assessments without isRecurring property');
        localStorage.removeItem('demo_assessments');
        return mockAssessments;
      }
      
      // Start with fresh mock data as the base
      let allAssessments = [...mockAssessments];
      const storedIds = demoAssessments.map((a: Assessment) => a.id);
      
      // Merge stored assessments with mock data, preserving user changes but ensuring isRecurring is set
      demoAssessments.forEach((storedAssessment: Assessment) => {
        const index = allAssessments.findIndex(a => a.id === storedAssessment.id);
        if (index >= 0) {
          // Merge stored assessment with mock data, but ensure isRecurring comes from mock data if not set
          const mockAssessment = allAssessments[index];
          if (mockAssessment) {
            const merged = {
              ...mockAssessment, // Start with mock data (has isRecurring)
              ...storedAssessment, // Override with stored data (user changes)
              // Ensure isRecurring is preserved from mock data if not explicitly set in stored data
              isRecurring: storedAssessment.isRecurring !== undefined ? storedAssessment.isRecurring : mockAssessment.isRecurring,
              recurrenceSettings: storedAssessment.recurrenceSettings ?? mockAssessment.recurrenceSettings,
              nextDueDate: storedAssessment.nextDueDate ?? mockAssessment.nextDueDate
            } as Assessment;
            allAssessments[index] = merged;
          }
        } else {
          // This is a user-created assessment, add it as-is
          allAssessments.push(storedAssessment);
        }
      });

      // Migrate old standard IDs to new UUIDs
      allAssessments = this.migrateOldStandardIds(allAssessments);

      // Force localStorage update to include isRecurring properties
      const shouldUpdate = stored && (
        JSON.stringify(demoAssessments) !== JSON.stringify(allAssessments.filter(a => storedIds.includes(a.id))) ||
        demoAssessments.some((a: Assessment) => a.isRecurring === undefined)
      );
      
      if (shouldUpdate) {
        const migratedStored = allAssessments.filter(a => storedIds.includes(a.id));
        localStorage.setItem('demo_assessments', JSON.stringify(migratedStored));
        console.log('Migrated demo assessments to include isRecurring properties');
      }

      return allAssessments;
    } catch (error) {
      console.error('Error reading demo assessments:', error);
      return mockAssessments;
    }
  }

  private createDemoAssessment(assessmentData: CreateAssessmentData): Assessment {
    const newAssessment: Assessment = {
      id: crypto.randomUUID(),
      name: assessmentData.name,
      description: assessmentData.description || '',
      standardIds: assessmentData.standardIds,
      status: 'draft',
      progress: 0,
      startDate: new Date().toISOString(),
      assessorName: assessmentData.assessorName,
      assessorId: assessmentData.assessorId,
      assessorNames: assessmentData.assessorNames || [assessmentData.assessorName],
      assessorIds: assessmentData.assessorIds || [assessmentData.assessorId],
      notes: '',
      evidence: '',
      isRecurring: assessmentData.isRecurring || false,
      recurrenceSettings: assessmentData.recurrenceSettings || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentAssessments = this.getDemoAssessments();
    const updatedAssessments = [...currentAssessments, newAssessment];
    
    localStorage.setItem('demo_assessments', JSON.stringify(updatedAssessments));
    return newAssessment;
  }

  private updateDemoAssessment(assessmentId: string, updates: Partial<Assessment>): Assessment | null {
    const currentAssessments = this.getDemoAssessments();
    const index = currentAssessments.findIndex(a => a.id === assessmentId);
    
    if (index === -1) return null;
    
    const updatedAssessment = {
      ...currentAssessments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    } as Assessment;
    
    currentAssessments[index] = updatedAssessment;
    
    // Store all assessments including the ones modified in memory
    const storedIds = new Set(currentAssessments.map(a => a.id));
    const allToStore = currentAssessments.filter(a => storedIds.has(a.id) || a.id === assessmentId);
    
    localStorage.setItem('demo_assessments', JSON.stringify(allToStore));
    console.log(`Updated demo assessment ${assessmentId} in localStorage`);
    
    return updatedAssessment;
  }

  private deleteDemoAssessment(assessmentId: string): boolean {
    const currentAssessments = this.getDemoAssessments();
    const filteredAssessments = currentAssessments.filter(a => a.id !== assessmentId);
    
    localStorage.setItem('demo_assessments', JSON.stringify(filteredAssessments));
    return true;
  }
}

// Export singleton instance
export const multiTenantAssessmentService = MultiTenantAssessmentService.getInstance();