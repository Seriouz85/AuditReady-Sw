/**
 * Modern Template Gallery - Beautiful card-based template selection
 * Professional design with hover effects and clean layouts
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter,
  Play,
  Eye,
  Star,
  Zap,
  Target,
  Shield,
  Users,
  BarChart3,
  GitBranch,
  Workflow,
  Database,
  Cloud,
  Settings,
  CheckCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AuditReadyThemes } from '../ui/design-system/AuditReadyDesignSystem';

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  preview: string;
  tags: string[];
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  isPopular?: boolean;
  isNew?: boolean;
  code: string;
}

interface ModernTemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
  currentTheme: string;
}

export const ModernTemplateGallery: React.FC<ModernTemplateGalleryProps> = ({
  onTemplateSelect,
  currentTheme
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const themeData = AuditReadyThemes[currentTheme as keyof typeof AuditReadyThemes] || AuditReadyThemes['Executive Clean'];

  const categories: TemplateCategory[] = [
    { id: 'all', name: 'All Templates', icon: <Workflow className="h-4 w-4" />, color: themeData.colors.accent, count: 12 },
    { id: 'audit', name: 'Audit Process', icon: <Shield className="h-4 w-4" />, color: '#3b82f6', count: 4 },
    { id: 'compliance', name: 'Compliance', icon: <CheckCircle className="h-4 w-4" />, color: '#10b981', count: 3 },
    { id: 'risk', name: 'Risk Management', icon: <Target className="h-4 w-4" />, color: '#f59e0b', count: 2 },
    { id: 'business', name: 'Business Process', icon: <Users className="h-4 w-4" />, color: '#8b5cf6', count: 2 },
    { id: 'technical', name: 'Technical', icon: <Database className="h-4 w-4" />, color: '#06b6d4', count: 1 }
  ];

  const templates: Template[] = [
    {
      id: 'audit-process',
      name: 'Comprehensive Audit Process',
      description: 'End-to-end audit workflow from planning to reporting',
      category: 'audit',
      icon: <Shield className="h-5 w-5" />,
      preview: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
      tags: ['Audit', 'Process', 'Compliance'],
      complexity: 'Intermediate',
      isPopular: true,
      code: `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E{Findings Analysis}
    E --> F[Report Generation]
    F --> G[Management Review]
    G --> H[Action Plan]`
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment Matrix',
      description: 'Systematic risk evaluation and mitigation framework',
      category: 'risk',
      icon: <Target className="h-5 w-5" />,
      preview: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)',
      tags: ['Risk', 'Assessment', 'Matrix'],
      complexity: 'Advanced',
      isNew: true,
      code: `flowchart TD
    A[Identify Risks] --> B[Assess Probability]
    B --> C[Assess Impact]
    C --> D{Risk Level Acceptable?}
    D -->|High Risk| E[Immediate Action]
    D -->|Medium Risk| F[Planned Mitigation]
    D -->|Low Risk| G[Monitor & Review]
    E --> H[Risk Assessment Complete]
    F --> H
    G --> H`
    },
    {
      id: 'compliance-framework',
      name: 'Compliance Framework',
      description: 'Regulatory compliance workflow and monitoring',
      category: 'compliance',
      icon: <CheckCircle className="h-5 w-5" />,
      preview: 'linear-gradient(135deg, #dcfce7 0%, #10b981 100%)',
      tags: ['Compliance', 'Framework', 'Regulatory'],
      complexity: 'Intermediate',
      isPopular: true,
      code: `flowchart TD
    A[Regulatory Requirements] --> B[Policy Development]
    B --> C[Control Implementation]
    C --> D[Monitoring & Testing]
    D --> E[Compliance Review]`
    },
    {
      id: 'business-process',
      name: 'Business Process Flow',
      description: 'Standard business process with decision points',
      category: 'business',
      icon: <Users className="h-5 w-5" />,
      preview: 'linear-gradient(135deg, #f3e8ff 0%, #8b5cf6 100%)',
      tags: ['Business', 'Process', 'Workflow'],
      complexity: 'Simple',
      code: `flowchart LR
    A[Start] --> B[Input Validation]
    B --> C{Valid Input?}
    C -->|Yes| D[Process Request]
    C -->|No| E[Error Handling]
    D --> F[Generate Output]
    E --> G[End]
    F --> G`
    },
    {
      id: 'org-chart',
      name: 'Organizational Chart',
      description: 'Clean organizational structure visualization',
      category: 'business',
      icon: <GitBranch className="h-5 w-5" />,
      preview: 'linear-gradient(135deg, #f1f5f9 0%, #64748b 100%)',
      tags: ['Organization', 'Structure', 'Hierarchy'],
      complexity: 'Simple',
      code: `flowchart TD
    A[CEO] --> B[CTO]
    A --> C[CFO]
    A --> D[COO]`
    },
    {
      id: 'infinity-loop-process',
      name: 'Continuous Improvement Loop',
      description: 'Infinite loop process for continuous improvement',
      category: 'audit',
      icon: <Zap className="h-5 w-5" />,
      preview: 'linear-gradient(135deg, #cffafe 0%, #06b6d4 100%)',
      tags: ['Continuous', 'Improvement', 'Loop'],
      complexity: 'Advanced',
      isNew: true,
      code: `flowchart LR
    A[Security Assessment] --> B[Risk Analysis]
    B --> C[Implementation Planning]
    C --> D[Process Execution]
    D --> E[Monitoring & Review]
    E --> F[Optimization & Feedback]
    F --> A`
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return themeData.colors.text.muted;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: themeData.colors.accent }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Template Gallery</h2>
            <p className="text-sm text-gray-500">Professional diagram templates</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                borderColor: category.color
              }}
            >
              {category.icon}
              <span className="text-xs">{category.name}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`group relative rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                hoveredTemplate === template.id
                  ? 'border-blue-300 shadow-lg scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => onTemplateSelect(template)}
            >
              {/* Template Preview */}
              <div 
                className="h-24 relative"
                style={{ background: template.preview }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  {template.isPopular && (
                    <Badge className="bg-orange-500 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {template.isNew && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white bg-opacity-90 hover:bg-opacity-100"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </div>

                {/* Icon */}
                <div className="absolute bottom-3 left-3">
                  <div className="w-8 h-8 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                    {template.icon}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {template.name}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className="text-xs ml-2"
                    style={{ 
                      borderColor: getComplexityColor(template.complexity),
                      color: getComplexityColor(template.complexity)
                    }}
                  >
                    {template.complexity}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {template.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};