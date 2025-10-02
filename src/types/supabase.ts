export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_content_edits: {
        Row: {
          admin_notes: string | null
          admin_role: string | null
          admin_user_id: string
          affects_cache_keys: Json | null
          affects_quality_score: boolean | null
          applied_at: string | null
          approval_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          change_description: string | null
          content_diff: string | null
          created_at: string | null
          deployed_at: string | null
          deployment_notes: string | null
          deployment_status: string | null
          edit_reason: string | null
          edit_type: string | null
          estimated_impact_level: string | null
          field_name: string | null
          id: string
          organization_id: string | null
          original_content: string | null
          requires_ai_regeneration: boolean | null
          scheduled_deployment_at: string | null
          section_type: string | null
          template_id: string | null
          updated_content: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_role?: string | null
          admin_user_id: string
          affects_cache_keys?: Json | null
          affects_quality_score?: boolean | null
          applied_at?: string | null
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_description?: string | null
          content_diff?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployment_notes?: string | null
          deployment_status?: string | null
          edit_reason?: string | null
          edit_type?: string | null
          estimated_impact_level?: string | null
          field_name?: string | null
          id?: string
          organization_id?: string | null
          original_content?: string | null
          requires_ai_regeneration?: boolean | null
          scheduled_deployment_at?: string | null
          section_type?: string | null
          template_id?: string | null
          updated_content?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_role?: string | null
          admin_user_id?: string
          affects_cache_keys?: Json | null
          affects_quality_score?: boolean | null
          applied_at?: string | null
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_description?: string | null
          content_diff?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployment_notes?: string | null
          deployment_status?: string | null
          edit_reason?: string | null
          edit_type?: string | null
          estimated_impact_level?: string | null
          field_name?: string | null
          id?: string
          organization_id?: string | null
          original_content?: string | null
          requires_ai_regeneration?: boolean | null
          scheduled_deployment_at?: string | null
          section_type?: string | null
          template_id?: string | null
          updated_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_content_edits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_content_edits_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unified_guidance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ai_generation_logs: {
        Row: {
          ai_model: string
          ai_provider: string
          api_cost: number | null
          content_coherence: number | null
          content_relevance: number | null
          cost_per_token: number | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          factual_accuracy: number | null
          framework_context: Json | null
          id: string
          input_prompt: string
          ip_address: unknown | null
          max_tokens: number | null
          model_version: string | null
          organization_id: string | null
          request_success: boolean | null
          request_type: string | null
          response_content: string | null
          response_finish_reason: string | null
          response_time_ms: number | null
          session_id: string | null
          system_prompt: string | null
          temperature: number | null
          template_context: Json | null
          template_id: string | null
          tokens_completion: number | null
          tokens_prompt: number | null
          total_tokens: number | null
          user_agent: string | null
          user_context: Json | null
          user_id: string | null
          user_satisfaction: number | null
        }
        Insert: {
          ai_model: string
          ai_provider: string
          api_cost?: number | null
          content_coherence?: number | null
          content_relevance?: number | null
          cost_per_token?: number | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          factual_accuracy?: number | null
          framework_context?: Json | null
          id?: string
          input_prompt: string
          ip_address?: unknown | null
          max_tokens?: number | null
          model_version?: string | null
          organization_id?: string | null
          request_success?: boolean | null
          request_type?: string | null
          response_content?: string | null
          response_finish_reason?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          system_prompt?: string | null
          temperature?: number | null
          template_context?: Json | null
          template_id?: string | null
          tokens_completion?: number | null
          tokens_prompt?: number | null
          total_tokens?: number | null
          user_agent?: string | null
          user_context?: Json | null
          user_id?: string | null
          user_satisfaction?: number | null
        }
        Update: {
          ai_model?: string
          ai_provider?: string
          api_cost?: number | null
          content_coherence?: number | null
          content_relevance?: number | null
          cost_per_token?: number | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          factual_accuracy?: number | null
          framework_context?: Json | null
          id?: string
          input_prompt?: string
          ip_address?: unknown | null
          max_tokens?: number | null
          model_version?: string | null
          organization_id?: string | null
          request_success?: boolean | null
          request_type?: string | null
          response_content?: string | null
          response_finish_reason?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          system_prompt?: string | null
          temperature?: number | null
          template_context?: Json | null
          template_id?: string | null
          tokens_completion?: number | null
          tokens_prompt?: number | null
          total_tokens?: number | null
          user_agent?: string | null
          user_context?: Json | null
          user_id?: string | null
          user_satisfaction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generation_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unified_guidance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          citations: Json
          confidence_score: number
          created_at: string | null
          created_by_ai_model: string | null
          id: string
          impact_label: string
          original_content: string | null
          processing_time_ms: number | null
          rationale: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          source_chunks: string[]
          status: string | null
          suggested_content: string
          suggestion_type: string
          target_block_id: string | null
          target_version_id: string
          token_usage: Json | null
          unified_requirement_id: string
        }
        Insert: {
          citations?: Json
          confidence_score: number
          created_at?: string | null
          created_by_ai_model?: string | null
          id?: string
          impact_label: string
          original_content?: string | null
          processing_time_ms?: number | null
          rationale: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          source_chunks: string[]
          status?: string | null
          suggested_content: string
          suggestion_type: string
          target_block_id?: string | null
          target_version_id: string
          token_usage?: Json | null
          unified_requirement_id: string
        }
        Update: {
          citations?: Json
          confidence_score?: number
          created_at?: string | null
          created_by_ai_model?: string | null
          id?: string
          impact_label?: string
          original_content?: string | null
          processing_time_ms?: number | null
          rationale?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          source_chunks?: string[]
          status?: string | null
          suggested_content?: string
          suggestion_type?: string
          target_block_id?: string | null
          target_version_id?: string
          token_usage?: Json | null
          unified_requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_target_block_id_fkey"
            columns: ["target_block_id"]
            isOneToOne: false
            referencedRelation: "guidance_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_target_version_id_fkey"
            columns: ["target_version_id"]
            isOneToOne: false
            referencedRelation: "guidance_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_unified_requirement_id_fkey"
            columns: ["unified_requirement_id"]
            isOneToOne: false
            referencedRelation: "unified_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_comments: {
        Row: {
          assessment_id: string
          attachments: Json | null
          comment: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_internal: boolean | null
          mentions: string[] | null
          parent_comment_id: string | null
          requirement_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          attachments?: Json | null
          comment: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          mentions?: string[] | null
          parent_comment_id?: string | null
          requirement_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          attachments?: Json | null
          comment?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          mentions?: string[] | null
          parent_comment_id?: string | null
          requirement_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_comments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "assessment_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_comments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_evidence: {
        Row: {
          assessment_id: string
          collected_at: string | null
          collected_by: string
          created_at: string | null
          description: string | null
          evidence_type: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          requirement_id: string
          title: string
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assessment_id: string
          collected_at?: string | null
          collected_by: string
          created_at?: string | null
          description?: string | null
          evidence_type: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          requirement_id: string
          title: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assessment_id?: string
          collected_at?: string | null
          collected_by?: string
          created_at?: string | null
          description?: string | null
          evidence_type?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          requirement_id?: string
          title?: string
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_evidence_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_evidence_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_requirements: {
        Row: {
          assessment_id: string
          assessment_notes: Json | null
          created_at: string | null
          evidence: string | null
          id: string
          notes: string | null
          requirement_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          assessment_notes?: Json | null
          created_at?: string | null
          evidence?: string | null
          id?: string
          notes?: string | null
          requirement_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          assessment_notes?: Json | null
          created_at?: string | null
          evidence?: string | null
          id?: string
          notes?: string | null
          requirement_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_requirements_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_requirements_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_templates: {
        Row: {
          created_at: string | null
          created_by: string
          default_workflow_id: string | null
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          methodology: string | null
          name: string
          organization_id: string
          risk_scoring_enabled: boolean | null
          sections: Json | null
          standard_ids: string[]
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_workflow_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name: string
          organization_id: string
          risk_scoring_enabled?: boolean | null
          sections?: Json | null
          standard_ids: string[]
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_workflow_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          methodology?: string | null
          name?: string
          organization_id?: string
          risk_scoring_enabled?: boolean | null
          sections?: Json | null
          standard_ids?: string[]
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      assessment_workflows: {
        Row: {
          auto_advance: boolean | null
          created_at: string | null
          created_by: string
          current_stage: number | null
          description: string | null
          id: string
          name: string
          notification_settings: Json | null
          organization_id: string
          stages: Json
          updated_at: string | null
        }
        Insert: {
          auto_advance?: boolean | null
          created_at?: string | null
          created_by: string
          current_stage?: number | null
          description?: string | null
          id?: string
          name: string
          notification_settings?: Json | null
          organization_id: string
          stages: Json
          updated_at?: string | null
        }
        Update: {
          auto_advance?: boolean | null
          created_at?: string | null
          created_by?: string
          current_stage?: number | null
          description?: string | null
          id?: string
          name?: string
          notification_settings?: Json | null
          organization_id?: string
          stages?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          assessor_id: string | null
          assessor_ids: string[] | null
          assessor_name: string | null
          assessor_names: string[] | null
          assigned_team_ids: string[] | null
          compliance_score: number | null
          created_at: string | null
          critical_findings_count: number | null
          current_workflow_stage: number | null
          description: string | null
          end_date: string | null
          evidence: string | null
          findings_count: number | null
          id: string
          is_recurring: boolean | null
          locked_at: string | null
          locked_by: string | null
          maturity_level: number | null
          name: string
          notes: string | null
          organization_id: string
          parent_assessment_id: string | null
          progress: number | null
          recurrence_pattern: Json | null
          reviewer_ids: string[] | null
          risk_score: number | null
          standard_ids: string[]
          start_date: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
          version: number | null
          workflow_id: string | null
          workflow_status: string | null
        }
        Insert: {
          assessor_id?: string | null
          assessor_ids?: string[] | null
          assessor_name?: string | null
          assessor_names?: string[] | null
          assigned_team_ids?: string[] | null
          compliance_score?: number | null
          created_at?: string | null
          critical_findings_count?: number | null
          current_workflow_stage?: number | null
          description?: string | null
          end_date?: string | null
          evidence?: string | null
          findings_count?: number | null
          id?: string
          is_recurring?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          maturity_level?: number | null
          name: string
          notes?: string | null
          organization_id: string
          parent_assessment_id?: string | null
          progress?: number | null
          recurrence_pattern?: Json | null
          reviewer_ids?: string[] | null
          risk_score?: number | null
          standard_ids: string[]
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          version?: number | null
          workflow_id?: string | null
          workflow_status?: string | null
        }
        Update: {
          assessor_id?: string | null
          assessor_ids?: string[] | null
          assessor_name?: string | null
          assessor_names?: string[] | null
          assigned_team_ids?: string[] | null
          compliance_score?: number | null
          created_at?: string | null
          critical_findings_count?: number | null
          current_workflow_stage?: number | null
          description?: string | null
          end_date?: string | null
          evidence?: string | null
          findings_count?: number | null
          id?: string
          is_recurring?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          maturity_level?: number | null
          name?: string
          notes?: string | null
          organization_id?: string
          parent_assessment_id?: string | null
          progress?: number | null
          recurrence_pattern?: Json | null
          reviewer_ids?: string[] | null
          risk_score?: number | null
          standard_ids?: string[]
          start_date?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          version?: number | null
          workflow_id?: string | null
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_parent_assessment_id_fkey"
            columns: ["parent_assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "assessment_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "assessment_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          enrollment_id: string
          feedback: string | null
          file_sizes_kb: number[] | null
          file_urls: string[] | null
          grade: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_late: boolean | null
          metadata: Json | null
          organization_id: string
          original_filenames: string[] | null
          score: number | null
          status: string | null
          submission_number: number
          submission_url: string | null
          submitted_at: string | null
          text_content: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          enrollment_id: string
          feedback?: string | null
          file_sizes_kb?: number[] | null
          file_urls?: string[] | null
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_late?: boolean | null
          metadata?: Json | null
          organization_id: string
          original_filenames?: string[] | null
          score?: number | null
          status?: string | null
          submission_number?: number
          submission_url?: string | null
          submitted_at?: string | null
          text_content?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          enrollment_id?: string
          feedback?: string | null
          file_sizes_kb?: number[] | null
          file_urls?: string[] | null
          grade?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_late?: boolean | null
          metadata?: Json | null
          organization_id?: string
          original_filenames?: string[] | null
          score?: number | null
          status?: string | null
          submission_number?: number
          submission_url?: string | null
          submitted_at?: string | null
          text_content?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          allowed_file_types: string[] | null
          auto_grade: boolean | null
          available_from: string | null
          available_until: string | null
          created_at: string | null
          created_by: string
          description: string
          due_date: string | null
          grading_type: string | null
          id: string
          instructions: string | null
          late_penalty_percentage: number | null
          late_submission_allowed: boolean | null
          learning_content_id: string
          max_file_size_mb: number | null
          max_submissions: number | null
          organization_id: string
          status: string | null
          submission_type: string
          title: string
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_file_types?: string[] | null
          auto_grade?: boolean | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          created_by: string
          description: string
          due_date?: string | null
          grading_type?: string | null
          id?: string
          instructions?: string | null
          late_penalty_percentage?: number | null
          late_submission_allowed?: boolean | null
          learning_content_id: string
          max_file_size_mb?: number | null
          max_submissions?: number | null
          organization_id: string
          status?: string | null
          submission_type: string
          title: string
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_file_types?: string[] | null
          auto_grade?: boolean | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          due_date?: string | null
          grading_type?: string | null
          id?: string
          instructions?: string | null
          late_penalty_percentage?: number | null
          late_submission_allowed?: boolean | null
          learning_content_id?: string
          max_file_size_mb?: number | null
          max_submissions?: number | null
          organization_id?: string
          status?: string | null
          submission_type?: string
          title?: string
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_learning_content_id_fkey"
            columns: ["learning_content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          record_id: string
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          record_id: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          record_id?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      certificate_templates: {
        Row: {
          available_fields: Json | null
          created_at: string | null
          created_by: string
          css_styles: string | null
          description: string | null
          html_template: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          layout: string | null
          name: string
          organization_id: string
          qr_code_enabled: boolean | null
          signatures: Json | null
          template_type: string | null
          updated_at: string | null
          validity_months: number | null
          verification_enabled: boolean | null
        }
        Insert: {
          available_fields?: Json | null
          created_at?: string | null
          created_by: string
          css_styles?: string | null
          description?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          layout?: string | null
          name: string
          organization_id: string
          qr_code_enabled?: boolean | null
          signatures?: Json | null
          template_type?: string | null
          updated_at?: string | null
          validity_months?: number | null
          verification_enabled?: boolean | null
        }
        Update: {
          available_fields?: Json | null
          created_at?: string | null
          created_by?: string
          css_styles?: string | null
          description?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          layout?: string | null
          name?: string
          organization_id?: string
          qr_code_enabled?: boolean | null
          signatures?: Json | null
          template_type?: string | null
          updated_at?: string | null
          validity_months?: number | null
          verification_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          certificate_url: string
          completion_date: string
          created_at: string | null
          description: string | null
          enrollment_id: string
          expiry_date: string | null
          final_score: number | null
          id: string
          is_revoked: boolean | null
          issued_date: string | null
          learning_path_id: string
          metadata: Json | null
          organization_id: string
          public_verification_url: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          template_used: string | null
          title: string
          user_id: string
          verification_code: string
        }
        Insert: {
          certificate_number: string
          certificate_url: string
          completion_date: string
          created_at?: string | null
          description?: string | null
          enrollment_id: string
          expiry_date?: string | null
          final_score?: number | null
          id?: string
          is_revoked?: boolean | null
          issued_date?: string | null
          learning_path_id: string
          metadata?: Json | null
          organization_id: string
          public_verification_url?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          template_used?: string | null
          title: string
          user_id: string
          verification_code: string
        }
        Update: {
          certificate_number?: string
          certificate_url?: string
          completion_date?: string
          created_at?: string | null
          description?: string | null
          enrollment_id?: string
          expiry_date?: string | null
          final_score?: number | null
          id?: string
          is_revoked?: boolean | null
          issued_date?: string | null
          learning_path_id?: string
          metadata?: Json | null
          organization_id?: string
          public_verification_url?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          template_used?: string | null
          title?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          block_id: string | null
          citation_text: string
          context_after: string | null
          context_before: string | null
          created_at: string | null
          id: string
          knowledge_content_id: string
          metadata: Json | null
          page_number: number | null
          relevance_score: number | null
          section_reference: string | null
          suggestion_id: string | null
        }
        Insert: {
          block_id?: string | null
          citation_text: string
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          id?: string
          knowledge_content_id: string
          metadata?: Json | null
          page_number?: number | null
          relevance_score?: number | null
          section_reference?: string | null
          suggestion_id?: string | null
        }
        Update: {
          block_id?: string | null
          citation_text?: string
          context_after?: string | null
          context_before?: string | null
          created_at?: string | null
          id?: string
          knowledge_content_id?: string
          metadata?: Json | null
          page_number?: number | null
          relevance_score?: number | null
          section_reference?: string | null
          suggestion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citations_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "guidance_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_knowledge_content_id_fkey"
            columns: ["knowledge_content_id"]
            isOneToOne: false
            referencedRelation: "knowledge_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "ai_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_quality_metrics: {
        Row: {
          accuracy_score: number | null
          action_verb_count: number | null
          actionability_score: number | null
          ai_confidence_level: number | null
          ai_sentiment_score: number | null
          ai_topics_covered: Json | null
          assessment_method: string | null
          assessment_notes: string | null
          assessor_id: string | null
          cache_id: string | null
          ciso_grade_score: number | null
          clarity_score: number | null
          completeness_score: number | null
          created_at: string | null
          cross_references_valid: boolean | null
          framework_coverage_complete: boolean | null
          has_all_required_sections: boolean | null
          id: string
          improvement_suggestions: Json | null
          measured_at: string | null
          organization_id: string | null
          overall_quality_score: number | null
          readability_grade: number | null
          regulatory_compliance_check: boolean | null
          section_completeness: Json | null
          technical_term_density: number | null
          template_id: string | null
          word_count: number | null
        }
        Insert: {
          accuracy_score?: number | null
          action_verb_count?: number | null
          actionability_score?: number | null
          ai_confidence_level?: number | null
          ai_sentiment_score?: number | null
          ai_topics_covered?: Json | null
          assessment_method?: string | null
          assessment_notes?: string | null
          assessor_id?: string | null
          cache_id?: string | null
          ciso_grade_score?: number | null
          clarity_score?: number | null
          completeness_score?: number | null
          created_at?: string | null
          cross_references_valid?: boolean | null
          framework_coverage_complete?: boolean | null
          has_all_required_sections?: boolean | null
          id?: string
          improvement_suggestions?: Json | null
          measured_at?: string | null
          organization_id?: string | null
          overall_quality_score?: number | null
          readability_grade?: number | null
          regulatory_compliance_check?: boolean | null
          section_completeness?: Json | null
          technical_term_density?: number | null
          template_id?: string | null
          word_count?: number | null
        }
        Update: {
          accuracy_score?: number | null
          action_verb_count?: number | null
          actionability_score?: number | null
          ai_confidence_level?: number | null
          ai_sentiment_score?: number | null
          ai_topics_covered?: Json | null
          assessment_method?: string | null
          assessment_notes?: string | null
          assessor_id?: string | null
          cache_id?: string | null
          ciso_grade_score?: number | null
          clarity_score?: number | null
          completeness_score?: number | null
          created_at?: string | null
          cross_references_valid?: boolean | null
          framework_coverage_complete?: boolean | null
          has_all_required_sections?: boolean | null
          id?: string
          improvement_suggestions?: Json | null
          measured_at?: string | null
          organization_id?: string | null
          overall_quality_score?: number | null
          readability_grade?: number | null
          regulatory_compliance_check?: boolean | null
          section_completeness?: Json | null
          technical_term_density?: number | null
          template_id?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_quality_metrics_cache_id_fkey"
            columns: ["cache_id"]
            isOneToOne: false
            referencedRelation: "guidance_content_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_quality_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_quality_metrics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unified_guidance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      content_validation_logs: {
        Row: {
          automated_validation: boolean | null
          check_results: Json | null
          checks_performed: Json | null
          confidence_level: number | null
          content_updated: boolean | null
          corrective_actions: string[] | null
          created_at: string | null
          false_positive_risk: number | null
          human_reviewer: string | null
          id: string
          issues_found: string[] | null
          metadata: Json | null
          quality_score: number | null
          recommendations: string[] | null
          review_notes: string | null
          source_flagged: boolean | null
          target_id: string
          target_type: string
          updated_at: string | null
          validation_rules_version: string | null
          validation_status: string
          validation_time_ms: number | null
          validation_type: string
        }
        Insert: {
          automated_validation?: boolean | null
          check_results?: Json | null
          checks_performed?: Json | null
          confidence_level?: number | null
          content_updated?: boolean | null
          corrective_actions?: string[] | null
          created_at?: string | null
          false_positive_risk?: number | null
          human_reviewer?: string | null
          id?: string
          issues_found?: string[] | null
          metadata?: Json | null
          quality_score?: number | null
          recommendations?: string[] | null
          review_notes?: string | null
          source_flagged?: boolean | null
          target_id: string
          target_type: string
          updated_at?: string | null
          validation_rules_version?: string | null
          validation_status: string
          validation_time_ms?: number | null
          validation_type: string
        }
        Update: {
          automated_validation?: boolean | null
          check_results?: Json | null
          checks_performed?: Json | null
          confidence_level?: number | null
          content_updated?: boolean | null
          corrective_actions?: string[] | null
          created_at?: string | null
          false_positive_risk?: number | null
          human_reviewer?: string | null
          id?: string
          issues_found?: string[] | null
          metadata?: Json | null
          quality_score?: number | null
          recommendations?: string[] | null
          review_notes?: string | null
          source_flagged?: boolean | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
          validation_rules_version?: string | null
          validation_status?: string
          validation_time_ms?: number | null
          validation_type?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_summary: string | null
          changed_at: string | null
          changed_by: string
          content: Json | null
          content_id: string
          id: string
          is_current: boolean | null
          restored_from: string | null
          title: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by: string
          content?: Json | null
          content_id: string
          id?: string
          is_current?: boolean | null
          restored_from?: string | null
          title: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string
          content?: Json | null
          content_id?: string
          id?: string
          is_current?: boolean | null
          restored_from?: string | null
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_versions_restored_from_fkey"
            columns: ["restored_from"]
            isOneToOne: false
            referencedRelation: "content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          certificate_issued: boolean | null
          certificate_issued_at: string | null
          certificate_url: string | null
          completed_at: string | null
          completion_score: number | null
          due_date: string | null
          enrolled_at: string | null
          enrolled_by: string | null
          enrollment_type: string | null
          id: string
          last_accessed_at: string | null
          learning_path_id: string
          metadata: Json | null
          notes: string | null
          organization_id: string
          progress_percentage: number | null
          started_at: string | null
          status: string | null
          total_time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          certificate_issued?: boolean | null
          certificate_issued_at?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          completion_score?: number | null
          due_date?: string | null
          enrolled_at?: string | null
          enrolled_by?: string | null
          enrollment_type?: string | null
          id?: string
          last_accessed_at?: string | null
          learning_path_id: string
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          total_time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          certificate_issued?: boolean | null
          certificate_issued_at?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          completion_score?: number | null
          due_date?: string | null
          enrolled_at?: string | null
          enrolled_by?: string | null
          enrollment_type?: string | null
          id?: string
          last_accessed_at?: string | null
          learning_path_id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          total_time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_forums: {
        Row: {
          allow_anonymous: boolean | null
          allow_attachments: boolean | null
          created_at: string | null
          created_by: string
          description: string | null
          forum_type: string | null
          id: string
          is_active: boolean | null
          is_locked: boolean | null
          is_moderated: boolean | null
          last_post_at: string | null
          learning_content_id: string | null
          learning_path_id: string | null
          name: string
          organization_id: string
          post_count: number | null
          requires_approval: boolean | null
          topic_count: number | null
        }
        Insert: {
          allow_anonymous?: boolean | null
          allow_attachments?: boolean | null
          created_at?: string | null
          created_by: string
          description?: string | null
          forum_type?: string | null
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          is_moderated?: boolean | null
          last_post_at?: string | null
          learning_content_id?: string | null
          learning_path_id?: string | null
          name: string
          organization_id: string
          post_count?: number | null
          requires_approval?: boolean | null
          topic_count?: number | null
        }
        Update: {
          allow_anonymous?: boolean | null
          allow_attachments?: boolean | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          forum_type?: string | null
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          is_moderated?: boolean | null
          last_post_at?: string | null
          learning_content_id?: string | null
          learning_path_id?: string | null
          name?: string
          organization_id?: string
          post_count?: number | null
          requires_approval?: boolean | null
          topic_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_forums_learning_content_id_fkey"
            columns: ["learning_content_id"]
            isOneToOne: true
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_forums_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_forums_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          author_id: string
          content: string
          created_at: string | null
          edit_count: number | null
          edited_at: string | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          is_best_answer: boolean | null
          is_edited: boolean | null
          like_count: number | null
          marked_best_at: string | null
          marked_best_by: string | null
          organization_id: string
          parent_id: string | null
          reply_count: number | null
          status: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          author_id: string
          content: string
          created_at?: string | null
          edit_count?: number | null
          edited_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          is_best_answer?: boolean | null
          is_edited?: boolean | null
          like_count?: number | null
          marked_best_at?: string | null
          marked_best_by?: string | null
          organization_id: string
          parent_id?: string | null
          reply_count?: number | null
          status?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          author_id?: string
          content?: string
          created_at?: string | null
          edit_count?: number | null
          edited_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          is_best_answer?: boolean | null
          is_edited?: boolean | null
          like_count?: number | null
          marked_best_at?: string | null
          marked_best_by?: string | null
          organization_id?: string
          parent_id?: string | null
          reply_count?: number | null
          status?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "discussion_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_topics: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          author_id: string
          content: string
          created_at: string | null
          forum_id: string
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          last_reply_by: string | null
          like_count: number | null
          organization_id: string
          reply_count: number | null
          status: string | null
          tags: string[] | null
          title: string
          topic_type: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          author_id: string
          content: string
          created_at?: string | null
          forum_id: string
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          like_count?: number | null
          organization_id: string
          reply_count?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          topic_type?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          author_id?: string
          content?: string
          created_at?: string | null
          forum_id?: string
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          like_count?: number | null
          organization_id?: string
          reply_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          topic_type?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_topics_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "discussion_forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_topics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_analytics: {
        Row: {
          avg_send_time_ms: number | null
          created_at: string | null
          date: string
          id: string
          organization_id: string | null
          template_id: string | null
          total_bounced: number | null
          total_clicked: number | null
          total_delivered: number | null
          total_failed: number | null
          total_opened: number | null
          total_sent: number | null
        }
        Insert: {
          avg_send_time_ms?: number | null
          created_at?: string | null
          date: string
          id?: string
          organization_id?: string | null
          template_id?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_sent?: number | null
        }
        Update: {
          avg_send_time_ms?: number | null
          created_at?: string | null
          date?: string
          id?: string
          organization_id?: string | null
          template_id?: string | null
          total_bounced?: number | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_sent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          category: string | null
          created_at: string | null
          error_message: string | null
          from_email: string
          from_name: string | null
          html_content: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          error_message?: string | null
          from_email: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          error_message?: string | null
          from_email?: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          text_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          error_message: string | null
          failed_at: string | null
          html_body: string
          id: string
          max_retries: number | null
          metadata: Json | null
          opened_at: string | null
          organization_id: string | null
          priority: string | null
          provider: string | null
          provider_message_id: string | null
          recipient_email: string
          recipient_id: string | null
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_id: string | null
          text_body: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          html_body: string
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          opened_at?: string | null
          organization_id?: string | null
          priority?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient_email: string
          recipient_id?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_id?: string | null
          text_body?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          html_body?: string
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          opened_at?: string | null
          organization_id?: string | null
          priority?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string
          recipient_id?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_id?: string | null
          text_body?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          assessment_reminders: boolean | null
          compliance_alerts: boolean | null
          created_at: string | null
          frequency: string | null
          id: string
          onboarding_emails: boolean | null
          organization_id: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          report_ready: boolean | null
          team_updates: boolean | null
          timezone: string | null
          unsubscribe_token: string | null
          unsubscribed_all: boolean | null
          updated_at: string | null
          user_id: string | null
          weekly_digest: boolean | null
        }
        Insert: {
          assessment_reminders?: boolean | null
          compliance_alerts?: boolean | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          onboarding_emails?: boolean | null
          organization_id?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          report_ready?: boolean | null
          team_updates?: boolean | null
          timezone?: string | null
          unsubscribe_token?: string | null
          unsubscribed_all?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Update: {
          assessment_reminders?: boolean | null
          compliance_alerts?: boolean | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          onboarding_emails?: boolean | null
          organization_id?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          report_ready?: boolean | null
          team_updates?: boolean | null
          timezone?: string | null
          unsubscribe_token?: string | null
          unsubscribed_all?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          next_retry_at: string | null
          notification_id: string | null
          priority: number | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          next_retry_at?: string | null
          notification_id?: string | null
          priority?: number | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          next_retry_at?: string | null
          notification_id?: string | null
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "email_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          html_body: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          priority: string | null
          subject: string
          text_body: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          html_body: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          priority?: string | null
          subject: string
          text_body?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          html_body?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          priority?: string | null
          subject?: string
          text_body?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      emergency_guidance_backup: {
        Row: {
          audit_ready_guidance: string | null
          backup_timestamp: string | null
          control_id: string | null
          implementation_guidance: string | null
          standard_id: string | null
          title: string | null
        }
        Insert: {
          audit_ready_guidance?: string | null
          backup_timestamp?: string | null
          control_id?: string | null
          implementation_guidance?: string | null
          standard_id?: string | null
          title?: string | null
        }
        Update: {
          audit_ready_guidance?: string | null
          backup_timestamp?: string | null
          control_id?: string | null
          implementation_guidance?: string | null
          standard_id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      enhanced_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          metadata: Json | null
          organization_id: string | null
          role_id: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          role_id?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          role_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enhanced_user_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          flag_reason: string | null
          id: string
          is_approved: boolean | null
          is_flagged: boolean | null
          like_count: number | null
          organization_id: string
          parent_post_id: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          flag_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_flagged?: boolean | null
          like_count?: number | null
          organization_id: string
          parent_post_id?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          flag_reason?: string | null
          id?: string
          is_approved?: boolean | null
          is_flagged?: boolean | null
          like_count?: number | null
          organization_id?: string
          parent_post_id?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          forum_id: string
          id: string
          is_approved: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          last_reply_by: string | null
          organization_id: string
          reply_count: number | null
          tags: string[] | null
          title: string
          topic_type: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          forum_id: string
          id?: string
          is_approved?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          organization_id: string
          reply_count?: number | null
          tags?: string[] | null
          title: string
          topic_type?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          forum_id?: string
          id?: string
          is_approved?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          organization_id?: string
          reply_count?: number | null
          tags?: string[] | null
          title?: string
          topic_type?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "discussion_forums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_requirement_mappings: {
        Row: {
          ai_context_weight: number | null
          created_at: string | null
          custom_guidance_notes: string | null
          framework_type: string
          id: string
          include_in_ai_context: boolean | null
          last_validated_at: string | null
          mapping_confidence: number | null
          organization_id: string | null
          relevance_level: string | null
          requirement_code: string
          requirement_description: string | null
          requirement_title: string
          template_id: string | null
          updated_at: string | null
          validation_notes: string | null
          validation_source: string | null
        }
        Insert: {
          ai_context_weight?: number | null
          created_at?: string | null
          custom_guidance_notes?: string | null
          framework_type: string
          id?: string
          include_in_ai_context?: boolean | null
          last_validated_at?: string | null
          mapping_confidence?: number | null
          organization_id?: string | null
          relevance_level?: string | null
          requirement_code: string
          requirement_description?: string | null
          requirement_title: string
          template_id?: string | null
          updated_at?: string | null
          validation_notes?: string | null
          validation_source?: string | null
        }
        Update: {
          ai_context_weight?: number | null
          created_at?: string | null
          custom_guidance_notes?: string | null
          framework_type?: string
          id?: string
          include_in_ai_context?: boolean | null
          last_validated_at?: string | null
          mapping_confidence?: number | null
          organization_id?: string | null
          relevance_level?: string | null
          requirement_code?: string
          requirement_description?: string | null
          requirement_title?: string
          template_id?: string | null
          updated_at?: string | null
          validation_notes?: string | null
          validation_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "framework_requirement_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "framework_requirement_mappings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unified_guidance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_badges: {
        Row: {
          badge_type: string
          created_at: string | null
          created_by: string
          criteria: Json
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_visible: boolean | null
          level: string | null
          name: string
          organization_id: string
          points: number | null
          updated_at: string | null
        }
        Insert: {
          badge_type: string
          created_at?: string | null
          created_by: string
          criteria: Json
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          level?: string | null
          name: string
          organization_id: string
          points?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          created_by?: string
          criteria?: Json
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          level?: string | null
          name?: string
          organization_id?: string
          points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamification_badges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_blocks: {
        Row: {
          ai_confidence: number | null
          ai_generated: boolean | null
          ai_model_version: string | null
          ai_rationale: string | null
          block_order: number
          block_type: string
          citations: Json | null
          content: string
          content_hash: string
          created_at: string | null
          framework_conditions: Json | null
          id: string
          lint_violations: Json | null
          style_score: number | null
          sub_requirement_letter: string | null
          updated_at: string | null
          version_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_generated?: boolean | null
          ai_model_version?: string | null
          ai_rationale?: string | null
          block_order: number
          block_type: string
          citations?: Json | null
          content: string
          content_hash: string
          created_at?: string | null
          framework_conditions?: Json | null
          id?: string
          lint_violations?: Json | null
          style_score?: number | null
          sub_requirement_letter?: string | null
          updated_at?: string | null
          version_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_generated?: boolean | null
          ai_model_version?: string | null
          ai_rationale?: string | null
          block_order?: number
          block_type?: string
          citations?: Json | null
          content?: string
          content_hash?: string
          created_at?: string | null
          framework_conditions?: Json | null
          id?: string
          lint_violations?: Json | null
          style_score?: number | null
          sub_requirement_letter?: string | null
          updated_at?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidance_blocks_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "guidance_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_content_cache: {
        Row: {
          ai_model_used: string
          ai_provider: string | null
          cache_hit_count: number | null
          cache_priority: number | null
          content_format: string | null
          content_length: number | null
          content_quality_score: number | null
          content_version: number | null
          created_at: string | null
          expires_at: string | null
          framework_selection_hash: string
          generated_content: string
          generation_cost: number | null
          generation_prompt_hash: string | null
          generation_time_ms: number | null
          generation_tokens_used: number | null
          id: string
          invalidation_reason: string | null
          is_active: boolean | null
          last_accessed_at: string | null
          organization_id: string | null
          template_id: string | null
          updated_at: string | null
          usage_count: number | null
          user_context_hash: string | null
          user_feedback_score: number | null
        }
        Insert: {
          ai_model_used: string
          ai_provider?: string | null
          cache_hit_count?: number | null
          cache_priority?: number | null
          content_format?: string | null
          content_length?: number | null
          content_quality_score?: number | null
          content_version?: number | null
          created_at?: string | null
          expires_at?: string | null
          framework_selection_hash: string
          generated_content: string
          generation_cost?: number | null
          generation_prompt_hash?: string | null
          generation_time_ms?: number | null
          generation_tokens_used?: number | null
          id?: string
          invalidation_reason?: string | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          organization_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_context_hash?: string | null
          user_feedback_score?: number | null
        }
        Update: {
          ai_model_used?: string
          ai_provider?: string | null
          cache_hit_count?: number | null
          cache_priority?: number | null
          content_format?: string | null
          content_length?: number | null
          content_quality_score?: number | null
          content_version?: number | null
          created_at?: string | null
          expires_at?: string | null
          framework_selection_hash?: string
          generated_content?: string
          generation_cost?: number | null
          generation_prompt_hash?: string | null
          generation_time_ms?: number | null
          generation_tokens_used?: number | null
          id?: string
          invalidation_reason?: string | null
          is_active?: boolean | null
          last_accessed_at?: string | null
          organization_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_context_hash?: string | null
          user_feedback_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guidance_content_cache_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guidance_content_cache_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "unified_guidance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_versions: {
        Row: {
          ai_approved_count: number | null
          ai_confidence_avg: number | null
          ai_suggestions_count: number | null
          approved_at: string | null
          approved_by: string | null
          content_blocks: Json
          content_hash: string
          created_at: string | null
          created_by: string
          framework_conditions: Json | null
          id: string
          last_ai_enhancement: string | null
          lint_score: number | null
          metadata: Json | null
          published_at: string | null
          published_by: string | null
          readability_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          row_count: number | null
          scheduled_publish_at: string | null
          status: string
          unified_requirement_id: string
          version_number: number
          word_count: number | null
          workflow_stage: string
        }
        Insert: {
          ai_approved_count?: number | null
          ai_confidence_avg?: number | null
          ai_suggestions_count?: number | null
          approved_at?: string | null
          approved_by?: string | null
          content_blocks?: Json
          content_hash: string
          created_at?: string | null
          created_by: string
          framework_conditions?: Json | null
          id?: string
          last_ai_enhancement?: string | null
          lint_score?: number | null
          metadata?: Json | null
          published_at?: string | null
          published_by?: string | null
          readability_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          row_count?: number | null
          scheduled_publish_at?: string | null
          status?: string
          unified_requirement_id: string
          version_number: number
          word_count?: number | null
          workflow_stage?: string
        }
        Update: {
          ai_approved_count?: number | null
          ai_confidence_avg?: number | null
          ai_suggestions_count?: number | null
          approved_at?: string | null
          approved_by?: string | null
          content_blocks?: Json
          content_hash?: string
          created_at?: string | null
          created_by?: string
          framework_conditions?: Json | null
          id?: string
          last_ai_enhancement?: string | null
          lint_score?: number | null
          metadata?: Json | null
          published_at?: string | null
          published_by?: string | null
          readability_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          row_count?: number | null
          scheduled_publish_at?: string | null
          status?: string
          unified_requirement_id?: string
          version_number?: number
          word_count?: number | null
          workflow_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidance_versions_unified_requirement_id_fkey"
            columns: ["unified_requirement_id"]
            isOneToOne: false
            referencedRelation: "unified_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_requirement_mappings: {
        Row: {
          created_at: string | null
          id: string
          industry_sector_id: string
          relevance_level: string | null
          requirement_id: string
          sector_specific: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry_sector_id: string
          relevance_level?: string | null
          requirement_id: string
          sector_specific?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry_sector_id?: string
          relevance_level?: string | null
          requirement_id?: string
          sector_specific?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_requirement_mappings_industry_sector_id_fkey"
            columns: ["industry_sector_id"]
            isOneToOne: false
            referencedRelation: "industry_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "industry_requirement_mappings_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_sectors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          nis2_essential: boolean | null
          nis2_important: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          nis2_essential?: boolean | null
          nis2_important?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          nis2_essential?: boolean | null
          nis2_important?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf: string | null
          organization_id: string | null
          status: string
          stripe_invoice_id: string
          subscription_id: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          organization_id?: string | null
          status: string
          stripe_invoice_id: string
          subscription_id?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          organization_id?: string | null
          status?: string
          stripe_invoice_id?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      issued_certificates: {
        Row: {
          blockchain_hash: string | null
          certificate_number: string
          completion_date: string
          course_name: string
          created_at: string | null
          expiry_date: string | null
          grade: string | null
          html_content: string | null
          id: string
          issued_date: string
          learning_path_id: string | null
          metadata: Json | null
          organization_id: string
          pdf_url: string | null
          qr_code_url: string | null
          recipient_name: string
          replaced_by: string | null
          revoked_at: string | null
          revoked_reason: string | null
          score: number | null
          status: string | null
          template_id: string
          user_id: string
          verification_code: string
        }
        Insert: {
          blockchain_hash?: string | null
          certificate_number: string
          completion_date: string
          course_name: string
          created_at?: string | null
          expiry_date?: string | null
          grade?: string | null
          html_content?: string | null
          id?: string
          issued_date?: string
          learning_path_id?: string | null
          metadata?: Json | null
          organization_id: string
          pdf_url?: string | null
          qr_code_url?: string | null
          recipient_name: string
          replaced_by?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          score?: number | null
          status?: string | null
          template_id: string
          user_id: string
          verification_code: string
        }
        Update: {
          blockchain_hash?: string | null
          certificate_number?: string
          completion_date?: string
          course_name?: string
          created_at?: string | null
          expiry_date?: string | null
          grade?: string | null
          html_content?: string | null
          id?: string
          issued_date?: string
          learning_path_id?: string | null
          metadata?: Json | null
          organization_id?: string
          pdf_url?: string | null
          qr_code_url?: string | null
          recipient_name?: string
          replaced_by?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          score?: number | null
          status?: string | null
          template_id?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "issued_certificates_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "issued_certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_analytics: {
        Row: {
          active_sources: number | null
          api_cost_total: number | null
          avg_generation_time_ms: number | null
          avg_quality_score: number | null
          avg_response_time_ms: number | null
          cache_hit_rate: number | null
          content_freshness_avg: number | null
          content_quality_avg: number | null
          content_updated: number | null
          created_at: string | null
          date_recorded: string
          error_rate: number | null
          failed_sources: number | null
          fallback_generations: number | null
          feedback_responses: number | null
          id: string
          metadata: Json | null
          new_content_added: number | null
          new_sources_added: number | null
          rag_generations: number | null
          source_reliability_avg: number | null
          total_content_chunks: number | null
          total_generations: number | null
          total_sources: number | null
          unique_users: number | null
          user_satisfaction_avg: number | null
          validation_pass_rate: number | null
        }
        Insert: {
          active_sources?: number | null
          api_cost_total?: number | null
          avg_generation_time_ms?: number | null
          avg_quality_score?: number | null
          avg_response_time_ms?: number | null
          cache_hit_rate?: number | null
          content_freshness_avg?: number | null
          content_quality_avg?: number | null
          content_updated?: number | null
          created_at?: string | null
          date_recorded: string
          error_rate?: number | null
          failed_sources?: number | null
          fallback_generations?: number | null
          feedback_responses?: number | null
          id?: string
          metadata?: Json | null
          new_content_added?: number | null
          new_sources_added?: number | null
          rag_generations?: number | null
          source_reliability_avg?: number | null
          total_content_chunks?: number | null
          total_generations?: number | null
          total_sources?: number | null
          unique_users?: number | null
          user_satisfaction_avg?: number | null
          validation_pass_rate?: number | null
        }
        Update: {
          active_sources?: number | null
          api_cost_total?: number | null
          avg_generation_time_ms?: number | null
          avg_quality_score?: number | null
          avg_response_time_ms?: number | null
          cache_hit_rate?: number | null
          content_freshness_avg?: number | null
          content_quality_avg?: number | null
          content_updated?: number | null
          created_at?: string | null
          date_recorded?: string
          error_rate?: number | null
          failed_sources?: number | null
          fallback_generations?: number | null
          feedback_responses?: number | null
          id?: string
          metadata?: Json | null
          new_content_added?: number | null
          new_sources_added?: number | null
          rag_generations?: number | null
          source_reliability_avg?: number | null
          total_content_chunks?: number | null
          total_generations?: number | null
          total_sources?: number | null
          unique_users?: number | null
          user_satisfaction_avg?: number | null
          validation_pass_rate?: number | null
        }
        Relationships: []
      }
      knowledge_content: {
        Row: {
          authority_score: number | null
          citation_count: number | null
          compliance_categories: string[] | null
          confidence_score: number | null
          content_chunk: string
          content_hash: string
          content_structure: Json | null
          expires_at: string | null
          external_references: string[] | null
          extracted_at: string | null
          extraction_method: string | null
          frameworks: string[] | null
          freshness_score: number | null
          id: string
          indexed_at: string | null
          language_detected: string | null
          last_validated: string | null
          metadata: Json | null
          original_url: string | null
          processing_version: string | null
          quality_score: number | null
          readability_score: number | null
          relevance_score: number | null
          requirement_keywords: string[] | null
          section_path: string | null
          source_authority: Json | null
          source_id: string
          technical_depth: string | null
          title: string | null
          word_count: number | null
        }
        Insert: {
          authority_score?: number | null
          citation_count?: number | null
          compliance_categories?: string[] | null
          confidence_score?: number | null
          content_chunk: string
          content_hash: string
          content_structure?: Json | null
          expires_at?: string | null
          external_references?: string[] | null
          extracted_at?: string | null
          extraction_method?: string | null
          frameworks?: string[] | null
          freshness_score?: number | null
          id?: string
          indexed_at?: string | null
          language_detected?: string | null
          last_validated?: string | null
          metadata?: Json | null
          original_url?: string | null
          processing_version?: string | null
          quality_score?: number | null
          readability_score?: number | null
          relevance_score?: number | null
          requirement_keywords?: string[] | null
          section_path?: string | null
          source_authority?: Json | null
          source_id: string
          technical_depth?: string | null
          title?: string | null
          word_count?: number | null
        }
        Update: {
          authority_score?: number | null
          citation_count?: number | null
          compliance_categories?: string[] | null
          confidence_score?: number | null
          content_chunk?: string
          content_hash?: string
          content_structure?: Json | null
          expires_at?: string | null
          external_references?: string[] | null
          extracted_at?: string | null
          extraction_method?: string | null
          frameworks?: string[] | null
          freshness_score?: number | null
          id?: string
          indexed_at?: string | null
          language_detected?: string | null
          last_validated?: string | null
          metadata?: Json | null
          original_url?: string | null
          processing_version?: string | null
          quality_score?: number | null
          readability_score?: number | null
          relevance_score?: number | null
          requirement_keywords?: string[] | null
          section_path?: string | null
          source_authority?: Json | null
          source_id?: string
          technical_depth?: string | null
          title?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          added_by: string | null
          authority_score: number | null
          canonical_url: string | null
          checksum: string | null
          compliance_frameworks: string[] | null
          content_hash: string | null
          content_type: string
          created_at: string | null
          credibility_rating: string | null
          description: string | null
          domain: string
          error_count: number | null
          file_size_bytes: number | null
          focus_areas: string[] | null
          governance_notes: Json | null
          id: string
          last_error: string | null
          last_modified_check: string | null
          last_scraped: string | null
          last_updated: string | null
          license_note: string | null
          metadata: Json | null
          mime_type: string | null
          owner_id: string | null
          processing_rules: Json | null
          robots_compliance: boolean | null
          scraping_config: Json | null
          source_type: string | null
          status: string | null
          success_rate: number | null
          title: string | null
          update_frequency: unknown | null
          updated_at: string | null
          url: string
          visibility: string | null
        }
        Insert: {
          added_by?: string | null
          authority_score?: number | null
          canonical_url?: string | null
          checksum?: string | null
          compliance_frameworks?: string[] | null
          content_hash?: string | null
          content_type?: string
          created_at?: string | null
          credibility_rating?: string | null
          description?: string | null
          domain: string
          error_count?: number | null
          file_size_bytes?: number | null
          focus_areas?: string[] | null
          governance_notes?: Json | null
          id?: string
          last_error?: string | null
          last_modified_check?: string | null
          last_scraped?: string | null
          last_updated?: string | null
          license_note?: string | null
          metadata?: Json | null
          mime_type?: string | null
          owner_id?: string | null
          processing_rules?: Json | null
          robots_compliance?: boolean | null
          scraping_config?: Json | null
          source_type?: string | null
          status?: string | null
          success_rate?: number | null
          title?: string | null
          update_frequency?: unknown | null
          updated_at?: string | null
          url: string
          visibility?: string | null
        }
        Update: {
          added_by?: string | null
          authority_score?: number | null
          canonical_url?: string | null
          checksum?: string | null
          compliance_frameworks?: string[] | null
          content_hash?: string | null
          content_type?: string
          created_at?: string | null
          credibility_rating?: string | null
          description?: string | null
          domain?: string
          error_count?: number | null
          file_size_bytes?: number | null
          focus_areas?: string[] | null
          governance_notes?: Json | null
          id?: string
          last_error?: string | null
          last_modified_check?: string | null
          last_scraped?: string | null
          last_updated?: string | null
          license_note?: string | null
          metadata?: Json | null
          mime_type?: string | null
          owner_id?: string | null
          processing_rules?: Json | null
          robots_compliance?: boolean | null
          scraping_config?: Json | null
          source_type?: string | null
          status?: string | null
          success_rate?: number | null
          title?: string | null
          update_frequency?: unknown | null
          updated_at?: string | null
          url?: string
          visibility?: string | null
        }
        Relationships: []
      }
      learning_analytics: {
        Row: {
          content_id: string | null
          content_position: Json | null
          device_type: string | null
          duration_seconds: number | null
          error_count: number | null
          event_data: Json | null
          event_type: string
          help_requests: number | null
          id: string
          interaction_count: number | null
          ip_address: unknown | null
          learning_path_id: string | null
          organization_id: string
          platform: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          content_id?: string | null
          content_position?: Json | null
          device_type?: string | null
          duration_seconds?: number | null
          error_count?: number | null
          event_data?: Json | null
          event_type: string
          help_requests?: number | null
          id?: string
          interaction_count?: number | null
          ip_address?: unknown | null
          learning_path_id?: string | null
          organization_id: string
          platform?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string | null
          content_position?: Json | null
          device_type?: string | null
          duration_seconds?: number | null
          error_count?: number | null
          event_data?: Json | null
          event_type?: string
          help_requests?: number | null
          id?: string
          interaction_count?: number | null
          ip_address?: unknown | null
          learning_path_id?: string | null
          organization_id?: string
          platform?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content: {
        Row: {
          completion_criteria: Json | null
          content: Json | null
          content_type: string
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          is_preview: boolean | null
          learning_path_id: string
          max_attempts: number | null
          parent_id: string | null
          passing_score: number | null
          resource_metadata: Json | null
          resource_url: string | null
          sequence: number
          status: string | null
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completion_criteria?: Json | null
          content?: Json | null
          content_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          is_preview?: boolean | null
          learning_path_id: string
          max_attempts?: number | null
          parent_id?: string | null
          passing_score?: number | null
          resource_metadata?: Json | null
          resource_url?: string | null
          sequence?: number
          status?: string | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completion_criteria?: Json | null
          content?: Json | null
          content_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          is_preview?: boolean | null
          learning_path_id?: string
          max_attempts?: number | null
          parent_id?: string | null
          passing_score?: number | null
          resource_metadata?: Json | null
          resource_url?: string | null
          sequence?: number
          status?: string | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          difficulty_level: string
          estimated_duration_minutes: number | null
          id: string
          is_featured: boolean | null
          is_mandatory: boolean | null
          is_published: boolean | null
          language: string | null
          learning_objectives: string[] | null
          metadata: Json | null
          organization_id: string
          prerequisites: string[] | null
          short_description: string | null
          status: string | null
          tags: string[] | null
          target_audience: string | null
          thumbnail_url: string | null
          title: string
          total_modules: number | null
          updated_at: string | null
          updated_by: string
          version: string | null
        }
        Insert: {
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty_level?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          is_mandatory?: boolean | null
          is_published?: boolean | null
          language?: string | null
          learning_objectives?: string[] | null
          metadata?: Json | null
          organization_id: string
          prerequisites?: string[] | null
          short_description?: string | null
          status?: string | null
          tags?: string[] | null
          target_audience?: string | null
          thumbnail_url?: string | null
          title: string
          total_modules?: number | null
          updated_at?: string | null
          updated_by: string
          version?: string | null
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty_level?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          is_mandatory?: boolean | null
          is_published?: boolean | null
          language?: string | null
          learning_objectives?: string[] | null
          metadata?: Json | null
          organization_id?: string
          prerequisites?: string[] | null
          short_description?: string | null
          status?: string | null
          tags?: string[] | null
          target_audience?: string | null
          thumbnail_url?: string | null
          title?: string
          total_modules?: number | null
          updated_at?: string | null
          updated_by?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_announcements: {
        Row: {
          acknowledgment_count: number | null
          content: string
          created_at: string | null
          created_by: string
          excerpt: string | null
          expire_at: string | null
          id: string
          is_pinned: boolean | null
          learning_path_id: string | null
          organization_id: string
          priority: string | null
          publish_at: string | null
          requires_acknowledgment: boolean | null
          show_on_dashboard: boolean | null
          status: string | null
          target_audience: string | null
          target_groups: Json | null
          target_users: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          acknowledgment_count?: number | null
          content: string
          created_at?: string | null
          created_by: string
          excerpt?: string | null
          expire_at?: string | null
          id?: string
          is_pinned?: boolean | null
          learning_path_id?: string | null
          organization_id: string
          priority?: string | null
          publish_at?: string | null
          requires_acknowledgment?: boolean | null
          show_on_dashboard?: boolean | null
          status?: string | null
          target_audience?: string | null
          target_groups?: Json | null
          target_users?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          acknowledgment_count?: number | null
          content?: string
          created_at?: string | null
          created_by?: string
          excerpt?: string | null
          expire_at?: string | null
          id?: string
          is_pinned?: boolean | null
          learning_path_id?: string | null
          organization_id?: string
          priority?: string | null
          publish_at?: string | null
          requires_acknowledgment?: boolean | null
          show_on_dashboard?: boolean | null
          status?: string | null
          target_audience?: string | null
          target_groups?: Json | null
          target_users?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_announcements_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          error_details: Json | null
          error_message: string | null
          id: string
          method: string
          organization_id: string
          request_body: Json | null
          request_headers: Json | null
          request_ip: unknown | null
          response_size_bytes: number | null
          response_status: number
          response_time_ms: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          error_details?: Json | null
          error_message?: string | null
          id?: string
          method: string
          organization_id: string
          request_body?: Json | null
          request_headers?: Json | null
          request_ip?: unknown | null
          response_size_bytes?: number | null
          response_status: number
          response_time_ms?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          error_details?: Json | null
          error_message?: string | null
          id?: string
          method?: string
          organization_id?: string
          request_body?: Json | null
          request_headers?: Json | null
          request_ip?: unknown | null
          response_size_bytes?: number | null
          response_status?: number
          response_time_ms?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_api_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_tenant_config: {
        Row: {
          branding: Json | null
          created_at: string | null
          created_by: string
          custom_domain: string | null
          embed_settings: Json | null
          features: Json | null
          id: string
          is_active: boolean | null
          notification_settings: Json | null
          organization_id: string
          sso_config: Json | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          created_at?: string | null
          created_by: string
          custom_domain?: string | null
          embed_settings?: Json | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          notification_settings?: Json | null
          organization_id: string
          sso_config?: Json | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          created_at?: string | null
          created_by?: string
          custom_domain?: string | null
          embed_settings?: Json | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          notification_settings?: Json | null
          organization_id?: string
          sso_config?: Json | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_tenant_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_data_classification_labels: {
        Row: {
          color: string
          confidentiality_level: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_built_in: boolean | null
          label_id: string
          name: string
          organization_id: string
          parent_id: string | null
          retention_period: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          confidentiality_level?: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_built_in?: boolean | null
          label_id: string
          name: string
          organization_id: string
          parent_id?: string | null
          retention_period?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          confidentiality_level?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_built_in?: boolean | null
          label_id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          retention_period?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_data_policies: {
        Row: {
          applies_to: string[]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          rules: Json
          type: string
          updated_at: string | null
        }
        Insert: {
          applies_to?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          rules?: Json
          type: string
          updated_at?: string | null
        }
        Update: {
          applies_to?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          rules?: Json
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_requirement_overrides: {
        Row: {
          assigned_user_id: string | null
          created_at: string | null
          created_by: string | null
          custom_due_date: string | null
          custom_guidance: string | null
          custom_priority:
            | Database["public"]["Enums"]["requirement_priority"]
            | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          organization_tags: string[] | null
          requirement_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_due_date?: string | null
          custom_guidance?: string | null
          custom_priority?:
            | Database["public"]["Enums"]["requirement_priority"]
            | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          organization_tags?: string[] | null
          requirement_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_due_date?: string | null
          custom_guidance?: string | null
          custom_priority?:
            | Database["public"]["Enums"]["requirement_priority"]
            | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          organization_tags?: string[] | null
          requirement_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_requirement_overrides_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_requirement_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_requirement_overrides_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_requirement_overrides_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_requirement_overrides_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_requirements: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          data_classification: string | null
          due_date: string | null
          evidence: string | null
          evidence_files: Json | null
          fulfillment_percentage: number | null
          id: string
          last_assessment_date: string | null
          maturity_level: number | null
          next_review_date: string | null
          notes: string | null
          organization_id: string | null
          priority_override: string | null
          requirement_id: string | null
          responsible_party: string | null
          risk_level: string | null
          status: Database["public"]["Enums"]["requirement_status"]
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          version: number
          workflow_state: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          data_classification?: string | null
          due_date?: string | null
          evidence?: string | null
          evidence_files?: Json | null
          fulfillment_percentage?: number | null
          id?: string
          last_assessment_date?: string | null
          maturity_level?: number | null
          next_review_date?: string | null
          notes?: string | null
          organization_id?: string | null
          priority_override?: string | null
          requirement_id?: string | null
          responsible_party?: string | null
          risk_level?: string | null
          status?: Database["public"]["Enums"]["requirement_status"]
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
          workflow_state?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          data_classification?: string | null
          due_date?: string | null
          evidence?: string | null
          evidence_files?: Json | null
          fulfillment_percentage?: number | null
          id?: string
          last_assessment_date?: string | null
          maturity_level?: number | null
          next_review_date?: string | null
          notes?: string | null
          organization_id?: string | null
          priority_override?: string | null
          requirement_id?: string | null
          responsible_party?: string | null
          risk_level?: string | null
          status?: Database["public"]["Enums"]["requirement_status"]
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          version?: number
          workflow_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_requirements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_requirements_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_retention_policies: {
        Row: {
          action: string
          applies_to: string[]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          retention_period: number
          updated_at: string | null
        }
        Insert: {
          action?: string
          applies_to?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          retention_period: number
          updated_at?: string | null
        }
        Update: {
          action?: string
          applies_to?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          retention_period?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_sensitive_data_detections: {
        Row: {
          confidence: number
          created_at: string | null
          detected_types: string[]
          file_name: string
          file_path: string
          id: string
          locations: Json
          organization_id: string
          scanned_at: string | null
        }
        Insert: {
          confidence?: number
          created_at?: string | null
          detected_types?: string[]
          file_name: string
          file_path: string
          id?: string
          locations?: Json
          organization_id: string
          scanned_at?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          detected_types?: string[]
          file_name?: string
          file_path?: string
          id?: string
          locations?: Json
          organization_id?: string
          scanned_at?: string | null
        }
        Relationships: []
      }
      organization_standards: {
        Row: {
          adoption_date: string | null
          created_at: string | null
          current_compliance_percentage: number | null
          id: string
          is_active: boolean | null
          is_applicable: boolean | null
          organization_id: string | null
          settings: Json | null
          standard_id: string | null
          target_compliance_date: string | null
          updated_at: string | null
        }
        Insert: {
          adoption_date?: string | null
          created_at?: string | null
          current_compliance_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_applicable?: boolean | null
          organization_id?: string | null
          settings?: Json | null
          standard_id?: string | null
          target_compliance_date?: string | null
          updated_at?: string | null
        }
        Update: {
          adoption_date?: string | null
          created_at?: string | null
          current_compliance_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_applicable?: boolean | null
          organization_id?: string | null
          settings?: Json | null
          standard_id?: string | null
          target_compliance_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_standards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_standards_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "standards_library"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          last_login_at: string | null
          metadata: Json | null
          organization_id: string | null
          role_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_login_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          role_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_login_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          role_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          name: string
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          organization_id: string | null
          stripe_payment_method_id: string
          type: string
        }
        Insert: {
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          organization_id?: string | null
          stripe_payment_method_id: string
          type: string
        }
        Update: {
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          organization_id?: string | null
          stripe_payment_method_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_administrators: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number
          completed_at: string | null
          enrollment_id: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string
          points_earned: number | null
          question_scores: Json | null
          quiz_id: string
          score: number | null
          started_at: string | null
          status: string | null
          suspicious_activity: Json | null
          time_remaining_minutes: number | null
          time_spent_minutes: number | null
          total_points: number | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempt_number: number
          completed_at?: string | null
          enrollment_id: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id: string
          points_earned?: number | null
          question_scores?: Json | null
          quiz_id: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          suspicious_activity?: Json | null
          time_remaining_minutes?: number | null
          time_spent_minutes?: number | null
          total_points?: number | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempt_number?: number
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string
          points_earned?: number | null
          question_scores?: Json | null
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
          suspicious_activity?: Json | null
          time_remaining_minutes?: number | null
          time_spent_minutes?: number | null
          total_points?: number | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          attachments: Json | null
          audio_url: string | null
          category: string | null
          correct_answers: Json
          created_at: string | null
          created_by: string
          difficulty_level: string | null
          explanation: string | null
          id: string
          image_url: string | null
          is_reusable: boolean | null
          negative_marking: boolean | null
          options: Json | null
          organization_id: string
          partial_credit: boolean | null
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string
          sequence: number
          status: string | null
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
          video_url: string | null
        }
        Insert: {
          attachments?: Json | null
          audio_url?: string | null
          category?: string | null
          correct_answers: Json
          created_at?: string | null
          created_by: string
          difficulty_level?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          is_reusable?: boolean | null
          negative_marking?: boolean | null
          options?: Json | null
          organization_id: string
          partial_credit?: boolean | null
          points?: number | null
          question_text: string
          question_type: string
          quiz_id: string
          sequence?: number
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          video_url?: string | null
        }
        Update: {
          attachments?: Json | null
          audio_url?: string | null
          category?: string | null
          correct_answers?: Json
          created_at?: string | null
          created_by?: string
          difficulty_level?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          is_reusable?: boolean | null
          negative_marking?: boolean | null
          options?: Json | null
          organization_id?: string
          partial_credit?: boolean | null
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string
          sequence?: number
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          allow_review: boolean | null
          available_from: string | null
          available_until: string | null
          created_at: string | null
          created_by: string
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          id: string
          instructions: string | null
          learning_content_id: string
          max_attempts: number | null
          organization_id: string
          passing_score: number | null
          show_correct_answers: boolean | null
          show_explanations: boolean | null
          shuffle_answers: boolean | null
          shuffle_questions: boolean | null
          status: string | null
          time_limit_minutes: number | null
          title: string
          total_points: number | null
          total_questions: number | null
          updated_at: string | null
        }
        Insert: {
          allow_review?: boolean | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          instructions?: string | null
          learning_content_id: string
          max_attempts?: number | null
          organization_id: string
          passing_score?: number | null
          show_correct_answers?: boolean | null
          show_explanations?: boolean | null
          shuffle_answers?: boolean | null
          shuffle_questions?: boolean | null
          status?: string | null
          time_limit_minutes?: number | null
          title: string
          total_points?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_review?: boolean | null
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          instructions?: string | null
          learning_content_id?: string
          max_attempts?: number | null
          organization_id?: string
          passing_score?: number | null
          show_correct_answers?: boolean | null
          show_explanations?: boolean | null
          shuffle_answers?: boolean | null
          shuffle_questions?: boolean | null
          status?: string | null
          time_limit_minutes?: number | null
          title?: string
          total_points?: number | null
          total_questions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_learning_content_id_fkey"
            columns: ["learning_content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_generation_history: {
        Row: {
          admin_approval: string | null
          ai_model_used: string | null
          api_cost_estimate: number | null
          content_length: number | null
          content_quality_score: number | null
          context_window_size: number | null
          created_at: string | null
          embedding_similarities: number[] | null
          fallback_reason: string | null
          fallback_to_rules: boolean | null
          generated_content: string
          generation_method: string
          generation_time_ms: number | null
          id: string
          improvement_score: number | null
          ip_address: unknown | null
          knowledge_content_ids: string[] | null
          metadata: Json | null
          prompt_version: string | null
          quality_score: number | null
          requirement_category: string
          requirement_title: string
          session_id: string | null
          similarity_to_previous: number | null
          source_ids: string[] | null
          token_usage: Json | null
          user_agent: string | null
          user_context: Json | null
          user_feedback: number | null
          user_frameworks: Json | null
          user_id: string | null
          validation_passed: boolean | null
        }
        Insert: {
          admin_approval?: string | null
          ai_model_used?: string | null
          api_cost_estimate?: number | null
          content_length?: number | null
          content_quality_score?: number | null
          context_window_size?: number | null
          created_at?: string | null
          embedding_similarities?: number[] | null
          fallback_reason?: string | null
          fallback_to_rules?: boolean | null
          generated_content: string
          generation_method: string
          generation_time_ms?: number | null
          id?: string
          improvement_score?: number | null
          ip_address?: unknown | null
          knowledge_content_ids?: string[] | null
          metadata?: Json | null
          prompt_version?: string | null
          quality_score?: number | null
          requirement_category: string
          requirement_title: string
          session_id?: string | null
          similarity_to_previous?: number | null
          source_ids?: string[] | null
          token_usage?: Json | null
          user_agent?: string | null
          user_context?: Json | null
          user_feedback?: number | null
          user_frameworks?: Json | null
          user_id?: string | null
          validation_passed?: boolean | null
        }
        Update: {
          admin_approval?: string | null
          ai_model_used?: string | null
          api_cost_estimate?: number | null
          content_length?: number | null
          content_quality_score?: number | null
          context_window_size?: number | null
          created_at?: string | null
          embedding_similarities?: number[] | null
          fallback_reason?: string | null
          fallback_to_rules?: boolean | null
          generated_content?: string
          generation_method?: string
          generation_time_ms?: number | null
          id?: string
          improvement_score?: number | null
          ip_address?: unknown | null
          knowledge_content_ids?: string[] | null
          metadata?: Json | null
          prompt_version?: string | null
          quality_score?: number | null
          requirement_category?: string
          requirement_title?: string
          session_id?: string | null
          similarity_to_previous?: number | null
          source_ids?: string[] | null
          token_usage?: Json | null
          user_agent?: string | null
          user_context?: Json | null
          user_feedback?: number | null
          user_frameworks?: Json | null
          user_id?: string | null
          validation_passed?: boolean | null
        }
        Relationships: []
      }
      requirement_embeddings: {
        Row: {
          created_at: string | null
          description: string | null
          embedding: string | null
          framework: string | null
          id: string
          indexed_at: string | null
          requirement_id: string
          requirement_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          framework?: string | null
          id?: string
          indexed_at?: string | null
          requirement_id: string
          requirement_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          framework?: string | null
          id?: string
          indexed_at?: string | null
          requirement_id?: string
          requirement_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      requirement_evidence: {
        Row: {
          collected_by: string | null
          collected_date: string | null
          created_at: string | null
          description: string | null
          evidence_type: string | null
          expires_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_validated: boolean | null
          mime_type: string | null
          organization_requirement_id: string | null
          title: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validation_notes: string | null
        }
        Insert: {
          collected_by?: string | null
          collected_date?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string | null
          expires_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_validated?: boolean | null
          mime_type?: string | null
          organization_requirement_id?: string | null
          title: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Update: {
          collected_by?: string | null
          collected_date?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string | null
          expires_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_validated?: boolean | null
          mime_type?: string | null
          organization_requirement_id?: string | null
          title?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_evidence_organization_requirement_id_fkey"
            columns: ["organization_requirement_id"]
            isOneToOne: false
            referencedRelation: "organization_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          organization_id: string
          requirement_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          organization_id: string
          requirement_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          organization_id?: string
          requirement_id?: string
          user_id?: string
        }
        Relationships: []
      }
      requirements_library: {
        Row: {
          audit_ready_guidance: string | null
          category: string | null
          category_id: string | null
          control_id: string
          created_at: string | null
          description: string
          id: string
          implementation_guidance: string | null
          is_active: boolean | null
          official_description: string | null
          order_index: number | null
          parent_requirement_id: string | null
          priority: string | null
          section: string | null
          standard_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audit_ready_guidance?: string | null
          category?: string | null
          category_id?: string | null
          control_id: string
          created_at?: string | null
          description: string
          id?: string
          implementation_guidance?: string | null
          is_active?: boolean | null
          official_description?: string | null
          order_index?: number | null
          parent_requirement_id?: string | null
          priority?: string | null
          section?: string | null
          standard_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audit_ready_guidance?: string | null
          category?: string | null
          category_id?: string | null
          control_id?: string
          created_at?: string | null
          description?: string
          id?: string
          implementation_guidance?: string | null
          is_active?: boolean | null
          official_description?: string | null
          order_index?: number | null
          parent_requirement_id?: string | null
          priority?: string | null
          section?: string | null
          standard_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_library_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "unified_compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_library_parent_requirement_id_fkey"
            columns: ["parent_requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_library_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "standards_library"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements_library_audit_cleanup_backup: {
        Row: {
          audit_ready_guidance: string | null
          backup_created_at: string | null
          control_id: string | null
          id: string | null
          title: string | null
        }
        Insert: {
          audit_ready_guidance?: string | null
          backup_created_at?: string | null
          control_id?: string | null
          id?: string | null
          title?: string | null
        }
        Update: {
          audit_ready_guidance?: string | null
          backup_created_at?: string | null
          control_id?: string | null
          id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      requirements_library_guidance_backup: {
        Row: {
          audit_ready_guidance: string | null
          control_id: string | null
          created_at: string | null
          standard_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          audit_ready_guidance?: string | null
          control_id?: string | null
          created_at?: string | null
          standard_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          audit_ready_guidance?: string | null
          control_id?: string | null
          created_at?: string | null
          standard_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restore_history: {
        Row: {
          affected_table: string
          changes_summary: Json
          created_at: string
          id: string
          organization_id: string
          reason: string | null
          restore_point: string
          restore_type: string
          restored_by: string
        }
        Insert: {
          affected_table: string
          changes_summary: Json
          created_at?: string
          id?: string
          organization_id: string
          reason?: string | null
          restore_point: string
          restore_type: string
          restored_by: string
        }
        Update: {
          affected_table?: string
          changes_summary?: Json
          created_at?: string
          id?: string
          organization_id?: string
          reason?: string | null
          restore_point?: string
          restore_type?: string
          restored_by?: string
        }
        Relationships: []
      }
      standards_library: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          official_url: string | null
          publication_date: string | null
          type: string
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          official_url?: string | null
          publication_date?: string | null
          type: string
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          official_url?: string | null
          publication_date?: string | null
          type?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          price_id: string
          quantity: number | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          price_id: string
          quantity?: number | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          price_id?: string
          quantity?: number | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_assessment_campaigns: {
        Row: {
          allow_delegation: boolean | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          organization_id: string
          reminder_frequency_days: number | null
          require_evidence: boolean | null
          risk_level: string | null
          risk_score: number | null
          send_reminders: boolean | null
          status: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          allow_delegation?: boolean | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          organization_id: string
          reminder_frequency_days?: number | null
          require_evidence?: boolean | null
          risk_level?: string | null
          risk_score?: number | null
          send_reminders?: boolean | null
          status?: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          allow_delegation?: boolean | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          organization_id?: string
          reminder_frequency_days?: number | null
          require_evidence?: boolean | null
          risk_level?: string | null
          risk_score?: number | null
          send_reminders?: boolean | null
          status?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_assessment_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_assessment_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_assessment_campaigns_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_assessment_emails: {
        Row: {
          campaign_id: string
          email_type: string
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          campaign_id: string
          email_type: string
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          campaign_id?: string
          email_type?: string
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_assessment_emails_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "supplier_assessment_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_assessment_standards: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          standard_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          standard_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          standard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_assessment_standards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "supplier_assessment_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_assessment_standards_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "standards_library"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_compliance_metrics: {
        Row: {
          campaign_id: string
          completed_requirements: number
          compliance_percentage: number
          fulfillment_breakdown: Json
          generated_at: string | null
          id: string
          standards_compliance: Json
          total_requirements: number
        }
        Insert: {
          campaign_id: string
          completed_requirements: number
          compliance_percentage: number
          fulfillment_breakdown: Json
          generated_at?: string | null
          id?: string
          standards_compliance: Json
          total_requirements: number
        }
        Update: {
          campaign_id?: string
          completed_requirements?: number
          compliance_percentage?: number
          fulfillment_breakdown?: Json
          generated_at?: string | null
          id?: string
          standards_compliance?: Json
          total_requirements?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_compliance_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "supplier_assessment_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_external_users: {
        Row: {
          campaign_id: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          invite_token: string | null
          is_active: boolean | null
          last_login: string | null
          role: string
          supplier_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          invite_token?: string | null
          is_active?: boolean | null
          last_login?: string | null
          role?: string
          supplier_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          invite_token?: string | null
          is_active?: boolean | null
          last_login?: string | null
          role?: string
          supplier_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_external_users_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "supplier_assessment_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_external_users_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_gap_analysis: {
        Row: {
          campaign_id: string
          critical_gaps: number
          gap_details: Json
          generated_at: string | null
          high_risk_gaps: number
          id: string
          low_risk_gaps: number
          medium_risk_gaps: number
          recommendations: Json
          total_gaps: number
        }
        Insert: {
          campaign_id: string
          critical_gaps: number
          gap_details: Json
          generated_at?: string | null
          high_risk_gaps: number
          id?: string
          low_risk_gaps: number
          medium_risk_gaps: number
          recommendations: Json
          total_gaps: number
        }
        Update: {
          campaign_id?: string
          critical_gaps?: number
          gap_details?: Json
          generated_at?: string | null
          high_risk_gaps?: number
          id?: string
          low_risk_gaps?: number
          medium_risk_gaps?: number
          recommendations?: Json
          total_gaps?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_gap_analysis_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "supplier_assessment_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_requirement_responses: {
        Row: {
          campaign_id: string
          confidence_level: number | null
          created_at: string | null
          evidence_description: string | null
          fulfillment_level: string
          id: string
          is_draft: boolean | null
          requirement_id: string
          response_text: string | null
          submitted_at: string | null
          supplier_user_id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          confidence_level?: number | null
          created_at?: string | null
          evidence_description?: string | null
          fulfillment_level: string
          id?: string
          is_draft?: boolean | null
          requirement_id: string
          response_text?: string | null
          submitted_at?: string | null
          supplier_user_id: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          confidence_level?: number | null
          created_at?: string | null
          evidence_description?: string | null
          fulfillment_level?: string
          id?: string
          is_draft?: boolean | null
          requirement_id?: string
          response_text?: string | null
          submitted_at?: string | null
          supplier_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_requirement_responses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "supplier_assessment_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_requirement_responses_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_requirement_responses_supplier_user_id_fkey"
            columns: ["supplier_user_id"]
            isOneToOne: false
            referencedRelation: "supplier_external_users"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          contact_title: string | null
          created_at: string | null
          id: string
          internal_responsible_id: string
          name: string
          organization_id: string
          organization_number: string
          status: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          id?: string
          internal_responsible_id: string
          name: string
          organization_id: string
          organization_number: string
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          id?: string
          internal_responsible_id?: string
          name?: string
          organization_id?: string
          organization_number?: string
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_internal_responsible_id_fkey"
            columns: ["internal_responsible_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          data_type: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          requires_restart: boolean | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          requires_restart?: boolean | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          requires_restart?: boolean | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      unified_compliance_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          pentagon_domain: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pentagon_domain?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pentagon_domain?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_compliance_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "platform_administrators"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_guidance_templates: {
        Row: {
          ai_context_keywords: Json | null
          ai_enhancement_enabled: boolean | null
          ai_prompt_foundation: string | null
          ai_prompt_implementation: string | null
          audit_evidence: Json
          category_name: string
          category_slug: string
          content_hash: string | null
          content_quality_score: number | null
          created_at: string | null
          created_by: string | null
          cross_references: Json
          display_order: number | null
          foundation_content: string
          id: string
          implementation_steps: Json
          is_global_template: boolean | null
          last_ai_enhanced_at: string | null
          last_reviewed_at: string | null
          organization_id: string | null
          practical_tools: Json
          review_status: string | null
          reviewed_by: string | null
          updated_at: string | null
          updated_by: string | null
          vector_embedding: string | null
          vector_keywords: Json | null
        }
        Insert: {
          ai_context_keywords?: Json | null
          ai_enhancement_enabled?: boolean | null
          ai_prompt_foundation?: string | null
          ai_prompt_implementation?: string | null
          audit_evidence?: Json
          category_name: string
          category_slug: string
          content_hash?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          created_by?: string | null
          cross_references?: Json
          display_order?: number | null
          foundation_content: string
          id?: string
          implementation_steps?: Json
          is_global_template?: boolean | null
          last_ai_enhanced_at?: string | null
          last_reviewed_at?: string | null
          organization_id?: string | null
          practical_tools?: Json
          review_status?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vector_embedding?: string | null
          vector_keywords?: Json | null
        }
        Update: {
          ai_context_keywords?: Json | null
          ai_enhancement_enabled?: boolean | null
          ai_prompt_foundation?: string | null
          ai_prompt_implementation?: string | null
          audit_evidence?: Json
          category_name?: string
          category_slug?: string
          content_hash?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          created_by?: string | null
          cross_references?: Json
          display_order?: number | null
          foundation_content?: string
          id?: string
          implementation_steps?: Json
          is_global_template?: boolean | null
          last_ai_enhanced_at?: string | null
          last_reviewed_at?: string | null
          organization_id?: string | null
          practical_tools?: Json
          review_status?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vector_embedding?: string | null
          vector_keywords?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_guidance_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_requirement_mappings: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          mapping_strength: string | null
          notes: string | null
          requirement_id: string | null
          unified_requirement_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          mapping_strength?: string | null
          notes?: string | null
          requirement_id?: string | null
          unified_requirement_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          mapping_strength?: string | null
          notes?: string | null
          requirement_id?: string | null
          unified_requirement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_requirement_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "platform_administrators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_requirement_mappings_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_requirement_mappings_unified_requirement_id_fkey"
            columns: ["unified_requirement_id"]
            isOneToOne: false
            referencedRelation: "unified_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_requirements: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          sub_requirements: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          sub_requirements: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          sub_requirements?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_requirements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "unified_compliance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_requirements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "platform_administrators"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_requirements_backup_audit_cleanup: {
        Row: {
          backup_created_at: string | null
          id: string | null
          sub_requirements: string[] | null
          title: string | null
        }
        Insert: {
          backup_created_at?: string | null
          id?: string | null
          sub_requirements?: string[] | null
          title?: string | null
        }
        Update: {
          backup_created_at?: string | null
          id?: string | null
          sub_requirements?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      unified_requirements_full_audit_cleanup_backup: {
        Row: {
          backup_created_at: string | null
          id: string | null
          sub_requirements: string[] | null
          title: string | null
        }
        Insert: {
          backup_created_at?: string | null
          id?: string | null
          sub_requirements?: string[] | null
          title?: string | null
        }
        Update: {
          backup_created_at?: string | null
          id?: string | null
          sub_requirements?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          earned_for: Json | null
          id: string
          is_featured: boolean | null
          organization_id: string
          progress: number | null
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          earned_for?: Json | null
          id?: string
          is_featured?: boolean | null
          organization_id: string
          progress?: number | null
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          earned_for?: Json | null
          id?: string
          is_featured?: boolean | null
          organization_id?: string
          progress?: number | null
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "gamification_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          metadata: Json | null
          organization_id: string | null
          role_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          role_id?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          role_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          attempt_count: number | null
          best_score: number | null
          bookmarks: Json | null
          completed_at: string | null
          content_id: string | null
          enrollment_id: string
          first_accessed_at: string | null
          id: string
          is_completed: boolean | null
          last_accessed_at: string | null
          latest_score: number | null
          learning_path_id: string | null
          metadata: Json | null
          notes: string | null
          organization_id: string
          progress_percentage: number | null
          session_count: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          attempt_count?: number | null
          best_score?: number | null
          bookmarks?: Json | null
          completed_at?: string | null
          content_id?: string | null
          enrollment_id: string
          first_accessed_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_accessed_at?: string | null
          latest_score?: number | null
          learning_path_id?: string | null
          metadata?: Json | null
          notes?: string | null
          organization_id: string
          progress_percentage?: number | null
          session_count?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          attempt_count?: number | null
          best_score?: number | null
          bookmarks?: Json | null
          completed_at?: string | null
          content_id?: string | null
          enrollment_id?: string
          first_accessed_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_accessed_at?: string | null
          latest_score?: number | null
          learning_path_id?: string | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string
          progress_percentage?: number | null
          session_count?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_requirement_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string | null
          requirement_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          requirement_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          requirement_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_requirement_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_requirement_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_requirement_assignments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_requirement_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_system_role: boolean | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_system_role?: boolean | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_system_role?: boolean | null
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vector_embeddings: {
        Row: {
          chunk_index: number | null
          content_id: string
          created_at: string | null
          embedding: string | null
          embedding_method: string | null
          embedding_model: string | null
          embedding_quality: number | null
          id: string
          last_used: string | null
          metadata: Json | null
          model_version: string | null
          similarity_threshold: number | null
          total_chunks: number | null
          updated_at: string | null
          usage_count: number | null
          validation_status: string | null
        }
        Insert: {
          chunk_index?: number | null
          content_id: string
          created_at?: string | null
          embedding?: string | null
          embedding_method?: string | null
          embedding_model?: string | null
          embedding_quality?: number | null
          id?: string
          last_used?: string | null
          metadata?: Json | null
          model_version?: string | null
          similarity_threshold?: number | null
          total_chunks?: number | null
          updated_at?: string | null
          usage_count?: number | null
          validation_status?: string | null
        }
        Update: {
          chunk_index?: number | null
          content_id?: string
          created_at?: string | null
          embedding?: string | null
          embedding_method?: string | null
          embedding_model?: string | null
          embedding_quality?: number | null
          id?: string
          last_used?: string | null
          metadata?: Json | null
          model_version?: string | null
          similarity_threshold?: number | null
          total_chunks?: number | null
          updated_at?: string | null
          usage_count?: number | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vector_embeddings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "knowledge_content"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_transitions: {
        Row: {
          actor_id: string
          actor_role: string
          blocks_affected: number | null
          change_summary: string
          from_stage: string
          from_status: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          rationale: string | null
          suggestions_processed: number | null
          to_stage: string
          to_status: string
          transition_at: string | null
          user_agent: string | null
          version_id: string
        }
        Insert: {
          actor_id: string
          actor_role: string
          blocks_affected?: number | null
          change_summary: string
          from_stage: string
          from_status: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          rationale?: string | null
          suggestions_processed?: number | null
          to_stage: string
          to_status: string
          transition_at?: string | null
          user_agent?: string | null
          version_id: string
        }
        Update: {
          actor_id?: string
          actor_role?: string
          blocks_affected?: number | null
          change_summary?: string
          from_stage?: string
          from_status?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          rationale?: string | null
          suggestions_processed?: number | null
          to_stage?: string
          to_status?: string
          transition_at?: string | null
          user_agent?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transitions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "guidance_versions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      extension_security_audit: {
        Row: {
          extension_name: unknown | null
          extension_version: string | null
          is_relocatable: boolean | null
          schema_name: unknown | null
          security_status: string | null
        }
        Relationships: []
      }
      requirement_embeddings_stats: {
        Row: {
          embedding_dimension: number | null
          first_embedding_created: string | null
          last_embedding_created: string | null
          requirements_with_embeddings: number | null
          total_embeddings: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_content_quality_score: {
        Args: { content_text: string }
        Returns: number
      }
      calculate_course_progress: {
        Args: { p_learning_path_id: string; p_user_id: string }
        Returns: number
      }
      calculate_overall_quality_score: {
        Args: { version_id_param: string }
        Returns: number
      }
      find_similar_requirements: {
        Args:
          | {
              max_results?: number
              query_embedding: string
              requirement_type_filter?: string
              similarity_threshold?: number
            }
          | {
              max_results?: number
              query_embedding: string
              similarity_threshold?: number
            }
        Returns: {
          requirement_id: string
          requirement_text: string
          similarity_score: number
          standard_name: string
        }[]
      }
      generate_certificate_number: {
        Args: { p_learning_path_id: string; p_organization_id: string }
        Returns: string
      }
      get_ai_usage_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_quality_score: number
          avg_response_time: number
          date: string
          model: string
          provider: string
          successful_requests: number
          total_cost: number
          total_requests: number
          total_tokens: number
        }[]
      }
      get_latest_published_guidance: {
        Args: { requirement_id_param: string }
        Returns: Json
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { org_uuid: string; user_uuid: string } | { user_email: string }
        Returns: Json
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_activity: {
        Args:
          | {
              action_name: string
              details_val?: Json
              org_id: string
              resource_id_val?: string
              resource_type_name: string
              user_id: string
            }
          | {
              p_action: string
              p_details?: Json
              p_organization_id: string
              p_user_id: string
            }
        Returns: string
      }
      update_daily_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_lms_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      requirement_priority: "low" | "medium" | "high" | "critical"
      requirement_status:
        | "fulfilled"
        | "partially-fulfilled"
        | "not-fulfilled"
        | "not-applicable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      requirement_priority: ["low", "medium", "high", "critical"],
      requirement_status: [
        "fulfilled",
        "partially-fulfilled",
        "not-fulfilled",
        "not-applicable",
      ],
    },
  },
} as const
