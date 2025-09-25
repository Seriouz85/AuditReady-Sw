import React from 'react';
import { Assessment, Requirement, Standard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import '@/styles/assessment-export.css';

export interface UnifiedAssessmentData {
  // Core Assessment Information
  assessment: Assessment;
  requirements: Requirement[];
  standards: Standard[];
  
  // Pre-processed Metrics
  metrics: {
    totalRequirements: number;
    fulfilled: number;
    partiallyFulfilled: number;
    notFulfilled: number;
    notApplicable: number;
    complianceScore: number;
  };
  
  // Grouped Data for Sections
  requirementsBySection: Record<string, Requirement[]>;
  requirementsByStatus: Record<string, Requirement[]>;
  
  // Requirement Notes (from assessment)
  requirementNotes: Record<string, string>;
  
  // Attachments (extracted from evidence)
  attachments: Array<{
    filename: string;
    description: string;
    size?: string;
    type?: string;
  }>;
  
  // Export Configuration
  config: {
    showHeader: boolean;
    showSummary: boolean;
    showCharts: boolean;
    showRequirements: boolean;
    showAttachments: boolean;
    format: 'preview' | 'pdf' | 'word';
  };
}

interface UnifiedAssessmentTemplateProps {
  data: UnifiedAssessmentData;
  className?: string;
}

export const UnifiedAssessmentTemplate: React.FC<UnifiedAssessmentTemplateProps> = ({
  data,
  className = ''
}) => {
  const { t } = useTranslation();
  const { assessment, metrics, requirementsBySection, attachments, config } = data;

  // Modern color palette for charts and status indicators
  const statusColors = {
    fulfilled: '#10b981', // emerald-500
    'partially-fulfilled': '#f59e0b', // amber-500
    'not-fulfilled': '#ef4444', // red-500
    'not-applicable': '#6b7280' // gray-500
  };

  // Chart data for modern donut chart
  const chartData = [
    { name: 'Fulfilled', value: metrics.fulfilled, color: statusColors.fulfilled },
    { name: 'Partially Fulfilled', value: metrics.partiallyFulfilled, color: statusColors['partially-fulfilled'] },
    { name: 'Not Fulfilled', value: metrics.notFulfilled, color: statusColors['not-fulfilled'] },
    { name: 'Not Applicable', value: metrics.notApplicable, color: statusColors['not-applicable'] }
  ].filter(item => item.value > 0);

  return (
    <div className={`unified-assessment-template ${className}`}>
      {/* Professional Header Section */}
      {config.showHeader && (
        <header className="assessment-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 mb-8 rounded-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-3">{assessment.name}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.standards.map(standard => (
                    <Badge 
                      key={standard.id} 
                      variant="secondary" 
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      {standard.name} {standard.version}
                    </Badge>
                  ))}
                </div>
                {assessment.description && (
                  <p className="text-slate-200 text-sm lg:text-base leading-relaxed">
                    {assessment.description}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={assessment.status === 'completed' ? 'default' : 'outline'}
                    className="px-4 py-2 text-sm font-semibold"
                  >
                    {assessment.status === 'completed' ? 'Completed' : 
                     assessment.status === 'in-progress' ? 'In Progress' : 'Draft'}
                  </Badge>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
                    <div className="text-xs text-slate-300">Compliance Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Assessment Metadata */}
      <div className="assessment-metadata grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Assessor</div>
          <div className="text-lg font-semibold text-slate-900">
            {assessment.assessorNames?.join(', ') || assessment.assessorName || 'Not Assigned'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Start Date</div>
          <div className="text-lg font-semibold text-slate-900">
            {assessment.startDate ? format(new Date(assessment.startDate), 'MMM dd, yyyy') : 'Not Set'}
          </div>
        </div>
        
        {assessment.endDate && (
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-sm font-medium text-slate-600">Completion Date</div>
            <div className="text-lg font-semibold text-slate-900">
              {format(new Date(assessment.endDate), 'MMM dd, yyyy')}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Last Updated</div>
          <div className="text-lg font-semibold text-slate-900">
            {format(new Date(assessment.updatedAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </div>

      {/* Assessment Summary Section */}
      {config.showSummary && (
        <Card className="assessment-summary mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-600">{metrics.fulfilled}</div>
                  <div className="text-sm font-medium text-emerald-700">Fulfilled</div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-amber-600">{metrics.partiallyFulfilled}</div>
                  <div className="text-sm font-medium text-amber-700">Partially Fulfilled</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{metrics.notFulfilled}</div>
                  <div className="text-sm font-medium text-red-700">Not Fulfilled</div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600">{metrics.notApplicable}</div>
                  <div className="text-sm font-medium text-gray-700">Not Applicable</div>
                </div>
              </div>

              {/* Modern Donut Chart */}
              {config.showCharts && chartData.length > 0 && (
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value} (${Math.round((Number(value) / metrics.totalRequirements) * 100)}%)`, 
                            name
                          ]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Notes and Evidence */}
            <div className="mt-8 space-y-6">
              {assessment.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Assessment Notes</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {assessment.notes}
                    </div>
                  </div>
                </div>
              )}
              
              {assessment.evidence && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Evidence Collection</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {assessment.evidence}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Attachments */}
              {config.showAttachments && attachments.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Attached Evidence Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="font-medium text-slate-900">{attachment.filename}</div>
                        <div className="text-sm text-slate-600">{attachment.description}</div>
                        <div className="flex gap-2 mt-1">
                          {attachment.size && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              {attachment.size}
                            </span>
                          )}
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            {attachment.type || 'Document'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Requirements Section */}
      {config.showRequirements && (
        <div className="requirements-section">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Detailed Requirements Analysis</h2>
          
          {Object.entries(requirementsBySection).map(([section, sectionRequirements]) => (
            <Card key={section} className="mb-6">
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {section}
                  </CardTitle>
                  <Badge variant="outline" className="text-sm">
                    {sectionRequirements.length} requirement{sectionRequirements.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {sectionRequirements.map((requirement) => (
                    <div key={requirement.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center border">
                            <span className="text-xs font-bold text-slate-700">{requirement.code}</span>
                          </div>
                          <h4 className="font-semibold text-slate-900 leading-tight">
                            {requirement.name}
                          </h4>
                        </div>
                        <StatusBadge status={requirement.status} />
                      </div>
                      
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {requirement.description}
                      </p>
                      
                      {requirement.notes && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">Assessor Notes</h5>
                          <div className="text-sm text-blue-800 whitespace-pre-line">
                            {requirement.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Footer */}
      <footer className="report-footer mt-12 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Generated on {format(new Date(), 'MMMM dd, yyyy \'at\' h:mm a')}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          This report was generated by the AuditReady compliance management system.
        </p>
      </footer>
    </div>
  );
};

export default UnifiedAssessmentTemplate;