import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  FileText, 
  Users, 
  Target,
  Sparkles,
  BarChart3,
  BookOpen,
  Settings
} from 'lucide-react';

interface ComplianceManagementProps {
  loading: boolean;
}

export const ComplianceManagement: React.FC<ComplianceManagementProps> = ({
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Compliance Dashboard
            </h2>
            <p className="text-muted-foreground mt-2">Monitor compliance status and assessment progress</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Compliance Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">Monitor compliance status and assessment progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliance Tracking Active
          </Badge>
        </div>
      </div>

      {/* Compliance Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">27</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              In progress
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">156</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Assessments
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">87.3%</div>
            <div className="flex items-center mt-2 text-sm text-yellow-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Average score
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Risk Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">12</div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Need attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Framework Status
            </CardTitle>
            <CardDescription>Compliance status by framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">ISO 27001</div>
                    <div className="text-sm text-gray-500">Information Security</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800">92%</Badge>
                  <div className="text-xs text-gray-500 mt-1">Compliant</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">NIS2 Directive</div>
                    <div className="text-sm text-gray-500">Network Security</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800">85%</Badge>
                  <div className="text-xs text-gray-500 mt-1">Good</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">GDPR</div>
                    <div className="text-sm text-gray-500">Data Protection</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-yellow-100 text-yellow-800">73%</Badge>
                  <div className="text-xs text-gray-500 mt-1">Needs work</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">SOC 2</div>
                    <div className="text-sm text-gray-500">Service Controls</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-purple-100 text-purple-800">88%</Badge>
                  <div className="text-xs text-gray-500 mt-1">Good</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest compliance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <div className="font-medium">Assessment completed</div>
                  <div className="text-sm text-gray-500">ISO 27001 - Organization Alpha</div>
                </div>
                <div className="text-xs text-gray-500">2h ago</div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">Policy updated</div>
                  <div className="text-sm text-gray-500">Data Protection Policy v2.1</div>
                </div>
                <div className="text-xs text-gray-500">4h ago</div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium">Risk identified</div>
                  <div className="text-sm text-gray-500">Access control gap found</div>
                </div>
                <div className="text-xs text-gray-500">6h ago</div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <div className="font-medium">Training completed</div>
                  <div className="text-sm text-gray-500">Security awareness - 12 users</div>
                </div>
                <div className="text-xs text-gray-500">1d ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Tools */}
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Sparkles className="w-5 h-5 mr-2" />
            Compliance Management Tools
          </CardTitle>
          <CardDescription>Tools for managing compliance assessments and frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <BarChart3 className="w-5 h-5 mb-1" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <BookOpen className="w-5 h-5 mb-1" />
              <span className="text-sm">Frameworks</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <Target className="w-5 h-5 mb-1" />
              <span className="text-sm">Assessments</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};