import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { standards, assessments } from "@/data/mockData";
import { FileText, Download, Filter } from "lucide-react";
import { useState } from "react";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
      
      <div className="flex justify-end">
        <Select 
          value={standardFilter}
          onValueChange={setStandardFilter}
        >
          <SelectTrigger className="w-[220px]">
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
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Standard</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead>Compliance Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell>{report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}</TableCell>
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
