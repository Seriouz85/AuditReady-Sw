import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Users, Building2, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FrameworkSelection } from '@/services/compliance/FrameworkMappingResolver';

interface FrameworkSelectorProps {
  frameworks: FrameworkSelection;
  onFrameworkChange: (frameworks: FrameworkSelection) => void;
  selectedIndustrySector: string | null;
  onIndustrySectorChange: (sector: string | null) => void;
  industrySectors?: Array<{
    id: string;
    name: string;
    description: string;
    nis2Essential: boolean;
    nis2Important: boolean;
  }>;
  frameworkCounts?: {
    iso27001: number;
    iso27002: number;
    cisControls: number;
    gdpr: number;
    nis2: number;
  };
  isLoading?: boolean;
}

export function FrameworkSelector({
  frameworks,
  onFrameworkChange,
  selectedIndustrySector,
  onIndustrySectorChange,
  industrySectors = [],
  frameworkCounts,
  isLoading = false
}: FrameworkSelectorProps) {
  
  const handleFrameworkToggle = (framework: keyof Omit<FrameworkSelection, 'cisControls'>) => {
    onFrameworkChange({
      ...frameworks,
      [framework]: !frameworks[framework]
    });
  };

  const handleCISLevelChange = (level: string) => {
    onFrameworkChange({
      ...frameworks,
      cisControls: level === 'none' ? null : level as 'ig1' | 'ig2' | 'ig3'
    });
  };

  const frameworkOptions = [
    {
      key: 'iso27001' as const,
      name: 'ISO 27001',
      description: 'Information Security Management System',
      icon: Shield,
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      count: frameworkCounts?.iso27001
    },
    {
      key: 'iso27002' as const,
      name: 'ISO 27002',
      description: 'Security Controls Implementation',
      icon: Lock,
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      count: frameworkCounts?.iso27002
    },
    {
      key: 'gdpr' as const,
      name: 'GDPR',
      description: 'Data Protection Regulation',
      icon: Users,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      count: frameworkCounts?.gdpr
    },
    {
      key: 'nis2' as const,
      name: 'NIS2',
      description: 'Network & Information Security',
      icon: Building2,
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      count: frameworkCounts?.nis2
    }
  ];

  const cisLevels = [
    { value: 'none', label: 'Not Selected', description: '' },
    { value: 'ig1', label: 'Implementation Group 1', description: 'Essential Cyber Hygiene' },
    { value: 'ig2', label: 'Implementation Group 2', description: 'Enterprises & Small Organizations' },
    { value: 'ig3', label: 'Implementation Group 3', description: 'Large Organizations & Critical Infrastructure' }
  ];

  const getSelectedCount = () => {
    let count = 0;
    if (frameworks.iso27001) count++;
    if (frameworks.iso27002) count++;
    if (frameworks.cisControls) count++;
    if (frameworks.gdpr) count++;
    if (frameworks.nis2) count++;
    return count;
  };

  if (isLoading) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Framework Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-800/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Framework Selection
            {getSelectedCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getSelectedCount()} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Industry Sector Selection */}
          {industrySectors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Industry Sector (Optional)
              </label>
              <Select
                value={selectedIndustrySector || 'none'}
                onValueChange={(value) => onIndustrySectorChange(value === 'none' ? null : value)}
              >
                <SelectTrigger className="bg-gray-900/50 border-gray-700">
                  <SelectValue placeholder="Select your industry sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No sector selected</SelectItem>
                  {industrySectors.map(sector => (
                    <SelectItem key={sector.id} value={sector.id}>
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4" />
                        {sector.name}
                        {sector.nis2Essential && (
                          <Badge variant="destructive" className="text-xs">NIS2 Essential</Badge>
                        )}
                        {sector.nis2Important && !sector.nis2Essential && (
                          <Badge variant="secondary" className="text-xs">NIS2 Important</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Framework Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {frameworkOptions.map(option => {
              const Icon = option.icon;
              const isSelected = frameworks[option.key];
              
              return (
                <motion.div
                  key={option.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleFrameworkToggle(option.key)}
                    className={`h-auto p-4 justify-start text-left ${
                      isSelected 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500' 
                        : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{option.name}</span>
                          {option.count !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {option.count} req
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* CIS Controls Level Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              CIS Controls Implementation Group
              {frameworkCounts?.cisControls !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {frameworkCounts.cisControls} controls
                </Badge>
              )}
            </label>
            <Select
              value={frameworks.cisControls || 'none'}
              onValueChange={handleCISLevelChange}
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cisLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      {level.description && (
                        <div className="text-xs text-gray-500">{level.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection Summary */}
          {getSelectedCount() > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
            >
              <div className="text-sm text-cyan-300">
                <strong>Selected Frameworks:</strong>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {frameworks.iso27001 && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    ISO 27001
                  </Badge>
                )}
                {frameworks.iso27002 && (
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    ISO 27002
                  </Badge>
                )}
                {frameworks.cisControls && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    CIS {frameworks.cisControls.toUpperCase()}
                  </Badge>
                )}
                {frameworks.gdpr && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    GDPR
                  </Badge>
                )}
                {frameworks.nis2 && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    NIS2
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}