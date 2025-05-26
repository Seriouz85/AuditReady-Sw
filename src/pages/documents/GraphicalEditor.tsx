import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FabricEditor from '../../components/audit/AuditReadyGraphicalEditor/FabricEditor';

// Standalone Graphical Editor
const GraphicalEditor: React.FC = () => {
  const navigate = useNavigate();

  // Function to navigate back to dashboard or document generator
  const handleBack = () => {
    // Check if we came from the document generator page
    try {
      const referrer = document.referrer;
      if (referrer && referrer.includes('/app/documents')) {
        // If we came from documents, go back there
        window.history.back();
      } else {
        // Otherwise go to the main dashboard
        navigate('/app');
      }
    } catch (e) {
      // If any error, default to main dashboard
      navigate('/app');
    }
  };

  useEffect(() => {
    document.title = 'AuditReady Graphical Editor';
  }, []);

  return (
    <FabricEditor designId="standalone-editor" showBackButton={true} onBack={handleBack} />
  );
};

export default GraphicalEditor;