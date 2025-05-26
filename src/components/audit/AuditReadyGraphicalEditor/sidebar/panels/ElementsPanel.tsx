import React, { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { addShapeToCanvas, addConnectorLine, addConnectorArrow, addElbowConnector, AUDIT_COLORS } from '../../core/fabric-utils';
import { showConnectionPoints, hideConnectionPointsForObject, hideAllConnectionPoints } from '../../utils/connection-points';
import { Square, Circle, Triangle, Minus, Star, ArrowRight, Diamond, Hexagon, CornerDownRight, Zap, ArrowUpDown, Link, Palette, Grid, Image, FileText, Database, Edit, Layers, Clock, AlertTriangle, CheckCircle, Search, Lightbulb, Shield, Target, Users, Building, TrendingUp, BarChart3, PieChart, Activity, Workflow, GitBranch, Clipboard, FileCheck, AlertCircle, Eye, Lock, Unlock, Settings, Cog } from 'lucide-react';

interface ShapeItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: string;
  description?: string;
  category?: string;
  tooltip?: string;
}

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
    gridTemplateColumns: 'repeat(3, 1fr)',
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
    minHeight: '88px',
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
    width: '28px',
    height: '28px',
    color: '#3b82f6',
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
  }
};

const shapes: ShapeItem[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: <Square style={panelStyles.buttonIcon} />,
    type: 'rectangle',
    tooltip: 'Basic rectangular shape for general use'
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: <Circle style={panelStyles.buttonIcon} />,
    type: 'circle',
    tooltip: 'Perfect circle for highlighting or grouping'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    icon: <Triangle style={panelStyles.buttonIcon} />,
    type: 'triangle',
    tooltip: 'Triangle shape for warnings or hierarchy'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: <Diamond style={panelStyles.buttonIcon} />,
    type: 'diamond',
    tooltip: 'Diamond shape for decision points'
  },
  {
    id: 'line',
    name: 'Line',
    icon: <Minus style={panelStyles.buttonIcon} />,
    type: 'line',
    tooltip: 'Straight line for connections'
  },
  {
    id: 'arrow',
    name: 'Arrow',
    icon: <ArrowRight style={panelStyles.buttonIcon} />,
    type: 'arrow',
    tooltip: 'Arrow for directional flow'
  },
  {
    id: 'star',
    name: 'Star',
    icon: <Star style={panelStyles.buttonIcon} />,
    type: 'star',
    tooltip: 'Star shape for emphasis or ratings'
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    icon: <Hexagon style={panelStyles.buttonIcon} />,
    type: 'hexagon',
    tooltip: 'Hexagon for complex processes'
  }
];

// Connector shapes
const connectorShapes: ShapeItem[] = [
  {
    id: 'straight-connector',
    name: 'Straight Line',
    icon: <Minus style={panelStyles.buttonIcon} />,
    type: 'line',
    tooltip: 'Direct connection between elements'
  },
  {
    id: 'arrow-connector',
    name: 'Arrow',
    icon: <ArrowRight style={panelStyles.buttonIcon} />,
    type: 'arrow',
    tooltip: 'Directional arrow connector'
  },
  {
    id: 'elbow-connector',
    name: 'Elbow',
    icon: <CornerDownRight style={panelStyles.buttonIcon} />,
    type: 'elbow-connector',
    tooltip: 'L-shaped connector for clean layouts'
  },
  {
    id: 'double-arrow',
    name: 'Double Arrow',
    icon: <ArrowUpDown style={panelStyles.buttonIcon} />,
    type: 'double-arrow',
    tooltip: 'Bidirectional arrow connector'
  }
];

