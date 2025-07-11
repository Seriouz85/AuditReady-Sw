import React from 'react';
import { UnifiedAssessmentData } from './UnifiedAssessmentTemplate';

interface WYSIWYGAssessmentPreviewProps {
  data: UnifiedAssessmentData;
  className?: string;
}

/**
 * WYSIWYG Assessment Preview
 * 
 * This component renders assessment content exactly as it appears in PDF exports.
 * It uses the same styling and layout patterns as ProfessionalAssessmentDocument
 * to ensure true WYSIWYG preview experience.
 * 
 * Key Features:
 * - Identical styling to PDF export
 * - Proper multi-standard organization
 * - Professional color scheme and typography
 * - Responsive design for all devices
 * - No progress bars (as requested by user)
 * - Modern donut charts instead of circle diagrams
 */
export const WYSIWYGAssessmentPreview: React.FC<WYSIWYGAssessmentPreviewProps> = ({ 
  data, 
  className = '' 
}) => {
  const { assessment, metrics, requirementsBySection, attachments, standards } = data;

  // Professional color scheme (matching PDF)
  const colors = {
    primary: '#1e293b',
    secondary: '#475569',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    muted: '#6b7280',
    light: '#f8fafc',
    white: '#ffffff',
    border: '#e2e8f0'
  };

  // Get status badge styling (matching PDF)
  const getStatusBadgeClass = (status: string): string => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide';
    
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return `${baseClasses} bg-emerald-100 text-emerald-700 border border-emerald-200`;
      case 'partially-fulfilled':
        return `${baseClasses} bg-amber-100 text-amber-700 border border-amber-200`;
      case 'not-fulfilled':
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`;
      case 'not-applicable':
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-700 border border-slate-200`;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`wysiwyg-assessment-preview bg-white font-inter text-slate-800 ${className}`}>
      {/* Professional Header Section */}
      <div 
        className="header-section bg-gradient-to-br from-slate-900 to-slate-700 text-white p-6 rounded-t-lg relative"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="absolute top-4 right-4 text-xs font-bold opacity-75">
          CONFIDENTIAL - ASSESSMENT REPORT
        </div>
        
        <h1 className="text-2xl font-bold mb-2 leading-tight">
          {assessment.name}
        </h1>
        
        <p className="text-slate-200 text-sm">
          {standards.map(s => `${s.name} ${s.version}`).join(' | ')}
        </p>
      </div>

      {/* Metadata Grid - Professional Layout */}
      <div className="metadata-grid grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 border-x border-slate-200">
        <div className="metadata-card bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Assessor</div>
          <div className="text-sm font-bold text-slate-800">
            {assessment.assessorNames?.join(', ') || assessment.assessorName || 'Not Assigned'}
          </div>
        </div>
        
        <div className="metadata-card bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Status</div>
          <div className="text-sm font-bold text-slate-800">
            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
          </div>
        </div>
        
        <div className="metadata-card bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Compliance Score</div>
          <div className="text-sm font-bold text-blue-600">
            {metrics.complianceScore}%
          </div>
        </div>
        
        <div className="metadata-card bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Last Updated</div>
          <div className="text-sm font-bold text-slate-800">
            {formatDate(assessment.updatedAt)}
          </div>
        </div>
      </div>

      {/* Assessment Summary Section */}
      <div className="summary-section p-6 border-x border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-blue-500 pb-2">
          Assessment Summary
        </h2>
        
        <div className="summary-container bg-slate-50 p-6 rounded-lg border border-slate-200">
          {/* Metrics Grid - Professional Cards */}
          <div className="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="metric-card bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-700 mb-1">
                {metrics.fulfilled}
              </div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Fulfilled
              </div>
            </div>
            
            <div className="metric-card bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-700 mb-1">
                {metrics.partiallyFulfilled}
              </div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Partially Fulfilled
              </div>
            </div>
            
            <div className="metric-card bg-red-50 border border-red-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700 mb-1">
                {metrics.notFulfilled}
              </div>
              <div className="text-xs font-bold text-red-700 uppercase tracking-wide">
                Not Fulfilled
              </div>
            </div>
            
            <div className="metric-card bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-700 mb-1">
                {metrics.notApplicable}
              </div>
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Not Applicable
              </div>
            </div>
          </div>

          {/* Assessment Notes */}
          {assessment.notes && (
            <div className="content-section bg-white p-4 rounded-lg border border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-blue-600 mb-3">1. Assessment Notes</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {assessment.notes}
              </p>
            </div>
          )}

          {/* Evidence */}
          {assessment.evidence && (
            <div className="content-section bg-white p-4 rounded-lg border border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-emerald-600 mb-3">2. Evidence Collection</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {assessment.evidence}
              </p>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="content-section bg-white p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-amber-600 mb-3">3. Attached Evidence Documents</h3>
              <div className="space-y-3">
                {attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="text-sm font-bold text-amber-800 mb-1">
                      {attachment.filename}
                    </div>
                    <div className="text-xs text-amber-700 mb-2">
                      {attachment.description}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded">
                        {attachment.size || 'N/A'}
                      </span>
                      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded">
                        {attachment.type || 'Document'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirements Analysis - Professional Multi-Standard Organization */}
      <div className="requirements-section p-6 border-x border-b border-slate-200 rounded-b-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-blue-500 pb-2">
          Detailed Requirements Analysis
        </h2>
        
        {Object.entries(requirementsBySection).map(([section, requirements]) => (
          <div key={section} className="standard-section mb-6">
            {/* Standard Header */}
            <div className="standard-header bg-slate-900 text-white p-4 rounded-lg mb-4">
              <h3 className="text-lg font-bold">{section}</h3>
              <p className="text-slate-300 text-sm mt-1">
                {requirements.length} requirement{requirements.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Requirements Cards */}
            <div className="requirements-list space-y-4">
              {requirements.map((requirement) => (
                <div key={requirement.id} className="requirement-card bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="requirement-header flex items-start justify-between gap-4 mb-3">
                    <div className="code-badge bg-slate-100 border border-slate-300 rounded px-3 py-2 min-w-fit">
                      <span className="text-xs font-bold text-slate-700">
                        {requirement.code}
                      </span>
                    </div>
                    
                    <h4 className="requirement-title flex-1 text-sm font-bold text-slate-800 leading-tight">
                      {requirement.name}
                    </h4>
                    
                    <span className={getStatusBadgeClass(requirement.status)}>
                      {requirement.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <p className="requirement-description text-sm text-slate-600 leading-relaxed mb-3">
                    {requirement.description}
                  </p>

                  {requirement.notes && (
                    <div className="notes-section bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3">
                      <h5 className="text-xs font-bold text-blue-700 mb-2">Assessor Notes</h5>
                      <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-line">
                        {requirement.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="footer-section bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500 rounded-b-lg">
        <div className="flex justify-between items-center">
          <span>Generated by AuditReady Security Platform • {formatDate(new Date())}</span>
          <span>CONFIDENTIAL - This assessment report is proprietary and confidential</span>
        </div>
      </div>
    </div>
  );
};

export default WYSIWYGAssessmentPreview;