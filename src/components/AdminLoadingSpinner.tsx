import { Loader, Shield } from 'lucide-react';

export const AdminLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative">
          <Shield className="w-12 h-12 text-blue-600 animate-pulse" />
          <Loader className="w-6 h-6 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Loading Admin Dashboard</h3>
        <p className="text-sm text-muted-foreground">Preparing administrative tools...</p>
      </div>
    </div>
  </div>
);