// Enhanced professional audit-specific shapes with detailed descriptions
const auditShapes: ShapeItem[] = [
  // Process Flow Elements
  {
    id: 'process',
    name: 'Process Step',
    icon: <Square style={panelStyles.buttonIcon} />,
    type: 'process',
    description: 'Standard rectangular process box for audit procedures, activities, and operations',
    category: 'Process Flow',
    tooltip: 'Represents a standard audit process or procedure step'
  },
  {
    id: 'decision',
    name: 'Decision Point',
    icon: <Diamond style={panelStyles.buttonIcon} />,
    type: 'decision',
    description: 'Diamond-shaped decision point for yes/no questions, risk assessments, and evaluation criteria',
    category: 'Process Flow',
    tooltip: 'Decision diamond for audit evaluation points'
  },
  {
    id: 'start-end',
    name: 'Start/End Terminal',
    icon: <Circle style={panelStyles.buttonIcon} />,
    type: 'start-end',
    description: 'Oval terminal symbol marking the beginning or end of audit processes and workflows',
    category: 'Process Flow',
    tooltip: 'Terminal symbol for process start and end points'
  },
  {
    id: 'predefined-process',
    name: 'Standard Procedure',
    icon: <Layers style={panelStyles.buttonIcon} />,
    type: 'predefined-process',
    description: 'Predefined process box for established audit methodologies, SOPs, and standardized procedures',
    category: 'Process Flow',
    tooltip: 'Standardized audit procedure or methodology'
  },
  {
    id: 'delay',
    name: 'Wait/Delay',
    icon: <Clock style={panelStyles.buttonIcon} />,
    type: 'delay',
    description: 'D-shaped symbol for waiting periods, delays, or time-dependent steps in audit timeline',
    category: 'Process Flow',
    tooltip: 'Represents waiting periods or delays in audit process'
  },

  // Documentation & Data
  {
    id: 'document',
    name: 'Document',
    icon: <FileText style={panelStyles.buttonIcon} />,
    type: 'document',
    description: 'Document symbol for audit reports, working papers, evidence files, and documentation',
    category: 'Documentation',
    tooltip: 'Audit documents, reports, and evidence files'
  },
  {
    id: 'database',
    name: 'Data Storage',
    icon: <Database style={panelStyles.buttonIcon} />,
    type: 'database',
    description: 'Cylinder-shaped database symbol for data repositories, systems, and information storage',
    category: 'Data Systems',
    tooltip: 'Database or data storage system'
  },
  {
    id: 'manual-input',
    name: 'Manual Input',
    icon: <Edit style={panelStyles.buttonIcon} />,
    type: 'manual-input',
    description: 'Parallelogram for manual data entry, human verification, and manual audit procedures',
    category: 'Input/Output',
    tooltip: 'Manual data entry or human input step'
  },

  // Risk & Control Elements
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    icon: <AlertTriangle style={panelStyles.buttonIcon} />,
    type: 'risk-assessment',
    description: 'Triangle symbol for risk identification, assessment, and evaluation activities in audit',
    category: 'Risk Management',
    tooltip: 'Risk assessment and evaluation step'
  },
  {
    id: 'control-test',
    name: 'Control Testing',
    icon: <CheckCircle style={panelStyles.buttonIcon} />,
    type: 'control-test',
    description: 'Circle with checkmark for internal control testing, validation, and compliance verification',
    category: 'Control Testing',
    tooltip: 'Internal control testing and validation'
  },
  {
    id: 'control-design',
    name: 'Control Design',
    icon: <Shield style={panelStyles.buttonIcon} />,
    type: 'control-design',
    description: 'Shield symbol representing control design evaluation and effectiveness assessment',
    category: 'Control Testing',
    tooltip: 'Control design and effectiveness evaluation'
  },
  {
    id: 'compliance-check',
    name: 'Compliance Check',
    icon: <FileCheck style={panelStyles.buttonIcon} />,
    type: 'compliance-check',
    description: 'Document with checkmark for regulatory compliance verification and adherence testing',
    category: 'Compliance',
    tooltip: 'Compliance verification and regulatory checks'
  },

  // Findings & Results
  {
    id: 'finding',
    name: 'Audit Finding',
    icon: <Search style={panelStyles.buttonIcon} />,
    type: 'finding',
    description: 'Hexagon symbol for audit findings, exceptions, deficiencies, and observations',
    category: 'Audit Results',
    tooltip: 'Audit finding or exception identified'
  },
  {
    id: 'recommendation',
    name: 'Recommendation',
    icon: <Lightbulb style={panelStyles.buttonIcon} />,
    type: 'recommendation',
    description: 'Light bulb symbol for audit recommendations, improvement suggestions, and corrective actions',
    category: 'Audit Results',
    tooltip: 'Audit recommendation or improvement suggestion'
  },
  {
    id: 'observation',
    name: 'Observation',
    icon: <Eye style={panelStyles.buttonIcon} />,
    type: 'observation',
    description: 'Eye symbol for audit observations, notes, and areas requiring attention',
    category: 'Audit Results',
    tooltip: 'Audit observation or area of interest'
  },
  {
    id: 'critical-finding',
    name: 'Critical Finding',
    icon: <AlertCircle style={panelStyles.buttonIcon} />,
    type: 'critical-finding',
    description: 'Alert circle for critical findings, significant deficiencies, and high-priority issues',
    category: 'Audit Results',
    tooltip: 'Critical or high-priority audit finding'
  },

  // Organizational Elements
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    icon: <Users style={panelStyles.buttonIcon} />,
    type: 'stakeholder',
    description: 'People icon representing stakeholders, audit team members, and responsible parties',
    category: 'Organization',
    tooltip: 'Stakeholders and responsible parties'
  },
  {
    id: 'department',
    name: 'Department',
    icon: <Building style={panelStyles.buttonIcon} />,
    type: 'department',
    description: 'Building icon for organizational units, departments, and business divisions',
    category: 'Organization',
    tooltip: 'Department or organizational unit'
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: <Settings style={panelStyles.buttonIcon} />,
    type: 'governance',
    description: 'Gear icon representing governance structures, oversight, and management controls',
    category: 'Governance',
    tooltip: 'Governance and oversight structures'
  },

  // Performance & Analytics
  {
    id: 'kpi',
    name: 'KPI/Metric',
    icon: <Target style={panelStyles.buttonIcon} />,
    type: 'kpi',
    description: 'Target icon for key performance indicators, metrics, and measurement criteria',
    category: 'Performance',
    tooltip: 'Key performance indicators and metrics'
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    icon: <TrendingUp style={panelStyles.buttonIcon} />,
    type: 'trend-analysis',
    description: 'Trending chart for analytical procedures, trend analysis, and performance tracking',
    category: 'Analytics',
    tooltip: 'Trend analysis and performance tracking'
  },
  {
    id: 'data-analytics',
    name: 'Data Analytics',
    icon: <BarChart3 style={panelStyles.buttonIcon} />,
    type: 'data-analytics',
    description: 'Bar chart for data analytics, statistical analysis, and audit data mining',
    category: 'Analytics',
    tooltip: 'Data analytics and statistical analysis'
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: <Activity style={panelStyles.buttonIcon} />,
    type: 'monitoring',
    description: 'Activity monitor for continuous monitoring, real-time tracking, and ongoing surveillance',
    category: 'Monitoring',
    tooltip: 'Continuous monitoring and tracking'
  }
];

const ElementsPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [connectionMode, setConnectionMode] = useState<boolean>(false);

  const handleShapeClick = async (shapeType: string) => {
    if (!canvas) {
      console.error('Canvas not available in ElementsPanel');
      return;
    }

    console.log('ElementsPanel: Adding shape:', shapeType);
    console.log('ElementsPanel: Canvas state:', {
      canvasExists: !!canvas,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      objectCount: canvas.getObjects()?.length || 0
    });
    
    try {
      const shape = await addShapeToCanvas(canvas, shapeType);
      if (shape) {
        console.log('ElementsPanel: Shape added successfully:', shape);
      } else {
        console.error('ElementsPanel: Failed to add shape');
      }
    } catch (error) {
      console.error('ElementsPanel: Error adding shape:', error);
    }
  };

  const handleConnectorClick = async (connectorType: string) => {
    if (!canvas) return;
    
    try {
      switch (connectorType) {
        case 'line':
          await addConnectorLine(canvas);
          break;
        case 'arrow':
          await addConnectorArrow(canvas);
          break;
        case 'elbow-connector':
          await addElbowConnector(canvas);
          break;
        default:
          await addShapeToCanvas(canvas, connectorType);
      }
    } catch (error) {
      console.error('Error adding connector:', error);
    }
  };

  // Toggle connection mode
  useEffect(() => {
    if (!canvas) return;
    
    if (connectionMode) {
      console.log('Connection mode enabled - showing magnetic connection points');
      
      const handleObjectMouseOver = (e: any) => {
        if (e.target && !(e.target as any).isConnectionPoint && !(e.target as any).isConnector) {
          showConnectionPoints(canvas, e.target);
        }
      };
      
      const handleObjectMouseOut = (e: any) => {
        if (e.target && !(e.target as any).isConnectionPoint && !(e.target as any).isConnector) {
          if (canvas.getActiveObject() !== e.target) {
            hideConnectionPointsForObject(canvas, e.target);
          }
        }
      };
      
      canvas.on('mouse:over', handleObjectMouseOver);
      canvas.on('mouse:out', handleObjectMouseOut);
      
      canvas.getObjects().forEach((obj: fabric.Object) => {
        if (!(obj as any).isConnectionPoint && !(obj as any).isConnector) {
          showConnectionPoints(canvas, obj);
        }
      });
      
      return () => {
        canvas.off('mouse:over', handleObjectMouseOver);
        canvas.off('mouse:out', handleObjectMouseOut);
        hideAllConnectionPoints(canvas);
      };
    } else {
      hideAllConnectionPoints(canvas);
    }
  }, [canvas, connectionMode]);

  // Get unique categories for filtering
  const categories = [
    { id: 'basic', name: 'Basic Shapes', description: 'Fundamental geometric shapes' },
    { id: 'connectors', name: 'Connectors', description: 'Lines and arrows for connections' },
    { id: 'audit', name: 'Audit Elements', description: 'Professional audit symbols' }
  ];

  // Filter audit shapes by category
  const getShapesForCategory = (categoryId: string) => {
    switch (categoryId) {
      case 'basic':
        return shapes;
      case 'connectors':
        return connectorShapes;
      case 'audit':
        return auditShapes;
      default:
        return shapes;
    }
  };

  const currentShapes = getShapesForCategory(selectedCategory);
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.borderColor = '#3b82f6';
    button.style.backgroundColor = '#f8fafc';
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
    
    // Enhance icon color on hover
    const icon = button.querySelector('svg');
    if (icon) {
      icon.style.color = '#1d4ed8';
    }
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.borderColor = '#e2e8f0';
    button.style.backgroundColor = 'white';
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    
    // Reset icon color
    const icon = button.querySelector('svg');
    if (icon) {
      icon.style.color = '#3b82f6';
    }
  };

  return (
    <div style={panelStyles.container}>
      {/* Category Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '10px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '20px',
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
        
        {/* Simple category title */}
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
          fontFamily: 'inherit'
        }}>
          {currentCategory?.name}
        </h3>
      </div>

      {/* Connection Mode Toggle for Connectors */}
      {selectedCategory === 'connectors' && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setConnectionMode(!connectionMode)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid',
              transition: 'all 0.2s ease',
              outline: 'none',
              userSelect: 'none' as const,
              borderColor: connectionMode ? '#3b82f6' : '#e2e8f0',
              backgroundColor: connectionMode ? '#eff6ff' : 'white',
              color: connectionMode ? '#1d4ed8' : '#374151'
            }}
          >
            <Link style={{ width: '16px', height: '16px' }} />
            {connectionMode ? 'Exit Smart Mode' : 'Smart Connections'}
          </button>
          
          {connectionMode && (
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              backgroundColor: '#eff6ff',
              borderRadius: '4px',
              border: '1px solid #bfdbfe'
            }}>
              <p style={{
                fontSize: '10px',
                color: '#3b82f6',
                margin: '0',
                textAlign: 'center' as const,
                fontFamily: 'inherit',
                fontWeight: 500
              }}>
                Hover over shapes to see connection points
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shapes Grid */}
      <div style={panelStyles.grid}>
        {currentShapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => selectedCategory === 'connectors' ? handleConnectorClick(shape.type) : handleShapeClick(shape.type)}
            title={shape.description || shape.tooltip}
            style={panelStyles.button}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            {shape.icon}
            <span style={panelStyles.buttonText}>{shape.name}</span>
            {shape.category && selectedCategory === 'audit' && (
              <span style={{
                fontSize: '9px',
                color: '#64748b',
                textAlign: 'center' as const,
                lineHeight: 1.2,
                fontFamily: 'inherit',
                marginTop: '2px'
              }}>
                {shape.category}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ElementsPanel; 