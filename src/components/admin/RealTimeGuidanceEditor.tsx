/**
 * Real-Time Guidance Editor
 * Advanced content editor with live preview, validation, and AI assistance
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Edit3,
  Eye,
  Save,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Lightbulb,
  Shield,
  Target,
  FileText,
  Wand2,
  History,
  BookOpen,
  Settings,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RAGGenerationService } from '@/services/rag/RAGGenerationService';
import { RequirementValidationService, type ValidationResult } from '@/services/rag/RequirementValidationService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GuidanceContent {
  id: string;
  category: string;
  title: string;
  content: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  quality: number;
  frameworks: string[];
  sources: string[];
  lastModified: string;
  modifiedBy: string;
  validationResults?: ValidationResult;
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: 'basic' | 'intermediate' | 'advanced';
    tags: string[];
    requirements: string[];
  };
}

interface EditorState {
  content: string;
  isDirty: boolean;
  isValidating: boolean;
  isGenerating: boolean;
  autoSave: boolean;
  lastSaved?: string;
  currentValidation?: ValidationResult;
}

interface GuidanceTemplate {
  id: string;
  name: string;
  category: string;
  structure: string;
  placeholders: Record<string, string>;
  frameworks: string[];
}

// Compliance categories
const COMPLIANCE_CATEGORIES = [
  'Access Control & Identity Management',
  'Asset Management & Configuration',
  'Data Protection & Encryption',
  'Network Security Controls',
  'Incident Response & Recovery',
  'Risk Management & Assessment',
  'Security Monitoring & Logging',
  'Compliance & Governance',
  'Business Continuity Planning',
  'Physical & Environmental Security',
  'Supplier & Third-Party Management',
  'Security Training & Awareness',
  'Vulnerability Management',
  'Change Management & Controls',
  'Authentication & Authorization',
  'Backup & Recovery Systems',
  'Security Architecture',
  'Mobile Device Management',
  'Cloud Security Controls',
  'Application Security',
  'Cryptographic Controls'
];

const FRAMEWORKS = [
  'ISO 27001', 'ISO 27002', 'NIST CSF', 'CIS Controls', 'GDPR', 
  'NIS2 Directive', 'SOX', 'PCI DSS', 'HIPAA', 'SOC 2'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RealTimeGuidanceEditorProps {
  initialGuidance?: GuidanceContent;
  category?: string;
  onSave?: (guidance: GuidanceContent) => void;
  onClose?: () => void;
}

export function RealTimeGuidanceEditor({
  initialGuidance,
  category: initialCategory,
  onSave,
  onClose
}: RealTimeGuidanceEditorProps) {
  const { user } = useAuth();
  const [guidance, setGuidance] = useState<GuidanceContent>(
    initialGuidance || {
      id: `guidance_${Date.now()}`,
      category: initialCategory || COMPLIANCE_CATEGORIES[0],
      title: '',
      content: '',
      version: '1.0.0',
      status: 'draft',
      quality: 0,
      frameworks: [],
      sources: [],
      lastModified: new Date().toISOString(),
      modifiedBy: user?.email || 'unknown',
      metadata: {
        wordCount: 0,
        readingTime: 0,
        complexity: 'basic',
        tags: [],
        requirements: []
      }
    }
  );

  const [editorState, setEditorState] = useState<EditorState>({
    content: guidance.content,
    isDirty: false,
    isValidating: false,
    isGenerating: false,
    autoSave: true,
    currentValidation: undefined
  });

  const [activeTab, setActiveTab] = useState('editor');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<GuidanceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);

  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const validationRef = useRef<NodeJS.Timeout>();

  // Load templates and validation history
  useEffect(() => {
    loadTemplates();
    if (guidance.id) {
      loadValidationHistory();
    }
  }, [guidance.id]);

  // Auto-save functionality
  useEffect(() => {
    if (editorState.autoSave && editorState.isDirty) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [editorState.content, editorState.autoSave, editorState.isDirty]);

  // Real-time validation
  useEffect(() => {
    if (editorState.content.length > 50 && editorState.isDirty) {
      if (validationRef.current) {
        clearTimeout(validationRef.current);
      }
      
      validationRef.current = setTimeout(() => {
        handleValidation();
      }, 2000); // Validate after 2 seconds of inactivity
    }

    return () => {
      if (validationRef.current) {
        clearTimeout(validationRef.current);
      }
    };
  }, [editorState.content]);

  // Content change handler
  const handleContentChange = useCallback((newContent: string) => {
    setEditorState(prev => ({
      ...prev,
      content: newContent,
      isDirty: true
    }));

    // Update metadata
    const wordCount = newContent.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // Assume 200 words per minute
    
    setGuidance(prev => ({
      ...prev,
      content: newContent,
      lastModified: new Date().toISOString(),
      metadata: {
        ...prev.metadata,
        wordCount,
        readingTime
      }
    }));
  }, []);

  // Load guidance templates
  const loadTemplates = async () => {
    // Mock templates - in production, load from database
    const mockTemplates: GuidanceTemplate[] = [
      {
        id: 'access-control-basic',
        name: 'Access Control - Basic Implementation',
        category: 'Access Control & Identity Management',
        structure: `## Overview
{overview}

## Implementation Requirements
{requirements}

## Best Practices
{best_practices}

## Compliance Considerations
{compliance}

## Validation Steps
{validation}`,
        placeholders: {
          overview: 'Describe the access control requirement and its importance...',
          requirements: 'List specific implementation requirements...',
          best_practices: 'Outline industry best practices...',
          compliance: 'Detail framework-specific compliance requirements...',
          validation: 'Specify how to validate implementation...'
        },
        frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls']
      },
      {
        id: 'risk-management-comprehensive',
        name: 'Risk Management - Comprehensive Guide',
        category: 'Risk Management & Assessment',
        structure: `## Risk Identification
{identification}

## Risk Assessment Methodology
{assessment}

## Risk Treatment Options
{treatment}

## Monitoring and Review
{monitoring}

## Reporting Requirements
{reporting}`,
        placeholders: {
          identification: 'Describe risk identification processes...',
          assessment: 'Detail risk assessment methodology...',
          treatment: 'Outline risk treatment strategies...',
          monitoring: 'Specify monitoring requirements...',
          reporting: 'Define reporting obligations...'
        },
        frameworks: ['ISO 27001', 'NIST CSF', 'SOX']
      }
    ];
    
    setTemplates(mockTemplates);
  };

  // Load validation history
  const loadValidationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('validation_history')
        .select('*')
        .eq('entity_id', guidance.id)
        .eq('entity_type', 'guidance')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setValidationHistory(data.map(item => ({
          score: item.validation_score,
          checks: item.validation_checks,
          recommendations: item.recommendations,
          confidence: item.confidence,
          isValid: item.is_valid,
          metadata: item.metadata
        })));
      }
    } catch (error) {
      console.error('Failed to load validation history:', error);
    }
  };

  // Auto-save handler
  const handleAutoSave = async () => {
    try {
      // Simulate auto-save to local storage or draft API
      localStorage.setItem(`guidance_draft_${guidance.id}`, JSON.stringify({
        ...guidance,
        content: editorState.content
      }));

      setEditorState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date().toISOString()
      }));

      toast.success('Auto-saved draft', { duration: 2000 });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Manual save handler
  const handleSave = async () => {
    try {
      const updatedGuidance = {
        ...guidance,
        content: editorState.content,
        lastModified: new Date().toISOString(),
        modifiedBy: user?.email || 'unknown'
      };

      // Save to database
      const { error } = await supabase
        .from('guidance_content')
        .upsert(updatedGuidance);

      if (error) throw error;

      setGuidance(updatedGuidance);
      setEditorState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date().toISOString()
      }));

      toast.success('Guidance saved successfully');
      onSave?.(updatedGuidance);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save guidance');
    }
  };

  // Validation handler
  const handleValidation = async () => {
    if (editorState.isValidating) return;

    setEditorState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await RequirementValidationService.validateContent(
        editorState.content,
        'guidance'
      );

      setEditorState(prev => ({
        ...prev,
        currentValidation: result,
        isValidating: false
      }));

      setGuidance(prev => ({
        ...prev,
        quality: result.score,
        validationResults: result
      }));

      // Store validation result
      await RequirementValidationService.storeValidationResult(
        guidance.id,
        'guidance',
        result
      );

      // Reload validation history
      await loadValidationHistory();

    } catch (error) {
      console.error('Validation failed:', error);
      setEditorState(prev => ({ ...prev, isValidating: false }));
      toast.error('Validation failed');
    }
  };

  // AI generation handler
  const handleAIGeneration = async (prompt?: string) => {
    setEditorState(prev => ({ ...prev, isGenerating: true }));

    try {
      const enhancedPrompt = prompt || `Generate comprehensive guidance for ${guidance.category}`;
      
      const result = await RAGGenerationService.generateGuidance(
        {
          letter: 'a',
          title: guidance.title || guidance.category,
          description: enhancedPrompt,
          originalText: enhancedPrompt
        },
        guidance.category,
        { iso27001: true, nist: true, gdpr: true }
      );

      if (result.success && result.content) {
        handleContentChange(result.content);
        toast.success('AI guidance generated successfully');
      } else {
        toast.error('Failed to generate AI guidance');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('AI generation failed');
    } finally {
      setEditorState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Template application handler
  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    let content = template.structure;
    
    // Replace placeholders with guidance for users
    Object.entries(template.placeholders).forEach(([key, value]) => {
      content = content.replace(`{${key}}`, value);
    });

    handleContentChange(content);
    setGuidance(prev => ({
      ...prev,
      frameworks: template.frameworks,
      category: template.category
    }));

    toast.success('Template applied successfully');
  };

  // Export handler
  const handleExport = (format: 'markdown' | 'pdf' | 'docx') => {
    const content = `# ${guidance.title || guidance.category}

**Category:** ${guidance.category}
**Version:** ${guidance.version}
**Status:** ${guidance.status}
**Last Modified:** ${new Date(guidance.lastModified).toLocaleDateString()}

## Content

${editorState.content}

## Metadata

- **Word Count:** ${guidance.metadata.wordCount}
- **Reading Time:** ${guidance.metadata.readingTime} minutes
- **Complexity:** ${guidance.metadata.complexity}
- **Quality Score:** ${(guidance.quality * 100).toFixed(0)}%
- **Frameworks:** ${guidance.frameworks.join(', ')}

## Validation Results

${editorState.currentValidation ? `
**Overall Score:** ${(editorState.currentValidation.score * 100).toFixed(0)}%
**Confidence:** ${(editorState.currentValidation.confidence * 100).toFixed(0)}%
**Recommendations:**
${editorState.currentValidation.recommendations.map(rec => `- ${rec}`).join('\n')}
` : 'No validation results available'}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guidance.category.replace(/\s+/g, '_').toLowerCase()}_guidance.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Guidance exported as ${format.toUpperCase()}`);
  };

  // Quality indicators
  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplexityBadge = (complexity: string) => {
    const colors = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || colors.basic;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Real-Time Guidance Editor</h2>
            </div>
            {editorState.isDirty && (
              <Badge variant="outline" className="text-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={editorState.autoSave}
                onCheckedChange={(checked) => 
                  setEditorState(prev => ({ ...prev, autoSave: checked }))
                }
                id="auto-save"
              />
              <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidation}
              disabled={editorState.isValidating}
            >
              <Shield className="h-4 w-4 mr-2" />
              Validate
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!editorState.isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Category: {guidance.category}</span>
            <span>Version: {guidance.version}</span>
            <span>Status: {guidance.status}</span>
            {editorState.lastSaved && (
              <span>Last saved: {new Date(editorState.lastSaved).toLocaleTimeString()}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{guidance.metadata.wordCount} words</span>
            <span>{guidance.metadata.readingTime} min read</span>
            <span className={getQualityColor(guidance.quality)}>
              Quality: {(guidance.quality * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor Panel */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none">
              <TabsTrigger value="editor">
                <Edit3 className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="metadata">
                <Settings className="h-4 w-4 mr-2" />
                Metadata
              </TabsTrigger>
              <TabsTrigger value="templates">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="ai-assistant">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="validation">
                <Shield className="h-4 w-4 mr-2" />
                Validation
              </TabsTrigger>
            </TabsList>
            
            {/* Editor Tab */}
            <TabsContent value="editor" className="flex-1 p-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <Input
                    placeholder="Guidance title..."
                    value={guidance.title}
                    onChange={(e) => setGuidance(prev => ({ ...prev, title: e.target.value }))}
                    className="font-medium"
                  />
                </div>
                
                <div className="flex-1 p-4">
                  <Textarea
                    ref={contentRef}
                    placeholder="Start writing your compliance guidance here..."
                    value={editorState.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="h-full resize-none border-0 focus:ring-0 text-sm font-mono"
                    style={{ minHeight: '500px' }}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Metadata Tab */}
            <TabsContent value="metadata" className="flex-1 p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={guidance.category}
                    onValueChange={(value) => setGuidance(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={guidance.version}
                    onChange={(e) => setGuidance(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={guidance.status}
                    onValueChange={(value) => setGuidance(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Frameworks</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {FRAMEWORKS.map(framework => (
                      <Badge
                        key={framework}
                        variant={guidance.frameworks.includes(framework) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const frameworks = guidance.frameworks.includes(framework)
                            ? guidance.frameworks.filter(f => f !== framework)
                            : [...guidance.frameworks, framework];
                          setGuidance(prev => ({ ...prev, frameworks }));
                        }}
                      >
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="complexity">Complexity Level</Label>
                  <Select
                    value={guidance.metadata.complexity}
                    onValueChange={(value) => setGuidance(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, complexity: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Content Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Word Count: {guidance.metadata.wordCount}</div>
                  <div>Reading Time: {guidance.metadata.readingTime} min</div>
                  <div>Characters: {editorState.content.length}</div>
                  <div className={getQualityColor(guidance.quality)}>
                    Quality: {(guidance.quality * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Templates Tab */}
            <TabsContent value="templates" className="flex-1 p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Guidance Templates</h4>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {templates
                    .filter(t => !guidance.category || t.category === guidance.category)
                    .map(template => (
                      <Card key={template.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{template.name}</h5>
                            <p className="text-sm text-gray-600">{template.category}</p>
                            <div className="flex gap-1 mt-2">
                              {template.frameworks.map(fw => (
                                <Badge key={fw} variant="outline" className="text-xs">
                                  {fw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyTemplate(template.id)}
                          >
                            Apply
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            </TabsContent>
            
            {/* AI Assistant Tab */}
            <TabsContent value="ai-assistant" className="flex-1 p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">AI Writing Assistant</h4>
                  <Badge variant="secondary">
                    <Zap className="h-3 w-3 mr-1" />
                    Powered by Gemini
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ai-prompt">Custom prompt</Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder="Describe what you want the AI to help with..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={() => handleAIGeneration(aiPrompt)}
                    disabled={editorState.isGenerating}
                    className="w-full"
                  >
                    {editorState.isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h5 className="font-medium">Quick Actions</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGeneration('Improve the clarity and readability of this guidance')}
                      disabled={editorState.isGenerating}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Improve Clarity
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGeneration('Add more specific implementation details')}
                      disabled={editorState.isGenerating}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Add Implementation Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIGeneration('Include compliance framework references')}
                      disabled={editorState.isGenerating}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Add Framework References
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Validation Tab */}
            <TabsContent value="validation" className="flex-1">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Content Validation</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleValidation}
                      disabled={editorState.isValidating}
                    >
                      {editorState.isValidating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Validate
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {editorState.currentValidation ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getQualityColor(editorState.currentValidation.score)}`}>
                          {(editorState.currentValidation.score * 100).toFixed(0)}%
                        </div>
                        <p className="text-sm text-gray-600">Overall Quality Score</p>
                        <Progress value={editorState.currentValidation.score * 100} className="mt-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <h5 className="font-medium">Validation Checks</h5>
                        {editorState.currentValidation.checks.map((check, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                            {check.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h6 className="font-medium">{check.name}</h6>
                                <span className="text-sm font-semibold">
                                  {(check.score * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{check.details}</p>
                              <Badge
                                variant={check.severity === 'critical' ? 'destructive' : 'secondary'}
                                className="mt-2 text-xs"
                              >
                                {check.severity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {editorState.currentValidation.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium">Recommendations</h5>
                          <div className="space-y-2">
                            {editorState.currentValidation.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded">
                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-blue-800">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No validation results yet.</p>
                      <p className="text-sm">Click "Validate" to analyze your content.</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 bg-gray-50">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Live Preview</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('markdown')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-6 prose prose-sm max-w-none">
                <h1>{guidance.title || guidance.category}</h1>
                
                <div className="flex items-center space-x-4 mb-6 not-prose">
                  <Badge className={getComplexityBadge(guidance.metadata.complexity)}>
                    {guidance.metadata.complexity}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {guidance.metadata.wordCount} words • {guidance.metadata.readingTime} min read
                  </span>
                </div>
                
                <div className="whitespace-pre-wrap">
                  {editorState.content || 'Start writing to see preview...'}
                </div>
                
                {guidance.frameworks.length > 0 && (
                  <div className="mt-8 not-prose">
                    <h4 className="font-medium mb-2">Applicable Frameworks</h4>
                    <div className="flex flex-wrap gap-2">
                      {guidance.frameworks.map(framework => (
                        <Badge key={framework} variant="outline">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}