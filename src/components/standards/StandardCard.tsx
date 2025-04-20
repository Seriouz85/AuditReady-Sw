import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Standard } from "@/types";
import { BookOpen, FileText, BarChart3, FileDown } from "lucide-react";
import { Link } from "react-router-dom";

interface StandardCardProps {
  standard: Standard;
  requirementCount: number;
  onExport?: (id: string) => void;
  horizontal?: boolean;
}

export function StandardCard({ standard, requirementCount, onExport, horizontal = false }: StandardCardProps) {
  return (
    <Card className={`w-full border-muted transition-all duration-200 hover:border-primary/50 hover:shadow-md ${horizontal ? 'flex' : ''}`}>
      <div className={`${horizontal ? 'flex-1' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-[0.75rem] line-clamp-1">{standard.name}</CardTitle>
              <CardDescription className="text-[0.65rem]">Version {standard.version}</CardDescription>
            </div>
            <div className="px-2 py-1 text-[0.65rem] font-medium rounded bg-muted shrink-0 ml-2">
              {standard.type}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-[0.75rem] text-muted-foreground mb-4">
            {standard.description}
          </p>
          <div className="flex flex-wrap gap-4 text-[0.75rem]">
            <div className="flex items-center gap-1">
              <BookOpen size={14} className="text-muted-foreground" />
              <span className="font-medium">{requirementCount} requirements</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText size={14} className="text-muted-foreground" />
              <span className="line-clamp-1">{standard.category}</span>
            </div>
          </div>
        </CardContent>
      </div>
      {horizontal && (
        <div className="border-l bg-muted/5 p-4 w-[220px] flex flex-col justify-center">
          <CardFooter className="flex gap-2 p-0 pt-2 flex-wrap">
            <Button variant="outline" size="sm" asChild className="w-full mb-2">
              <Link to={`/app/requirements?standard=${standard.id}`}>
                <BookOpen size={16} className="mr-2" />
                <span>Requirements</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full mb-2" onClick={() => onExport?.(standard.id)}>
              <FileDown size={16} className="mr-2" />
              <span>Export</span>
            </Button>
            <Button variant="default" size="sm" asChild className="w-full">
              <Link to={`/app/assessments?standard=${standard.id}`}>
                <BarChart3 size={16} className="mr-2" />
                <span>Assess</span>
              </Link>
            </Button>
          </CardFooter>
        </div>
      )}
      {!horizontal && (
        <CardFooter className="flex gap-2 pt-2 border-t bg-muted/10">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to={`/app/requirements?standard=${standard.id}`}>
              <BookOpen size={16} className="mr-2" />
              <span className="hidden sm:inline">Requirements</span>
              <span className="sm:hidden">View</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onExport?.(standard.id)}>
            <FileDown size={16} className="mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button variant="default" size="sm" asChild className="flex-1">
            <Link to={`/app/assessments?standard=${standard.id}`}>
              <BarChart3 size={16} className="mr-2" />
              <span className="hidden sm:inline">Assess</span>
              <span className="sm:hidden">Assess</span>
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
