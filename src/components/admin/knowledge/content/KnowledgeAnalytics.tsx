/**
 * Knowledge Analytics Component
 * Displays analytics and metrics for knowledge management
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Award, 
  Database, 
  Zap 
} from 'lucide-react';
import { CategoryStats } from '../shared/KnowledgeTypes';

interface KnowledgeAnalyticsProps {
  categoryStats: CategoryStats[];
  onGenerateGuidance: (category: string) => void;
}

export function KnowledgeAnalytics({
  categoryStats,
  onGenerateGuidance
}: KnowledgeAnalyticsProps) {
  return (
    <div className="space-y-4">
      {/* Category Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {categoryStats.map((stat) => (
          <Card key={stat.category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{stat.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Guidance</span>
                <span className="font-semibold">{stat.totalGuidance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="font-semibold text-green-600">{stat.approvedGuidance}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <span className="font-semibold">{(stat.avgQuality * 100).toFixed(0)}%</span>
                </div>
                <Progress value={stat.avgQuality * 100} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sources Used</span>
                <span className="font-semibold">{stat.sourcesUsed}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Satisfaction</span>
                  <span className="font-semibold">{(stat.userSatisfaction * 100).toFixed(0)}%</span>
                </div>
                <Progress value={stat.userSatisfaction * 100} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onGenerateGuidance(stat.category)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Ingestions</span>
              <span className="text-xl font-bold text-blue-600">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-xl font-bold text-green-600">98.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Processing Time</span>
              <span className="text-xl font-bold text-purple-600">2.4s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cache Hit Rate</span>
              <span className="text-xl font-bold text-orange-600">73.2%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">92.4</div>
              <div className="text-sm text-gray-600">Overall Quality Score</div>
              <Progress value={92.4} className="mt-3" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Content Accuracy</span>
                <span className="font-semibold">94.1%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Framework Coverage</span>
                <span className="font-semibold">89.7%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>User Satisfaction</span>
                <span className="font-semibold">93.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">Online</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">128.5 MB</div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}