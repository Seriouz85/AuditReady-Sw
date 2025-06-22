import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComingSoonBadge } from "@/components/ui/coming-soon-badge";
import { standards, assessments } from "@/data/mockData";
import { FileText, Download, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "@/utils/toast";

const Reports = () => {
  const [standardFilter, setStandardFilter] = useState<string>("all");
  
  const filteredReports = standardFilter === "all" 
    ? assessments.filter(a => a.status === "completed") 
    : assessments.filter(a => a.status === "completed" && a.standardIds.includes(standardFilter));
  
  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard ? standard.name : id;
  };

  // Get the primary standard ID for a report
  const getPrimaryStandard = (standardIds: string[]): string => {
    return standardIds.length > 0 ? standardIds[0] : 'unknown';
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Compliance Reports</h1>
          <ComingSoonBadge variant="development" />
        </div>
        <Button 
          className="w-full sm:w-auto" 
          onClick={() => toast.info('Report generation feature coming soon!')}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Generate Report</span>
          <span className="sm:hidden">Generate</span>
        </Button>
      </div>
      
      <div className="flex justify-start sm:justify-end">
        <Select 
          value={standardFilter}
          onValueChange={setStandardFilter}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Standards</SelectItem>
            {standards.map((standard) => (
              <SelectItem key={standard.id} value={standard.id}>
                {standard.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-base">{report.name} Report</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Standard:</span> {getStandardName(getPrimaryStandard(report.standardIds))}</div>
                  <div><span className="font-medium">Completed:</span> {report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}</div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Score:</span>
                    <span 
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        report.progress >= 80 
                          ? 'bg-green-500' 
                          : report.progress >= 50 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                    ></span>
                    {report.progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No completed assessments found.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Report Name</TableHead>
              <TableHead className="min-w-[150px]">Standard</TableHead>
              <TableHead className="min-w-[120px] hidden md:table-cell">Completion Date</TableHead>
              <TableHead className="min-w-[120px]">Compliance Score</TableHead>
              <TableHead className="text-right min-w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    {report.name} Report
                  </TableCell>
                  <TableCell>{getStandardName(getPrimaryStandard(report.standardIds))}</TableCell>
                  <TableCell className="hidden md:table-cell">{report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span 
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          report.progress >= 80 
                            ? 'bg-green-500' 
                            : report.progress >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                      ></span>
                      {report.progress}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No completed assessments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredReports.length > 0 && (
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-medium mb-2">About Reports</h3>
          <p className="text-sm text-muted-foreground">
            Reports are generated when an assessment is completed. They provide a snapshot of your compliance status at the time of completion.
            You can download reports in PDF format for record-keeping or sharing with stakeholders.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
