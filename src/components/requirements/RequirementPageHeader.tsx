import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveIndicator } from "@/components/ui/save-indicator";

interface RequirementPageHeaderProps {
  totalRequirements: number;
  filteredCount: number;
  fulfilledCount: number;
  partiallyFulfilledCount: number;
  notFulfilledCount: number;
  notApplicableCount: number;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  realTimeStatus: 'connected' | 'disconnected' | 'reconnecting';
  onBack: () => void;
}

export function RequirementPageHeader({
  totalRequirements,
  filteredCount,
  fulfilledCount,
  partiallyFulfilledCount,
  notFulfilledCount,
  notApplicableCount,
  saveStatus,
  realTimeStatus,
  onBack
}: RequirementPageHeaderProps) {
  const compliancePercentage = totalRequirements > 0
    ? Math.round(((fulfilledCount + partiallyFulfilledCount * 0.5) / totalRequirements) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            aria-label="Go back to standards"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Standards
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Requirements Management
            </h1>
            <p className="text-slate-600 mt-1">
              Showing {filteredCount} of {totalRequirements} requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Status */}
          <Badge
            variant={realTimeStatus === 'connected' ? 'default' : 'secondary'}
            className={
              realTimeStatus === 'connected'
                ? 'bg-green-100 text-green-800 border-green-200'
                : realTimeStatus === 'reconnecting'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
            }
            aria-live="polite"
            aria-label={`Real-time status: ${realTimeStatus}`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${
              realTimeStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              realTimeStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-slate-400'
            }`} />
            {realTimeStatus === 'connected' ? 'Live' :
             realTimeStatus === 'reconnecting' ? 'Reconnecting' :
             'Offline'}
          </Badge>

          {/* Save Status */}
          <SaveIndicator status={saveStatus} />
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total"
          value={totalRequirements}
          color="slate"
        />
        <StatCard
          label="Fulfilled"
          value={fulfilledCount}
          percentage={totalRequirements > 0 ? Math.round((fulfilledCount / totalRequirements) * 100) : 0}
          color="green"
        />
        <StatCard
          label="Partial"
          value={partiallyFulfilledCount}
          percentage={totalRequirements > 0 ? Math.round((partiallyFulfilledCount / totalRequirements) * 100) : 0}
          color="yellow"
        />
        <StatCard
          label="Not Fulfilled"
          value={notFulfilledCount}
          percentage={totalRequirements > 0 ? Math.round((notFulfilledCount / totalRequirements) * 100) : 0}
          color="red"
        />
        <StatCard
          label="Overall"
          value={`${compliancePercentage}%`}
          subtext="Compliance"
          color="blue"
          highlight
        />
      </div>
    </div>
  );
}

// Helper Component
interface StatCardProps {
  label: string;
  value: number | string;
  percentage?: number;
  subtext?: string;
  color: 'slate' | 'green' | 'yellow' | 'red' | 'blue';
  highlight?: boolean;
}

function StatCard({ label, value, percentage, subtext, color, highlight }: StatCardProps) {
  const colorClasses = {
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} ${highlight ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {percentage !== undefined && (
        <div className="text-xs text-slate-500 mt-1">{percentage}%</div>
      )}
      {subtext && (
        <div className="text-xs text-slate-500 mt-1">{subtext}</div>
      )}
    </div>
  );
}
