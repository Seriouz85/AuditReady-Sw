import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Requirement } from "@/types";
import { TagList } from "@/components/ui/tag-selector";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface RequirementTableProps {
  requirements: Requirement[];
  onSelectRequirement?: (requirement: Requirement) => void;
  onSort?: (key: keyof Requirement) => void;
  sortConfig?: { key: keyof Requirement; direction: 'asc' | 'desc' } | null;
}

export function RequirementTable({ 
  requirements, 
  onSelectRequirement,
  onSort,
  sortConfig 
}: RequirementTableProps) {
  const getSortIcon = (key: keyof Requirement) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => onSort?.('code')}
            >
              <div className="flex items-center gap-1">
                Code {getSortIcon('code')}
              </div>
            </TableHead>
            <TableHead 
              className="w-[300px] cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('name')}
            >
              <div className="flex items-center gap-1">
                Requirement {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('status')}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('lastAssessmentDate')}
            >
              <div className="flex items-center gap-1">
                Last Assessment {getSortIcon('lastAssessmentDate')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort?.('responsibleParty')}
            >
              <div className="flex items-center gap-1">
                Responsible {getSortIcon('responsibleParty')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.length > 0 ? (
            requirements.map((req) => (
              <TableRow 
                key={req.id}
                onClick={() => onSelectRequirement?.(req)}
                className={onSelectRequirement ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                <TableCell className="font-medium">{req.code}</TableCell>
                <TableCell>{req.name}</TableCell>
                <TableCell>
                  <TagList tagIds={req.tags} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell>
                  {req.lastAssessmentDate 
                    ? new Date(req.lastAssessmentDate).toLocaleDateString() 
                    : 'Never'}
                </TableCell>
                <TableCell>{req.responsibleParty || 'Unassigned'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No requirements found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
