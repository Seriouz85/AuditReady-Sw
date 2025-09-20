import React from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Target, 
  Shield, 
  Lock, 
  Settings, 
  BookOpen 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OriginalFrameworkFilteringSystemProps {
  frameworkFilter: string;
  setFrameworkFilter: (filter: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  categoryMappings: any[];
}

export const OriginalFrameworkFilteringSystem: React.FC<OriginalFrameworkFilteringSystemProps> = ({
  frameworkFilter,
  setFrameworkFilter,
  categoryFilter,
  setCategoryFilter,
  categoryMappings
}) => {
  return (
    <div className="space-y-4">
      {/* Framework Filters - EXACT ORIGINAL DESIGN */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Filter by Framework:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
            { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
            { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
            { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
            { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'nis2', label: 'NIS2', icon: <Shield className="w-4 h-4" /> },
            { id: 'dora', label: 'DORA', icon: <Shield className="w-4 h-4" /> }
          ].map((filter) => (
            <motion.div
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={frameworkFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFrameworkFilter(filter.id)}
                className={`flex items-center space-x-1 rounded-full transition-all duration-200 ${
                  frameworkFilter === filter.id 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {filter.icon}
                <span>{filter.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Filter Dropdown */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Filter by Category:</span>
        </div>
        <div className="min-w-[200px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryMappings.map((mapping) => (
                <SelectItem key={mapping.id} value={mapping.id}>
                  {mapping.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};