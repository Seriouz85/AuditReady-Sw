import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '@/components/PageHeader';
import { ArrowLeft, Filter, Search, Shield, UserPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const mockRisks = [
  {
    id: "1",
    title: "Unauthorized Access to Production Systems",
    type: "access_control",
    status: "open",
    likelihood: "likely",
    consequence: "major",
    riskLevel: "high",
    owner: "John Doe",
    reportedDate: "2024-04-15",
    dueDate: "2024-05-15",
  },
  {
    id: "2",
    title: "Data Breach in Customer Database",
    type: "data_protection",
    status: "in_progress",
    likelihood: "possible",
    consequence: "severe",
    riskLevel: "critical",
    owner: "Jane Smith",
    reportedDate: "2024-04-10",
    dueDate: "2024-05-10",
  },
  // Add more mock risks as needed
];

const ManageRisks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState("all");

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "mitigated":
        return "bg-green-500 text-white";
      case "accepted":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredRisks = mockRisks.filter((risk) => {
    const matchesSearch = 
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
    const matchesRiskLevel = riskLevelFilter === "all" || risk.riskLevel === riskLevelFilter;
    
    return matchesSearch && matchesStatus && matchesRiskLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/app/risk-management")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <PageHeader 
          title="Manage Risks" 
          description="View and manage reported information security risks"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Management Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search risks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={riskLevelFilter}
                  onValueChange={setRiskLevelFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">{risk.title}</TableCell>
                      <TableCell>{risk.type.replace(/_/g, ' ').toUpperCase()}</TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(risk.riskLevel)}>
                          {risk.riskLevel.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(risk.status)}>
                          {risk.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{risk.owner}</TableCell>
                      <TableCell>{risk.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/risk-management/manage/risks/${risk.id}`)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/risk-management/manage/risks/${risk.id}/assign`)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRisks; 