import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Standard } from "@/types";
import { BookOpen, FileText, BarChart3, FileDown, Download, CheckCircle2, XCircle, Trash2 } from "lucide-react";
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
}

const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'framework':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'regulation':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'policy':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'guideline':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export function StandardCard({
  standard,
  requirementCount,
  onExport,
  horizontal = false,
  onApplicabilityChange,
  isApplicable = false,
  onRemove
}: StandardCardProps) {
  return (
    <Card className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 ${horizontal ? 'flex' : ''}`}>
      <div className={`${horizontal ? 'flex-1' : ''}`}>
        <CardHeader className="pb-3 p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{standard.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600 font-medium">Version {standard.version}</CardDescription>
            </div>
            <div className={`px-3 py-1.5 text-xs font-semibold rounded-full shrink-0 ${getTypeColor(standard.type)}`}>
              {standard.type}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {standard.description}
          </p>
          
          {/* Compact Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="p-1.5 bg-gray-600 rounded-md">
                <BookOpen size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Requirements</p>
                <p className="text-sm font-semibold text-gray-900">{requirementCount}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="p-1.5 bg-gray-600 rounded-md">
                <FileText size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Category</p>
                <p className="text-xs font-medium text-gray-800 line-clamp-1">{standard.category}</p>
              </div>
            </div>
          </div>

          {/* Compact Toggle Section */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <Switch
                id={`applicable-${standard.id}`}
                checked={isApplicable}
                onCheckedChange={onApplicabilityChange}
                className="data-[state=checked]:bg-green-600"
              />
              <Label htmlFor={`applicable-${standard.id}`} className="text-sm font-medium cursor-pointer">
                {isApplicable ? (
                  <span className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 size={14} />
                    Applicable
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-gray-600">
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
        <div className="border-l bg-gray-50 p-3 w-[180px] flex flex-col justify-center">
          <CardFooter className="flex gap-1.5 p-0 pt-1 flex-wrap">
            <Button variant="outline" size="sm" asChild className="w-full mb-1.5 text-xs h-7 border-gray-300 hover:border-gray-400 hover:bg-gray-100">
              <Link to={`/app/requirements?standard=${standard.id}`}>
                <BookOpen size={12} className="mr-1" />
                <span>Requirements</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full mb-1.5 text-xs h-7 border-gray-300 hover:border-gray-400 hover:bg-gray-100" onClick={() => onExport?.(standard.id)}>
              <FileDown size={12} className="mr-1" />
              <span>Export</span>
            </Button>
            <Button variant="default" size="sm" asChild className="w-full mb-1.5 text-xs h-7 bg-gray-800 hover:bg-gray-900">
              <Link to={`/app/assessments?standard=${standard.id}`}>
                <BarChart3 size={12} className="mr-1" />
                <span>Assess</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={onRemove} className="w-full text-xs h-7 border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600">
              <Trash2 size={12} className="mr-1" />
              <span>Remove</span>
            </Button>
          </CardFooter>
        </div>
      )}
      {!horizontal && (
        <CardFooter className="flex gap-2 pt-3 pb-3 px-4 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" size="sm" asChild className="text-xs px-3 py-1.5 h-7 border-gray-300 hover:border-gray-400 hover:bg-gray-100">
            <Link to={`/app/requirements?standard=${standard.id}`}>
              <BookOpen size={12} className="mr-1" />
              <span>Requirements</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-3 py-1.5 h-7 border-gray-300 hover:border-gray-400 hover:bg-gray-100" onClick={() => onExport?.(standard.id)}>
            <FileDown size={12} className="mr-1" />
            <span>Export</span>
          </Button>
          <Button variant="default" size="sm" asChild className="text-xs px-3 py-1.5 h-7 bg-gray-800 hover:bg-gray-900">
            <Link to={`/app/assessments?standard=${standard.id}`}>
              <BarChart3 size={12} className="mr-1" />
              <span>Assess</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onRemove} className="text-xs px-2 py-1.5 h-7 border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600">
            <Trash2 size={12} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
