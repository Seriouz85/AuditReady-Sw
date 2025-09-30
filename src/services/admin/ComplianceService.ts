/**
 * Compliance Service - Real data from database
 * NO MOCK DATA - All data fetched from Supabase
 */

import { supabase } from '@/lib/supabase';

export interface ComplianceStats {
  activeAssessments: number;
  completedAssessments: number;
  averageComplianceRate: number;
  riskItems: number;
}

export interface FrameworkStatus {
  id: string;
  name: string;
  code: string;
  description: string;
  complianceRate: number;
  assessmentCount: number;
  status: 'compliant' | 'good' | 'needs_work' | 'critical';
}

export interface ComplianceActivity {
  id: string;
  type: 'assessment' | 'policy' | 'risk' | 'training';
  title: string;
  description: string;
  timestamp: string;
  organizationName?: string;
}

export class ComplianceService {
  /**
   * Get compliance statistics across all organizations
   */
  static async getComplianceStats(): Promise<ComplianceStats> {
    try {
      // Get active assessments
      const { data: activeAssessments, error: activeError } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .in('status', ['in_progress', 'pending_review']);

      if (activeError) throw activeError;

      // Get completed assessments
      const { data: completedAssessments, error: completedError } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Calculate average compliance rate
      type ScoreRow = { compliance_score: number | null };
      const { data: assessmentScores, error: scoresError } = await supabase
        .from('assessments')
        .select('compliance_score')
        .eq('status', 'completed')
        .not('compliance_score', 'is', null);

      if (scoresError) throw scoresError;

      const typedScores = assessmentScores as ScoreRow[] | null;
      const averageComplianceRate = typedScores && typedScores.length > 0
        ? typedScores.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / typedScores.length
        : 0;

      // Get risk items (high and critical)
      const { data: riskItems, error: riskError } = await supabase
        .from('risks')
        .select('id', { count: 'exact', head: true })
        .in('severity', ['high', 'critical'])
        .eq('status', 'open');

      if (riskError) throw riskError;

      return {
        activeAssessments: activeAssessments?.length || 0,
        completedAssessments: completedAssessments?.length || 0,
        averageComplianceRate: Math.round(averageComplianceRate * 10) / 10,
        riskItems: riskItems?.length || 0
      };
    } catch (error) {
      console.error('Error fetching compliance stats:', error);
      return {
        activeAssessments: 0,
        completedAssessments: 0,
        averageComplianceRate: 0,
        riskItems: 0
      };
    }
  }

  /**
   * Get framework status with compliance rates
   */
  static async getFrameworkStatus(): Promise<FrameworkStatus[]> {
    try {
      // Get all standards/frameworks
      const { data: standards, error: standardsError } = await supabase
        .from('standards')
        .select('id, name, code, description')
        .eq('is_active', true)
        .order('name');

      if (standardsError) throw standardsError;

      type StandardRow = {
        id: string;
        name: string;
        code: string | null;
        description: string | null;
      };

      if (!standards || standards.length === 0) {
        return [];
      }

      // For each standard, calculate compliance rate based on assessments
      const frameworkStatuses = await Promise.all(
        (standards as StandardRow[]).map(async (standard) => {
          // Get assessments for this standard
          type AssessmentRow = { compliance_score: number | null };
          const { data: assessments, error: assessError } = await supabase
            .from('assessments')
            .select('compliance_score')
            .eq('standard_id', standard.id)
            .eq('status', 'completed')
            .not('compliance_score', 'is', null);

          if (assessError) {
            console.error(`Error fetching assessments for ${standard.name}:`, assessError);
          }

          const assessmentCount = assessments?.length || 0;
          const typedAssessments = assessments as AssessmentRow[] | null;
          const avgCompliance = typedAssessments && typedAssessments.length > 0
            ? typedAssessments.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / typedAssessments.length
            : 0;

          // Determine status based on compliance rate
          let status: 'compliant' | 'good' | 'needs_work' | 'critical' = 'needs_work';
          if (avgCompliance >= 90) status = 'compliant';
          else if (avgCompliance >= 75) status = 'good';
          else if (avgCompliance >= 50) status = 'needs_work';
          else status = 'critical';

          return {
            id: standard.id,
            name: standard.name,
            code: standard.code || '',
            description: standard.description || '',
            complianceRate: Math.round(avgCompliance * 10) / 10,
            assessmentCount,
            status
          };
        })
      );

      return frameworkStatuses;
    } catch (error) {
      console.error('Error fetching framework status:', error);
      return [];
    }
  }

  /**
   * Get recent compliance activities
   */
  static async getRecentActivities(limit = 10): Promise<ComplianceActivity[]> {
    try {
      const activities: ComplianceActivity[] = [];

      // Get recent assessments
      const { data: assessments, error: assessError } = await supabase
        .from('assessments')
        .select(`
          id,
          status,
          updated_at,
          organization:organizations!inner(name),
          standard:standards!inner(name)
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (!assessError && assessments) {
        assessments.forEach((assessment: any) => {
          if (assessment.status === 'completed') {
            activities.push({
              id: assessment.id,
              type: 'assessment',
              title: 'Assessment completed',
              description: `${assessment.standard?.name} - ${assessment.organization?.name}`,
              timestamp: assessment.updated_at
            });
          }
        });
      }

      // Get recent risks
      const { data: risks, error: riskError } = await supabase
        .from('risks')
        .select(`
          id,
          title,
          severity,
          created_at,
          organization:organizations!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!riskError && risks) {
        risks.forEach((risk: any) => {
          if (risk.severity === 'high' || risk.severity === 'critical') {
            activities.push({
              id: risk.id,
              type: 'risk',
              title: 'Risk identified',
              description: risk.title,
              timestamp: risk.created_at
            });
          }
        });
      }

      // Sort all activities by timestamp
      return activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }
}
