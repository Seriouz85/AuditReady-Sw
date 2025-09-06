import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import MissingEvidence from "@/components/documents/MissingEvidence";
import DocumentGenerator from "@/components/documents/DocumentGenerator";

const Documents = () => {
  const { organization, isDemo } = useAuth();
  
  // Read the correct key from environment variables
  // Fallback to OpenRouter if Gemini key is expired
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || ""; 

  // Check if the key is missing and potentially handle the error
  if (!apiKey) {
    console.error("Error: No API key found. Please configure VITE_OPENROUTER_API_KEY or VITE_GEMINI_API_KEY in your .env file.");
    // Optionally, render an error message or prevent rendering the generator
    // return <div>API Key is missing. Please configure it in your .env file.</div>;
  }

  const organizationId = organization?.id || 'demo-org';

  return (
    <Routes>
      <Route path="" element={<Navigate to="library" replace />} />
      <Route path="library" element={<DocumentLibrary organizationId={organizationId} />} />
      <Route path="missing" element={<MissingEvidence />} />
      <Route path="generator" element={<DocumentGenerator apiKey={apiKey} />} />
    </Routes>
  );
};

export default Documents; 