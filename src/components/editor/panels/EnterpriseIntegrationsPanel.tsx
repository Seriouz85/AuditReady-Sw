/**
 * 🔗 Enterprise Integrations Panel - Connect to Your Tools
 * Beautiful integrations dashboard with enterprise tools and services
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Network, Settings, CheckCircle, ArrowRight, ExternalLink,
  Database, Cloud, Shield, Key, Zap, RefreshCw, AlertCircle,
  Box, Building, MessageSquare, GitBranch, FileText, Folder,
  Link, Workflow, Package, Server, CloudIcon, Palette,
  CreditCard, Video, Users, Send, File, Calendar,
  Target, Lightbulb, Circle, Layers, PenTool, Brush
} from 'lucide-react';

interface EnterpriseIntegrationsPanelProps {
  onClose: () => void;
}

interface Integration {
  id: string;
  name: string;
  icon: any;
  category: string;
  description: string;
  isConnected: boolean;
  isPremium: boolean;
  setupComplexity: 'Easy' | 'Medium' | 'Advanced';
  features: string[];
  pricing?: string;
  color: string;
}

const EnterpriseIntegrationsPanel: React.FC<EnterpriseIntegrationsPanelProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  const integrations: Integration[] = [
    // Microsoft Ecosystem
    {
      id: 'microsoft-visio',
      name: 'Microsoft Visio',
      icon: PenTool,
      category: 'Design Tools',
      description: 'Import/export Visio diagrams seamlessly',
      isConnected: true,
      isPremium: false,
      setupComplexity: 'Easy',
      features: ['Import .vsdx files', 'Export to Visio format', 'Template sync'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sharepoint',
      name: 'SharePoint',
      icon: Folder,
      category: 'Document Management',
      description: 'Sync diagrams with SharePoint libraries',
      isConnected: false,
      isPremium: true,
      setupComplexity: 'Medium',
      features: ['Auto-sync diagrams', 'Version control', 'Team collaboration'],
      pricing: '$15/month',
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      icon: Users,
      category: 'Communication',
      description: 'Share diagrams in Teams channels',
      isConnected: true,
      isPremium: false,
      setupComplexity: 'Easy',
      features: ['Direct sharing', 'Real-time collaboration', 'Meeting integration'],
      color: 'from-purple-500 to-purple-600'
    },

    // Development Tools
    {
      id: 'github',
      name: 'GitHub',
      icon: GitBranch,
      category: 'Development',
      description: 'Version control for diagrams and docs',
      isConnected: true,
      isPremium: false,
      setupComplexity: 'Medium',
      features: ['Git integration', 'PR reviews', 'Issue tracking'],
      color: 'from-gray-800 to-gray-900'
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: Target,
      category: 'Project Management',
      description: 'Link diagrams to Jira issues and epics',
      isConnected: false,
      isPremium: true,
      setupComplexity: 'Advanced',
      features: ['Issue linking', 'Workflow automation', 'Sprint planning'],
      pricing: '$10/month',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'confluence',
      name: 'Confluence',
      icon: FileText,
      category: 'Documentation',
      description: 'Embed diagrams in Confluence pages',
      isConnected: false,
      isPremium: true,
      setupComplexity: 'Medium',
      features: ['Page embedding', 'Live updates', 'Comment sync'],
      pricing: '$12/month',
      color: 'from-blue-400 to-blue-600'
    },

    // Cloud Platforms
    {
      id: 'aws',
      name: 'Amazon AWS',
      icon: CloudIcon,
      category: 'Cloud Infrastructure',
      description: 'Generate infrastructure diagrams from AWS',
      isConnected: false,
      isPremium: true,
      setupComplexity: 'Advanced',
      features: ['Auto-discovery', 'Resource mapping', 'Cost analysis'],
      pricing: '$25/month',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      icon: Server,
      category: 'Cloud Infrastructure',
      description: 'Visualize Azure resources and topologies',
      isConnected: true,
      isPremium: true,
      setupComplexity: 'Advanced',
      features: ['Resource groups', 'Network topology', 'Security mapping'],
      pricing: '$25/month',
      color: 'from-blue-500 to-cyan-500'
    },

    // Automation
    {
      id: 'zapier',
      name: 'Zapier',
      icon: Workflow,
      category: 'Automation',
      description: 'Automate diagram workflows',
      isConnected: false,
      isPremium: true,
      setupComplexity: 'Medium',
      features: ['Workflow triggers', 'Data sync', '1000+ app connections'],
      pricing: '$20/month',
      color: 'from-orange-400 to-red-500'
    },

    // Communication
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      category: 'Communication',
      description: 'Share and discuss diagrams in Slack',
      isConnected: true,
      isPremium: false,
      setupComplexity: 'Easy',
      features: ['Instant sharing', 'Channel notifications', 'Bot commands'],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Integrations', count: integrations.length },
    { id: 'Design Tools', name: 'Design Tools', count: integrations.filter(i => i.category === 'Design Tools').length },
    { id: 'Development', name: 'Development', count: integrations.filter(i => i.category === 'Development').length },
    { id: 'Cloud Infrastructure', name: 'Cloud', count: integrations.filter(i => i.category === 'Cloud Infrastructure').length },
    { id: 'Communication', name: 'Communication', count: integrations.filter(i => i.category === 'Communication').length },
    { id: 'Project Management', name: 'Project Management', count: integrations.filter(i => i.category === 'Project Management').length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesConnected = !showConnectedOnly || integration.isConnected;
    
    return matchesSearch && matchesCategory && matchesConnected;
  });

  const handleConnect = (integrationId: string) => {
    // Handle integration connection logic
    console.log('Connecting to:', integrationId);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Enterprise Integrations
              </h2>
              <p className="text-sm text-gray-500">Connect to your enterprise tools and workflows</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/70 border-gray-200/50 focus:bg-white"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label htmlFor="connected-only" className="text-sm font-medium">
                Connected only
              </Label>
              <Switch
                id="connected-only"
                checked={showConnectedOnly}
                onCheckedChange={setShowConnectedOnly}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                {integrations.filter(i => i.isConnected).length} Connected
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {filteredIntegrations.length} Available
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4 border-b border-gray-200/50">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-white shadow-md border border-gray-200/50 text-gray-900'
                    : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium">{category.name}</span>
                <Badge variant="outline" className="text-xs bg-gray-100 border-gray-200">
                  {category.count}
                </Badge>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Integrations List */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-4 space-y-4">
          <AnimatePresence>
            {filteredIntegrations.map((integration, index) => {
              const Icon = integration.icon;
              
              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/95 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Icon */}
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${integration.color} flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                              {integration.isConnected && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Connected
                                </Badge>
                              )}
                              {integration.isPremium && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                              {integration.description}
                            </p>

                            {/* Features */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {integration.features.slice(0, 3).map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="outline"
                                  className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                                >
                                  {feature}
                                </Badge>
                              ))}
                              {integration.features.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                                  +{integration.features.length - 3}
                                </Badge>
                              )}
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span>Setup:</span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getComplexityColor(integration.setupComplexity)}`}
                                >
                                  {integration.setupComplexity}
                                </Badge>
                              </div>
                              <span>•</span>
                              <span>{integration.category}</span>
                              {integration.pricing && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium">{integration.pricing}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {integration.isConnected ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/70 hover:bg-white border-gray-200/50"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Configure
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/70 hover:bg-white border-gray-200/50"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Learn More
                              </Button>
                              <Button
                                onClick={() => handleConnect(integration.id)}
                                className={`bg-gradient-to-r ${integration.color} hover:opacity-90 text-white border-0 shadow-md`}
                                size="sm"
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredIntegrations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Network className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No integrations found</h3>
              <p className="text-gray-400 text-sm">
                Try adjusting your search terms or category filter
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Setup Guide */}
      <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Quick Setup</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Most integrations can be set up in under 5 minutes. Premium features include advanced 
              sync options, automation, and priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseIntegrationsPanel;