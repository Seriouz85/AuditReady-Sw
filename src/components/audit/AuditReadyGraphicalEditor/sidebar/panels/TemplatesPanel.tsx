import React, { useState } from 'react';
import * as fabric from 'fabric';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { addShapeToCanvas, addTextToCanvas, AUDIT_COLORS } from '../../core/fabric-utils';
import { getTemplateManager } from '../../templates/TemplateManager';
import TemplateGallery from '../../ui/TemplateGallery';
import {
  LayoutTemplate,
  Search,
  Star,
  Clock,
  BookOpen,
  Shield,
  BarChart3,
  FileText,
  Workflow,
  Target,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Grid3X3
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  preview: string;
  createTemplate: (canvas: any) => Promise<void>;
}

const auditTemplates: Template[] = [
  {
    id: 'audit-process',
    name: 'Professional Audit Process Flow',
    description: 'Comprehensive audit workflow with modern design and detailed phases',
    category: 'Audit',
    icon: <BookOpen className="w-5 h-5" />,
    preview: 'Planning → Risk Assessment → Fieldwork → Testing → Reporting → Follow-up',
    createTemplate: async (canvas) => {
      // Clear canvas and set professional background
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Add elegant title with better contrast and shadow
      await addTextToCanvas(canvas, 'AUDIT PROCESS WORKFLOW', {
        left: 500,
        top: 60,
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#000000',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        stroke: '#ffffff',
        strokeWidth: 4
      });

      await addTextToCanvas(canvas, 'Comprehensive Professional Audit Methodology Framework', {
        left: 500,
        top: 100,
        fontSize: 16,
        fill: '#64748b',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      });

      // Professional process steps with enhanced design and better text contrast
      const steps = [
        {
          text: 'PLANNING &\nPREPARATION',
          subtitle: 'Scope Definition\nResource Allocation\nRisk Planning',
          x: 80,
          color: '#3b82f6',
          textColor: '#ffffff',
          icon: '📋'
        },
        {
          text: 'RISK\nASSESSMENT',
          subtitle: 'Risk Identification\nControl Evaluation\nMateriality',
          x: 240,
          color: '#f59e0b',
          textColor: '#ffffff',
          icon: '⚠️'
        },
        {
          text: 'FIELDWORK &\nDATA COLLECTION',
          subtitle: 'Evidence Gathering\nDocumentation\nTesting',
          x: 400,
          color: '#10b981',
          textColor: '#ffffff',
          icon: '🔍'
        },
        {
          text: 'TESTING &\nVALIDATION',
          subtitle: 'Control Testing\nSubstantive Testing\nAnalytical Review',
          x: 560,
          color: '#8b5cf6',
          textColor: '#ffffff',
          icon: '✅'
        },
        {
          text: 'REPORTING &\nCOMMUNICATION',
          subtitle: 'Findings Report\nManagement Letter\nPresentation',
          x: 720,
          color: '#ef4444',
          textColor: '#ffffff',
          icon: '📊'
        },
        {
          text: 'FOLLOW-UP &\nMONITORING',
          subtitle: 'Action Plans\nProgress Tracking\nClosure',
          x: 880,
          color: '#06b6d4',
          textColor: '#ffffff',
          icon: '🔄'
        }
      ];

      // Create beautiful process boxes with enhanced shadows and gradients
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Main process box with enhanced styling
        await addShapeToCanvas(canvas, 'rectangle', {
          left: step.x,
          top: 180,
          width: 140,
          height: 120,
          fill: step.color,
          stroke: step.color,
          strokeWidth: 0,
          rx: 16,
          ry: 16,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.2)',
            blur: 12,
            offsetX: 0,
            offsetY: 6
          })
        });

        // Icon background circle with better contrast
        await addShapeToCanvas(canvas, 'circle', {
          left: step.x + 55,
          top: 155,
          radius: 22,
          fill: 'rgba(255,255,255,0.95)',
          stroke: step.color,
          strokeWidth: 3,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.1)',
            blur: 4,
            offsetX: 0,
            offsetY: 2
          })
        });

        // Step number with better visibility
        await addTextToCanvas(canvas, `${i + 1}`, {
          left: step.x + 70,
          top: 170,
          fontSize: 18,
          fontWeight: 'bold',
          fill: step.color,
          textAlign: 'center',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        });

        // Main text with enhanced readability - improved contrast
        await addTextToCanvas(canvas, step.text, {
          left: step.x + 70,
          top: 210,
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          stroke: '#000000',
          strokeWidth: 3,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.8)',
            blur: 3,
            offsetX: 1,
            offsetY: 1
          })
        });

        // Subtitle with better contrast - improved visibility
        await addTextToCanvas(canvas, step.subtitle, {
          left: step.x + 70,
          top: 250,
          fontSize: 10,
          fill: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          stroke: '#000000',
          strokeWidth: 2,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.8)',
            blur: 2,
            offsetX: 1,
            offsetY: 1
          })
        });

        // Enhanced connecting arrows
        if (i < steps.length - 1) {
          await addShapeToCanvas(canvas, 'arrow', {
            left: step.x + 150,
            top: 235,
            fill: '#64748b',
            stroke: '#64748b',
            strokeWidth: 2,
            scaleX: 0.8,
            scaleY: 0.8,
            shadow: new fabric.Shadow({
              color: 'rgba(0,0,0,0.1)',
              blur: 2,
              offsetX: 0,
              offsetY: 1
            })
          });
        }

        // Small delay for smooth rendering
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Add enhanced timeline at bottom
      await addShapeToCanvas(canvas, 'line', {
        left: 80,
        top: 340,
        x1: 0,
        y1: 0,
        x2: 920,
        y2: 0,
        stroke: '#e2e8f0',
        strokeWidth: 3,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 2,
          offsetX: 0,
          offsetY: 1
        })
      });

      await addTextToCanvas(canvas, 'AUDIT TIMELINE: 4-12 WEEKS DEPENDING ON SCOPE AND COMPLEXITY', {
        left: 500,
        top: 360,
        fontSize: 12,
        fontWeight: '600',
        fill: '#000000',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        stroke: '#ffffff',
        strokeWidth: 3
      });

      // Add professional footer
      await addTextToCanvas(canvas, 'Professional Audit Standards Compliant | Risk-Based Methodology', {
        left: 500,
        top: 380,
        fontSize: 10,
        fill: '#000000',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        stroke: '#ffffff',
        strokeWidth: 2
      });

      // Force canvas render
      canvas.renderAll();
    }
  },
  {
    id: 'risk-assessment',
    name: 'Enterprise Risk Assessment Matrix',
    description: 'Comprehensive risk management framework with heat map visualization',
    category: 'Risk',
    icon: <AlertTriangle className="w-5 h-5" />,
    preview: 'Risk Identification → Assessment → Heat Map → Mitigation → Monitoring',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = '#fafafa';

      // Title - repositioned lower
      await addTextToCanvas(canvas, 'ENTERPRISE RISK ASSESSMENT MATRIX', {
        left: 500,
        top: 80,
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#dc2626',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // Risk Heat Map Grid
              const riskLevels = [
          { label: 'CRITICAL', color: '#dc2626', y: 150 },
          { label: 'HIGH', color: '#ea580c', y: 190 },
          { label: 'MEDIUM', color: '#d97706', y: 230 },
          { label: 'LOW', color: '#65a30d', y: 270 },
          { label: 'MINIMAL', color: '#16a34a', y: 310 }
        ];

      const probability = ['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'CERTAIN'];

      // Create heat map grid
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const riskScore = (i + 1) * (j + 1);
          let cellColor = '#16a34a'; // Low risk

          if (riskScore >= 20) cellColor = '#dc2626'; // Critical
          else if (riskScore >= 15) cellColor = '#ea580c'; // High
          else if (riskScore >= 9) cellColor = '#d97706'; // Medium
          else if (riskScore >= 4) cellColor = '#65a30d'; // Low

          await addShapeToCanvas(canvas, 'rectangle', {
            left: 200 + (j * 80),
            top: 150 + (i * 40),
            width: 75,
            height: 35,
            fill: cellColor,
            stroke: 'white',
            strokeWidth: 2,
            opacity: 0.8,
            shadow: {
              color: 'rgba(0,0,0,0.1)',
              blur: 4,
              offsetX: 0,
              offsetY: 2
            }
          });

          await addTextToCanvas(canvas, riskScore.toString(), {
            left: 235 + (j * 80),
            top: 165 + (i * 40),
            fontSize: 14,
            fontWeight: 'bold',
            fill: 'white',
            textAlign: 'center'
          });
        }
      }

              // Impact labels (left side)
        for (let i = 0; i < 5; i++) {
          await addTextToCanvas(canvas, riskLevels[4-i].label, {
            left: 120,
            top: 165 + (i * 40),
            fontSize: 11,
            fontWeight: 'bold',
            fill: riskLevels[4-i].color,
            textAlign: 'center'
          });
        }

              // Probability labels (bottom)
        for (let j = 0; j < 5; j++) {
          await addTextToCanvas(canvas, probability[j], {
            left: 235 + (j * 80),
            top: 360,
            fontSize: 11,
            fontWeight: 'bold',
            fill: '#374151',
            textAlign: 'center'
          });
        }

      // Axis labels
      await addTextToCanvas(canvas, 'IMPACT', {
        left: 50,
        top: 180,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#374151',
        angle: -90
      });

      await addTextToCanvas(canvas, 'PROBABILITY', {
        left: 400,
        top: 340,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#374151',
        textAlign: 'center'
      });

      // Legend
      await addTextToCanvas(canvas, 'RISK LEGEND', {
        left: 700,
        top: 120,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#374151'
      });

      const legendItems = [
        { label: 'CRITICAL (20-25)', color: '#dc2626' },
        { label: 'HIGH (15-19)', color: '#ea580c' },
        { label: 'MEDIUM (9-14)', color: '#d97706' },
        { label: 'LOW (4-8)', color: '#65a30d' },
        { label: 'MINIMAL (1-3)', color: '#16a34a' }
      ];

      for (let i = 0; i < legendItems.length; i++) {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: 700,
          top: 150 + (i * 30),
          width: 20,
          height: 20,
          fill: legendItems[i].color,
          stroke: 'white',
          strokeWidth: 1
        });

        await addTextToCanvas(canvas, legendItems[i].label, {
          left: 730,
          top: 158 + (i * 30),
          fontSize: 12,
          fill: '#374151'
        });
      }

      canvas.renderAll();
    }
  },
  {
    id: 'compliance-check',
    name: 'SOX Compliance Framework',
    description: 'Sarbanes-Oxley compliance assessment and certification process',
    category: 'Compliance',
    icon: <CheckCircle className="w-5 h-5" />,
    preview: 'Scoping → Documentation → Testing → Deficiency Assessment → Certification',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = '#fafafa';

      // Title
      await addTextToCanvas(canvas, 'SOX COMPLIANCE FRAMEWORK', {
        left: 400,
        top: 80,
        fontSize: 24,
        fontWeight: 'bold',
        fill: '#1e40af',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'Section 404 Internal Controls Assessment', {
        left: 400,
        top: 110,
        fontSize: 14,
        fill: '#6b7280',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      const phases = [
        {
          title: 'SCOPING & PLANNING',
          details: 'Entity-Level Controls\nSignificant Accounts\nKey Business Processes',
          color: '#3b82f6',
          x: 80,
          y: 160
        },
        {
          title: 'DOCUMENTATION',
          details: 'Process Narratives\nFlowcharts\nRisk Control Matrices',
          color: '#8b5cf6',
          x: 280,
          y: 160
        },
        {
          title: 'TESTING',
          details: 'Design Effectiveness\nOperating Effectiveness\nSample Selection',
          color: '#10b981',
          x: 480,
          y: 160
        },
        {
          title: 'DEFICIENCY ASSESSMENT',
          details: 'Material Weaknesses\nSignificant Deficiencies\nRemediation Plans',
          color: '#f59e0b',
          x: 680,
          y: 160
        },
        {
          title: 'CERTIFICATION',
          details: 'Management Assessment\nAuditor Opinion\nDisclosure Controls',
          color: '#ef4444',
          x: 280,
          y: 320
        }
      ];

      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];

        // Main box
        await addShapeToCanvas(canvas, 'rectangle', {
          left: phase.x,
          top: phase.y,
          width: 160,
          height: 120,
          fill: phase.color,
          stroke: phase.color,
          strokeWidth: 0,
          rx: 8,
          ry: 8,
          shadow: {
            color: 'rgba(0,0,0,0.1)',
            blur: 6,
            offsetX: 0,
            offsetY: 3
          }
        });

        // Title
        await addTextToCanvas(canvas, phase.title, {
          left: phase.x + 80,
          top: phase.y + 20,
          fontSize: 12,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Details
        await addTextToCanvas(canvas, phase.details, {
          left: phase.x + 80,
          top: phase.y + 50,
          fontSize: 10,
          fill: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Arrows for flow
        if (i < 3) {
          await addShapeToCanvas(canvas, 'arrow', {
            left: phase.x + 170,
            top: phase.y + 60,
            fill: '#6b7280',
            stroke: '#6b7280',
            scaleX: 0.6,
            scaleY: 0.6
          });
        } else if (i === 3) {
          // Arrow down to certification
          await addShapeToCanvas(canvas, 'arrow', {
            left: phase.x + 80,
            top: phase.y + 130,
            fill: '#6b7280',
            stroke: '#6b7280',
            scaleX: 0.6,
            scaleY: 0.6,
            angle: 90
          });
        }
      }

      // Add compliance checklist
      await addTextToCanvas(canvas, 'KEY COMPLIANCE REQUIREMENTS', {
        left: 100,
        top: 480,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      const requirements = [
        '✓ Management Assessment of ICFR',
        '✓ External Auditor Attestation',
        '✓ Quarterly Certifications',
        '✓ Annual 10-K Disclosure'
      ];

      for (let i = 0; i < requirements.length; i++) {
        await addTextToCanvas(canvas, requirements[i], {
          left: 100,
          top: 510 + (i * 25),
          fontSize: 12,
          fill: '#059669',
          fontFamily: 'Inter, system-ui, sans-serif'
        });
      }

      canvas.renderAll();
    }
  },
  {
    id: 'control-testing',
    name: 'COSO Internal Controls Testing',
    description: 'Comprehensive COSO framework-based control testing methodology',
    category: 'Testing',
    icon: <Target className="w-5 h-5" />,
    preview: 'Control Identification → Risk Assessment → Test Design → Execution → Evaluation',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = '#f8fafc';

      // Title
      await addTextToCanvas(canvas, 'COSO INTERNAL CONTROLS TESTING', {
        left: 400,
        top: 80,
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#1e40af',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'Five Components Framework Assessment', {
        left: 400,
        top: 110,
        fontSize: 12,
        fill: '#6b7280',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // COSO Components
      const cosoComponents = [
        {
          name: 'CONTROL ENVIRONMENT',
          description: 'Tone at the Top\nIntegrity & Ethics\nBoard Oversight',
          color: '#3b82f6',
          x: 100,
          y: 160
        },
        {
          name: 'RISK ASSESSMENT',
          description: 'Risk Identification\nRisk Analysis\nFraud Consideration',
          color: '#8b5cf6',
          x: 320,
          y: 160
        },
        {
          name: 'CONTROL ACTIVITIES',
          description: 'Preventive Controls\nDetective Controls\nIT General Controls',
          color: '#10b981',
          x: 540,
          y: 160
        },
        {
          name: 'INFORMATION & COMMUNICATION',
          description: 'Relevant Information\nInternal Communication\nExternal Communication',
          color: '#f59e0b',
          x: 210,
          y: 300
        },
        {
          name: 'MONITORING ACTIVITIES',
          description: 'Ongoing Evaluations\nSeparate Evaluations\nReporting Deficiencies',
          color: '#ef4444',
          x: 430,
          y: 300
        }
      ];

      for (let i = 0; i < cosoComponents.length; i++) {
        const component = cosoComponents[i];

        // Component box
        await addShapeToCanvas(canvas, 'rectangle', {
          left: component.x,
          top: component.y,
          width: 180,
          height: 100,
          fill: component.color,
          stroke: component.color,
          strokeWidth: 0,
          rx: 10,
          ry: 10,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.12)',
            blur: 8,
            offsetX: 0,
            offsetY: 4
          })
        });

        // Component name
        await addTextToCanvas(canvas, component.name, {
          left: component.x + 90,
          top: component.y + 20,
          fontSize: 11,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Component description
        await addTextToCanvas(canvas, component.description, {
          left: component.x + 90,
          top: component.y + 45,
          fontSize: 9,
          fill: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });
      }

      // Testing methodology
      await addTextToCanvas(canvas, 'TESTING METHODOLOGY', {
        left: 100,
        top: 450,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      const testingSteps = [
        { step: '1', text: 'WALKTHROUGH PROCEDURES', detail: 'Understand process flow and identify key controls' },
        { step: '2', text: 'DESIGN EFFECTIVENESS', detail: 'Evaluate if controls are properly designed' },
        { step: '3', text: 'OPERATING EFFECTIVENESS', detail: 'Test if controls operated effectively throughout period' },
        { step: '4', text: 'DEFICIENCY EVALUATION', detail: 'Assess significance of identified deficiencies' }
      ];

      for (let i = 0; i < testingSteps.length; i++) {
        const step = testingSteps[i];
        const yPos = 480 + (i * 35);

        // Step number circle
        await addShapeToCanvas(canvas, 'circle', {
          left: 100,
          top: yPos,
          radius: 12,
          fill: '#1e40af',
          stroke: 'white',
          strokeWidth: 2
        });

        await addTextToCanvas(canvas, step.step, {
          left: 112,
          top: yPos + 8,
          fontSize: 10,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center'
        });

        // Step text
        await addTextToCanvas(canvas, step.text, {
          left: 140,
          top: yPos + 5,
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#374151',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        await addTextToCanvas(canvas, step.detail, {
          left: 140,
          top: yPos + 20,
          fontSize: 10,
          fill: '#6b7280',
          fontFamily: 'Inter, system-ui, sans-serif'
        });
      }

      canvas.renderAll();
    }
  },
  {
    id: 'audit-findings',
    name: 'Audit Findings Report',
    description: 'Template for documenting and categorizing audit findings',
    category: 'Reporting',
    icon: <FileText className="w-5 h-5" />,
    preview: 'Finding → Impact → Recommendation → Management Response',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = AUDIT_COLORS.background;

      // Header
      await addTextToCanvas(canvas, 'AUDIT FINDINGS REPORT', {
        left: 200,
        top: 50,
        fontSize: 24,
        fontWeight: 'bold',
        fill: AUDIT_COLORS.primary
      });

      // Finding categories
      const categories = [
        { text: 'HIGH RISK FINDINGS', color: AUDIT_COLORS.danger, y: 120 },
        { text: 'MEDIUM RISK FINDINGS', color: AUDIT_COLORS.warning, y: 200 },
        { text: 'LOW RISK FINDINGS', color: AUDIT_COLORS.secondary, y: 280 },
        { text: 'RECOMMENDATIONS', color: AUDIT_COLORS.primary, y: 360 }
      ];

      for (const category of categories) {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: 100,
          top: category.y,
          fill: category.color,
          width: 400,
          height: 50,
          rx: 8,
          ry: 8,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.1)',
            blur: 6,
            offsetX: 0,
            offsetY: 3
          })
        });
        await addTextToCanvas(canvas, category.text, {
          left: 120,
          top: category.y + 20,
          fontSize: 16,
          fontWeight: 'bold',
          fill: 'white'
        });
      }
    }
  },
  {
    id: 'process-map',
    name: 'Business Process Map',
    description: 'Visual representation of business processes for audit review',
    category: 'Process',
    icon: <Workflow className="w-5 h-5" />,
    preview: 'Input → Process → Decision → Output → Feedback',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = AUDIT_COLORS.background;

      // Process mapping elements with shadows
      await addShapeToCanvas(canvas, 'start-end', {
        left: 100,
        top: 150,
        fill: AUDIT_COLORS.secondary,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 6,
          offsetX: 0,
          offsetY: 3
        })
      });
      await addTextToCanvas(canvas, 'INPUT', { left: 130, top: 170, fontSize: 12, fontWeight: 'bold', fill: 'white' });

      await addShapeToCanvas(canvas, 'process', {
        left: 250,
        top: 150,
        fill: AUDIT_COLORS.primary,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 6,
          offsetX: 0,
          offsetY: 3
        })
      });
      await addTextToCanvas(canvas, 'PROCESS', { left: 270, top: 170, fontSize: 12, fontWeight: 'bold', fill: 'white' });

      await addShapeToCanvas(canvas, 'diamond', {
        left: 400,
        top: 150,
        fill: AUDIT_COLORS.warning,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 6,
          offsetX: 0,
          offsetY: 3
        })
      });
      await addTextToCanvas(canvas, 'DECISION', { left: 420, top: 180, fontSize: 10, fontWeight: 'bold', fill: 'white' });

      await addShapeToCanvas(canvas, 'start-end', {
        left: 550,
        top: 150,
        fill: AUDIT_COLORS.secondary,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 6,
          offsetX: 0,
          offsetY: 3
        })
      });
      await addTextToCanvas(canvas, 'OUTPUT', { left: 575, top: 170, fontSize: 12, fontWeight: 'bold', fill: 'white' });

      // Add connecting arrows
      for (let i = 0; i < 3; i++) {
        await addShapeToCanvas(canvas, 'arrow', {
          left: 200 + (i * 150),
          top: 190,
          fill: AUDIT_COLORS.neutral,
          scaleX: 0.5,
          scaleY: 0.5
        });
      }
    }
  },
  {
    id: 'org-chart',
    name: 'Executive Organizational Chart',
    description: 'Professional organizational hierarchy with modern design',
    category: 'Organization',
    icon: <Shield className="w-5 h-5" />,
    preview: 'CEO → VPs → Directors → Managers → Staff',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = '#f8fafc';

      // Title - repositioned lower
      await addTextToCanvas(canvas, 'ORGANIZATIONAL STRUCTURE', {
        left: 500,
        top: 80,
        fontSize: 26,
        fontWeight: 'bold',
        fill: '#1e40af',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // CEO Level - repositioned lower
      await addShapeToCanvas(canvas, 'rectangle', {
        left: 450,
        top: 130,
        width: 180,
        height: 80,
        fill: '#1e40af',
        stroke: '#1e40af',
        strokeWidth: 0,
        rx: 12,
        ry: 12,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 8,
          offsetX: 0,
          offsetY: 4
        })
      });

      await addTextToCanvas(canvas, 'CHIEF EXECUTIVE\nOFFICER', {
        left: 540,
        top: 160,
        fontSize: 14,
        fontWeight: 'bold',
        fill: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // VP Level
      const vpPositions = [
        { title: 'VP FINANCE\n& OPERATIONS', x: 200, color: '#059669' },
        { title: 'VP TECHNOLOGY\n& INNOVATION', x: 450, color: '#7c3aed' },
        { title: 'VP SALES\n& MARKETING', x: 700, color: '#dc2626' }
      ];

      vpPositions.forEach(async (vp, index) => {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: vp.x,
          top: 250,
          width: 160,
          height: 70,
          fill: vp.color,
          stroke: vp.color,
          strokeWidth: 0,
          rx: 10,
          ry: 10,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.1)',
            blur: 6,
            offsetX: 0,
            offsetY: 3
          })
        });

        await addTextToCanvas(canvas, vp.title, {
          left: vp.x + 80,
          top: 275,
          fontSize: 12,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Connection lines from CEO to VPs
        await addShapeToCanvas(canvas, 'line', {
          left: 540,
          top: 210,
          x1: 0,
          y1: 0,
          x2: vp.x + 80 - 540,
          y2: 40,
          stroke: '#6b7280',
          strokeWidth: 2
        });
      });

      // Director Level
      const directorPositions = [
        { title: 'FINANCE\nDIRECTOR', x: 120, parent: 0 },
        { title: 'AUDIT\nDIRECTOR', x: 280, parent: 0 },
        { title: 'IT\nDIRECTOR', x: 420, parent: 1 },
        { title: 'SECURITY\nDIRECTOR', x: 580, parent: 1 },
        { title: 'SALES\nDIRECTOR', x: 720, parent: 2 }
      ];

      directorPositions.forEach(async (director, index) => {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: director.x,
          top: 370,
          width: 120,
          height: 60,
          fill: '#6b7280',
          stroke: '#6b7280',
          strokeWidth: 0,
          rx: 8,
          ry: 8,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.1)',
            blur: 4,
            offsetX: 0,
            offsetY: 2
          })
        });

        await addTextToCanvas(canvas, director.title, {
          left: director.x + 60,
          top: 390,
          fontSize: 10,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Connection lines from VPs to Directors
        const parentVP = vpPositions[director.parent];
        await addShapeToCanvas(canvas, 'line', {
          left: parentVP.x + 80,
          top: 320,
          x1: 0,
          y1: 0,
          x2: director.x + 60 - (parentVP.x + 80),
          y2: 50,
          stroke: '#9ca3af',
          strokeWidth: 1.5
        });
      });

      // Add department labels
      await addTextToCanvas(canvas, 'EXECUTIVE LEVEL', {
        left: 100,
        top: 120,
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'VICE PRESIDENT LEVEL', {
        left: 100,
        top: 235,
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'DIRECTOR LEVEL', {
        left: 100,
        top: 350,
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#374151',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      canvas.renderAll();
    }
  },
  {
    id: 'circular-timeline',
    name: 'Circular Timeline Infographic',
    description: 'Professional circular timeline with monthly segments and icons',
    category: 'Infographic',
    icon: <BarChart3 className="w-5 h-5" />,
    preview: 'Circular 12-month timeline with professional design',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Title - repositioned to fit better
      await addTextToCanvas(canvas, 'ANNUAL AUDIT', {
        left: 100,
        top: 80,
        fontSize: 36,
        fontWeight: 'bold',
        fill: '#2d3748',
        textAlign: 'left',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'TIMELINE', {
        left: 100,
        top: 125,
        fontSize: 18,
        fill: '#718096',
        textAlign: 'left',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // Center circle - repositioned and resized to fit canvas
      const centerX = 500;
      const centerY = 350;
      const radius = 120;

      // Create 12 segments for months
      const months = [
        { name: 'JAN', color: '#3182ce', angle: 0 },
        { name: 'FEB', color: '#38b2ac', angle: 30 },
        { name: 'MAR', color: '#38a169', angle: 60 },
        { name: 'APR', color: '#68d391', angle: 90 },
        { name: 'MAY', color: '#ecc94b', angle: 120 },
        { name: 'JUN', color: '#ed8936', angle: 150 },
        { name: 'JUL', color: '#f56565', angle: 180 },
        { name: 'AUG', color: '#e53e3e', angle: 210 },
        { name: 'SEP', color: '#d53f8c', angle: 240 },
        { name: 'OCT', color: '#9f7aea', angle: 270 },
        { name: 'NOV', color: '#805ad5', angle: 300 },
        { name: 'DEC', color: '#553c9a', angle: 330 }
      ];

      // Create beautiful circular segments with proper shadows
      for (let i = 0; i < 12; i++) {
        const month = months[i];
        const startAngle = (month.angle - 15) * Math.PI / 180;
        const endAngle = (month.angle + 15) * Math.PI / 180;

        // Create segment path with proper circular shape
        const innerRadius = radius - 40;
        const x1 = centerX + innerRadius * Math.cos(startAngle);
        const y1 = centerY + innerRadius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(startAngle);
        const y2 = centerY + radius * Math.sin(startAngle);
        const x3 = centerX + radius * Math.cos(endAngle);
        const y3 = centerY + radius * Math.sin(endAngle);
        const x4 = centerX + innerRadius * Math.cos(endAngle);
        const y4 = centerY + innerRadius * Math.sin(endAngle);

        const pathString = `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

        const segment = new fabric.Path(pathString, {
          fill: month.color,
          stroke: 'white',
          strokeWidth: 2,
          left: 0,
          top: 0,
          selectable: true,
          evented: true,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.15)',
            blur: 6,
            offsetX: 0,
            offsetY: 3
          })
        });

        canvas.add(segment);

        // Add month label with better positioning
        const labelAngle = month.angle * Math.PI / 180;
        const labelRadius = radius - 20;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        await addTextToCanvas(canvas, month.name, {
          left: labelX - 15,
          top: labelY - 8,
          fontSize: 10,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Add number
        await addTextToCanvas(canvas, String(i + 1).padStart(2, '0'), {
          left: labelX - 10,
          top: labelY + 5,
          fontSize: 12,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });
      }

      // Center content with shadow
      await addShapeToCanvas(canvas, 'circle', {
        left: centerX - 60,
        top: centerY - 60,
        radius: 60,
        fill: '#f7fafc',
        stroke: '#e2e8f0',
        strokeWidth: 2,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 8,
          offsetX: 0,
          offsetY: 4
        })
      });

      await addTextToCanvas(canvas, 'AUDIT CYCLE', {
        left: centerX,
        top: centerY - 10,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#2d3748',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, '2024', {
        left: centerX,
        top: centerY + 10,
        fontSize: 20,
        fontWeight: 'bold',
        fill: '#4a5568',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // Add descriptions around the circle - repositioned to fit canvas
      const descriptions = [
        { text: 'Q1 Planning\n& Risk Assessment', x: 300, y: 200 },
        { text: 'Q2 Internal Controls\nTesting', x: 700, y: 200 },
        { text: 'Q3 Substantive\nProcedures', x: 700, y: 500 },
        { text: 'Q4 Reporting\n& Follow-up', x: 300, y: 500 }
      ];

      descriptions.forEach(async (desc) => {
        await addTextToCanvas(canvas, desc.text, {
          left: desc.x,
          top: desc.y,
          fontSize: 12,
          fill: '#4a5568',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });
      });

      canvas.renderAll();
    }
  },
  {
    id: 'business-infographic',
    name: 'Business Process Infographic',
    description: 'Colorful circular business process with segments and icons',
    category: 'Infographic',
    icon: <Workflow className="w-5 h-5" />,
    preview: 'Professional business process wheel with editable segments',
    createTemplate: async (canvas) => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Title - repositioned and resized
      await addTextToCanvas(canvas, 'BUSINESS', {
        left: 80,
        top: 40,
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#2d3748',
        textAlign: 'left',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'PROCESS', {
        left: 80,
        top: 80,
        fontSize: 16,
        fill: '#718096',
        textAlign: 'left',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      // Center circle - repositioned and resized to fit canvas
      const centerX = 450;
      const centerY = 300;
      const radius = 110;

      // Create 8 segments for business processes
      const processes = [
        { name: 'STRATEGY', color: '#3182ce', angle: 0, icon: '📋' },
        { name: 'PLANNING', color: '#38b2ac', angle: 45, icon: '📊' },
        { name: 'EXECUTION', color: '#38a169', angle: 90, icon: '⚡' },
        { name: 'MONITORING', color: '#68d391', angle: 135, icon: '👁️' },
        { name: 'ANALYSIS', color: '#ecc94b', angle: 180, icon: '📈' },
        { name: 'REPORTING', color: '#ed8936', angle: 225, icon: '📄' },
        { name: 'REVIEW', color: '#f56565', angle: 270, icon: '🔍' },
        { name: 'IMPROVE', color: '#e53e3e', angle: 315, icon: '🔄' }
      ];

      // Create beautiful circular segments with proper shadows
      for (let i = 0; i < 8; i++) {
        const process = processes[i];
        const startAngle = (process.angle - 22.5) * Math.PI / 180;
        const endAngle = (process.angle + 22.5) * Math.PI / 180;

        // Create segment path with proper circular shape
        const innerRadius = radius - 35;
        const x1 = centerX + innerRadius * Math.cos(startAngle);
        const y1 = centerY + innerRadius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(startAngle);
        const y2 = centerY + radius * Math.sin(startAngle);
        const x3 = centerX + radius * Math.cos(endAngle);
        const y3 = centerY + radius * Math.sin(endAngle);
        const x4 = centerX + innerRadius * Math.cos(endAngle);
        const y4 = centerY + innerRadius * Math.sin(endAngle);

        const pathString = `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

        const segment = new fabric.Path(pathString, {
          fill: process.color,
          stroke: 'white',
          strokeWidth: 2,
          left: 0,
          top: 0,
          selectable: true,
          evented: true,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.15)',
            blur: 6,
            offsetX: 0,
            offsetY: 3
          })
        });

        canvas.add(segment);

        // Add process label with better positioning
        const labelAngle = process.angle * Math.PI / 180;
        const labelRadius = radius - 18;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        await addTextToCanvas(canvas, process.name, {
          left: labelX - 20,
          top: labelY - 5,
          fontSize: 8,
          fontWeight: 'bold',
          fill: 'white',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        // Add external labels - repositioned to fit canvas better
        const outerLabelRadius = radius + 30;
        const outerLabelX = centerX + outerLabelRadius * Math.cos(labelAngle);
        const outerLabelY = centerY + outerLabelRadius * Math.sin(labelAngle);

        await addTextToCanvas(canvas, process.name, {
          left: outerLabelX - 25,
          top: outerLabelY - 8,
          fontSize: 11,
          fontWeight: 'bold',
          fill: process.color,
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });

        await addTextToCanvas(canvas, 'Process description\nand key activities', {
          left: outerLabelX - 35,
          top: outerLabelY + 8,
          fontSize: 8,
          fill: '#718096',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        });
      }

      // Center content with shadow
      await addShapeToCanvas(canvas, 'circle', {
        left: centerX - 50,
        top: centerY - 50,
        radius: 50,
        fill: '#f7fafc',
        stroke: '#e2e8f0',
        strokeWidth: 2,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 8,
          offsetX: 0,
          offsetY: 4
        })
      });

      await addTextToCanvas(canvas, 'CORE', {
        left: centerX,
        top: centerY - 15,
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#2d3748',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      await addTextToCanvas(canvas, 'BUSINESS', {
        left: centerX,
        top: centerY + 5,
        fontSize: 12,
        fill: '#4a5568',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      });

      canvas.renderAll();
    }
  }
];

const TemplatesPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  const categories = ['All', 'Audit', 'Risk', 'Compliance', 'Testing', 'Reporting', 'Process', 'Organization', 'Infographic'];

  const filteredTemplates = auditTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = async (template: Template) => {
    if (!canvas) {
      console.error('Canvas not available for template loading');
      return;
    }

    try {
      console.log('Loading template:', template.name);
      console.log('Canvas state:', {
        canvasExists: !!canvas,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        objectCount: canvas.getObjects()?.length || 0
      });

      await template.createTemplate(canvas);
      canvas.renderAll();
      console.log('Template loaded successfully');
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  return (
    <div style={{
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
      fontSize: '14px',
      lineHeight: 1.5,
      color: '#1f2937'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e293b',
            margin: '0',
            fontFamily: 'inherit'
          }}>
            Audit Templates
          </h4>
          <button
            onClick={() => setShowTemplateGallery(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            title="Open Template Gallery"
          >
            <Sparkles size={14} />
            Gallery
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{
        position: 'relative',
        marginBottom: '16px'
      }}>
        <Search style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          color: '#9ca3af'
        }} />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Categories */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '20px'
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600,
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              outline: 'none',
              userSelect: 'none' as const,
              backgroundColor: selectedCategory === category ? '#3b82f6' : 'white',
              borderColor: selectedCategory === category ? '#3b82f6' : '#e2e8f0',
              color: selectedCategory === category ? 'white' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#3b82f6';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  flexShrink: 0,
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6'
                }}>
                  {template.icon}
                </div>
                <div style={{
                  flex: 1,
                  minWidth: 0
                }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1f2937',
                    margin: '0 0 4px 0',
                    fontFamily: 'inherit'
                  }}>
                    {template.name}
                  </h5>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    fontFamily: 'inherit'
                  }}>
                    {template.description}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    margin: '0',
                    fontFamily: 'monospace',
                    lineHeight: 1.3
                  }}>
                    {template.preview}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    backgroundColor: '#f0f9ff',
                    color: '#0369a1',
                    fontFamily: 'inherit'
                  }}>
                    {template.category}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc'
          }}>
            <LayoutTemplate style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 12px auto',
              color: '#9ca3af'
            }} />
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 4px 0',
              fontFamily: 'inherit'
            }}>
              No templates found
            </p>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '0',
              fontFamily: 'inherit'
            }}>
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#eff6ff',
        fontSize: '12px'
      }}>
        <p style={{
          color: '#1f2937',
          margin: '0 0 8px 0',
          fontWeight: 600,
          fontFamily: 'inherit'
        }}>
          Tips:
        </p>
        <ul style={{
          color: '#6b7280',
          fontSize: '11px',
          margin: '0',
          paddingLeft: '16px',
          lineHeight: 1.4,
          fontFamily: 'inherit'
        }}>
          <li>Templates will replace current canvas content</li>
          <li>Customize templates after loading to fit your needs</li>
          <li>Use templates as starting points for complex diagrams</li>
        </ul>
      </div>

      {/* Template Gallery Modal */}
      <TemplateGallery
        visible={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
      />
    </div>
  );
};

export default TemplatesPanel;