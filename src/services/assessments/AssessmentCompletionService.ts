import { supabase } from '@/lib/supabase';
import { Assessment, Requirement } from '@/types';

export interface AssessmentCompletionData {
  assessment: Assessment;
  requirements: Requirement[];
  completionNotes?: string;
  reviewerNotes?: string;
}

export interface NotesTransferResult {
  success: boolean;
  transferredCount: number;
  errors: string[];
  completionDate: string;
}

/**
 * Service for handling assessment completion and notes transfer
 * Implements the user requirement: "When an assessment is completed and has made notes 
 * to each requirement, those notes should be sent to that requirement's notes section 
 * with date and timestamp"
 */
export class AssessmentCompletionService {
  private static instance: AssessmentCompletionService;
  
  private constructor() {}
  
  public static getInstance(): AssessmentCompletionService {
    if (!AssessmentCompletionService.instance) {
      AssessmentCompletionService.instance = new AssessmentCompletionService();
    }
    return AssessmentCompletionService.instance;
  }

  /**
   * Complete an assessment and transfer all requirement notes to global requirement notes
   */
  async completeAssessment(
    assessmentId: string,
    completionData: Partial<AssessmentCompletionData> = {}
  ): Promise<NotesTransferResult> {
    const completionDate = new Date().toISOString();
    const errors: string[] = [];
    let transferredCount = 0;

    try {
      // 1. Update assessment status to completed
      const { data: updatedAssessment, error: assessmentError } = await supabase
        .from('assessments')
        .update({
          status: 'completed',
          end_date: completionDate,
          progress: 100,
          updated_at: completionDate
        })
        .eq('id', assessmentId)
        .select()
        .single();

      if (assessmentError) {
        throw new Error(`Failed to update assessment: ${assessmentError.message}`);
      }

      // 2. Get all assessment requirements with notes
      const { data: assessmentRequirements, error: requirementsError } = await supabase
        .from('assessment_requirements')
        .select(`
          id,
          requirement_id,
          notes,
          assessment_notes,
          status,
          requirements_library (
            id,
            name,
            code,
            notes
          )
        `)
        .eq('assessment_id', assessmentId)
        .not('notes', 'is', null)
        .neq('notes', '');

      if (requirementsError) {
        throw new Error(`Failed to fetch assessment requirements: ${requirementsError.message}`);
      }

      // 3. Transfer notes for each requirement that has assessment notes
      if (assessmentRequirements && assessmentRequirements.length > 0) {
        for (const assessmentReq of assessmentRequirements) {
          try {
            // Prepare the notes transfer
            const transferNotes = this.formatTransferNotes(
              updatedAssessment.name,
              assessmentReq.notes,
              completionDate,
              assessmentReq.status
            );

            // Get current requirement notes
            const { data: currentReq, error: fetchError } = await supabase
              .from('requirements_library')
              .select('notes')
              .eq('id', assessmentReq.requirement_id)
              .single();

            if (fetchError) {
              errors.push(`Failed to fetch requirement ${assessmentReq.requirement_id}: ${fetchError.message}`);
              continue;
            }

            // Append new notes to existing notes
            const updatedNotes = this.appendNotes(currentReq.notes || '', transferNotes);

            // Update the requirement notes
            const { error: updateError } = await supabase
              .from('requirements_library')
              .update({
                notes: updatedNotes,
                updated_at: completionDate
              })
              .eq('id', assessmentReq.requirement_id);

            if (updateError) {
              errors.push(`Failed to update requirement ${assessmentReq.requirement_id}: ${updateError.message}`);
              continue;
            }

            transferredCount++;

            // Log the transfer for audit purposes
            await this.logNotesTransfer(
              assessmentId,
              assessmentReq.requirement_id,
              assessmentReq.notes,
              completionDate
            );

          } catch (reqError) {
            const errorMessage = reqError instanceof Error ? reqError.message : 'Unknown error';
            errors.push(`Error processing requirement ${assessmentReq.requirement_id}: ${errorMessage}`);
          }
        }
      }

      // 4. Create completion record
      await this.createCompletionRecord(assessmentId, transferredCount, completionDate);

      return {
        success: errors.length === 0,
        transferredCount,
        errors,
        completionDate
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        transferredCount: 0,
        errors: [errorMessage],
        completionDate
      };
    }
  }

