import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Lightbulb, 
  Download, 
  ChevronDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

interface ComplianceSimplificationHeaderProps {
  onNavigateBack: () => void;
  onExportCSV: () => void;
  onExportXLSX: () => void;
  onExportPDF: () => void;
}

export function ComplianceSimplificationHeader({
  onNavigateBack,
  onExportCSV,
  onExportXLSX,
  onExportPDF,
}: ComplianceSimplificationHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Compliance Simplification</h1>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">How AuditReady AI unifies overlapping compliance requirements</p>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full self-start lg:self-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as CSV
                <span className="text-xs text-muted-foreground ml-auto">Compatible</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportXLSX} className="cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Export as Excel
                <span className="text-xs text-muted-foreground ml-auto">Enhanced</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2 text-red-600" />
                Export as PDF
                <span className="text-xs text-muted-foreground ml-auto">Premium</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}