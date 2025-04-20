import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '@/components/PageHeader';
import { AlertTriangle, FileText, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const RiskManagement = () => {
  const [activeTab, setActiveTab] = useState('report');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Risk Management" 
        description="Manage and track information security risks across your organization"
      />

      <Tabs defaultValue="report" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="report">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report New Risk
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Shield className="mr-2 h-4 w-4" />
            Risk Management
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Risk Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report New Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Use this form to report new information security risks. All fields marked with an asterisk (*) are required.
                </p>
                <Link to="/app/risk-management/report">
                  <Button>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report New Risk
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Access risk management tools and settings. This section is restricted to risk managers and administrators.
                </p>
                <div className="flex gap-4">
                  <Link to="/app/risk-management/manage/risks">
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Risks
                    </Button>
                  </Link>
                  <Link to="/app/risk-management/manage/settings">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Risk Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  View and export risk reports. Generate comprehensive risk assessments and track risk mitigation progress.
                </p>
                <Link to="/app/risk-management/reports">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskManagement; 