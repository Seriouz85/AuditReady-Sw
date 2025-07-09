import { PubSub } from 'graphql-subscriptions';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { supabase } from '@/lib/supabase';
import { mlAnalyticsService } from '@/lib/ml/analyticsService';
import { documentAnalysisService } from '@/lib/ai/documentAnalysis';
import { anomalyDetectionService } from '@/lib/ml/anomalyDetection';
import { riskPredictionService } from '@/lib/ml/riskPrediction';

const pubsub = new PubSub();

// Custom Date scalar
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom JSON scalar
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
});

export const resolvers = {
  Date: dateScalar,
  JSON: jsonScalar,

  Query: {
    // User queries
    me: async (_: any, __: any, context: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return data;
    },

    user: async (_: any, { id }: any) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      return data;
    },

    users: async (_: any, { organizationId }: any) => {
      const { data } = await supabase
        .from('organization_users')
        .select('*, profiles(*)')
        .eq('organization_id', organizationId);
      
      return data?.map(ou => ({ ...ou.profiles, role: ou.role })) || [];
    },

    // Organization queries
    organization: async (_: any, { id }: any) => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
      
      return data;
    },

    organizations: async (_: any, __: any, context: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data } = await supabase
        .from('organization_users')
        .select('*, organizations(*)')
        .eq('user_id', user.id);
      
      return data?.map(ou => ou.organizations) || [];
    },

    organizationStats: async (_: any, { id }: any) => {
      const [assessments, users, compliance, risk] = await Promise.all([
        supabase.from('assessments').select('*', { count: 'exact' }).eq('organization_id', id),
        supabase.from('organization_users').select('*', { count: 'exact' }).eq('organization_id', id),
        mlAnalyticsService.calculateComplianceScore(id),
        riskPredictionService.calculateRiskScore(id)
      ]);

      const activeAssessments = assessments.data?.filter(a => a.status === 'active').length || 0;
      const upcomingDeadlines = assessments.data?.filter(a => {
        const dueDate = new Date(a.due_date);
        const now = new Date();
        const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilDue <= 30 && daysUntilDue > 0;
      }).length || 0;

      return {
        totalAssessments: assessments.count || 0,
        activeAssessments,
        complianceScore: compliance,
        riskScore: risk.score,
        totalUsers: users.count || 0,
        upcomingDeadlines
      };
    },

    // Assessment queries
    assessment: async (_: any, { id }: any) => {
      const { data } = await supabase
        .from('assessments')
        .select(`
          *,
          frameworks(*),
          assessment_assignments(*, profiles(*))
        `)
        .eq('id', id)
        .single();
      
      return data;
    },

    assessments: async (_: any, { organizationId, status, framework }: any) => {
      let query = supabase
        .from('assessments')
        .select(`
          *,
          frameworks(*),
          assessment_assignments(*, profiles(*))
        `)
        .eq('organization_id', organizationId);
      
      if (status) query = query.eq('status', status);
      if (framework) query = query.eq('framework_id', framework);
      
      const { data } = await query;
      return data || [];
    },

    // Compliance queries
    complianceOverview: async (_: any, { organizationId }: any) => {
      const overview = await mlAnalyticsService.getComplianceOverview(organizationId);
      return overview;
    },

    complianceFrameworks: async () => {
      const { data } = await supabase
        .from('frameworks')
        .select(`
          *,
          categories(*,
            requirements(*)
          )
        `);
      
      return data || [];
    },

    requirements: async (_: any, { assessmentId, status, category }: any) => {
      let query = supabase
        .from('requirements')
        .select(`
          *,
          categories(*),
          evidence(*)
        `)
        .eq('assessment_id', assessmentId);
      
      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category_id', category);
      
      const { data } = await query;
      return data || [];
    },

    // Risk queries
    riskAnalysis: async (_: any, { organizationId }: any) => {
      const analysis = await riskPredictionService.analyzeRisk(organizationId);
      return analysis;
    },

    riskPredictions: async (_: any, { organizationId, timeframe }: any) => {
      const predictions = await riskPredictionService.predictFutureRisk(organizationId, timeframe);
      return predictions;
    },

    // ML/AI queries
    mlInsights: async (_: any, { organizationId, type, limit = 10 }: any) => {
      const insights = await mlAnalyticsService.getInsights(organizationId, type, limit);
      return insights;
    },

    documentAnalysis: async (_: any, { id }: any) => {
      const { data } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('id', id)
        .single();
      
      return data;
    },

    recentDocumentAnalyses: async (_: any, { organizationId, limit = 10 }: any) => {
      const { data } = await supabase
        .from('document_analyses')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return data || [];
    },

    // Anomaly queries
    anomalies: async (_: any, { organizationId, severity, resolved }: any) => {
      let query = supabase
        .from('anomaly_alerts')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (severity) query = query.eq('severity', severity);
      if (resolved !== undefined) query = query.eq('resolved', resolved);
      
      const { data } = await query.order('detected_at', { ascending: false });
      return data || [];
    },
  },

  Mutation: {
    // User mutations
    updateProfile: async (_: any, { input }: any, context: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(input)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Organization mutations
    createOrganization: async (_: any, { input }: any, context: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([input])
        .select()
        .single();
      
      if (orgError) throw orgError;
      
      // Add user as owner
      const { error: userError } = await supabase
        .from('organization_users')
        .insert([{
          organization_id: org.id,
          user_id: user.id,
          role: 'owner'
        }]);
      
      if (userError) throw userError;
      
      return org;
    },

    updateOrganization: async (_: any, { id, input }: any) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    // Assessment mutations
    createAssessment: async (_: any, { input }: any) => {
      const { assignedUserIds, ...assessmentData } = input;
      
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select()
        .single();
      
      if (assessmentError) throw assessmentError;
      
      // Assign users
      if (assignedUserIds?.length > 0) {
        const assignments = assignedUserIds.map((userId: string) => ({
          assessment_id: assessment.id,
          user_id: userId
        }));
        
        const { error: assignError } = await supabase
          .from('assessment_assignments')
          .insert(assignments);
        
        if (assignError) throw assignError;
      }
      
      // Trigger real-time update
      pubsub.publish('ASSESSMENT_CREATED', { 
        assessmentProgressUpdated: assessment 
      });
      
      return assessment;
    },

    updateAssessment: async (_: any, { id, input }: any) => {
      const { assignedUserIds, ...assessmentData } = input;
      
      const { data, error } = await supabase
        .from('assessments')
        .update(assessmentData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update assignments if provided
      if (assignedUserIds) {
        await supabase
          .from('assessment_assignments')
          .delete()
          .eq('assessment_id', id);
        
        if (assignedUserIds.length > 0) {
          const assignments = assignedUserIds.map((userId: string) => ({
            assessment_id: id,
            user_id: userId
          }));
          
          await supabase
            .from('assessment_assignments')
            .insert(assignments);
        }
      }
      
      // Trigger real-time update
      pubsub.publish('ASSESSMENT_UPDATED', { 
        assessmentProgressUpdated: data 
      });
      
      return data;
    },

    deleteAssessment: async (_: any, { id }: any) => {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },

    // Requirement mutations
    updateRequirement: async (_: any, { id, input }: any) => {
      const { data, error } = await supabase
        .from('requirements')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Trigger real-time update
      pubsub.publish('REQUIREMENT_UPDATED', { 
        requirementStatusChanged: data 
      });
      
      // Check for anomalies
      anomalyDetectionService.checkRequirementAnomaly(data);
      
      return data;
    },

    bulkUpdateRequirements: async (_: any, { input }: any) => {
      const updates = await Promise.all(
        input.map(async ({ requirementId, status }: any) => {
          const { data, error } = await supabase
            .from('requirements')
            .update({ status })
            .eq('id', requirementId)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        })
      );
      
      return updates;
    },

    // Evidence mutations
    uploadEvidence: async (_: any, { input }: any) => {
      const { data, error } = await supabase
        .from('evidence')
        .insert([input])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    verifyEvidence: async (_: any, { id }: any, context: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('evidence')
        .update({
          verified: true,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    deleteEvidence: async (_: any, { id }: any) => {
      const { error } = await supabase
        .from('evidence')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },

    // ML/AI mutations
    analyzeDocument: async (_: any, { input }: any) => {
      const analysis = await documentAnalysisService.analyzeDocument(input);
      
      // Store analysis results
      const { data, error } = await supabase
        .from('document_analyses')
        .insert([analysis])
        .select()
        .single();
      
      if (error) throw error;
      
      // Trigger real-time update
      pubsub.publish('DOCUMENT_ANALYZED', { 
        newMLInsight: {
          type: 'document_analysis',
          ...analysis
        }
      });
      
      return data;
    },

    generateComplianceReport: async (_: any, { organizationId, framework, format }: any) => {
      const reportUrl = await mlAnalyticsService.generateComplianceReport(
        organizationId,
        framework,
        format
      );
      
      return reportUrl;
    },

    // Risk mutations
    acknowledgeAnomaly: async (_: any, { id }: any) => {
      const { data, error } = await supabase
        .from('anomaly_alerts')
        .update({ resolved: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    createRiskMitigation: async (_: any, { input }: any) => {
      const mitigation = await riskPredictionService.createMitigationPlan(input);
      
      const { data, error } = await supabase
        .from('risk_mitigations')
        .insert([mitigation])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  Subscription: {
    // Real-time compliance updates
    complianceScoreUpdated: {
      subscribe: (_: any, { organizationId }: any) => 
        pubsub.asyncIterator([`COMPLIANCE_UPDATED_${organizationId}`])
    },

    // Risk monitoring
    riskLevelChanged: {
      subscribe: (_: any, { organizationId }: any) => 
        pubsub.asyncIterator([`RISK_CHANGED_${organizationId}`])
    },

    anomalyDetected: {
      subscribe: (_: any, { organizationId }: any) => 
        pubsub.asyncIterator([`ANOMALY_DETECTED_${organizationId}`])
    },

    // Assessment tracking
    assessmentProgressUpdated: {
      subscribe: (_: any, { assessmentId }: any) => 
        pubsub.asyncIterator([`ASSESSMENT_UPDATED_${assessmentId}`])
    },

    requirementStatusChanged: {
      subscribe: (_: any, { assessmentId }: any) => 
        pubsub.asyncIterator([`REQUIREMENT_UPDATED_${assessmentId}`])
    },

    // ML insights
    newMLInsight: {
      subscribe: (_: any, { organizationId }: any) => 
        pubsub.asyncIterator([`ML_INSIGHT_${organizationId}`])
    },
  },

  // Type resolvers
  User: {
    organizations: async (parent: any) => {
      const { data } = await supabase
        .from('organization_users')
        .select('*, organizations(*)')
        .eq('user_id', parent.id);
      
      return data?.map(ou => ou.organizations) || [];
    },
  },

  Organization: {
    users: async (parent: any) => {
      const { data } = await supabase
        .from('organization_users')
        .select('*, profiles(*)')
        .eq('organization_id', parent.id);
      
      return data?.map(ou => ({ ...ou.profiles, role: ou.role })) || [];
    },

    assessments: async (parent: any) => {
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('organization_id', parent.id);
      
      return data || [];
    },

    complianceStatus: async (parent: any) => {
      return mlAnalyticsService.getComplianceOverview(parent.id);
    },

    riskScore: async (parent: any) => {
      return riskPredictionService.analyzeRisk(parent.id);
    },

    subscription: async (parent: any) => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', parent.id)
        .single();
      
      return data;
    },
  },

  Assessment: {
    framework: async (parent: any) => {
      const { data } = await supabase
        .from('frameworks')
        .select('*')
        .eq('id', parent.framework_id)
        .single();
      
      return data;
    },

    assignedTo: async (parent: any) => {
      const { data } = await supabase
        .from('assessment_assignments')
        .select('*, profiles(*)')
        .eq('assessment_id', parent.id);
      
      return data?.map(aa => aa.profiles) || [];
    },

    requirements: async (parent: any) => {
      const { data } = await supabase
        .from('requirements')
        .select('*')
        .eq('assessment_id', parent.id);
      
      return data || [];
    },

    findings: async (parent: any) => {
      const { data } = await supabase
        .from('findings')
        .select('*')
        .eq('assessment_id', parent.id);
      
      return data || [];
    },
  },

  Requirement: {
    category: async (parent: any) => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('id', parent.category_id)
        .single();
      
      return data;
    },

    evidence: async (parent: any) => {
      const { data } = await supabase
        .from('evidence')
        .select('*')
        .eq('requirement_id', parent.id);
      
      return data || [];
    },
  },

  Evidence: {
    uploadedBy: async (parent: any) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parent.uploaded_by)
        .single();
      
      return data;
    },

    verifiedBy: async (parent: any) => {
      if (!parent.verified_by) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parent.verified_by)
        .single();
      
      return data;
    },
  },

  Finding: {
    requirement: async (parent: any) => {
      const { data } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', parent.requirement_id)
        .single();
      
      return data;
    },
  },
};