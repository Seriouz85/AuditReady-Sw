import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import MissingEvidence from "@/components/documents/MissingEvidence";
import DocumentGenerator from "@/components/documents/DocumentGenerator";

const Documents = () => {
  const { organization, isDemo } = useAuth();
  
  // Read the correct key from environment variables
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

  // Check if the key is missing and potentially handle the error
  if (!geminiApiKey) {
    console.error("Error: VITE_GEMINI_API_KEY is not set in the environment variables.");
    // Optionally, render an error message or prevent rendering the generator
    // return <div>API Key is missing. Please configure it in your .env file.</div>;
  }

  const organizationId = organization?.id || 'demo-org';

  return (
    <Routes>
      <Route path="" element={<Navigate to="library" replace />} />
      <Route path="library" element={<DocumentLibrary organizationId={organizationId} />} />
      <Route path="missing" element={<MissingEvidence />} />
      <Route path="generator" element={<DocumentGenerator apiKey={geminiApiKey} />} />
    </Routes>
  );
};

export default Documents; 