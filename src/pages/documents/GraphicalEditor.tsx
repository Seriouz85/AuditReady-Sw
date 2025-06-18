import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MermaidVisualEditor from '../../components/editor/MermaidVisualEditor';

// Standalone AuditReady Editor
const GraphicalEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Function to navigate back safely without breaking auth
  const handleBack = useCallback(() => {
    try {
      // Get the referrer from state or document.referrer
      const referrer = location.state?.from || document.referrer;
      
      if (referrer && referrer.includes('/app/documents')) {
        // Navigate directly to documents page to avoid history issues
        navigate('/app/documents', { replace: true });
      } else if (referrer && referrer.includes('/app')) {
        // Navigate to dashboard
        navigate('/app', { replace: true });
      } else {
        // Default to dashboard
        navigate('/app', { replace: true });
      }
    } catch (e) {
      // Fallback to dashboard
      navigate('/app', { replace: true });
    }
  }, [navigate, location.state]);

  // Prevent navigation issues by ensuring user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    document.title = 'AuditReady Editor - Professional Diagram Designer';
  }, []);

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AuditReady Editor...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // useEffect will handle redirect
  }

  return (
    <MermaidVisualEditor
      designId="standalone-visual-editor"
      showBackButton={true}
      onBack={handleBack}
    />
  );
};

export default GraphicalEditor;