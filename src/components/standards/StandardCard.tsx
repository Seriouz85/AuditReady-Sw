import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Standard } from "@/types";
import { BookOpen, FileText, BarChart3, FileDown, Download, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StandardCardProps {
  standard: Standard;
  requirementCount: number;
  onExport?: (id: string) => void;
  horizontal?: boolean;
  onApplicabilityChange?: (isApplicable: boolean) => void;
  isApplicable?: boolean;
  onRemove: () => void;
  isExporting?: boolean;
}

const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'framework':
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
    case 'regulation':
      return 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/50';
    case 'policy':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50';
    case 'guideline':
      return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
  }
};

export function StandardCard({
  standard,
  requirementCount,
  onExport,
  horizontal = false,
  onApplicabilityChange,
  isApplicable = false,
  onRemove,
  isExporting = false
}: StandardCardProps) {
  return (
    <Card className={`w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-slate-600 ${horizontal ? 'flex' : ''}`}>
      <div className={`${horizontal ? 'flex-1' : ''}`}>
        <CardHeader className="pb-3 p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{standard.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-slate-400 font-medium">Version {standard.version}</CardDescription>
            </div>
            <div className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 ${getTypeColor(standard.type)}`}>
              {standard.type}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
            {standard.description}
          </p>
          
          {/* Compact Stats and Toggle Section */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-600 dark:bg-slate-500 rounded-md">
                  <BookOpen size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">Requirements</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{requirementCount}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id={`applicable-${standard.id}`}
                checked={isApplicable}
                onCheckedChange={onApplicabilityChange}
                className="data-[state=checked]:bg-emerald-600"
              />
              <Label htmlFor={`applicable-${standard.id}`} className="text-sm font-medium cursor-pointer">
                {isApplicable ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    Applicable
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                    <XCircle size={14} />
                    Not Applicable
                  </span>
                )}
              </Label>
            </div>
          </div>
        </CardContent>
      </div>
      {horizontal && (
        <div className="border-l border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-3 w-[180px] flex flex-col justify-center">
          <CardFooter className="flex gap-1.5 p-0 pt-1 flex-wrap">
            <Button variant="outline" size="sm" asChild className="w-full mb-1.5 text-xs h-7 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-600">
              <Link to={`/app/requirements?standard=${standard.id}`}>
                <BookOpen size={12} className="mr-1" />
                <span>Requirements</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mb-1.5 text-xs h-7 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-600" 
              onClick={() => onExport?.(standard.id)}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 size={12} className="mr-1 animate-spin" />
              ) : (
                <FileDown size={12} className="mr-1" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </Button>
            <Button variant="default" size="sm" asChild className="w-full mb-1.5 text-xs h-7 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600">
              <Link to={`/app/assessments?standard=${standard.id}`}>
                <BarChart3 size={12} className="mr-1" />
                <span>Assess</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={onRemove} className="w-full text-xs h-7 border-gray-300 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
              <Trash2 size={12} className="mr-1" />
              <span>Remove</span>
            </Button>
          </CardFooter>
        </div>
      )}
      {!horizontal && (
        <CardFooter className="flex gap-2 pt-3 pb-3 px-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <Button variant="outline" size="sm" asChild className="text-xs px-3 py-1.5 h-7 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-600">
            <Link to={`/app/requirements?standard=${standard.id}`}>
              <BookOpen size={12} className="mr-1" />
              <span>Requirements</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs px-3 py-1.5 h-7 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-600" 
            onClick={() => onExport?.(standard.id)}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 size={12} className="mr-1 animate-spin" />
            ) : (
              <FileDown size={12} className="mr-1" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </Button>
          <Button variant="default" size="sm" asChild className="text-xs px-3 py-1.5 h-7 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600">
            <Link to={`/app/assessments?standard=${standard.id}`}>
              <BarChart3 size={12} className="mr-1" />
              <span>Assess</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onRemove} className="text-xs px-2 py-1.5 h-7 border-gray-300 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
            <Trash2 size={12} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
