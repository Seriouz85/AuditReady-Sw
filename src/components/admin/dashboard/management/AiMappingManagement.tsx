import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Sparkles,
  Network,
  Target,
  Lightbulb
} from 'lucide-react';

interface AiMappingManagementProps {
  loading: boolean;
}

export const AiMappingManagement: React.FC<AiMappingManagementProps> = ({
  loading
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Content Mapping
            </h2>
            <p className="text-muted-foreground mt-2">Intelligent compliance framework mapping and content generation</p>
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
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Content Mapping
          </h2>
          <p className="text-muted-foreground mt-2">Intelligent compliance framework mapping and content generation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            AI System Active
          </Badge>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Mappings Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">1,247</div>
            <div className="flex items-center mt-2 text-sm text-indigo-600">
              <Brain className="w-4 h-4 mr-1" />
              AI-powered
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Accuracy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">94.8%</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Target className="w-4 h-4 mr-1" />
              High precision
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Processing Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">2.3s</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <Zap className="w-4 h-4 mr-1" />
              Average time
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">3</div>
            <div className="flex items-center mt-2 text-sm text-yellow-600">
              <Network className="w-4 h-4 mr-1" />
              AI models
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Mapping Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-indigo-600" />
              Framework Mapping
            </CardTitle>
            <CardDescription>Intelligent cross-framework requirement mapping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-medium">ISO 27001 → NIS2</div>
                    <div className="text-sm text-gray-500">247 mappings found</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Complete</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">NIST → CIS Controls</div>
                    <div className="text-sm text-gray-500">189 mappings found</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Complete</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">SOC 2 → GDPR</div>
                    <div className="text-sm text-gray-500">Processing...</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
              Content Generation
            </CardTitle>
            <CardDescription>AI-powered compliance content creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Policy Templates</div>
                    <div className="text-sm text-gray-500">156 templates generated</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Assessment Questions</div>
                    <div className="text-sm text-gray-500">892 questions created</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Implementation Guides</div>
                    <div className="text-sm text-gray-500">Continuously improving</div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Learning</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Management Tools */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-800">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Management Tools
          </CardTitle>
          <CardDescription>Configure and monitor AI-powered compliance features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Brain className="w-5 h-5 mb-1" />
              <span className="text-sm">Model Config</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Network className="w-5 h-5 mb-1" />
              <span className="text-sm">Mappings</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Lightbulb className="w-5 h-5 mb-1" />
              <span className="text-sm">Content Gen</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Activity className="w-5 h-5 mb-1" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};