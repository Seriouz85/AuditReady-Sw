/**
 * Unified Requirements Validation Persistence Service
 * 
 * Handles all database operations for AI suggestion persistence, validation sessions,
 * approvals, and change history in the unified requirements validation system.
 */

import { supabase } from '../../lib/supabase';
import type { 
  RequirementSuggestion, 
  UnifiedRequirementAnalysis, 
  CategoryValidationResult 
} from './AIRequirementsValidationService';
import { RollbackData, DiagnosticData } from '@/types/auth';

// Database schema interfaces matching the migration
export interface ValidationSession {
  id: string;
  category_name: string;
  initiated_by: string;
  initiated_at: string;
  completed_at?: string;
  session_status: 'active' | 'completed' | 'cancelled';
  
  // Session metadata
  total_requirements: number;
  analyzed_requirements: number;
  approved_suggestions: number;
  rejected_suggestions: number;
  
  // Quality metrics
  overall_quality_score?: number;
  framework_coverage_score?: number;
  requirements_needing_attention: number;
  
  // Performance
  analysis_duration_seconds?: number;
  session_notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PersistedRequirementAnalysis {
  id: string;
  session_id: string;
  
  // Requirement identification
  requirement_id: string;
  requirement_letter: string;
  requirement_title: string;
  requirement_description?: string;
  original_text: string;
  
  // Analysis results
  current_word_count: number;
  optimal_word_range_min: number;
  optimal_word_range_max: number;
  length_compliance: 'too_short' | 'optimal' | 'too_long';
  
  // Quality scores
  clarity_score: number;
  completeness_score: number;
  framework_coverage_score: number;
  overall_confidence_score: number;
  
  // Framework analysis
  detected_frameworks: string[];
  mapped_standards_count: number;
  missing_framework_coverage: string[];
  
  // Metadata
  analysis_timestamp: string;
  ai_model_version: string;
  analysis_duration_ms?: number;
  
  created_at: string;
  updated_at: string;
}

export interface PersistedSuggestion {
  id: string;
  analysis_id: string;
  session_id: string;
  
  // Suggestion details
  suggestion_type: 'length_optimization' | 'framework_enhancement' | 'clarity_improvement' | 'completeness_addition';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  current_text: string;
  suggested_text: string;
  rationale: string;
  framework_specific?: string;
  
  // Impact
  estimated_word_change: number;
  confidence_score: number;
  
  // Approval workflow
  approval_status: 'pending' | 'approved' | 'rejected' | 'requires_review';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  
  // Bulk operations
  bulk_operation_id?: string;
  auto_approved: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface FrameworkCoverageAnalysis {
  id: string;
  session_id: string;
  framework_name: string;
  category_name: string;
  
  // Coverage metrics
  coverage_percentage: number;
  requirements_with_framework: number;
  total_requirements: number;
  
  // Gap analysis
  missing_topics: string[];
  recommended_additions: string[];
  
  // Mappings
  mapped_standards_count: number;
  unmapped_standards_count: number;
  
  created_at: string;
}

export interface RequirementChangeHistory {
  id: string;
  session_id: string;
  requirement_id: string;
  change_type: 'content_update' | 'length_optimization' | 'framework_enhancement' | 'clarity_improvement' | 'bulk_approval';
  
  // Content changes
  original_content: string;
  updated_content: string;
  change_summary?: string;
  
  // Metadata
  applied_suggestions: string[]; // Array of suggestion IDs
  change_reason?: string;
  framework_specific?: string;
  word_count_change: number;
  
  // Approval tracking
  changed_by?: string;
  approved_by?: string;
  change_timestamp: string;
  
  // Rollback
  can_rollback: boolean;
  rollback_data?: RollbackData;
  
  created_at: string;
}

export interface SessionMetrics {
  id: string;
  session_id: string;
  
  // Performance metrics
  total_analysis_time_seconds: number;
  average_requirement_analysis_time: number;
  suggestions_generated: number;
  suggestions_approved: number;
  suggestions_rejected: number;
  
  // Quality improvement
  quality_score_improvement: number;
  framework_coverage_improvement: number;
  word_count_optimization: number;
  
  // Framework-specific metrics
  framework_enhancements_applied: number;
  clarity_improvements_applied: number;
  length_optimizations_applied: number;
  
