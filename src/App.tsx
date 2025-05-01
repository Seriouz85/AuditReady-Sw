import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
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
import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ZoomProvider } from "@/components/ui/zoom-toggle";

const queryClient = new QueryClient();
const basename = import.meta.env.DEV ? "/" : "/audit-readiness-hub/";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ZoomProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={basename}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/app/*" element={<Index />} />
                <Route path="/lms-old" element={<LMS />} />
                <Route path="/lms" element={<TrenningLMS />} />
                <Route path="/lms/admin" element={<LMSAdmin />} />
                <Route path="/lms/create/learning-path" element={<CreateLearningPath />} />
                <Route path="/lms/create/content" element={<ContentCreator />} />
                <Route path="/lms/create/course-builder" element={<CourseBuilder />} />
                <Route path="/lms/courses/edit" element={<EditCourse />} />
                <Route path="/lms/quizzes/create" element={<QuizEditor />} />
                <Route path="/lms/quizzes/edit/:id" element={<QuizEditor />} />
                <Route path="/lms/reports" element={<Reports />} />
                <Route path="/lms/course/:courseId" element={<CourseDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ZoomProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
