import React, { useState } from 'react';
import * as fabric from 'fabric';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { addShapeToCanvas, addTextToCanvas, AUDIT_COLORS } from '../../core/fabric-utils';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users,
  BarChart3,
  Target,
  Clock,
  Search,
  Lightbulb,
  Eye,
  Lock,
  Unlock,
  Settings,
  Database,
  TrendingUp,
  Activity,
  Workflow,
  GitBranch,
  Clipboard,
  FileCheck,
  AlertCircle,
  Building,
  Cog,
  Layers,
  Edit
} from 'lucide-react';

// Self-contained panel styles
const panelStyles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#1f2937',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '0'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  button: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '100px',
    fontFamily: 'inherit',
    fontSize: '11px',
    lineHeight: 1.2,
    color: '#374151',
    position: 'relative' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    outline: 'none',
    userSelect: 'none' as const
  },
  buttonIcon: {
    width: '32px',
    height: '32px',
    marginBottom: '8px',
    flexShrink: 0
  },
  buttonText: {
    fontSize: '11px',
    color: '#374151',
    fontWeight: 600,
    textAlign: 'center' as const,
    lineHeight: 1.2,
    fontFamily: 'inherit'
  },
  categoryTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: '0 0 12px 0',
    fontFamily: 'inherit'
  }
};

interface AuditElement {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: string;
  description: string;
  category: string;
  color: string;
  shapeType: string;
  createCustomShape?: (canvas: any) => Promise<void>;
}

