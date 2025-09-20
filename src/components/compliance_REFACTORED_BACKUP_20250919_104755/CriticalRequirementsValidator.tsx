import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Clock, Shield } from 'lucide-react';
import { enhancedComplianceUnificationService } from '@/services/compliance/EnhancedComplianceUnificationService';

interface CriticalRequirementsValidatorProps {
  mappingData: any[];
  selectedFrameworks: Record<string, boolean | string>;
}

export function CriticalRequirementsValidator({ 
  mappingData, 
  selectedFrameworks 
}: CriticalRequirementsValidatorProps) {
  const validation = enhancedComplianceUnificationService.validateTimeframePreservation(mappingData);

  const criticalChecks = [
    {
      id: 'gdpr-72h',
      name: 'GDPR 72-Hour Breach Notification',
      framework: 'GDPR',
      requirement: 'Article 33',
      timeframe: '72 hours',
      action: 'Data breach notification to supervisory authority',
      isActive: selectedFrameworks.gdpr,
      isPreserved: mappingData.some(mapping => 
        mapping.auditReadyUnified.criticalDetails?.some((detail: any) => 
          detail.framework === 'GDPR' && 
          detail.timeframe.includes('72') &&
          detail.action.toLowerCase().includes('breach')
        ) ||
        mapping.auditReadyUnified.subRequirements?.some((subReq: string) =>
          subReq.toLowerCase().includes('72') && 
          subReq.toLowerCase().includes('breach')
        )
      )
    },
    {
      id: 'gdpr-data-subjects',
      name: 'GDPR Data Subject Notification',
      framework: 'GDPR',
      requirement: 'Article 34',
      timeframe: 'When high risk',
      action: 'Communication of breach to data subjects',
      isActive: selectedFrameworks.gdpr,
      isPreserved: mappingData.some(mapping => 
        mapping.auditReadyUnified.criticalDetails?.some((detail: any) => 
          detail.framework === 'GDPR' && 
          detail.requirementCode.includes('34')
        ) ||
        mapping.auditReadyUnified.subRequirements?.some((subReq: string) =>
          subReq.toLowerCase().includes('data subject') && 
          (subReq.toLowerCase().includes('notification') || subReq.toLowerCase().includes('communication'))
        )
      )
    },
    {
      id: 'nis2-24h',
      name: 'NIS2 24-Hour Early Warning',
      framework: 'NIS2',
      requirement: 'Article 23',
      timeframe: '24 hours',
      action: 'Early warning notification of significant incidents',
      isActive: selectedFrameworks.nis2,
      isPreserved: mappingData.some(mapping => 
        mapping.auditReadyUnified.criticalDetails?.some((detail: any) => 
          detail.framework === 'NIS2' && 
          detail.timeframe.includes('24') &&
          detail.action.toLowerCase().includes('incident')
        ) ||
        mapping.auditReadyUnified.subRequirements?.some((subReq: string) =>
          subReq.toLowerCase().includes('24') && 
          subReq.toLowerCase().includes('incident')
        )
      )
    },
    {
      id: 'nis2-72h',
      name: 'NIS2 72-Hour Detailed Report',
      framework: 'NIS2',
      requirement: 'Article 23',
      timeframe: '72 hours',
      action: 'Detailed incident report submission',
      isActive: selectedFrameworks.nis2,
      isPreserved: mappingData.some(mapping => 
        mapping.auditReadyUnified.criticalDetails?.some((detail: any) => 
          detail.framework === 'NIS2' && 
          detail.timeframe.includes('72') &&
          (detail.action.toLowerCase().includes('detailed') || detail.action.toLowerCase().includes('report'))
        ) ||
        mapping.auditReadyUnified.subRequirements?.some((subReq: string) =>
          subReq.toLowerCase().includes('72') && 
          subReq.toLowerCase().includes('detailed') &&
          subReq.toLowerCase().includes('report')
        )
      )
    }
  ];

  const activeChecks = criticalChecks.filter(check => check.isActive);
  const preservedCount = activeChecks.filter(check => check.isPreserved).length;
  const totalActive = activeChecks.length;

  const getStatusIcon = (isPreserved: boolean) => {
    if (isPreserved) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (isPreserved: boolean) => {
    return isPreserved 
      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-900/20 dark:via-yellow-900/20 dark:to-amber-900/20">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-2xl">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Critical Requirements Validation</h2>
            <p className="text-sm text-white/80 font-normal">
              Verification that time-sensitive compliance obligations are preserved
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        
        {/* Overall Status */}
        <div className="mb-6 p-4 rounded-xl border-2 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Preservation Status
            </h3>
            <Badge className={`px-3 py-1 ${
              preservedCount === totalActive 
                ? 'bg-green-100 text-green-800 border-green-300'
                : preservedCount > 0
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {preservedCount} of {totalActive} preserved
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                preservedCount === totalActive 
                  ? 'bg-green-500' 
                  : preservedCount > 0 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: totalActive > 0 ? `${(preservedCount / totalActive) * 100}%` : '0%' }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {preservedCount === totalActive 
              ? '✅ All critical time-sensitive requirements are properly preserved in unified requirements.'
              : preservedCount > 0
              ? '⚠️ Some critical requirements may need attention. Review the details below.'
              : '❌ Critical time-sensitive requirements are missing from unified requirements.'
            }
          </p>
        </div>

        {/* Individual Critical Checks */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Critical Time-Sensitive Requirements
          </h4>
          
          {activeChecks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No time-sensitive frameworks selected. Select GDPR or NIS2 to validate critical timing requirements.
              </p>
            </div>
          ) : (
            activeChecks.map((check) => (
              <div 
                key={check.id}
                className={`p-4 rounded-lg border ${getStatusColor(check.isPreserved)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(check.isPreserved)}
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {check.name}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {check.framework} {check.requirement}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Timeframe:</span> {check.timeframe}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Action:</span> {check.action}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Badge className={
                      check.isPreserved 
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }>
                      {check.isPreserved ? 'Preserved' : 'Missing'}
                    </Badge>
                  </div>
                </div>
                
                {!check.isPreserved && (
                  <div className="mt-3 p-3 bg-white dark:bg-slate-700 rounded border-l-4 border-red-400">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                      ⚠️ Recommendation:
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      This critical timing requirement should be explicitly mentioned in the unified requirements to ensure compliance auditors can verify timely implementation.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Missing Requirements Summary */}
        {validation.missingCriticalDetails.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Missing Critical Details
                </h5>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {validation.missingCriticalDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {validation.recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Recommendations for Improvement
            </h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {validation.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}