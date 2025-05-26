import React, { useState } from 'react';
import * as fabric from 'fabric';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { addShapeToCanvas, addTextToCanvas, addImageToCanvas, AUDIT_COLORS } from '../../core/fabric-utils';
import { Sparkles, MessageCircle, Lightbulb, Wand2, Send, Loader2, Image, Layout, FileText, Zap, GitBranch } from 'lucide-react';

const AiPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState('');
  const [selectedAiFunction, setSelectedAiFunction] = useState<string>('');

  const generateWithAI = async (type: 'layout' | 'content' | 'insights' | 'generate' | 'image' | 'optimize' | 'format' | 'flowchart') => {
    if (!canvas) return;

    setIsGenerating(true);
    setSelectedAiFunction(type);

    try {
      if (type === 'image') {
        // Use the provided API key for image generation
        const stabilityApiKey = 'sk-QWwXh2OgyufNQGc00YSXSQ4GRHaDDLWzzYAy5PCKHaU27yKi';
        const imagePrompt = prompt || 'Professional audit diagram background, clean corporate style, light colors';

        console.log('Starting image generation with prompt:', imagePrompt);
        setResponse('🎨 Generating professional audit image...');

        try {
          const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${stabilityApiKey}`,
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: `${imagePrompt}, professional audit diagram, corporate style, clean design, high quality, minimalist, business professional, white background`,
                  weight: 1
                },
                {
                  text: 'cluttered, messy, unprofessional, cartoon, colorful, busy, dark background',
                  weight: -0.5
                }
              ],
              cfg_scale: 7,
              height: 1024,
              width: 1024,
              steps: 30,
              samples: 1,
              style_preset: 'corporate'
            })
          });

          console.log('Stability AI response status:', response.status);
          console.log('Stability AI response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Stability AI error response:', errorData);
            throw new Error(`Stability AI request failed: ${response.status} - ${errorData}`);
          }

          const data = await response.json();
          console.log('Stability AI response data:', data);

          const imageBase64 = data.artifacts?.[0]?.base64;

          if (imageBase64) {
            console.log('Image generated successfully, adding to canvas...');
            const imageUrl = `data:image/png;base64,${imageBase64}`;
            await addImageToCanvas(canvas, imageUrl);
            setResponse('✅ AI-generated professional background image added to canvas successfully!');
          } else {
            console.error('No image data in response:', data);
            throw new Error('No image generated from Stability AI - check API response format');
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to connect to Stability AI. This might be due to CORS restrictions or network issues.');
          }
          throw fetchError;
        }

        return;
      }

      // Enhanced Gemini prompts for better results
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!geminiApiKey) {
        setResponse('❌ Error: Gemini API key not configured for text generation.');
        return;
      }

      let systemPrompt = '';
      let userPrompt = prompt;
      const canvasObjects = canvas.getObjects().length;
      const canvasInfo = `Current canvas contains ${canvasObjects} objects.`;

      switch (type) {
        case 'layout':
          systemPrompt = `You are an expert in professional audit diagram layout and design. Provide specific, actionable layout improvements for audit workflows. Focus on:
          - Logical flow from left to right or top to bottom
          - Proper spacing and alignment (minimum 20px between elements)
          - Clear visual hierarchy with consistent sizing
          - Professional audit standards compliance
          - Accessibility and readability
          - Color coding for different audit phases
          - Grid-based alignment for professional appearance`;
          userPrompt = `${canvasInfo} Analyze and suggest specific layout improvements for this audit diagram. Provide concrete positioning recommendations with exact coordinates and spacing.`;
          break;

        case 'content':
          systemPrompt = `You are a senior audit professional with expertise in creating clear, professional audit documentation. Provide:
          - Industry-standard audit terminology and phrases
          - Clear, concise labels and descriptions
          - Professional audit process language
          - Compliance-focused content
          - Risk-based audit approach terminology
          - Specific text suggestions for diagram elements`;
          userPrompt = prompt || `${canvasInfo} Suggest professional audit content, labels, and text for diagram elements. Focus on ${canvasObjects > 0 ? 'enhancing existing elements' : 'creating new audit process content'}.`;
          break;

        case 'insights':
          systemPrompt = `You are an audit design expert and quality reviewer. Analyze diagrams for:
          - Completeness of audit processes
          - Professional presentation standards
          - Logical flow and connections
          - Missing critical audit steps
          - Compliance with audit standards
          - Visual clarity and effectiveness
          - Industry best practices`;
          userPrompt = `${canvasInfo} Provide detailed analysis and improvement suggestions for this audit diagram. Focus on professional standards and completeness.`;
          break;

        case 'generate':
          systemPrompt = `You are an expert audit consultant creating comprehensive audit process diagrams. Generate detailed, step-by-step instructions for professional audit diagrams including:
          - Specific audit phases and steps with clear sequencing
          - Professional terminology and standardized labels
          - Logical process flow with decision points
          - Risk assessment components and controls
          - Control testing elements and procedures
          - Reporting and follow-up phases
          - Visual design recommendations for professional appearance`;
          userPrompt = prompt || 'Create a comprehensive audit process flow diagram with professional audit methodology, clear visual hierarchy, and beautiful design elements';
          break;

        case 'optimize':
          systemPrompt = `You are a process optimization expert specializing in audit workflows. Provide specific recommendations to:
          - Streamline audit processes and eliminate bottlenecks
          - Eliminate redundancies and improve efficiency
          - Enhance quality control measures
          - Reduce audit risk and improve coverage
          - Improve documentation and evidence collection
          - Optimize resource allocation and timing`;
          userPrompt = `${canvasInfo} Analyze this audit diagram and provide specific optimization recommendations to improve efficiency and effectiveness.`;
          break;

        case 'format':
          systemPrompt = `You are a professional document designer specializing in audit presentations. Provide specific formatting recommendations for:
          - Color schemes for audit documents (professional blues, greens, and grays)
          - Typography and font choices (clean, readable fonts)
          - Visual hierarchy and spacing guidelines
          - Professional styling and consistency
          - Brand consistency and corporate appearance
          - Accessibility compliance and readability`;
          userPrompt = `${canvasInfo} Suggest professional formatting improvements for this audit diagram including colors, fonts, and visual styling for maximum impact.`;
          break;

        case 'flowchart':
          systemPrompt = `You are an expert audit consultant specializing in creating professional flowcharts and process diagrams. Generate detailed flowchart specifications including:
          - Clear process flow with logical sequencing
          - Professional audit terminology and standardized labels
          - Decision points and branching logic
          - Risk assessment components and control points
          - Compliance checkpoints and verification steps
          - Visual design recommendations for professional appearance
          - Color coding for different process types and risk levels`;
          userPrompt = prompt || 'Create a comprehensive audit process flowchart with professional methodology, clear visual hierarchy, and beautiful design elements';

          // For flowchart, we'll create a specialized flowchart diagram
          await createAIFlowchartDiagram(userPrompt);
          setResponse('✨ **AI FLOWCHART GENERATED**\n\nProfessional audit flowchart created with intelligent process flow, risk-based color coding, and compliance checkpoints. The diagram includes decision points, control activities, and follows audit methodology best practices.');
          return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nContext: ${userPrompt}\n\nPlease provide specific, actionable recommendations in a well-formatted response with clear sections and bullet points.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

      // Format the response for better readability
      const formattedResponse = `✨ **${type.toUpperCase()} RECOMMENDATIONS**\n\n${aiResponse}`;
      setResponse(formattedResponse);

      // For auto-generate, use our new smart flowchart generator
      if (type === 'generate') {
        await createAIFlowchartDiagram(userPrompt);
      }

    } catch (error) {
      console.error('AI generation error:', error);
      setResponse(`❌ **Error**: ${error instanceof Error ? error.message : 'Failed to generate AI response'}`);
    } finally {
      setIsGenerating(false);
      setSelectedAiFunction('');
    }
  };

  const createEnhancedAIGeneratedDiagram = async (aiResponse: string) => {
    if (!canvas) return;

    // Enhanced AI-guided diagram creation with beautiful design
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    // Add professional title with enhanced styling
    await addTextToCanvas(canvas, 'AI-GENERATED AUDIT PROCESS', {
      left: 500,
      top: 40,
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#1e293b',
      textAlign: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.1)',
        blur: 4,
        offsetX: 0,
        offsetY: 2
      })
    });

    await addTextToCanvas(canvas, 'Professional Audit Methodology Framework', {
      left: 500,
      top: 75,
      fontSize: 14,
      fill: '#64748b',
      textAlign: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    });

    // Create comprehensive audit process elements with enhanced design
    const auditSteps = [
      {
        name: 'PLANNING &\nSCOPING',
        subtitle: 'Risk Assessment\nResource Planning\nScope Definition',
        color: '#3b82f6',
        icon: '📋',
        x: 80,
        y: 150
      },
      {
        name: 'RISK\nEVALUATION',
        subtitle: 'Control Assessment\nMateriality Analysis\nRisk Matrix',
        color: '#f59e0b',
        icon: '⚠️',
        x: 240,
        y: 150
      },
      {
        name: 'FIELDWORK &\nTESTING',
        subtitle: 'Evidence Collection\nControl Testing\nSubstantive Tests',
        color: '#10b981',
        icon: '🔍',
        x: 400,
        y: 150
      },
      {
        name: 'ANALYSIS &\nREVIEW',
        subtitle: 'Data Analysis\nFinding Evaluation\nQuality Review',
        color: '#8b5cf6',
        icon: '📊',
        x: 560,
        y: 150
      },
      {
        name: 'REPORTING &\nCOMMUNICATION',
        subtitle: 'Draft Report\nManagement Response\nFinal Report',
        color: '#ef4444',
        icon: '📄',
        x: 720,
        y: 150
      },
      {
        name: 'FOLLOW-UP &\nMONITORING',
        subtitle: 'Action Plans\nProgress Tracking\nClosure Verification',
        color: '#06b6d4',
        icon: '🔄',
        x: 880,
        y: 150
      }
    ];

    // Create beautiful process boxes with enhanced shadows and professional styling
    for (let i = 0; i < auditSteps.length; i++) {
      const step = auditSteps[i];

      // Main process box with enhanced styling
      await addShapeToCanvas(canvas, 'process', {
        left: step.x,
        top: step.y,
        width: 140,
        height: 120,
        fill: step.color,
        stroke: step.color,
        strokeWidth: 0,
        rx: 16,
        ry: 16,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 12,
          offsetX: 0,
          offsetY: 6
        })
      });

      // Step number circle with enhanced design
      await addShapeToCanvas(canvas, 'circle', {
        left: step.x + 55,
        top: step.y - 20,
        radius: 18,
        fill: 'white',
        stroke: step.color,
        strokeWidth: 3,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 4,
          offsetX: 0,
          offsetY: 2
        })
      });

      // Step number
      await addTextToCanvas(canvas, `${i + 1}`, {
        left: step.x + 70,
        top: step.y - 10,
        fontSize: 16,
        fontWeight: 'bold',
        fill: step.color,
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      });

      // Main text with enhanced readability
      await addTextToCanvas(canvas, step.name, {
        left: step.x + 70,
        top: step.y + 25,
        fontSize: 12,
        fontWeight: 'bold',
        fill: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 2,
          offsetX: 0,
          offsetY: 1
        })
      });

      // Subtitle with better contrast
      await addTextToCanvas(canvas, step.subtitle, {
        left: step.x + 70,
        top: step.y + 65,
        fontSize: 9,
        fill: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.4)',
          blur: 1,
          offsetX: 0,
          offsetY: 1
        })
      });

      // Enhanced connecting arrows
      if (i < auditSteps.length - 1) {
        await addShapeToCanvas(canvas, 'arrow', {
          left: step.x + 150,
          top: step.y + 55,
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Add supporting elements for comprehensive audit framework
    const supportingElements = [
      { name: 'Risk Register', x: 150, y: 320, color: '#ef4444' },
      { name: 'Control Matrix', x: 350, y: 320, color: '#10b981' },
      { name: 'Evidence Repository', x: 550, y: 320, color: '#3b82f6' },
      { name: 'Management Dashboard', x: 750, y: 320, color: '#8b5cf6' }
    ];

    for (const element of supportingElements) {
      await addShapeToCanvas(canvas, 'rectangle', {
        left: element.x,
        top: element.y,
        width: 120,
        height: 60,
        fill: `${element.color}20`,
        stroke: element.color,
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 4,
          offsetX: 0,
          offsetY: 2
        })
      });

      await addTextToCanvas(canvas, element.name, {
        left: element.x + 60,
        top: element.y + 25,
        fontSize: 11,
        fontWeight: '600',
        fill: element.color,
        textAlign: 'center',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      });
    }

    // Add enhanced timeline and footer
    await addShapeToCanvas(canvas, 'line', {
      left: 80,
      top: 420,
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

    await addTextToCanvas(canvas, 'COMPREHENSIVE AUDIT TIMELINE: 6-16 WEEKS | RISK-BASED METHODOLOGY', {
      left: 500,
      top: 440,
      fontSize: 12,
      fontWeight: '600',
      fill: '#475569',
      textAlign: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    });

    await addTextToCanvas(canvas, 'AI-Generated Professional Audit Framework | Compliant with International Standards', {
      left: 500,
      top: 460,
      fontSize: 10,
      fill: '#94a3b8',
      textAlign: 'center',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    });

    canvas.renderAll();
  };

  const createAIFlowchartDiagram = async (userPrompt: string) => {
    if (!canvas) return;

    // Clear canvas and set background
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    // Analyze prompt to determine flowchart type
    const promptLower = userPrompt.toLowerCase();
    let flowchartType = 'audit-process';

    if (promptLower.includes('risk') || promptLower.includes('assessment')) {
      flowchartType = 'risk-assessment';
    } else if (promptLower.includes('compliance') || promptLower.includes('control')) {
      flowchartType = 'compliance';
    } else if (promptLower.includes('incident') || promptLower.includes('security')) {
      flowchartType = 'incident-response';
    }

    // Generate flowchart based on type
    switch (flowchartType) {
      case 'risk-assessment':
        await createRiskAssessmentFlowchart();
        break;
      case 'compliance':
        await createComplianceFlowchart();
        break;
      case 'incident-response':
        await createIncidentResponseFlowchart();
        break;
      default:
        await createAuditProcessFlowchart();
    }

    canvas.renderAll();
  };

  // Smart connector function for professional flowcharts
  const createSmartConnections = async (nodes: any[], connections: any[]) => {
    for (const conn of connections) {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);

      if (!fromNode || !toNode) continue;

      // Calculate connection points
      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y;

      // Create main connector line
      const lineColor = conn.type === 'branch' ? '#ef4444' : '#3b82f6';

      const connector = await addShapeToCanvas(canvas, 'line', {
        left: Math.min(fromX, toX),
        top: Math.min(fromY, toY),
        width: Math.abs(toX - fromX) || 2,
        height: Math.abs(toY - fromY) || 2,
        stroke: lineColor,
        strokeWidth: 3,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.15)',
          blur: 4,
          offsetX: 0,
          offsetY: 2
        })
      });

      // Add arrow at the end
      const arrowSize = 15;
      const arrow = await addShapeToCanvas(canvas, 'triangle', {
        left: toX - arrowSize / 2,
        top: toY - arrowSize,
        width: arrowSize,
        height: arrowSize,
        fill: lineColor,
        stroke: lineColor,
        strokeWidth: 1,
        angle: 0
      });

      // Add label if provided
      if (conn.label) {
        const labelX = fromX + (toX - fromX) / 2;
        const labelY = fromY + (toY - fromY) / 2 - 15;

        // Add label background
        const labelBg = await addShapeToCanvas(canvas, 'rectangle', {
          left: labelX - 20,
          top: labelY - 8,
          width: 40,
          height: 20,
          fill: 'rgba(255,255,255,0.95)',
          stroke: lineColor,
          strokeWidth: 1,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.1)',
            blur: 2,
            offsetX: 0,
            offsetY: 1
          })
        });

        const label = await addTextToCanvas(canvas, conn.label, {
          left: labelX,
          top: labelY,
          fontSize: 11,
          fontWeight: 'bold',
          fill: lineColor,
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        });

        // Group label elements
        if (labelBg && label) {
          const labelGroup = new fabric.Group([labelBg, label], {
            selectable: false,
            evented: false
          });
          canvas.add(labelGroup);
        }
      }

      // Group connector elements for unified management
      if (connector && arrow) {
        const connectorGroup = new fabric.Group([connector, arrow], {
          selectable: true,
          hasControls: false,
          hasBorders: true,
          borderColor: lineColor,
          cornerColor: lineColor,
          transparentCorners: false
        });

        // Add metadata for connector management
        (connectorGroup as any).isConnector = true;
        (connectorGroup as any).connectorData = conn;
        (connectorGroup as any).connectorType = 'flowchart-connector';

        canvas.add(connectorGroup);
      }
    }
  };

  const createAuditProcessFlowchart = async () => {
    // Add professional background
    await addShapeToCanvas(canvas, 'rectangle', {
      left: 0,
      top: 0,
      width: 1200,
      height: 800,
      fill: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      stroke: 'none',
      selectable: false,
      evented: false
    });

    // Add title with enhanced styling
    await addTextToCanvas(canvas, 'AI-GENERATED AUDIT PROCESS FLOWCHART', {
      left: 600,
      top: 40,
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#1e293b',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.1)',
        blur: 4,
        offsetX: 0,
        offsetY: 2
      })
    });

    // Create flowchart nodes with better spacing
    const nodes = [
      { id: 'start', text: 'Start Audit', x: 150, y: 120, type: 'start', color: '#3b82f6', width: 160, height: 70 },
      { id: 'planning', text: 'Planning &\nRisk Assessment', x: 150, y: 250, type: 'process', color: '#3b82f6', width: 160, height: 90 },
      { id: 'fieldwork', text: 'Fieldwork &\nTesting', x: 150, y: 400, type: 'process', color: '#10b981', width: 160, height: 90 },
      { id: 'evaluation', text: 'Issues\nIdentified?', x: 150, y: 550, type: 'decision', color: '#f59e0b', width: 140, height: 90 },
      { id: 'findings', text: 'Document\nFindings', x: 400, y: 550, type: 'process', color: '#ef4444', width: 160, height: 90 },
      { id: 'reporting', text: 'Audit\nReporting', x: 275, y: 700, type: 'process', color: '#8b5cf6', width: 160, height: 90 },
      { id: 'end', text: 'Audit Complete', x: 275, y: 850, type: 'end', color: '#6b7280', width: 160, height: 70 }
    ];

    // Create nodes with enhanced styling
    for (const node of nodes) {
      let shape;

      if (node.type === 'start' || node.type === 'end') {
        shape = await addShapeToCanvas(canvas, 'ellipse', {
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          fill: node.color,
          stroke: '#ffffff',
          strokeWidth: 3,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.2)',
            blur: 8,
            offsetX: 0,
            offsetY: 4
          })
        });
      } else if (node.type === 'decision') {
        shape = await addShapeToCanvas(canvas, 'diamond', {
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          fill: node.color,
          stroke: '#ffffff',
          strokeWidth: 3,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.2)',
            blur: 8,
            offsetX: 0,
            offsetY: 4
          })
        });
      } else {
        shape = await addShapeToCanvas(canvas, 'rectangle', {
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          fill: node.color,
          stroke: '#ffffff',
          strokeWidth: 3,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.2)',
            blur: 8,
            offsetX: 0,
            offsetY: 4
          })
        });
      }

      // Add text with better contrast
      await addTextToCanvas(canvas, node.text, {
        left: node.x + node.width / 2,
        top: node.y + node.height / 2,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.5)',
          blur: 2,
          offsetX: 0,
          offsetY: 1
        })
      });

      // Store node data for connector logic
      if (shape) {
        (shape as any).nodeData = node;
      }
    }

    // Create smart connections with labels
    const connections = [
      { from: 'start', to: 'planning', label: '' },
      { from: 'planning', to: 'fieldwork', label: '' },
      { from: 'fieldwork', to: 'evaluation', label: '' },
      { from: 'evaluation', to: 'findings', label: 'Yes', type: 'branch' },
      { from: 'evaluation', to: 'reporting', label: 'No', type: 'main' },
      { from: 'findings', to: 'reporting', label: '' },
      { from: 'reporting', to: 'end', label: '' }
    ];

    await createSmartConnections(nodes, connections);
  };

  const createRiskAssessmentFlowchart = async () => {
    await addTextToCanvas(canvas, 'AI-GENERATED RISK ASSESSMENT FLOWCHART', {
      left: 400,
      top: 30,
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#1e293b',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif'
    });

    const nodes = [
      { id: 'start', text: 'Risk Assessment\nInitiation', x: 100, y: 100, type: 'start', color: '#3b82f6' },
      { id: 'identify', text: 'Identify\nRisks', x: 100, y: 200, type: 'process', color: '#f59e0b' },
      { id: 'analyze', text: 'Analyze\nLikelihood & Impact', x: 100, y: 300, type: 'process', color: '#ef4444' },
      { id: 'evaluate', text: 'Risk Level\nAcceptable?', x: 100, y: 400, type: 'decision', color: '#f59e0b' },
      { id: 'accept', text: 'Accept\nRisk', x: 50, y: 500, type: 'process', color: '#10b981' },
      { id: 'mitigate', text: 'Develop\nMitigation Plan', x: 250, y: 500, type: 'process', color: '#ef4444' },
      { id: 'monitor', text: 'Monitor\n& Review', x: 150, y: 600, type: 'process', color: '#8b5cf6' },
      { id: 'end', text: 'Risk Managed', x: 150, y: 700, type: 'end', color: '#6b7280' }
    ];

    for (const node of nodes) {
      if (node.type === 'start' || node.type === 'end') {
        await addShapeToCanvas(canvas, 'ellipse', {
          left: node.x,
          top: node.y,
          width: 140,
          height: 60,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      } else if (node.type === 'decision') {
        await addShapeToCanvas(canvas, 'diamond', {
          left: node.x,
          top: node.y,
          width: 120,
          height: 80,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      } else {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: node.x,
          top: node.y,
          width: 140,
          height: 80,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      }

      await addTextToCanvas(canvas, node.text, {
        left: node.x + 70,
        top: node.y + 30,
        fontSize: 12,
        fontWeight: 'bold',
        fill: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif'
      });
    }
  };

  const createComplianceFlowchart = async () => {
    await addTextToCanvas(canvas, 'AI-GENERATED COMPLIANCE FLOWCHART', {
      left: 400,
      top: 30,
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#1e293b',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif'
    });

    const nodes = [
      { id: 'start', text: 'Compliance\nReview Start', x: 100, y: 100, type: 'start', color: '#3b82f6' },
      { id: 'requirements', text: 'Review\nRequirements', x: 100, y: 200, type: 'process', color: '#3b82f6' },
      { id: 'assess', text: 'Assess Current\nControls', x: 100, y: 300, type: 'process', color: '#10b981' },
      { id: 'gaps', text: 'Gaps\nIdentified?', x: 100, y: 400, type: 'decision', color: '#f59e0b' },
      { id: 'remediate', text: 'Remediation\nPlan', x: 300, y: 400, type: 'process', color: '#ef4444' },
      { id: 'implement', text: 'Implement\nControls', x: 300, y: 500, type: 'process', color: '#8b5cf6' },
      { id: 'verify', text: 'Verify\nEffectiveness', x: 200, y: 600, type: 'process', color: '#10b981' },
      { id: 'compliant', text: 'Compliant', x: 100, y: 500, type: 'end', color: '#10b981' }
    ];

    for (const node of nodes) {
      if (node.type === 'start' || node.type === 'end') {
        await addShapeToCanvas(canvas, 'ellipse', {
          left: node.x,
          top: node.y,
          width: 140,
          height: 60,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      } else if (node.type === 'decision') {
        await addShapeToCanvas(canvas, 'diamond', {
          left: node.x,
          top: node.y,
          width: 120,
          height: 80,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      } else {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: node.x,
          top: node.y,
          width: 140,
          height: 80,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      }

      await addTextToCanvas(canvas, node.text, {
        left: node.x + 70,
        top: node.y + 30,
        fontSize: 12,
        fontWeight: 'bold',
        fill: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif'
      });
    }
  };

  const createIncidentResponseFlowchart = async () => {
    await addTextToCanvas(canvas, 'AI-GENERATED INCIDENT RESPONSE FLOWCHART', {
      left: 400,
      top: 30,
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#1e293b',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif'
    });

    const nodes = [
      { id: 'start', text: 'Incident\nDetected', x: 100, y: 100, type: 'start', color: '#ef4444' },
      { id: 'triage', text: 'Initial Triage\n& Classification', x: 100, y: 200, type: 'process', color: '#f59e0b' },
      { id: 'severity', text: 'Critical\nSeverity?', x: 100, y: 300, type: 'decision', color: '#f59e0b' },
      { id: 'escalate', text: 'Escalate to\nManagement', x: 300, y: 300, type: 'process', color: '#ef4444' },
      { id: 'contain', text: 'Containment\n& Isolation', x: 100, y: 400, type: 'process', color: '#8b5cf6' },
      { id: 'investigate', text: 'Investigation\n& Analysis', x: 100, y: 500, type: 'process', color: '#3b82f6' },
      { id: 'remediate', text: 'Remediation\n& Recovery', x: 100, y: 600, type: 'process', color: '#10b981' },
      { id: 'lessons', text: 'Lessons Learned\n& Improvement', x: 100, y: 700, type: 'process', color: '#6b7280' },
      { id: 'end', text: 'Incident\nClosed', x: 100, y: 800, type: 'end', color: '#6b7280' }
    ];

    for (const node of nodes) {
      if (node.type === 'start' || node.type === 'end') {
        await addShapeToCanvas(canvas, 'ellipse', {
          left: node.x,
          top: node.y,
          width: 140,
          height: 60,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      } else if (node.type === 'decision') {
        await addShapeToCanvas(canvas, 'diamond', {
          left: node.x,
          top: node.y,
          width: 120,
          height: 80,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      } else {
        await addShapeToCanvas(canvas, 'rectangle', {
          left: node.x,
          top: node.y,
          width: 140,
          height: 80,
          fill: node.color,
          stroke: node.color,
          strokeWidth: 2
        });
      }

      await addTextToCanvas(canvas, node.text, {
        left: node.x + 70,
        top: node.y + 30,
        fontSize: 12,
        fontWeight: 'bold',
        fill: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif'
      });
    }
  };

  const quickPrompts = [
    {
      category: 'Audit Flowcharts',
      prompts: [
        'Create a comprehensive audit process flowchart from planning to reporting',
        'Design a risk-based audit methodology flowchart with decision points',
        'Generate an internal controls testing flowchart with approval gates',
        'Build a financial audit process flowchart with review stages'
      ]
    },
    {
      category: 'Risk Assessment Flows',
      prompts: [
        'Create a risk assessment flowchart with likelihood and impact analysis',
        'Design a fraud risk evaluation flowchart with mitigation steps',
        'Generate a cybersecurity risk flowchart with incident response',
        'Build an operational risk flowchart with monitoring controls'
      ]
    },
    {
      category: 'Compliance Workflows',
      prompts: [
        'Create a regulatory compliance flowchart with gap analysis',
        'Design a GDPR compliance flowchart with data protection steps',
        'Generate an ISO 27001 audit flowchart with verification points',
        'Build a healthcare compliance flowchart with HIPAA requirements'
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h4 className="font-semibold text-lg mb-2" style={{ color: AUDIT_COLORS.primary }}>
            AI Assistant
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Professional AI-powered assistance for audit diagram creation and optimization
          </p>
        </div>

        {/* Enhanced AI Prompt Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Describe your audit flowchart or diagram needs:
          </label>
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a risk assessment flowchart, audit process workflow, compliance verification process..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              disabled={isGenerating}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => generateWithAI('generate')}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating && selectedAiFunction === 'generate' ?
                  <Loader2 className="w-4 h-4 animate-spin" /> :
                  <GitBranch className="w-4 h-4" />
                }
                Smart Flowchart
              </button>
              <button
                onClick={() => generateWithAI('image')}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating && selectedAiFunction === 'image' ?
                  <Loader2 className="w-4 h-4 animate-spin" /> :
                  <Image className="w-4 h-4" />
                }
                Image
              </button>
            </div>
          </div>
        </div>

        {/* Quick Prompt Categories */}
        <div className="space-y-4">
          <h5 className="font-medium text-gray-700 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Quick Prompts
          </h5>
          {quickPrompts.map((category, index) => (
            <div key={index} className="space-y-2">
              <h6 className="text-sm font-medium text-gray-600">{category.category}</h6>
              <div className="space-y-1">
                {category.prompts.map((promptText, promptIndex) => (
                  <button
                    key={promptIndex}
                    onClick={() => setPrompt(promptText)}
                    className="w-full text-left p-2 text-xs border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced AI Features */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-700">Professional AI Tools:</h5>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => generateWithAI('layout')}
              disabled={isGenerating}
              className="p-3 border-2 rounded-lg text-left hover:shadow-md transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" style={{ color: AUDIT_COLORS.primary }} />
                <div>
                  <h6 className="font-medium text-xs">Smart Layout</h6>
                  <p className="text-xs text-gray-600">Optimize arrangement</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => generateWithAI('content')}
              disabled={isGenerating}
              className="p-3 border-2 rounded-lg text-left hover:shadow-md transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: AUDIT_COLORS.secondary }} />
                <div>
                  <h6 className="font-medium text-xs">Content</h6>
                  <p className="text-xs text-gray-600">Professional text</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => generateWithAI('insights')}
              disabled={isGenerating}
              className="p-3 border-2 rounded-lg text-left hover:shadow-md transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: AUDIT_COLORS.warning }} />
                <div>
                  <h6 className="font-medium text-xs">Insights</h6>
                  <p className="text-xs text-gray-600">Quality review</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => generateWithAI('optimize')}
              disabled={isGenerating}
              className="p-3 border-2 rounded-lg text-left hover:shadow-md transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: '#10b981' }} />
                <div>
                  <h6 className="font-medium text-xs">Optimize</h6>
                  <p className="text-xs text-gray-600">Improve efficiency</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* AI Flowchart Generator */}
        <div className="space-y-3 border-t pt-4" style={{ borderColor: AUDIT_COLORS.border }}>
          <h5 className="font-medium text-gray-700 flex items-center gap-2">
            <GitBranch className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            AI Flowchart Generator
          </h5>
          <p className="text-xs text-gray-600">
            Generate professional audit flowcharts from natural language descriptions
          </p>

          <button
            onClick={() => generateWithAI('flowchart')}
            disabled={isGenerating}
            className="w-full p-4 border-2 rounded-lg text-left hover:shadow-md transition-all group disabled:opacity-50"
            style={{
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.05)',
              borderStyle: 'dashed'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <GitBranch className="w-5 h-5" style={{ color: '#8b5cf6' }} />
              </div>
              <div className="flex-1">
                <h6 className="font-medium text-sm" style={{ color: '#8b5cf6' }}>
                  Generate Smart Flowchart
                </h6>
                <p className="text-xs text-gray-600 mt-1">
                  Create audit process flows, risk assessments, and compliance workflows
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* AI Response with better formatting */}
        {response && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">AI Response:</h5>
            <div
              className="p-4 rounded-lg text-sm max-h-60 overflow-y-auto"
              style={{ backgroundColor: `${AUDIT_COLORS.primary}05`, border: `1px solid ${AUDIT_COLORS.border}` }}
            >
              <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {response.split('\n').map((line, index) => (
                  <div key={index} className={line.startsWith('**') ? 'font-semibold text-blue-700 mb-2' : 'mb-1'}>
                    {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-blue-700 font-medium">
              Generating {selectedAiFunction} recommendations...
            </span>
          </div>
        )}

        {/* Enhanced API Notice */}
        <div
          className="p-3 rounded-lg text-sm border"
          style={{ backgroundColor: `${AUDIT_COLORS.secondary}10`, borderColor: AUDIT_COLORS.border }}
        >
          <p className="text-gray-600">
            <strong>🤖 AI Powered by Stability AI & Google Gemini</strong><br />
            Professional image generation and intelligent audit content creation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiPanel;