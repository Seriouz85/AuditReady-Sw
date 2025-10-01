import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';
import {
  Brain,
  Zap,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Network,
  Target,
  Lightbulb,
  FileText,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface AiMappingManagementProps {
  loading: boolean;
}

interface AIStats {
  totalMappings: number;
  totalRequirements: number;
  requirementsWithAI: number;
  knowledgeSources: number;
  accuracyRate: number;
}

export const AiMappingManagement: React.FC<AiMappingManagementProps> = ({
  loading: parentLoading
}) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AIStats>({
    totalMappings: 0,
    totalRequirements: 0,
    requirementsWithAI: 0,
    knowledgeSources: 0,
    accuracyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadAIStats();
    loadRecentActivity();
  }, []);

  const loadAIStats = async () => {
    try {
      // Get total requirements count
      const { count: totalReqs } = await supabase
        .from('requirements_library')
        .select('*', { count: 'exact', head: true });

      // Get requirements with AI guidance
      const { count: withAI } = await supabase
        .from('requirements_library')
        .select('*', { count: 'exact', head: true })
        .not('ai_guidance', 'is', null);

      // Get knowledge sources count
      const { count: sources } = await supabase
        .from('knowledge_sources')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get framework mappings count (estimate from unique requirement-framework pairs)
      const { data: mappings } = await supabase
        .from('requirements_library')
        .select('frameworks');

      const totalMappings = mappings?.reduce((sum, req) => {
        const frameworks = Array.isArray(req.frameworks) ? req.frameworks : [];
        return sum + frameworks.length;
      }, 0) || 0;

      // Calculate accuracy rate (requirements with AI guidance / total requirements)
      const accuracyRate = totalReqs ? Math.round((withAI || 0) / totalReqs * 100) : 0;

      setStats({
        totalMappings,
        totalRequirements: totalReqs || 0,
        requirementsWithAI: withAI || 0,
        knowledgeSources: sources || 0,
        accuracyRate
      });
    } catch (error) {
      console.error('Failed to load AI stats:', error);
      toast.error('Failed to load AI mapping statistics');
    } finally {
      setDataLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Get recent AI-generated guidance (last 5)
      const { data: recentReqs } = await supabase
        .from('requirements_library')
        .select('id, category, title, updated_at')
        .not('ai_guidance', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5);

      setRecentActivity(recentReqs || []);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const goToFullDashboard = () => {
    navigate('/admin/ai-mapping');
  };

  const goToKnowledgeManagement = () => {
    navigate('/admin/knowledge');
  };

  if (parentLoading || dataLoading) {
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

  const coveragePercentage = stats.totalRequirements > 0
    ? Math.round((stats.requirementsWithAI / stats.totalRequirements) * 100)
    : 0;

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
            {coveragePercentage}% Coverage
          </Badge>
          <Button onClick={goToFullDashboard}>
            <Brain className="w-4 h-4 mr-2" />
            Full AI Dashboard
          </Button>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Total Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-900">{stats.totalRequirements}</div>
            <div className="flex items-center mt-2 text-sm text-indigo-600">
              <FileText className="w-4 h-4 mr-1" />
              In database
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">AI Guidance Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.requirementsWithAI}</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Brain className="w-4 h-4 mr-1" />
              {coveragePercentage}% coverage
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Framework Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.totalMappings}</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <Network className="w-4 h-4 mr-1" />
              Cross-framework
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Knowledge Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{stats.knowledgeSources}</div>
            <div className="flex items-center mt-2 text-sm text-yellow-600">
              <Target className="w-4 h-4 mr-1" />
              Active sources
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
              Recent AI Generations
            </CardTitle>
            <CardDescription>Latest AI-powered guidance additions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No AI-generated guidance yet</p>
                <Button onClick={goToFullDashboard} variant="outline" className="mt-4">
                  <Zap className="w-4 h-4 mr-2" />
                  Generate AI Guidance
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{req.title}</div>
                        <div className="text-xs text-gray-500">{req.category}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {new Date(req.updated_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
                <Button onClick={goToFullDashboard} variant="outline" className="w-full mt-2">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-purple-600" />
              AI Capabilities
            </CardTitle>
            <CardDescription>What our AI system can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Framework Mapping</div>
                  <div className="text-xs text-gray-500 mt-1">Automatically maps requirements across ISO 27001, NIS2, NIST, CIS Controls, and more</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Guidance Generation</div>
                  <div className="text-xs text-gray-500 mt-1">Creates comprehensive implementation guidance from trusted knowledge sources</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Network className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Knowledge Integration</div>
                  <div className="text-xs text-gray-500 mt-1">Ingests and processes compliance documentation from authoritative sources</div>
                </div>
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
            <Button
              onClick={goToFullDashboard}
              variant="outline"
              className="h-20 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Brain className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">AI Dashboard</span>
              <span className="text-xs text-gray-500">Full management</span>
            </Button>
            <Button
              onClick={goToKnowledgeManagement}
              variant="outline"
              className="h-20 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <FileText className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Knowledge Sources</span>
              <span className="text-xs text-gray-500">{stats.knowledgeSources} sources</span>
            </Button>
            <Button
              onClick={() => navigate('/admin/compliance')}
              variant="outline"
              className="h-20 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Network className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Mappings</span>
              <span className="text-xs text-gray-500">{stats.totalMappings} mappings</span>
            </Button>
            <Button
              onClick={() => window.open('https://docs.google.com/spreadsheets/d/your-ai-analytics', '_blank')}
              variant="outline"
              className="h-20 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Activity className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">Analytics</span>
              <ExternalLink className="w-3 h-3 absolute top-2 right-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Admins */}
      {coveragePercentage < 100 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <AlertTriangle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">AI Coverage Incomplete</h3>
                  <p className="text-sm text-purple-700">
                    {stats.totalRequirements - stats.requirementsWithAI} requirements still need AI-generated guidance.
                  </p>
                </div>
              </div>
              <Button onClick={goToFullDashboard} className="bg-purple-600 hover:bg-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Generate Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
