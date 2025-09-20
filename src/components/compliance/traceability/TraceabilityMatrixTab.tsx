import React from 'react';
import { FrameworkSelection, ComplianceMapping } from '@/types/ComplianceSimplificationTypes';
import { EnhancedTraceabilityMatrixTab } from './EnhancedTraceabilityMatrixTab';

interface TraceabilityMatrixTabProps {
  selectedFrameworks: FrameworkSelection;
  filteredMappings: ComplianceMapping[];
  onExport: (format: 'excel' | 'pdf') => void;
}


export function TraceabilityMatrixTab({ 
  selectedFrameworks, 
  filteredMappings, 
  onExport 
}: TraceabilityMatrixTabProps) {
  // Use the enhanced version directly
  return (
    <EnhancedTraceabilityMatrixTab
      selectedFrameworks={selectedFrameworks}
      filteredMappings={filteredMappings}
      onExport={onExport}
    />
  );
}