/**
 * Overview Tab Content
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * 
 * FEATURES:
 * - Problem statement card
 * - Solution statement card 
 * - Feature benefits card
 * - Getting started card
 * - Pentagon visualization
 * - Statistics overview
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  Target, 
  ArrowRight, 
  Shield, 
  Zap, 
  Users,
  BookOpen,
  PentagonIcon
} from 'lucide-react';
import { PentagonVisualization } from '@/components/compliance/PentagonVisualization';
import { ComplianceStatsGrid, generateFrameworkStats, generateProgressStats, generateOverlapStats } from '@/components/compliance/stats/ComplianceMetrics';
import { ProblemStatementCard, SolutionStatementCard, FeatureBenefitsCard, GettingStartedCard } from '@/components/compliance/cards/StatementCards';
import type { SelectedFrameworks } from '@/utils/FrameworkUtilities';

export interface OverviewTabContentProps {
  selectedFrameworks: SelectedFrameworks;
  maxComplianceMapping?: any[];
  onTabChange: (tab: string) => void;
}

export function OverviewTabContent({ 
  selectedFrameworks, 
  maxComplianceMapping,
  onTabChange 
}: OverviewTabContentProps) {
  
  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-800/30 pb-4">
          <CardTitle className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100">The Compliance Complexity Problem</h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1 font-medium">
                Multiple frameworks = exponential complexity
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ProblemStatementCard />
        </CardContent>
      </Card>

      {/* Solution Statement */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-blue-950/50 border-b border-green-100 dark:border-green-800/30 pb-4">
          <CardTitle className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">The AuditReady Solution</h3>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1 font-medium">
                  AI-powered unification and simplification
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <SolutionStatementCard />
        </CardContent>
      </Card>

      {/* Pentagon Visualization */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/50 dark:via-indigo-950/50 dark:to-blue-950/50 border-b border-purple-100 dark:border-purple-800/30 pb-4">
          <CardTitle className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full shrink-0 mt-0.5">
              <PentagonIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">Compliance Architecture</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm mt-1 font-medium">
                Unified framework visualization
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <PentagonVisualization 
            selectedFrameworks={selectedFrameworks}
            complianceData={maxComplianceMapping}
          />
        </CardContent>
      </Card>

      {/* Framework Statistics */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/50 dark:via-cyan-950/50 dark:to-teal-950/50 border-b border-blue-100 dark:border-blue-800/30 pb-4">
          <CardTitle className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0 mt-0.5">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Framework Statistics</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1 font-medium">
                Comprehensive overview of compliance requirements
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ComplianceStatsGrid
            frameworkStats={generateFrameworkStats(selectedFrameworks)}
            progressStats={generateProgressStats(maxComplianceMapping || [], new Map())}
            overlapStats={generateOverlapStats(maxComplianceMapping || [])}
          />
        </CardContent>
      </Card>

      {/* Feature Benefits */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 via-yellow-50 to-green-50 dark:from-orange-950/50 dark:via-yellow-950/50 dark:to-green-950/50 border-b border-orange-100 dark:border-orange-800/30 pb-4">
          <CardTitle className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full shrink-0 mt-0.5">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">Platform Benefits</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm mt-1 font-medium">
                Why choose AuditReady for compliance
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <FeatureBenefitsCard />
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border-b border-indigo-100 dark:border-indigo-800/30 pb-4">
          <CardTitle className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Get Started</h3>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1 font-medium">
                  Ready to simplify your compliance?
                </p>
              </div>
            </div>
            <Button 
              onClick={() => onTabChange('mapping')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              Start Now <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <GettingStartedCard onTabChange={onTabChange} />
        </CardContent>
      </Card>
    </div>
  );
}

export default OverviewTabContent;