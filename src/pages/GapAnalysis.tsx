import { GapAnalysisDashboard } from '@/components/analytics/GapAnalysisDashboard';
import { useAuth } from '@/contexts/AuthContext';

const GapAnalysis = () => {
  const { organization } = useAuth();
  
  const organizationId = organization?.id || 'demo-org';

  return (
    <div className="space-y-6">
      <GapAnalysisDashboard organizationId={organizationId} />
    </div>
  );
};

export default GapAnalysis;