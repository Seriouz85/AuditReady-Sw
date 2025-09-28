import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart2,
  X,
  Mail,
  MousePointer,
  AlertCircle,
  BarChart
} from 'lucide-react';
import { Campaign, PhishingTemplate } from '../types';

interface PhishingAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  templates: PhishingTemplate[];
}

export const PhishingAnalytics: React.FC<PhishingAnalyticsProps> = ({
  isOpen,
  onClose,
  campaigns,
  templates
}) => {
  if (!isOpen) return null;

  const getDepartmentStats = () => {
    return ['Sales', 'Marketing', 'Finance', 'HR', 'Engineering'].map((dept, index) => ({
      name: dept,
      employees: 20 + index * 15,
      failureRate: 70 - index * 8
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Phishing Campaign Analytics</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4 bg-green-50 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Average Open Rate</p>
                  <h3 className="text-3xl font-bold text-green-700">68.2%</h3>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">↑ 12% from previous month</p>
            </Card>
            
            <Card className="p-4 bg-red-50 border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Average Click Rate</p>
                  <h3 className="text-3xl font-bold text-red-700">42.5%</h3>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <MousePointer className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-red-600 mt-2">↓ 5% from previous month</p>
            </Card>
            
            <Card className="p-4 bg-blue-50 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Report Rate</p>
                  <h3 className="text-3xl font-bold text-blue-700">15.8%</h3>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">↑ 23% from previous month</p>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Performance Chart */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Campaign Performance Over Time</h3>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-[150px] rounded-xl">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="h-80 flex flex-col justify-center items-center">
                <div className="w-20 h-20 flex items-center justify-center">
                  <BarChart className="h-20 w-20 text-gray-300" />
                </div>
                <p className="text-gray-500 mt-4">Campaign performance chart will appear here</p>
              </div>
            </Card>
            
            {/* Templates and Departments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Most Effective Templates</h3>
                <div className="space-y-4">
                  {templates.slice(0, 5).map((template, index) => (
                    <div key={template.id} className="flex items-center gap-4">
                      <div className="bg-gray-100 text-gray-800 h-8 w-8 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{75 - index * 5}%</div>
                        <div className="text-xs text-muted-foreground">Click Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Vulnerable Departments</h3>
                <div className="space-y-4">
                  {getDepartmentStats().map((dept, index) => (
                    <div key={dept.name} className="flex items-center gap-4">
                      <div className="bg-gray-100 text-gray-800 h-8 w-8 rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-sm text-muted-foreground">{dept.employees} employees</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{dept.failureRate}%</div>
                        <div className="text-xs text-muted-foreground">Failure Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Recent Campaigns Table */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Campaign Name</th>
                      <th className="text-left py-3 px-4 font-medium">Start Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Open Rate</th>
                      <th className="text-right py-3 px-4 font-medium">Click Rate</th>
                      <th className="text-right py-3 px-4 font-medium">Report Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(campaign => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{campaign.name}</td>
                        <td className="py-3 px-4">{campaign.schedule.startDate}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={`${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {campaign.stats?.openRate?.toFixed(1) || '0'}%
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {campaign.stats?.clickRate?.toFixed(1) || '0'}%
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {campaign.stats?.reportRate?.toFixed(1) || '0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <Button 
            onClick={onClose} 
            className="rounded-xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};