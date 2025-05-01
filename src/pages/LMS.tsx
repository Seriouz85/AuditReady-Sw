import React from 'react';
import { Navigate } from 'react-router-dom';

const LMS: React.FC = () => {
  // Redirect to the modern implementation
  return <Navigate to="/lms" replace />;
};

export default LMS; 