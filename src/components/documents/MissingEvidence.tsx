import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

type Control = {
  id: number;
  name: string;
  framework: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  progress: number;
};

const MissingEvidence = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Sample data - replace with actual data in production
  const controls: Control[] = [
    { 
      id: 1, 
      name: 'Access Control Policy', 
      framework: 'ISO 27001', 
      priority: 'high',
      dueDate: '2024-04-01',
      progress: 30
    },
    { 
      id: 2, 
      name: 'Incident Response Plan', 
      framework: 'SOC 2', 
      priority: 'medium',
      dueDate: '2024-04-15',
      progress: 60
    },
    { 
      id: 3, 
      name: 'Business Continuity Plan', 
      framework: 'ISO 27001', 
      priority: 'high',
      dueDate: '2024-04-10',
      progress: 45
    }
  ];

  const filteredControls = controls.filter(control =>
    control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    control.framework.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: Control['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const totalControls = controls.length;
  const highPriorityCount = controls.filter(c => c.priority === 'high').length;
  const averageProgress = Math.round(
    controls.reduce((acc, curr) => acc + curr.progress, 0) / totalControls
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Missing Evidence</h1>
        <Button>
          <AlertCircle className="mr-2 h-4 w-4" />
          Review All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalControls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search controls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Control</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredControls.map((control) => (
                <TableRow key={control.id}>
                  <TableCell className="font-medium">{control.name}</TableCell>
                  <TableCell>{control.framework}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(control.priority)}>
                      {control.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{control.dueDate}</TableCell>
                  <TableCell className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Progress value={control.progress} />
                      <span className="text-sm text-muted-foreground w-[40px]">
                        {control.progress}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissingEvidence; 