  /**
   * Format notes for transfer with proper structure and metadata
   */
  private formatTransferNotes(
    assessmentName: string,
    notes: string,
    completionDate: string,
    status: string
  ): string {
    const formattedDate = new Date(completionDate).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `
═══════════════════════════════════════════════════════════════
ASSESSMENT COMPLETION NOTES
Assessment: ${assessmentName}
Status: ${status.toUpperCase().replace('-', ' ')}
Completed: ${formattedDate}
═══════════════════════════════════════════════════════════════

${notes}

═══════════════════════════════════════════════════════════════
`;
  }

  /**
   * Append new notes to existing notes with proper formatting
   */
  private appendNotes(existingNotes: string, newNotes: string): string {
    if (!existingNotes || existingNotes.trim() === '') {
      return newNotes.trim();
    }
    
    return `${existingNotes.trim()}\n\n${newNotes.trim()}`;
  }

  /**
   * Log the notes transfer for audit purposes
   */
  private async logNotesTransfer(
    assessmentId: string,
    requirementId: string,
    transferredNotes: string,
    timestamp: string
  ): Promise<void> {
    try {
      await supabase
        .from('assessment_comments')
        .insert({
          assessment_id: assessmentId,
          requirement_id: requirementId,
          user_id: null, // System-generated
          comment: `Notes transferred to requirement on assessment completion: ${transferredNotes.substring(0, 100)}...`,
          is_internal: true,
          created_at: timestamp
        });
    } catch (error) {
      console.warn('Failed to log notes transfer:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Create a completion record for tracking
   */
  private async createCompletionRecord(
    assessmentId: string,
    transferredCount: number,
    completionDate: string
  ): Promise<void> {
    try {
      await supabase
        .from('assessment_comments')
        .insert({
          assessment_id: assessmentId,
          user_id: null, // System-generated
          comment: `Assessment completed. ${transferredCount} requirement notes transferred to global requirement database.`,
          is_internal: true,
          created_at: completionDate
        });
    } catch (error) {
      console.warn('Failed to create completion record:', error);
    }
  }

  /**
   * Rollback assessment completion (reopen assessment)
   */
  async rollbackCompletion(assessmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'in-progress',
          end_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log the rollback
      await supabase
        .from('assessment_comments')
        .insert({
          assessment_id: assessmentId,
          user_id: null,
          comment: 'Assessment completion rolled back - status changed to in-progress',
          is_internal: true
        });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get completion status and transfer history for an assessment
   */
  async getCompletionStatus(assessmentId: string): Promise<{
    isCompleted: boolean;
    completionDate?: string;
    transferredCount?: number;
    transferHistory: Array<{
      requirementId: string;
      requirementName: string;
      transferDate: string;
      notes: string;
    }>;
  }> {
    try {
      // Get assessment info
      const { data: assessment } = await supabase
        .from('assessments')
        .select('status, end_date')
        .eq('id', assessmentId)
        .single();

      // Get transfer history from comments
      const { data: transferComments } = await supabase
        .from('assessment_comments')
        .select(`
          created_at,
          comment,
          requirement_id,
          requirements_library (
            name
          )
        `)
        .eq('assessment_id', assessmentId)
        .eq('is_internal', true)
        .like('comment', 'Notes transferred to requirement%')
        .order('created_at', { ascending: false });

      return {
        isCompleted: assessment?.status === 'completed',
        completionDate: assessment?.end_date,
        transferredCount: transferComments?.length || 0,
        transferHistory: transferComments?.map(comment => ({
          requirementId: comment.requirement_id,
          requirementName: (comment as any).requirements_library?.name || 'Unknown',
          transferDate: comment.created_at,
          notes: comment.comment
        })) || []
      };
    } catch (error) {
      console.error('Failed to get completion status:', error);
      return {
        isCompleted: false,
        transferHistory: []
      };
    }
  }
}

// Export singleton instance
export const assessmentCompletionService = AssessmentCompletionService.getInstance();