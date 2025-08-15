import React from 'react';
import { AIContentManagement } from '@/components/admin/AIContentManagement';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export function AIContentManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      <div className="flex-1 ml-64 p-8">
        <AIContentManagement />
      </div>
    </div>
  );
}

export default AIContentManagementPage;