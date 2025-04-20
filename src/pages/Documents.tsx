import { Routes, Route, Navigate } from "react-router-dom";
import LinkedDocuments from "@/components/documents/LinkedDocuments";
import MissingEvidence from "@/components/documents/MissingEvidence";
import DocumentGenerator from "@/components/documents/DocumentGenerator";

const Documents = () => {
  // Read the correct key from environment variables
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

  // Check if the key is missing and potentially handle the error
  if (!geminiApiKey) {
    console.error("Error: VITE_GEMINI_API_KEY is not set in the environment variables.");
    // Optionally, render an error message or prevent rendering the generator
    // return <div>API Key is missing. Please configure it in your .env file.</div>;
  }

  return (
    <Routes>
      <Route path="" element={<Navigate to="linked" replace />} />
      <Route path="linked" element={<LinkedDocuments />} />
      <Route path="missing" element={<MissingEvidence />} />
      <Route path="generator" element={<DocumentGenerator apiKey={geminiApiKey} />} />
    </Routes>
  );
};

export default Documents; 