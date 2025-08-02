import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StandardsService } from '@/services/standards/StandardsService';
import { RequirementsService } from '@/services/requirements/RequirementsService';
import { MultiTenantAssessmentService } from '@/services/assessments/MultiTenantAssessmentService';

interface DashboardStats {
  totalStandards: number;
  totalRequirements: number;
  totalAssessments: number;
  complianceScore: number;
  complianceBreakdown: {
    fulfilled: number;
    partiallyFulfilled: number;
    notFulfilled: number;
    notApplicable: number;
  };
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStandards: 0,
    totalRequirements: 0,
    totalAssessments: 0,
    complianceScore: 0,
    complianceBreakdown: {
      fulfilled: 0,
      partiallyFulfilled: 0,
      notFulfilled: 0,
      notApplicable: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, organization, isDemo } = useAuth();

  useEffect(() => {
    if (!organization?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const standardsService = new StandardsService();
        const requirementsService = new RequirementsService();
        const assessmentService = MultiTenantAssessmentService.getInstance();

        // Fetch organization standards
        const orgStandards = await standardsService.getOrganizationStandards(organization.id);

        // Fetch organization requirements (all standards)
        const orgRequirements = await requirementsService.getOrganizationRequirements(organization.id);

        // Fetch assessments
        const assessments = await assessmentService.getAssessments(organization.id, isDemo);
        
        // Use ALL assessments for total count, not just ongoing ones
        const allAssessments = assessments;

        // Calculate compliance breakdown
        const breakdown = {
          fulfilled: 0,
          partiallyFulfilled: 0,
          notFulfilled: 0,
          notApplicable: 0,
        };

        orgRequirements.forEach(req => {
          switch (req.status) {
            case 'fulfilled':
              breakdown.fulfilled++;
              break;
            case 'partially-fulfilled':
              breakdown.partiallyFulfilled++;
              break;
            case 'not-fulfilled':
              breakdown.notFulfilled++;
              break;
            case 'not-applicable':
              breakdown.notApplicable++;
              break;
            default:
              // Any unknown status defaults to not-fulfilled
              console.warn('Unknown requirement status:', req.status);
              breakdown.notFulfilled++;
              break;
          }
        });

        // Calculate compliance score
        const applicableRequirements = orgRequirements.filter(req => req.status !== 'not-applicable');
        let complianceScore = 0;
        
        if (applicableRequirements.length > 0) {
          const fulfilledPoints = breakdown.fulfilled * 100;
          const partialPoints = breakdown.partiallyFulfilled * 50;
          const totalPossiblePoints = applicableRequirements.length * 100;
          
          complianceScore = Math.round(((fulfilledPoints + partialPoints) / totalPossiblePoints) * 100);
        }


        setStats({
          totalStandards: orgStandards.length,
          totalRequirements: orgRequirements.length,
          totalAssessments: allAssessments.length,
          complianceScore,
          complianceBreakdown: breakdown,
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [organization?.id, user?.id]);

  return { stats, loading, error };
}