import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import PricingAssessment from "./pages/PricingAssessment";
import Onboarding from "./pages/Onboarding";
import EnhancedOnboarding from "./pages/EnhancedOnboarding";
import EnhancedOnboardingFlow from "./pages/EnhancedOnboardingFlow";
import GuidedStandardImport from "./pages/GuidedStandardImport";
import AcceptInvitation from "./pages/AcceptInvitation";
import About from "./pages/About";
import PublicOnboarding from "./pages/PublicOnboarding";
import LMS from "./pages/LMS";
import TrenningLMS from "./pages/LMS/index";
import CreateLearningPath from "./pages/LMS/CreateLearningPath";
import EditCourse from "./pages/LMS/EditCourse";
import QuizEditor from "./pages/LMS/QuizEditor";
import ContentCreator from "./pages/LMS/ContentCreator";
import CourseBuilder from "./pages/LMS/CourseBuilder";
import Reports from "./pages/LMS/Reports";
import CourseDetail from "./pages/LMS/CourseDetail";
import LMSAdmin from "./pages/LMS/Admin";
import PhishingSimulationManager from "./pages/LMS/PhishingSimulationManager";
import GraphicalEditor from "./pages/documents/GraphicalEditor";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AnalyticsDashboard } from "./pages/admin/analytics/AnalyticsDashboard";
import { BillingManagement } from "./pages/admin/billing/BillingManagement";
import { StandardDetail } from "./pages/admin/standards/StandardDetail";
import { OrganizationDetail } from "./pages/admin/organizations/OrganizationDetail";
import { UserManagement } from "./pages/admin/users/UserManagement";
import { SystemSettings } from "./pages/admin/system/SystemSettings";
import EntraCallbackPage from "./pages/auth/EntraCallbackPage";

import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ZoomProvider } from "@/components/ui/zoom-toggle";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

// Check if we're on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
// Use the appropriate basename based on deployment platform
const basename = import.meta.env.DEV
  ? "/"
  : isGitHubPages
    ? "/audit-readiness-hub/"
    : "/";

// EmptyLayout removed as it was unused

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ZoomProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename={basename}>
                <Routes>
                  {/* Public pages */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/pricing" element={<PricingAssessment />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-verification" element={<EmailVerification />} />
                  <Route path="/invite/:token" element={<AcceptInvitation />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/onboarding" element={<PublicOnboarding />} />
                  <Route path="/auth/callback/entra" element={<EntraCallbackPage />} />
                  
                  {/* Protected pages requiring authentication */}
                  {/* Enhanced onboarding flow for authenticated users */}
                  <Route 
                    path="/onboarding-auth" 
                    element={
                      <ProtectedRoute>
                        <EnhancedOnboardingFlow />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/onboarding-legacy" 
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/guided-import" 
                    element={
                      <ProtectedRoute>
                        <GuidedStandardImport />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/app/*" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Protected standalone editor routes */}
                  <Route 
                    path="/editor" 
                    element={
                      <ProtectedRoute>
                        <GraphicalEditor />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Protected LMS routes */}
                  <Route 
                    path="/lms-old" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <LMS />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <TrenningLMS />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/admin" 
                    element={
                      <ProtectedRoute requiredPermission="admin_lms">
                        <LMSAdmin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/learning-path" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <CreateLearningPath />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/content" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <ContentCreator />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/course-builder" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <CourseBuilder />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/courses/edit" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <EditCourse />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/quizzes/create" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <QuizEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/quizzes/edit/:id" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <QuizEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/reports" 
                    element={
                      <ProtectedRoute requiredPermission="view_lms_reports">
                        <Reports />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/course/:courseId" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <CourseDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/phishing-simulation-manager" 
                    element={
                      <ProtectedRoute requiredPermission="admin_lms">
                        <PhishingSimulationManager />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Platform Admin Console Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/standards/:id" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <StandardDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/organizations/:id" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <OrganizationDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <UserManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <UserManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <SystemSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/system/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <SystemSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <AnalyticsDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/billing" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <BillingManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ZoomProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