  // User interaction metrics
  bulk_operations_performed: number;
  manual_reviews_performed: number;
  rollbacks_performed: number;
  
  // Diagnostics
  errors_encountered: number;
  warnings_generated: number;
  diagnostic_data?: DiagnosticData;
  
  created_at: string;
  updated_at: string;
}

export class UnifiedRequirementsValidationPersistenceService {
  
  /**
   * 🚀 Create new validation session
   */
  static async createValidationSession(
    categoryName: string,
    initiatedBy: string,
    sessionNotes?: string
  ): Promise<ValidationSession> {
    console.log('🚀 DIAGNOSTIC: Creating validation session', {
      categoryName,
      initiatedBy,
      hasNotes: !!sessionNotes,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('unified_requirements_validation_sessions')
        .insert({
          category_name: categoryName,
          initiated_by: initiatedBy,
          session_status: 'active',
          total_requirements: 0,
          analyzed_requirements: 0,
          approved_suggestions: 0,
          rejected_suggestions: 0,
          requirements_needing_attention: 0,
          session_notes: sessionNotes
        })
        .select()
        .single();

      if (error) {
        console.error('❌ DIAGNOSTIC: Failed to create validation session:', error);
        throw error;
      }

      console.log('✅ DIAGNOSTIC: Validation session created', {
        sessionId: data.id,
        categoryName: data.category_name,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Create validation session error:', error);
      throw error;
    }
  }

  /**
   * 📊 Persist requirement analysis results
   */
  static async persistRequirementAnalysis(
    sessionId: string,
    analysis: UnifiedRequirementAnalysis,
    analysisDurationMs?: number
  ): Promise<PersistedRequirementAnalysis> {
    console.log('📊 DIAGNOSTIC: Persisting requirement analysis', {
      sessionId,
      requirementId: analysis.requirement_id,
      suggestionCount: analysis.suggestions.length,
      confidenceScore: analysis.confidence_score,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('ai_requirements_analysis')
        .insert({
          session_id: sessionId,
          requirement_id: analysis.requirement_id,
          requirement_letter: analysis.letter,
          requirement_title: analysis.title,
          requirement_description: analysis.description,
          original_text: analysis.title + (analysis.description ? ` - ${analysis.description}` : ''),
          current_word_count: analysis.current_length,
          optimal_word_range_min: analysis.optimal_length_range[0],
          optimal_word_range_max: analysis.optimal_length_range[1],
          length_compliance: analysis.length_compliance,
          clarity_score: analysis.clarity_score,
          completeness_score: analysis.completeness_score,
          framework_coverage_score: analysis.framework_coverage_score,
          overall_confidence_score: analysis.confidence_score,
          detected_frameworks: analysis.detected_frameworks,
          mapped_standards_count: analysis.mapped_standards.length,
          missing_framework_coverage: analysis.missing_framework_coverage,
          ai_model_version: 'v1.0',
          analysis_duration_ms: analysisDurationMs
        })
        .select()
        .single();

      if (error) {
        console.error('❌ DIAGNOSTIC: Failed to persist requirement analysis:', error);
        throw error;
      }

      console.log('✅ DIAGNOSTIC: Requirement analysis persisted', {
        analysisId: data.id,
        requirementId: data.requirement_id,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Persist requirement analysis error:', error);
      throw error;
    }
  }

  /**
   * 💡 Persist AI suggestions
   */
  static async persistSuggestions(
    sessionId: string,
    analysisId: string,
    suggestions: RequirementSuggestion[]
  ): Promise<PersistedSuggestion[]> {
    if (suggestions.length === 0) return [];

    console.log('💡 DIAGNOSTIC: Persisting AI suggestions', {
      sessionId,
      analysisId,
      suggestionCount: suggestions.length,
      suggestionTypes: [...new Set(suggestions.map(s => s.type))],
      priorities: [...new Set(suggestions.map(s => s.priority))],
      timestamp: new Date().toISOString()
    });

    try {
      const suggestionInserts = suggestions.map(suggestion => ({
        analysis_id: analysisId,
        session_id: sessionId,
        suggestion_type: suggestion.type,
        priority_level: suggestion.priority,
        current_text: suggestion.current_text,
        suggested_text: suggestion.suggested_text,
        rationale: suggestion.rationale,
        framework_specific: suggestion.framework_specific,
        estimated_word_change: suggestion.estimated_word_change,
        confidence_score: suggestion.confidence,
        approval_status: 'pending' as const,
        auto_approved: false
      }));

      const { data, error } = await supabase
        .from('ai_requirement_suggestions')
        .insert(suggestionInserts)
        .select();

      if (error) {
        console.error('❌ DIAGNOSTIC: Failed to persist suggestions:', error);
        throw error;
      }

      console.log('✅ DIAGNOSTIC: AI suggestions persisted', {
        persistedCount: data.length,
        sessionId,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Persist suggestions error:', error);
      throw error;
    }
  }

  /**
   * 🎯 Persist framework coverage analysis
   */
  static async persistFrameworkCoverage(
    sessionId: string,
    categoryName: string,
    frameworkGaps: CategoryValidationResult['framework_gaps']
  ): Promise<FrameworkCoverageAnalysis[]> {
    if (frameworkGaps.length === 0) return [];

    console.log('🎯 DIAGNOSTIC: Persisting framework coverage analysis', {
      sessionId,
      categoryName,
      frameworkCount: frameworkGaps.length,
      frameworks: frameworkGaps.map(fg => fg.framework),
      timestamp: new Date().toISOString()
    });

    try {
      const coverageInserts = frameworkGaps.map(gap => ({
        session_id: sessionId,
        framework_name: gap.framework,
        category_name: categoryName,
        coverage_percentage: gap.coverage_percentage,
        requirements_with_framework: Math.floor((gap.coverage_percentage / 100) * 10), // Estimate
        total_requirements: 10, // Will be updated later
        missing_topics: gap.missing_topics,
        recommended_additions: [], // Could be derived from missing_topics
        mapped_standards_count: 0, // Will be calculated
        unmapped_standards_count: 0
      }));

      const { data, error } = await supabase
        .from('framework_coverage_analysis')
        .insert(coverageInserts)
        .select();

      if (error) {
        console.error('❌ DIAGNOSTIC: Failed to persist framework coverage:', error);
        throw error;
      }

      console.log('✅ DIAGNOSTIC: Framework coverage analysis persisted', {
        persistedCount: data.length,
        sessionId,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Persist framework coverage error:', error);
      throw error;
    }
  }

  /**
   * ✅ Approve suggestion and create change history
   */
  static async approveSuggestion(
    suggestionId: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<{ suggestion: PersistedSuggestion; changeHistory?: RequirementChangeHistory }> {
    console.log('✅ DIAGNOSTIC: Approving suggestion', {
      suggestionId,
      reviewedBy,
      hasReviewNotes: !!reviewNotes,
      timestamp: new Date().toISOString()
    });

    try {
      // First, get the suggestion to create change history
      const { data: suggestion, error: fetchError } = await supabase
        .from('ai_requirement_suggestions')
        .select(`
          *,
          analysis:ai_requirements_analysis(
            requirement_id,
            requirement_title,
            requirement_description,
            original_text
          )
        `)
        .eq('id', suggestionId)
        .single();

      if (fetchError) {
        console.error('❌ DIAGNOSTIC: Failed to fetch suggestion for approval:', fetchError);
        throw fetchError;
      }

      // Update suggestion status
      const { data: updatedSuggestion, error: updateError } = await supabase
        .from('ai_requirement_suggestions')
        .update({
          approval_status: 'approved',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', suggestionId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ DIAGNOSTIC: Failed to update suggestion approval:', updateError);
        throw updateError;
      }

      // Create change history record
      let changeHistory: RequirementChangeHistory | undefined;
      if (suggestion.analysis) {
        const { data: historyData, error: historyError } = await supabase
          .from('unified_requirements_change_history')
          .insert({
            session_id: suggestion.session_id,
            requirement_id: suggestion.analysis.requirement_id,
            change_type: suggestion.suggestion_type,
            original_content: suggestion.current_text,
            updated_content: suggestion.suggested_text,
            change_summary: `Applied AI suggestion: ${suggestion.rationale}`,
            applied_suggestions: [suggestionId],
            change_reason: 'AI suggestion approval',
            framework_specific: suggestion.framework_specific,
            word_count_change: suggestion.estimated_word_change,
            changed_by: reviewedBy,
            approved_by: reviewedBy,
            can_rollback: true,
            rollback_data: {
              original_suggestion: suggestion,
              approval_timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (historyError) {
          console.error('⚠️ DIAGNOSTIC: Failed to create change history (non-critical):', historyError);
        } else {
          changeHistory = historyData;
        }
      }

      console.log('✅ DIAGNOSTIC: Suggestion approved successfully', {
        suggestionId,
        changeHistoryId: changeHistory?.id,
        timestamp: new Date().toISOString()
      });

      return { suggestion: updatedSuggestion, changeHistory };
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Approve suggestion error:', error);
      throw error;
    }
  }

  /**
   * ❌ Reject suggestion
   */
  static async rejectSuggestion(
    suggestionId: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<PersistedSuggestion> {
    console.log('❌ DIAGNOSTIC: Rejecting suggestion', {
      suggestionId,
      reviewedBy,
      hasReviewNotes: !!reviewNotes,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('ai_requirement_suggestions')
        .update({
          approval_status: 'rejected',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', suggestionId)
        .select()
        .single();

      if (error) {
        console.error('❌ DIAGNOSTIC: Failed to reject suggestion:', error);
        throw error;
      }

      console.log('✅ DIAGNOSTIC: Suggestion rejected successfully', {
        suggestionId,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Reject suggestion error:', error);
      throw error;
    }
  }

  /**
   * 📦 Bulk approve suggestions
   */
  static async bulkApproveSuggestions(
    suggestionIds: string[],
    reviewedBy: string,
    bulkOperationId: string,
    reviewNotes?: string
  ): Promise<{ approved: PersistedSuggestion[]; errors: string[] }> {
    if (suggestionIds.length === 0) return { approved: [], errors: [] };

    console.log('📦 DIAGNOSTIC: Bulk approving suggestions', {
      suggestionCount: suggestionIds.length,
      bulkOperationId,
      reviewedBy,
      timestamp: new Date().toISOString()
    });

    const approved: PersistedSuggestion[] = [];
    const errors: string[] = [];

    try {
      // Process in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < suggestionIds.length; i += batchSize) {
        const batch = suggestionIds.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('ai_requirement_suggestions')
          .update({
            approval_status: 'approved',
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
            review_notes: reviewNotes,
            bulk_operation_id: bulkOperationId,
            auto_approved: true
          })
          .in('id', batch)
          .eq('approval_status', 'pending') // Only approve pending suggestions
          .select();

        if (error) {
          console.error(`❌ DIAGNOSTIC: Bulk approval batch ${i / batchSize + 1} failed:`, error);
          errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        } else {
          approved.push(...data);
        }
      }

      console.log('✅ DIAGNOSTIC: Bulk approval completed', {
        approvedCount: approved.length,
        errorCount: errors.length,
        bulkOperationId,
        timestamp: new Date().toISOString()
      });

      return { approved, errors };
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Bulk approve suggestions error:', error);
      throw error;
    }
  }

  /**
   * 📦 Bulk reject suggestions
   */
  static async bulkRejectSuggestions(
    suggestionIds: string[],
    reviewedBy: string,
    bulkOperationId: string,
    reviewNotes?: string
  ): Promise<{ rejected: PersistedSuggestion[]; errors: string[] }> {
    if (suggestionIds.length === 0) return { rejected: [], errors: [] };

    console.log('📦 DIAGNOSTIC: Bulk rejecting suggestions', {
      suggestionCount: suggestionIds.length,
      bulkOperationId,
      reviewedBy,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('ai_requirement_suggestions')
        .update({
          approval_status: 'rejected',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
          bulk_operation_id: bulkOperationId,
          auto_approved: false
        })
        .in('id', suggestionIds)
        .eq('approval_status', 'pending') // Only reject pending suggestions
        .select();

      if (error) {
        console.error('❌ DIAGNOSTIC: Bulk rejection failed:', error);
        return { rejected: [], errors: [error.message] };
      }

      console.log('✅ DIAGNOSTIC: Bulk rejection completed', {
        rejectedCount: data.length,
        bulkOperationId,
        timestamp: new Date().toISOString()
      });

      return { rejected: data, errors: [] };
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Bulk reject suggestions error:', error);
      throw error;
    }
  }

  /**
   * 🔄 Complete validation session
   */
  static async completeValidationSession(
    sessionId: string,
    sessionMetrics: Partial<SessionMetrics>
  ): Promise<{ session: ValidationSession; metrics: SessionMetrics }> {
    console.log('🔄 DIAGNOSTIC: Completing validation session', {
      sessionId,
      hasMetrics: !!sessionMetrics,
      timestamp: new Date().toISOString()
    });

    try {
      // Update session status
      const { data: session, error: sessionError } = await supabase
        .from('unified_requirements_validation_sessions')
        .update({
          session_status: 'completed',
          completed_at: new Date().toISOString(),
          overall_quality_score: sessionMetrics.quality_score_improvement,
          framework_coverage_score: sessionMetrics.framework_coverage_improvement,
          analysis_duration_seconds: sessionMetrics.total_analysis_time_seconds
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (sessionError) {
        console.error('❌ DIAGNOSTIC: Failed to complete validation session:', sessionError);
        throw sessionError;
      }

      // Create session metrics record
      const { data: metrics, error: metricsError } = await supabase
        .from('validation_session_metrics')
        .insert({
          session_id: sessionId,
          ...sessionMetrics
        })
        .select()
        .single();

      if (metricsError) {
        console.error('❌ DIAGNOSTIC: Failed to create session metrics:', metricsError);
        throw metricsError;
      }

      console.log('✅ DIAGNOSTIC: Validation session completed successfully', {
        sessionId,
        metricsId: metrics.id,
        timestamp: new Date().toISOString()
      });

      return { session, metrics };
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Complete validation session error:', error);
      throw error;
    }
  }

  /**
   * 📈 Get session with detailed metrics
   */
  static async getValidationSessionWithMetrics(sessionId: string): Promise<{
    session: ValidationSession;
    analyses: PersistedRequirementAnalysis[];
    suggestions: PersistedSuggestion[];
    metrics?: SessionMetrics;
  }> {
    console.log('📈 DIAGNOSTIC: Fetching validation session with metrics', {
      sessionId,
      timestamp: new Date().toISOString()
    });

    try {
      // Fetch session
      const { data: session, error: sessionError } = await supabase
        .from('unified_requirements_validation_sessions')
        .select()
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('❌ DIAGNOSTIC: Failed to fetch validation session:', sessionError);
        throw sessionError;
      }

      // Fetch analyses
      const { data: analyses, error: analysesError } = await supabase
        .from('ai_requirements_analysis')
        .select()
        .eq('session_id', sessionId)
        .order('requirement_letter');

      if (analysesError) {
        console.error('❌ DIAGNOSTIC: Failed to fetch analyses:', analysesError);
        throw analysesError;
      }

      // Fetch suggestions
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('ai_requirement_suggestions')
        .select()
        .eq('session_id', sessionId)
        .order('created_at');

      if (suggestionsError) {
        console.error('❌ DIAGNOSTIC: Failed to fetch suggestions:', suggestionsError);
        throw suggestionsError;
      }

      // Fetch metrics (optional)
      const { data: metrics } = await supabase
        .from('validation_session_metrics')
        .select()
        .eq('session_id', sessionId)
        .single();

      console.log('✅ DIAGNOSTIC: Session data fetched successfully', {
        sessionId,
        analysesCount: analyses?.length || 0,
        suggestionsCount: suggestions?.length || 0,
        hasMetrics: !!metrics,
        timestamp: new Date().toISOString()
      });

      return {
        session,
        analyses: analyses || [],
        suggestions: suggestions || [],
        metrics: metrics || undefined
      };
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Get validation session error:', error);
      throw error;
    }
  }

  /**
   * 📊 Get recent validation sessions
   */
  static async getRecentValidationSessions(limit: number = 10): Promise<ValidationSession[]> {
    console.log('📊 DIAGNOSTIC: Fetching recent validation sessions', {
      limit,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('unified_requirements_validation_sessions')
        .select()
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ DIAGNOSTIC: Failed to fetch recent sessions:', error);
        throw error;
      }

      console.log('✅ DIAGNOSTIC: Recent sessions fetched successfully', {
        sessionCount: data.length,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Get recent validation sessions error:', error);
      throw error;
    }
  }
}