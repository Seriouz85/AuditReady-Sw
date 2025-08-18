/**
 * Cybersecurity Validation Admin Page
 * Main page wrapper for the cybersecurity validation dashboard
 */

import React from 'react';
import { CybersecurityValidationDashboard } from '@/components/admin/CybersecurityValidationDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const CybersecurityValidationPage: React.FC = () => {
  return (
    <ProtectedRoute requiredPermission="platform_admin">
      <div className="min-h-screen bg-gray-50">
        <CybersecurityValidationDashboard />
      </div>
    </ProtectedRoute>
  );
};

export default CybersecurityValidationPage;