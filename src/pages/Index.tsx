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
import NotFound from "@/pages/NotFound";
import Organizations from "@/pages/Organizations";
import Documents from "@/pages/Documents";
import RiskManagement from "@/pages/RiskManagement";
import ReportRisk from "@/pages/risk-management/ReportRisk";
import ManageRisks from "@/pages/risk-management/ManageRisks";
import RiskSettings from "@/pages/risk-management/RiskSettings";
import RiskReports from "@/pages/risk-management/RiskReports";
import OrgChart from "@/pages/OrgChart";

const Index = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/standards" element={<Standards />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/chart" element={<OrgChart />} />
        <Route path="/documents/*" element={<Documents />} />
        <Route path="/risk-management" element={<RiskManagement />} />
        <Route path="/risk-management/report" element={<ReportRisk />} />
        <Route path="/risk-management/manage/risks" element={<ManageRisks />} />
        <Route path="/risk-management/manage/settings" element={<RiskSettings />} />
        <Route path="/risk-management/reports" element={<RiskReports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

export default Index;
