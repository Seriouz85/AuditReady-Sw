import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Standards from "@/pages/Standards";
import Requirements from "@/pages/Requirements";
import Assessments from "@/pages/Assessments";
import Applications from "@/pages/Applications";
import Suppliers from "@/pages/Suppliers";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Activities from "@/pages/Activities";
import NotFound from "@/pages/NotFound";
import Organizations from "@/pages/Organizations";
import Documents from "@/pages/Documents";
import RiskManagement from "@/pages/RiskManagement";
import ReportRisk from "@/pages/risk-management/ReportRisk";
import ManageRisks from "@/pages/risk-management/ManageRisks";
import RiskSettings from "@/pages/risk-management/RiskSettings";
import RiskReports from "@/pages/risk-management/RiskReports";
import RiskDetail from "@/pages/risk-management/manage/RiskDetail";
import RiskAssignment from "@/pages/risk-management/manage/RiskAssignment";
import OrgChart from "@/pages/OrgChart";
import OrganizationStructurePage from "@/pages/organizations/structure";
import GapAnalysis from "@/pages/GapAnalysis";
import ComplianceMonitoring from "@/pages/ComplianceMonitoring";
import EnterpriseSSO from "@/pages/admin/EnterpriseSSO";
import EntraCallbackPage from "@/pages/auth/EntraCallbackPage";

const Index = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/standards" element={<Standards />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/assessments/:id" element={<Assessments />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/chart" element={<OrgChart />} />
        <Route path="/organizations/structure" element={<OrganizationStructurePage />} />
        <Route path="/documents/*" element={<Documents />} />
        <Route path="/risk-management" element={<RiskManagement />} />
        <Route path="/risk-management/report" element={<ReportRisk />} />
        <Route path="/risk-management/manage/risks" element={<ManageRisks />} />
        <Route path="/risk-management/manage/risks/:riskId" element={<RiskDetail />} />
        <Route path="/risk-management/manage/risks/:riskId/assign" element={<RiskAssignment />} />
        <Route path="/risk-management/manage/settings" element={<RiskSettings />} />
        <Route path="/risk-management/reports" element={<RiskReports />} />
        <Route path="/gap-analysis" element={<GapAnalysis />} />
        <Route path="/compliance-monitoring" element={<ComplianceMonitoring />} />
        <Route path="/admin/sso" element={<EnterpriseSSO />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

export default Index;
