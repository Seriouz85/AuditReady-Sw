import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import TrenningLMS from "./pages/LMS/index";
import CreateLearningPath from "./pages/LMS/CreateLearningPath";
import QuizView from "./pages/LMS/QuizView";
import QuizEditor from "./pages/LMS/QuizEditor";
import ContentCreator from "./pages/LMS/ContentCreator";
import Reports from "./pages/LMS/Reports";
import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ZoomProvider } from "@/components/ui/zoom-toggle";

const queryClient = new QueryClient();
const basename = import.meta.env.DEV ? "/" : "/audit-readiness-hub";

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
                <Route path="/lms" element={<TrenningLMS />} />
                <Route path="/lms/create/learning-path" element={<CreateLearningPath />} />
                <Route path="/lms/create/content" element={<ContentCreator />} />
                <Route path="/lms/quizzes" element={<QuizView />} />
                <Route path="/lms/quizzes/create" element={<QuizEditor />} />
                <Route path="/lms/quizzes/edit/:id" element={<QuizEditor />} />
                <Route path="/lms/reports" element={<Reports />} />
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