const AuditPanel: React.FC = () => {
  const { canvas, auditMode } = useFabricCanvasStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('process');

  // Comprehensive audit elements with professional symbols
  const auditElements: AuditElement[] = [
    // Process Flow Elements
    {
      id: 'audit-process',
      name: 'Audit Process',
      icon: <Workflow style={{ ...panelStyles.buttonIcon, color: '#3b82f6' }} />,
      type: 'process',
      description: 'Standard audit procedure step',
      category: 'process',
      color: '#3b82f6',
      shapeType: 'process',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'process', {
          fill: 'rgba(59, 130, 246, 0.1)',
          stroke: '#3b82f6',
          strokeWidth: 2,
          width: 140,
          height: 80
        });
        await addTextToCanvas(canvas, 'AUDIT\nPROCESS', {
          left: (shape?.left || 0) + 70,
          top: (shape?.top || 0) + 30,
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#3b82f6',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'decision-point',
      name: 'Decision Point',
      icon: <GitBranch style={{ ...panelStyles.buttonIcon, color: '#f59e0b' }} />,
      type: 'decision',
      description: 'Audit decision or evaluation point',
      category: 'process',
      color: '#f59e0b',
      shapeType: 'decision',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'decision', {
          fill: 'rgba(245, 158, 11, 0.1)',
          stroke: '#f59e0b',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'DECISION', {
          left: (shape?.left || 0) + 70,
          top: (shape?.top || 0) + 35,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#f59e0b',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'start-end',
      name: 'Start/End',
      icon: <Target style={{ ...panelStyles.buttonIcon, color: '#10b981' }} />,
      type: 'start-end',
      description: 'Process start or end point',
      category: 'process',
      color: '#10b981',
      shapeType: 'start-end',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'start-end', {
          fill: 'rgba(16, 185, 129, 0.1)',
          stroke: '#10b981',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'START/END', {
          left: (shape?.left || 0) + 70,
          top: (shape?.top || 0) + 35,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#10b981',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'manual-input',
      name: 'Manual Input',
      icon: <Edit style={{ ...panelStyles.buttonIcon, color: '#8b5cf6' }} />,
      type: 'manual-input',
      description: 'Manual data entry or verification',
      category: 'process',
      color: '#8b5cf6',
      shapeType: 'manual-input',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'manual-input', {
          fill: 'rgba(139, 92, 246, 0.1)',
          stroke: '#8b5cf6',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'MANUAL\nINPUT', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 30,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#8b5cf6',
          textAlign: 'center'
        });
      }
    },

    // Risk & Control Elements
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      icon: <AlertTriangle style={{ ...panelStyles.buttonIcon, color: '#ef4444' }} />,
      type: 'risk-assessment',
      description: 'Risk identification and evaluation',
      category: 'risk',
      color: '#ef4444',
      shapeType: 'risk-assessment',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'risk-assessment', {
          fill: 'rgba(239, 68, 68, 0.1)',
          stroke: '#ef4444',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'RISK\nASSESSMENT', {
          left: (shape?.left || 0) + 50,
          top: (shape?.top || 0) + 35,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#ef4444',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'control-test',
      name: 'Control Testing',
      icon: <CheckCircle style={{ ...panelStyles.buttonIcon, color: '#10b981' }} />,
      type: 'control-test',
      description: 'Internal control testing',
      category: 'risk',
      color: '#10b981',
      shapeType: 'control-test',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'control-test', {
          fill: 'rgba(16, 185, 129, 0.1)',
          stroke: '#10b981',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'CONTROL\nTEST', {
          left: (shape?.left || 0) + 35,
          top: (shape?.top || 0) + 25,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#10b981',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'control-design',
      name: 'Control Design',
      icon: <Shield style={{ ...panelStyles.buttonIcon, color: '#3b82f6' }} />,
      type: 'control-design',
      description: 'Control design evaluation',
      category: 'risk',
      color: '#3b82f6',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(59, 130, 246, 0.1)',
          stroke: '#3b82f6',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'CONTROL\nDESIGN', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 30,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#3b82f6',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      icon: <FileCheck style={{ ...panelStyles.buttonIcon, color: '#059669' }} />,
      type: 'compliance-check',
      description: 'Regulatory compliance verification',
      category: 'risk',
      color: '#059669',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(5, 150, 105, 0.1)',
          stroke: '#059669',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'COMPLIANCE\nCHECK', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 30,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#059669',
          textAlign: 'center'
        });
      }
    },

    // Documentation & Data
    {
      id: 'audit-document',
      name: 'Audit Document',
      icon: <FileText style={{ ...panelStyles.buttonIcon, color: '#6b7280' }} />,
      type: 'document',
      description: 'Audit documentation and evidence',
      category: 'documentation',
      color: '#6b7280',
      shapeType: 'document',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'document', {
          fill: 'rgba(107, 114, 128, 0.1)',
          stroke: '#6b7280',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'AUDIT\nDOCUMENT', {
          left: (shape?.left || 0) + 40,
          top: (shape?.top || 0) + 25,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#6b7280',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'data-source',
      name: 'Data Source',
      icon: <Database style={{ ...panelStyles.buttonIcon, color: '#7c3aed' }} />,
      type: 'database',
      description: 'Data repository or system',
      category: 'documentation',
      color: '#7c3aed',
      shapeType: 'database',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'database', {
          fill: 'rgba(124, 58, 237, 0.1)',
          stroke: '#7c3aed',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'DATA\nSOURCE', {
          left: (shape?.left || 0) + 40,
          top: (shape?.top || 0) + 30,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#7c3aed',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'working-papers',
      name: 'Working Papers',
      icon: <Clipboard style={{ ...panelStyles.buttonIcon, color: '#0891b2' }} />,
      type: 'working-papers',
      description: 'Audit working papers',
      category: 'documentation',
      color: '#0891b2',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(8, 145, 178, 0.1)',
          stroke: '#0891b2',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'WORKING\nPAPERS', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 30,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#0891b2',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'evidence',
      name: 'Evidence',
      icon: <Search style={{ ...panelStyles.buttonIcon, color: '#dc2626' }} />,
      type: 'evidence',
      description: 'Audit evidence and findings',
      category: 'documentation',
      color: '#dc2626',
      shapeType: 'hexagon',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'hexagon', {
          fill: 'rgba(220, 38, 38, 0.1)',
          stroke: '#dc2626',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'EVIDENCE', {
          left: (shape?.left || 0) + 50,
          top: (shape?.top || 0) + 35,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#dc2626',
          textAlign: 'center'
        });
      }
    },

    // Findings & Results
    {
      id: 'audit-finding',
      name: 'Audit Finding',
      icon: <Eye style={{ ...panelStyles.buttonIcon, color: '#f59e0b' }} />,
      type: 'finding',
      description: 'Audit finding or exception',
      category: 'findings',
      color: '#f59e0b',
      shapeType: 'finding',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'finding', {
          fill: 'rgba(245, 158, 11, 0.1)',
          stroke: '#f59e0b',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'FINDING', {
          left: (shape?.left || 0) + 50,
          top: (shape?.top || 0) + 25,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#f59e0b',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'recommendation',
      name: 'Recommendation',
      icon: <Lightbulb style={{ ...panelStyles.buttonIcon, color: '#10b981' }} />,
      type: 'recommendation',
      description: 'Audit recommendation',
      category: 'findings',
      color: '#10b981',
      shapeType: 'recommendation',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'recommendation', {
          fill: 'rgba(16, 185, 129, 0.1)',
          stroke: '#10b981',
          strokeWidth: 2
        });
        await addTextToCanvas(canvas, 'RECOMMENDATION', {
          left: (shape?.left || 0) + 35,
          top: (shape?.top || 0) + 25,
          fontSize: 9,
          fontWeight: 'bold',
          fill: '#10b981',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'critical-finding',
      name: 'Critical Finding',
      icon: <AlertCircle style={{ ...panelStyles.buttonIcon, color: '#dc2626' }} />,
      type: 'critical-finding',
      description: 'Critical or high-priority finding',
      category: 'findings',
      color: '#dc2626',
      shapeType: 'triangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'triangle', {
          fill: 'rgba(220, 38, 38, 0.1)',
          stroke: '#dc2626',
          strokeWidth: 3,
          width: 100,
          height: 100
        });
        await addTextToCanvas(canvas, 'CRITICAL\nFINDING', {
          left: (shape?.left || 0) + 50,
          top: (shape?.top || 0) + 40,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#dc2626',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'observation',
      name: 'Observation',
      icon: <Activity style={{ ...panelStyles.buttonIcon, color: '#6366f1' }} />,
      type: 'observation',
      description: 'Audit observation or note',
      category: 'findings',
      color: '#6366f1',
      shapeType: 'circle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'circle', {
          fill: 'rgba(99, 102, 241, 0.1)',
          stroke: '#6366f1',
          strokeWidth: 2,
          radius: 40
        });
        await addTextToCanvas(canvas, 'OBSERVATION', {
          left: (shape?.left || 0) + 40,
          top: (shape?.top || 0) + 35,
          fontSize: 9,
          fontWeight: 'bold',
          fill: '#6366f1',
          textAlign: 'center'
        });
      }
    },

    // Organizational Elements
    {
      id: 'stakeholder',
      name: 'Stakeholder',
      icon: <Users style={{ ...panelStyles.buttonIcon, color: '#059669' }} />,
      type: 'stakeholder',
      description: 'Key stakeholder or responsible party',
      category: 'organization',
      color: '#059669',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(5, 150, 105, 0.1)',
          stroke: '#059669',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'STAKEHOLDER', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 35,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#059669',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'department',
      name: 'Department',
      icon: <Building style={{ ...panelStyles.buttonIcon, color: '#7c3aed' }} />,
      type: 'department',
      description: 'Organizational unit or department',
      category: 'organization',
      color: '#7c3aed',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(124, 58, 237, 0.1)',
          stroke: '#7c3aed',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'DEPARTMENT', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 35,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#7c3aed',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'governance',
      name: 'Governance',
      icon: <Settings style={{ ...panelStyles.buttonIcon, color: '#1f2937' }} />,
      type: 'governance',
      description: 'Governance structure or oversight',
      category: 'organization',
      color: '#1f2937',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(31, 41, 55, 0.1)',
          stroke: '#1f2937',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'GOVERNANCE', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 35,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#1f2937',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'management',
      name: 'Management',
      icon: <Cog style={{ ...panelStyles.buttonIcon, color: '#0891b2' }} />,
      type: 'management',
      description: 'Management role or function',
      category: 'organization',
      color: '#0891b2',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(8, 145, 178, 0.1)',
          stroke: '#0891b2',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'MANAGEMENT', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 35,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#0891b2',
          textAlign: 'center'
        });
      }
    },

    // Performance & Analytics
    {
      id: 'kpi-metric',
      name: 'KPI/Metric',
      icon: <BarChart3 style={{ ...panelStyles.buttonIcon, color: '#059669' }} />,
      type: 'kpi',
      description: 'Key performance indicator',
      category: 'analytics',
      color: '#059669',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(5, 150, 105, 0.1)',
          stroke: '#059669',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'KPI/METRIC', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 35,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#059669',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'trend-analysis',
      name: 'Trend Analysis',
      icon: <TrendingUp style={{ ...panelStyles.buttonIcon, color: '#3b82f6' }} />,
      type: 'trend-analysis',
      description: 'Trend analysis and tracking',
      category: 'analytics',
      color: '#3b82f6',
      shapeType: 'rectangle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'rectangle', {
          fill: 'rgba(59, 130, 246, 0.1)',
          stroke: '#3b82f6',
          strokeWidth: 2,
          width: 120,
          height: 80
        });
        await addTextToCanvas(canvas, 'TREND\nANALYSIS', {
          left: (shape?.left || 0) + 60,
          top: (shape?.top || 0) + 30,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#3b82f6',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'monitoring',
      name: 'Monitoring',
      icon: <Activity style={{ ...panelStyles.buttonIcon, color: '#f59e0b' }} />,
      type: 'monitoring',
      description: 'Continuous monitoring and tracking',
      category: 'analytics',
      color: '#f59e0b',
      shapeType: 'circle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'circle', {
          fill: 'rgba(245, 158, 11, 0.1)',
          stroke: '#f59e0b',
          strokeWidth: 2,
          radius: 40
        });
        await addTextToCanvas(canvas, 'MONITORING', {
          left: (shape?.left || 0) + 40,
          top: (shape?.top || 0) + 35,
          fontSize: 9,
          fontWeight: 'bold',
          fill: '#f59e0b',
          textAlign: 'center'
        });
      }
    },
    {
      id: 'benchmark',
      name: 'Benchmark',
      icon: <Target style={{ ...panelStyles.buttonIcon, color: '#8b5cf6' }} />,
      type: 'benchmark',
      description: 'Performance benchmark or target',
      category: 'analytics',
      color: '#8b5cf6',
      shapeType: 'circle',
      createCustomShape: async (canvas) => {
        const shape = await addShapeToCanvas(canvas, 'circle', {
          fill: 'rgba(139, 92, 246, 0.1)',
          stroke: '#8b5cf6',
          strokeWidth: 2,
          radius: 40
        });
        await addTextToCanvas(canvas, 'BENCHMARK', {
          left: (shape?.left || 0) + 40,
          top: (shape?.top || 0) + 35,
          fontSize: 9,
          fontWeight: 'bold',
          fill: '#8b5cf6',
          textAlign: 'center'
        });
      }
    }
  ];

  const categories = [
    { id: 'process', name: 'Process Flow', description: 'Audit process elements' },
    { id: 'risk', name: 'Risk & Controls', description: 'Risk and control elements' },
    { id: 'documentation', name: 'Documentation', description: 'Documents and data' },
    { id: 'findings', name: 'Findings', description: 'Audit results and findings' },
    { id: 'organization', name: 'Organization', description: 'Organizational elements' },
    { id: 'analytics', name: 'Analytics', description: 'Performance and metrics' }
  ];

  const handleAuditElementClick = async (element: AuditElement) => {
    if (!canvas) return;
    
    try {
      if (element.createCustomShape) {
        await element.createCustomShape(canvas);
      } else {
        // Create a grouped shape with text that matches the button
        const shape = await addShapeToCanvas(canvas, element.shapeType, {
          fill: `${element.color}15`,
          stroke: element.color,
          strokeWidth: 2,
          width: 120,
          height: 80,
        });
        
        if (shape) {
          // Add text to the shape and group them
          const textObj = await addTextToCanvas(canvas, element.name.toUpperCase(), {
            left: (shape.left || 0) + 60,
            top: (shape.top || 0) + 35,
            fontSize: 11,
            fontWeight: 'bold',
            fill: element.color,
            textAlign: 'center',
            fontFamily: 'Inter, Arial, sans-serif'
          });
          
          if (textObj) {
            // Remove individual objects and create a group
            canvas.remove(shape);
            canvas.remove(textObj);
            
            const group = new fabric.Group([shape, textObj], {
              left: shape.left,
              top: shape.top,
              borderColor: AUDIT_COLORS.primary,
              cornerColor: AUDIT_COLORS.surface,
              cornerStrokeColor: AUDIT_COLORS.primary,
              cornerSize: 8,
              transparentCorners: false,
            });
            
            // Add custom properties
            (group as any).id = `audit-${element.id}-${Date.now()}`;
            (group as any).auditType = element.type;
            
            canvas.add(group);
            canvas.setActiveObject(group);
            canvas.renderAll();
          }
        }
      }
      console.log(`Added audit element: ${element.name}`);
    } catch (error) {
      console.error('Error adding audit element:', error);
    }
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.borderColor = '#3b82f6';
    button.style.backgroundColor = '#f8fafc';
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.borderColor = '#e2e8f0';
    button.style.backgroundColor = 'white';
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
  };

  // Filter elements by category
  const currentElements = auditElements.filter(element => element.category === selectedCategory);
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  return (
    <div style={panelStyles.container}>
      {/* Current Mode Indicator */}
      <div style={{
        marginBottom: '20px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: `${AUDIT_COLORS.primary}10`,
        border: `1px solid ${AUDIT_COLORS.primary}20`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <Shield style={{ width: '16px', height: '16px', color: AUDIT_COLORS.primary }} />
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: AUDIT_COLORS.primary,
            fontFamily: 'inherit'
          }}>
            {auditMode.charAt(0).toUpperCase() + auditMode.slice(1)} Mode
          </span>
        </div>
        <p style={{
          fontSize: '10px',
          color: '#6b7280',
          margin: '0',
          fontFamily: 'inherit'
        }}>
          Professional audit tools and symbols
        </p>
      </div>

      {/* Category Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '12px'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '6px 10px',
                fontSize: '10px',
                fontWeight: 600,
                borderRadius: '16px',
                border: '1px solid',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                outline: 'none',
                userSelect: 'none' as const,
                borderColor: selectedCategory === category.id ? '#3b82f6' : '#e2e8f0',
                backgroundColor: selectedCategory === category.id ? '#eff6ff' : 'white',
                color: selectedCategory === category.id ? '#1d4ed8' : '#6b7280'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <h3 style={panelStyles.categoryTitle}>
          {currentCategory?.name}
        </h3>
      </div>

      {/* Audit Elements Grid */}
      <div style={panelStyles.grid}>
        {currentElements.map((element) => (
          <button
            key={element.id}
            onClick={() => handleAuditElementClick(element)}
            title={element.description}
            style={panelStyles.button}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            {element.icon}
            <span style={panelStyles.buttonText}>{element.name}</span>
          </button>
        ))}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#eff6ff',
        fontSize: '11px'
      }}>
        <p style={{
          color: '#1f2937',
          margin: '0 0 6px 0',
          fontWeight: 600,
          fontFamily: 'inherit'
        }}>
          Professional Audit Tools:
        </p>
        <p style={{
          color: '#6b7280',
          fontSize: '10px',
          margin: '0',
          lineHeight: 1.4,
          fontFamily: 'inherit'
        }}>
          Each tool creates a properly labeled audit element with professional styling and appropriate symbols.
        </p>
      </div>
    </div>
  );
};

export default AuditPanel; 