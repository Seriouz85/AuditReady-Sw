import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Database, 
  Building, 
  Network, 
  Code, 
  AlertCircle, 
  Briefcase, 
  FileText,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FrameworkReference } from '@/services/compliance/ContentDeduplicator';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    pentagon_domain?: number;
  };
  requirementCount: number;
  frameworks: string[];
  references: FrameworkReference[];
  onSelect: () => void;
  onShowGuidance: () => void;
  isSelected: boolean;
}

export function CategoryCard({
  category,
  requirementCount,
  frameworks,
  references,
  onSelect,
  onShowGuidance,
  isSelected
}: CategoryCardProps) {
  
  const getCategoryIcon = (categoryName: string, iconName?: string) => {
    // Use specific icon if provided
    if (iconName) {
      const iconMap: Record<string, React.ComponentType<any>> = {
        'Users': Users,
        'Shield': Shield,
        'Database': Database,
        'Building': Building,
        'Network': Network,
        'Code': Code,
        'AlertCircle': AlertCircle,
        'Briefcase': Briefcase,
        'FileText': FileText
      };
      return iconMap[iconName] || Shield;
    }

    // Fallback to category name matching
    if (categoryName.includes('Governance')) return Users;
    if (categoryName.includes('Risk')) return Shield;
    if (categoryName.includes('Identity')) return Users;
    if (categoryName.includes('Data')) return Database;
    if (categoryName.includes('Physical')) return Building;
    if (categoryName.includes('Network')) return Network;
    if (categoryName.includes('Software')) return Code;
    if (categoryName.includes('Incident')) return AlertCircle;
    if (categoryName.includes('Business')) return Briefcase;
    if (categoryName.includes('Audit')) return FileText;
    return Shield;
  };

  const Icon = getCategoryIcon(category.name, category.icon);

  const getPentagonDomainColor = (domain?: number) => {
    switch (domain) {
      case 1: return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 2: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 3: return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 4: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 5: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getPentagonDomainName = (domain?: number) => {
    switch (domain) {
      case 1: return 'Identify';
      case 2: return 'Protect';
      case 3: return 'Detect';
      case 4: return 'Respond';
      case 5: return 'Recover';
      default: return 'Core';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
            : 'bg-black/40 backdrop-blur-md border-gray-800/50 hover:bg-black/60 hover:border-gray-700/50'
        }`}
        onClick={onSelect}
      >
        {/* Pentagon Domain Indicator */}
        {category.pentagon_domain && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline" 
              className={`text-xs ${getPentagonDomainColor(category.pentagon_domain)}`}
            >
              {getPentagonDomainName(category.pentagon_domain)}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="flex items-start gap-3 text-lg">
            <div className={`p-2 rounded-lg ${
              isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-800/50 text-gray-400'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${
                isSelected ? 'text-cyan-300' : 'text-white'
              }`}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {category.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Requirements Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {requirementCount} requirement{requirementCount !== 1 ? 's' : ''}
              </span>
            </div>
            {requirementCount > 0 && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  requirementCount >= 10 ? 'bg-red-500/20 text-red-300' :
                  requirementCount >= 5 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}
              >
                {requirementCount >= 10 ? 'High' : requirementCount >= 5 ? 'Med' : 'Low'} complexity
              </Badge>
            )}
          </div>

          {/* Framework Badges */}
          {frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {frameworks.map(framework => (
                <Badge 
                  key={framework}
                  variant="outline"
                  className={`text-xs ${
                    framework === 'ISO 27001' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    framework === 'ISO 27002' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                    framework.startsWith('CIS') ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    framework === 'GDPR' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    framework === 'NIS2' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                    'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }`}
                >
                  {framework}
                </Badge>
              ))}
            </div>
          )}

          {/* Reference Summary */}
          {references.length > 0 && (
            <div className="text-xs text-gray-400">
              <span>References: </span>
              {references.slice(0, 3).map((ref, index) => (
                <span key={ref.framework}>
                  {ref.codes.slice(0, 2).join(', ')}
                  {ref.codes.length > 2 && ` +${ref.codes.length - 2}`}
                  {index < Math.min(references.length - 1, 2) && ', '}
                </span>
              ))}
              {references.length > 3 && ` +${references.length - 3} more`}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              View Requirements
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onShowGuidance();
              }}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Guidance
            </Button>
          </div>
        </CardContent>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 border-2 border-cyan-500/50 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </Card>
    </motion.div>
  );
}