import { ComplianceMonitoringDashboard } from '@/components/monitoring/ComplianceMonitoringDashboard';
import { useAuth } from '@/contexts/AuthContext';

const ComplianceMonitoring = () => {
  const { organization } = useAuth();
  
  const organizationId = organization?.id || 'demo-org';

  return (
    <div className="space-y-6">
      <ComplianceMonitoringDashboard organizationId={organizationId} />
    </div>
  );
};

export default ComplianceMonitoring;