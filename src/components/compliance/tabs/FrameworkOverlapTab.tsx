import { Eye, Shield, Settings, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { PentagonVisualization } from '@/components/compliance/PentagonVisualization';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

interface FrameworkOverlapTabProps {
  selectedFrameworks: FrameworkSelection;
  filteredMappings: any[];
}

export function FrameworkOverlapTab({ selectedFrameworks, filteredMappings }: FrameworkOverlapTabProps) {
  // Check if any frameworks are selected
  const hasFrameworksSelected = selectedFrameworks['iso27001'] || 
    selectedFrameworks['iso27002'] || 
    selectedFrameworks['cisControls'] || 
    selectedFrameworks['gdpr'] || 
    selectedFrameworks['nis2'] ||
    selectedFrameworks['dora'];

  return (
    <TabsContent value="overlap" className="space-y-6">
      <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Framework Overlap Analysis</h2>
              <p className="text-sm text-white/80 font-normal">Visual representation of how your selected frameworks overlap</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {hasFrameworksSelected ? (
            <>
              {/* Overlap Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Object.values(selectedFrameworks).filter(v => v).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Frameworks Selected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {filteredMappings.reduce((total, mapping) => {
                      const frameworkCount = Object.entries(mapping.frameworks).filter(([key, value]) => {
                        const arrayValue = Array.isArray(value) ? value : [];
                        if (key === 'gdpr' || key === 'nis2') return value && arrayValue.length > 0;
                        if (key === 'cisControls') return arrayValue.length > 0;
                        return arrayValue.length > 0;
                      }).length;
                      return total + (frameworkCount > 1 ? 1 : 0);
                    }, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Groups with Overlap</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {(() => {
                      const overlapRate = filteredMappings.reduce((total, mapping) => {
                        const activeFrameworks = Object.entries(mapping.frameworks).filter(([key, value]) => {
                          const arrayValue = Array.isArray(value) ? value : [];
                          if (key === 'gdpr' || key === 'nis2') return value && arrayValue.length > 0;
                          if (key === 'cisControls') return arrayValue.length > 0;
                          return arrayValue.length > 0;
                        });
                        const maxReqs = activeFrameworks.length > 0 ? Math.max(...activeFrameworks.map(([_, reqs]) => {
                          const arrayReqs = Array.isArray(reqs) ? reqs : [];
                          return arrayReqs.length;
                        })) : 0;
                        const totalReqs = activeFrameworks.reduce((sum, [_, reqs]) => {
                          const arrayReqs = Array.isArray(reqs) ? reqs : [];
                          return sum + arrayReqs.length;
                        }, 0);
                        return total + (totalReqs > 0 ? ((totalReqs - maxReqs) / totalReqs) * 100 : 0);
                      }, 0);
                      return Math.round(overlapRate / Math.max(filteredMappings.length, 1));
                    })()}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Overlap Rate</div>
                </div>
              </div>
              
              {/* Framework Coverage Visualization */}
              <PentagonVisualization 
                selectedFrameworks={{
                  iso27001: selectedFrameworks['iso27001'],
                  iso27002: selectedFrameworks['iso27002'],
                  cisControls: Boolean(selectedFrameworks['cisControls']),
                  gdpr: selectedFrameworks['gdpr'],
                  nis2: selectedFrameworks['nis2'],
                  dora: selectedFrameworks['dora']
                }}
                mappingData={filteredMappings}
              />
            </>
          ) : (
            /* No frameworks selected state */
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Eye className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Frameworks Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Select frameworks in the "Framework Mapping" tab and click "Generate Unified Requirements" to see overlap analysis and efficiency insights.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>ISO 27001/27002</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-purple-500" />
                    <span>CIS Controls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span>GDPR</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span>NIS2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}