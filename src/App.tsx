import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Core pages that should load immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Lazy load secondary pages
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const PricingAssessment = lazy(() => import("./pages/PricingAssessment"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const EnhancedOnboardingFlow = lazy(() => import("./pages/EnhancedOnboardingFlow"));
const GuidedStandardImport = lazy(() => import("./pages/GuidedStandardImport"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const AuthCallback = lazy(() => import("./pages/auth/AuthCallback"));

// Lazy load informational pages
const About = lazy(() => import("./pages/About"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Security = lazy(() => import("./pages/legal/Security"));
const Cookies = lazy(() => import("./pages/legal/Cookies"));
const Features = lazy(() => import("./pages/Features"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const ComplianceSimplification = lazy(() => import("./pages/ComplianceSimplification"));
const PublicOnboarding = lazy(() => import("./pages/PublicOnboarding"));

// Lazy load supplier portal (external access)
const SupplierPortal = lazy(() => import("./pages/SupplierPortal"));

// Lazy load LMS modules
const LMS = lazy(() => import("./pages/LMS"));
const TrenningLMS = lazy(() => import("./pages/LMS/index"));
const CreateLearningPath = lazy(() => import("./pages/LMS/CreateLearningPath"));
const EditCourse = lazy(() => import("./pages/LMS/EditCourse"));
const QuizEditor = lazy(() => import("./pages/LMS/QuizEditor"));
const ContentCreator = lazy(() => import("./pages/LMS/ContentCreator"));
const CourseBuilder = lazy(() => import("./pages/LMS/CourseBuilder"));
const CoursePreview = lazy(() => import("./pages/LMS/CoursePreview"));
const Reports = lazy(() => import("./pages/LMS/Reports"));
const CourseDetail = lazy(() => import("./pages/LMS/CourseDetail"));
const LMSAdmin = lazy(() => import("./pages/LMS/Admin"));
const PhishingSimulationManager = lazy(() => import("./pages/LMS/PhishingSimulationManager"));
const MediaLibrary = lazy(() => import("./pages/LMS/MediaLibrary"));
const LMSAnalytics = lazy(() => import("./pages/LMS/Analytics"));
const CourseViewer = lazy(() => import("./pages/LMS/CourseViewer"));
const CourseLibrary = lazy(() => import("./pages/LMS/CourseLibrary"));
const PageEditor = lazy(() => import("./pages/LMS/PageEditor"));
const AssignmentEditor = lazy(() => import("./pages/LMS/AssignmentEditor"));
const LearningPathBuilder = lazy(() => import("./pages/LMS/LearningPathBuilder"));

// Lazy load editor
const GraphicalEditor = lazy(() => import("./pages/documents/GraphicalEditor"));
const AREditorShowcase = lazy(() => import("./pages/AREditorShowcase"));
// Lazy load admin components for code splitting
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AnalyticsDashboard = lazy(() => import("./pages/admin/analytics/AnalyticsDashboard").then(m => ({ default: m.AnalyticsDashboard })));
const BillingManagement = lazy(() => import("./pages/admin/billing/BillingManagement").then(m => ({ default: m.BillingManagement })));
const StandardDetail = lazy(() => import("./pages/admin/standards/StandardDetail").then(m => ({ default: m.StandardDetail })));
const OrganizationDetail = lazy(() => import("./pages/admin/organizations/OrganizationDetail").then(m => ({ default: m.OrganizationDetail })));
const UserManagement = lazy(() => import("./pages/admin/users/UserManagement").then(m => ({ default: m.UserManagement })));
const SystemSettings = lazy(() => import("./pages/admin/system/SystemSettings").then(m => ({ default: m.SystemSettings })));
const ComplianceManagement = lazy(() => import("./pages/admin/compliance/ComplianceManagement"));
const UnifiedGuidanceValidationDashboard = lazy(() => import("./pages/admin/UnifiedGuidanceValidationDashboard"));
const UnifiedRequirementsValidationDashboard = lazy(() => import("./pages/admin/UnifiedRequirementsValidationDashboard"));
import EntraCallbackPage from "./pages/auth/EntraCallbackPage";
import { ScrollToTop } from "./components/ScrollToTop";

import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ZoomProvider } from "@/components/ui/zoom-toggle";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GlobalErrorBoundary, ErrorRecoveryProvider } from "./components/error";
import { AdminLoadingSpinner } from "./components/AdminLoadingSpinner";
import { PageLoading } from "./components/loading/LoadingStates";
import { isDocsSubdomain } from "./utils/subdomainRouter";

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

const App = () => {
  // Handle subdomain routing for docs.auditready.xyz
  if (isDocsSubdomain()) {
    // If we're on docs subdomain, render Documentation directly
    return (
      <GlobalErrorBoundary>
        <ErrorRecoveryProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ZoomProvider>
                <LanguageProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter basename={basename}>
                      <Routes>
                        <Route path="*" element={
                          <Suspense fallback={<PageLoading title="Loading documentation..." />}>
                            <Documentation />
                          </Suspense>
                        } />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </LanguageProvider>
              </ZoomProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorRecoveryProvider>
      </GlobalErrorBoundary>
    );
  }

  // Regular app routing
  return (
  <GlobalErrorBoundary>
    <ErrorRecoveryProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ZoomProvider>
            <LanguageProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter 
                    basename={basename}
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                  <ScrollToTop />
                <Routes>
                  {/* Public pages */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/pricing" element={
                    <Suspense fallback={<PageLoading title="Loading pricing..." />}>
                      <PricingAssessment />
                    </Suspense>
                  } />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/reset-password" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <ResetPassword />
                    </Suspense>
                  } />
                  <Route path="/email-verification" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <EmailVerification />
                    </Suspense>
                  } />
                  <Route path="/invite/:token" element={
                    <Suspense fallback={<PageLoading title="Loading invitation..." />}>
                      <AcceptInvitation />
                    </Suspense>
                  } />
                  <Route path="/about" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <About />
                    </Suspense>
                  } />
                  <Route path="/documentation" element={
                    <Suspense fallback={<PageLoading title="Loading documentation..." />}>
                      <Documentation />
                    </Suspense>
                  } />
                  <Route path="/features" element={
                    <Suspense fallback={<PageLoading title="Loading features..." />}>
                      <Features />
                    </Suspense>
                  } />
                  <Route path="/roadmap" element={
                    <Suspense fallback={<PageLoading title="Loading roadmap..." />}>
                      <Roadmap />
                    </Suspense>
                  } />
                  <Route path="/compliance-simplification" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <ComplianceSimplification />
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <Privacy />
                    </Suspense>
                  } />
                  <Route path="/terms" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <Terms />
                    </Suspense>
                  } />
                  <Route path="/security" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <Security />
                    </Suspense>
                  } />
                  <Route path="/cookies" element={
                    <Suspense fallback={<PageLoading title="Loading..." />}>
                      <Cookies />
                    </Suspense>
                  } />
                  <Route path="/onboarding" element={
                    <Suspense fallback={<PageLoading title="Loading onboarding..." />}>
                      <PublicOnboarding />
                    </Suspense>
                  } />
                  <Route path="/auth/callback/entra" element={<EntraCallbackPage />} />
                  <Route path="/auth/accept-invitation" element={
                    <Suspense fallback={<PageLoading title="Loading auth callback..." />}>
                      <AuthCallback />
                    </Suspense>
                  } />
                  {/* Supplier Portal - External access (no authentication required) */}
                  <Route path="/supplier-portal" element={
                    <Suspense fallback={<PageLoading title="Loading supplier portal..." />}>
                      <SupplierPortal />
                    </Suspense>
                  } />
                  
                  {/* Protected pages requiring authentication */}
                  {/* Enhanced onboarding flow for authenticated users */}
                  <Route 
                    path="/onboarding-auth" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoading title="Loading onboarding..." />}>
                          <EnhancedOnboardingFlow />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/onboarding-legacy" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoading title="Loading onboarding..." />}>
                          <Onboarding />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/guided-import" 
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageLoading title="Loading import wizard..." />}>
                          <GuidedStandardImport />
                        </Suspense>
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
                      <ProtectedRoute requireOrganization={false}>
                        <Suspense fallback={<PageLoading title="Loading editor..." />}>
                          <GraphicalEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Enterprise AR Editor Showcase */}
                  <Route 
                    path="/ar-editor-showcase" 
                    element={
                      <ProtectedRoute requireOrganization={false}>
                        <Suspense fallback={<PageLoading title="Loading Enterprise AR Editor..." />}>
                          <AREditorShowcase />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Protected LMS routes */}
                  <Route 
                    path="/lms-old" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading LMS..." />}>
                          <LMS />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading LMS..." />}>
                          <TrenningLMS />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/admin" 
                    element={
                      <ProtectedRoute requiredPermission="admin_lms">
                        <Suspense fallback={<PageLoading title="Loading LMS Admin..." />}>
                          <LMSAdmin />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/learning-path" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading..." />}>
                          <CreateLearningPath />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/learning-path/create" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading learning path builder..." />}>
                          <LearningPathBuilder />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/learning-path/edit/:pathId" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <Suspense fallback={<PageLoading title="Loading learning path builder..." />}>
                          <LearningPathBuilder />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/learning-path/:pathId" 
                    element={
                      <ProtectedRoute requiredPermission="view_lms_content">
                        <Suspense fallback={<PageLoading title="Loading learning path..." />}>
                          <LearningPathBuilder />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/content" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading content creator..." />}>
                          <ContentCreator />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/course-builder" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading course builder..." />}>
                          <CourseBuilder />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/course-preview/:courseId" 
                    element={
                      <ProtectedRoute requiredPermission="view_lms_content">
                        <Suspense fallback={<PageLoading title="Loading course preview..." />}>
                          <CoursePreview />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/learning-path-builder" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading learning path builder..." />}>
                          <LearningPathBuilder />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/page-editor" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading page editor..." />}>
                          <PageEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/quiz-editor" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading quiz editor..." />}>
                          <QuizEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/create/assignment-editor" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading assignment editor..." />}>
                          <AssignmentEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/page/create" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading page editor..." />}>
                          <PageEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/page/edit/:pageId" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <Suspense fallback={<PageLoading title="Loading page editor..." />}>
                          <PageEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/page/:pageId" 
                    element={
                      <ProtectedRoute requiredPermission="view_lms_content">
                        <Suspense fallback={<PageLoading title="Loading page..." />}>
                          <PageEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/assignment/create" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading assignment editor..." />}>
                          <AssignmentEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/assignment/edit/:assignmentId" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <Suspense fallback={<PageLoading title="Loading assignment editor..." />}>
                          <AssignmentEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/assignment/:assignmentId" 
                    element={
                      <ProtectedRoute requiredPermission="view_lms_content">
                        <Suspense fallback={<PageLoading title="Loading assignment..." />}>
                          <AssignmentEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/courses/edit" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <Suspense fallback={<PageLoading title="Loading course editor..." />}>
                          <EditCourse />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/library" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading course library..." />}>
                          <CourseLibrary />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/quizzes/create" 
                    element={
                      <ProtectedRoute requiredPermission="create_lms_content">
                        <Suspense fallback={<PageLoading title="Loading quiz editor..." />}>
                          <QuizEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/quizzes/edit/:id" 
                    element={
                      <ProtectedRoute requiredPermission="edit_lms_content">
                        <Suspense fallback={<PageLoading title="Loading quiz editor..." />}>
                          <QuizEditor />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/reports" 
                    element={
                      <ProtectedRoute requiredPermission="view_lms_reports">
                        <Suspense fallback={<PageLoading title="Loading reports..." />}>
                          <Reports />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/course/:courseId" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading course details..." />}>
                          <CourseDetail />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/viewer/:courseId" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading course viewer..." />}>
                          <CourseViewer />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/phishing-simulation-manager" 
                    element={
                      <ProtectedRoute requiredPermission="admin_lms">
                        <Suspense fallback={<PageLoading title="Loading phishing simulation manager..." />}>
                          <PhishingSimulationManager />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/media-library" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading media library..." />}>
                          <MediaLibrary />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lms/analytics" 
                    element={
                      <ProtectedRoute requiredPermission="access_lms">
                        <Suspense fallback={<PageLoading title="Loading analytics..." />}>
                          <LMSAnalytics />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />

                  {/* Platform Admin Console Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <AdminDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/standards/:id" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <StandardDetail />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/organizations/:id" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <OrganizationDetail />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <UserManagement />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <UserManagement />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/compliance" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <ComplianceManagement />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/unified-requirements-validation" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <UnifiedRequirementsValidationDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/semantic-mapping" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <UnifiedGuidanceValidationDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/unified-guidance-validation" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <UnifiedGuidanceValidationDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <SystemSettings />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/system/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <SystemSettings />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <AnalyticsDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/billing" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <BillingManagement />
                        </Suspense>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute requiredPermission="platform_admin">
                        <Suspense fallback={<AdminLoadingSpinner />}>
                          <AdminDashboard />
                        </Suspense>
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
  </ErrorRecoveryProvider>
  </GlobalErrorBoundary>
  );
};

export default App;
