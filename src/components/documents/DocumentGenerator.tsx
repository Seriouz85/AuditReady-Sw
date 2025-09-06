import React from 'react';
import DocumentFormatter from "./DocumentFormatter";
// import ProfessionalEditor from "./ProfessionalEditor";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Switch,
  FormControlLabel,
  Avatar,
  // Remove unused imports
  // Grid,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
  // Snackbar,
  // Alert
} from '@mui/material';

import {
  Description as DescriptionIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Warning as WarningIcon,
  Brush as BrushIcon,
  AutoAwesome as AIIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// Import docx and file-saver
import { Document, Paragraph, Packer, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Custom CSS for handling text overflow
const customStyles = {
  wordBreak: 'break-word' as const,
  overflowWrap: 'break-word' as const,
  maxWidth: '100%'
};

type DocumentType = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  initialQuestions: string[];
};

type Message = {
  id: string;
  type: 'ai' | 'user' | 'system';
  content: string;
  thinking?: boolean;
};

type DocumentGeneratorProps = {
  apiKey: string;
};

const documentTypes: DocumentType[] = [
  {
    id: 'security-policy',
    name: 'Information Security Policy',
    description: 'Create a comprehensive security policy document that outlines organization-wide security practices',
    icon: <DescriptionIcon />,
    initialQuestions: [
      'What is your organization type (e.g., healthcare, finance, tech startup)?',
      'What are your primary security concerns (e.g., data breaches, compliance, insider threats)?',
      'Do you have any specific compliance requirements (e.g., GDPR, HIPAA, ISO 27001)?'
    ]
  },
  {
    id: 'incident-response',
    name: 'Incident Response Plan',
    description: 'Generate a structured plan for responding to security incidents and breaches',
    icon: <DescriptionIcon />,
    initialQuestions: [
      'What types of security incidents are most concerning for your organization?',
      'Who are the key stakeholders that should be involved in incident response?',
      'Do you have any existing incident classification system?'
    ]
  },
  {
    id: 'risk-assessment',
    name: 'Security Risk Assessment',
    description: 'Create a template for assessing and documenting security risks across your organization',
    icon: <DescriptionIcon />,
    initialQuestions: [
      'What assets are most critical to protect in your organization?',
      'What threat actors are most concerning for your industry?',
      'Do you have any existing risk management framework?'
    ]
  },
  {
    id: 'system-security-plan',
    name: 'System Security Plan',
    description: 'Document the security controls and configurations for a specific system or application',
    icon: <DescriptionIcon />,
    initialQuestions: [
      'What type of system are you documenting (e.g., cloud service, internal application, network)?',
      'What data classification levels will this system handle?',
      'What are the primary security controls already in place?'
    ]
  },
  {
    id: 'process',
    name: 'Security Process Documentation',
    description: 'Create detailed documentation for security processes with steps, roles, and responsibilities',
    icon: <DescriptionIcon />,
    initialQuestions: [
      'What specific security process do you need documented? Type the EXACT name of the process (e.g., "Identity and Access Management", "Vulnerability Management", etc.)',
      'Who are the key stakeholders involved in this specific process?',
      'What is the main objective of this security process?'
    ]
  },
  {
    id: 'action-plan',
    name: 'Security Action Plan',
    description: 'Generate a detailed security action plan with tasks, owners, and timelines',
    icon: <DescriptionIcon />,
    initialQuestions: [
      'What security issue or initiative does this action plan address?',
      'What is the target completion timeframe?',
      'Who are the key stakeholders responsible for implementation?'
    ]
  },
  {
    id: 'create-custom',
    name: 'AR Editor (Legacy)',
    description: 'Create professional diagrams with our AuditReady Editor - featuring 14+ diagram types, modern design, audit-specific themes, and AI-powered workflow creation',
    icon: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><BrushIcon /><AIIcon sx={{ fontSize: '0.9em' }} /></Box>,
    initialQuestions: [
      'What type of diagram would you like to create? (Flowchart, Sequence, Gantt, etc.)',
      'Would you prefer to start with a template or write Mermaid syntax?',
      'What is the primary purpose of this diagram?'
    ]
  },
  {
    id: 'enterprise-ar-editor',
    name: '🚀 Enterprise AR Editor',
    description: 'NEW! Jaw-dropping AI-powered enterprise diagram editor with 50+ templates, real-time collaboration, stunning animations, and professional themes. Transformed from F- to A+ level!',
    icon: <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative' }}>
      <BrushIcon sx={{ color: 'primary.main' }} />
      <AIIcon sx={{ fontSize: '0.9em', color: 'secondary.main' }} />
      <Box sx={{ position: 'absolute', top: -6, right: -6, bgcolor: 'error.main', color: 'white', fontSize: '0.6rem', px: 0.5, py: 0.2, borderRadius: '50%', fontWeight: 'bold' }}>NEW</Box>
    </Box>,
    initialQuestions: [
      'This will launch the new Enterprise AR Editor!',
      'Experience the stunning transformation from our previous editor',
      'Features: AI Intelligence, 50+ Templates, Real-time Collaboration'
    ]
  }
];

const DocumentGenerator = ({ apiKey }: DocumentGeneratorProps) => {
  // State for document generation
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [isTypeSelected, setIsTypeSelected] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState<string>('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [userInput, setUserInput] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [autoGenerateEnabled, setAutoGenerateEnabled] = React.useState(true);

  // Add state for graphical editor
  // const [showGraphicalEditor, setShowGraphicalEditor] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const selectedDocType = documentTypes.find(t => t.id === selectedType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle document type selection
  const handleTypeSelection = () => {
    if (!selectedType) return;

    // If it's the graphical editor option, open the standalone editor in a new window
    if (selectedType === 'create-custom') {
      window.open('/editor', '_blank');
      // Reset the selected type to prevent further processing
      setSelectedType('');
      return;
    }

    // If it's the new Enterprise AR Editor, open the AR Editor Showcase
    if (selectedType === 'enterprise-ar-editor') {
      window.open('/ar-editor-showcase', '_blank');
      // Reset the selected type to prevent further processing
      setSelectedType('');
      return;
    }

    // For all other document types, proceed normally
    setIsTypeSelected(true);
    setMessages([
      {
        id: '1',
        type: 'system',
        content: `Starting ${selectedDocType?.name} generation process...`
      },
      {
        id: '2',
        type: 'ai',
        content: "Hello! I'll help you create your document. Let's start with the first question:"
      },
      {
        id: '3',
        type: 'ai',
        content: selectedDocType?.initialQuestions[0] || ''
      }
    ]);
    setCurrentQuestion(selectedDocType?.initialQuestions[0] || '');
  };

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

      const testBody = {
        model: 'microsoft/wizardlm-2-8x22b:nitro',
        messages: [{
          role: 'user',
          content: "Hello, this is a test message. Please respond with 'OK' if you receive this."
        }],
        temperature: 0.7,
        max_tokens: 50
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Audit Readiness Hub'
        },
        body: JSON.stringify(testBody)
      });

      console.log('Test response status:', response.status);
      const responseText = await response.text();
      console.log('Test response:', responseText);

      if (!response.ok) {
        try {
          const errorJson = JSON.parse(responseText);
          console.error('API Error:', errorJson);
          throw new Error(errorJson.error?.message || 'API request failed');
        } catch (e) {
          throw new Error(`API request failed with status ${response.status}: ${responseText}`);
        }
      }

      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  };

  // Add API test on component mount
  React.useEffect(() => {
    testApiConnection().then(isConnected => {
      if (!isConnected) {
        setMessages([{
          id: '1',
          type: 'system',
          content: 'Warning: Unable to connect to AI service. Please check your API key and internet connection.'
        }]);
      }
    });
  }, [apiKey]);

  // New function to determine if we should auto-generate the document
  const shouldAutoGenerateDocument = (messageHistory: Message[]) => {
    // Get only user messages
    const userMessages = messageHistory.filter(m => m.type === 'user');

    // Auto-generate after first user response if enabled
    return autoGenerateEnabled && userMessages.length > 0;
  };

  // Modified handleUserInput to trigger document generation
  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    
    setIsGenerating(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput
    };

    // Update messages with user input
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setUserInput('');

    // Simulate AI thinking
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      thinking: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      console.log('Making API request to AI service...');
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      console.log('Request URL:', apiUrl);

      let promptText = `You are an expert in IT security and information security documentation.

You are helping create a "${selectedDocType?.name}" document.

Previous question: "${currentQuestion}"
User's answer: "${userInput}"

Based on this answer and the document type, ask only ONE follow-up question that would provide the most crucial information needed for the document. If you have enough information already, instead provide a short summary of what you'll include in the document and ask if there's anything specific they want to add.

Be concise, professional, and focused. Remember that the goal is to create a high-quality security document with minimal back-and-forth.`;

      // Add specific instructions for process documentation
      if (selectedDocType?.id === 'process') {
        // Extract process name from the conversation if this is the first question
        let processName = userInput;
        if (currentQuestion.includes("What specific security process")) {
          processName = userInput.trim();
          // Store the process name in a variable for future use
          sessionStorage.setItem('documentProcessName', processName);
        } else {
          // Retrieve the process name if it was stored previously
          const storedProcessName = sessionStorage.getItem('documentProcessName');
          if (storedProcessName) {
            processName = storedProcessName;
          }
        }

        promptText = `You are an expert in IT security and information security documentation.

PROCESS NAME: "${processName}"

You are creating documentation SPECIFICALLY for the "${processName}" process, and ONLY this process.

Previous question: "${currentQuestion}"
User's answer: "${userInput}"

CRITICAL INSTRUCTIONS:
1. You are documenting the "${processName}" process ONLY
2. Do NOT switch to any other process type
3. Do NOT create documentation for "Incident Response" or any other process unless the user EXPLICITLY requested "${processName}" as "Incident Response"
4. Stay focused ONLY on "${processName}" throughout the entire conversation

Based on this answer, ask only ONE follow-up question that would provide crucial information needed for documenting the "${processName}" process. If you have enough information already, provide a short summary of what you'll include in the "${processName}" process document and ask if there's anything specific they want to add.

Be concise, professional, and focused.`;
      }

      const requestBody = {
        model: 'microsoft/wizardlm-2-8x22b:nitro',
        messages: [{
          role: 'user',
          content: promptText
        }],
        temperature: 0.7,
        max_tokens: 4000
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Audit Readiness Hub'
        },
        body: JSON.stringify(requestBody)
      });

      // Fix for handling headers - ensure it works in all browsers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error?.message || 'API request failed');
        } catch (e) {
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      const aiResponse = data.choices?.[0]?.message?.content ||
                         data.message?.content ||
                         data.text;

      if (!aiResponse) {
        throw new Error('No valid response from AI');
      }

      // Remove thinking message and add AI response
      setMessages(prev => [
        ...prev.filter(m => !m.thinking),
        {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: aiResponse
        }
      ]);

      setCurrentQuestion(aiResponse);

      // Determine if we should auto-generate the document
      if (shouldAutoGenerateDocument(updatedMessages)) {
        // Add small delay to ensure AI response is processed first
        setTimeout(() => {
          if (!isGenerating) {
            generateFinalDocument();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Please check your internet connection and ensure the API key is correct';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessages(prev => [
        ...prev.filter(m => !m.thinking),
        {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: `Error: ${errorMessage}. Please try again.`
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Modified document generator function to update version number
  const generateFinalDocument = async () => {
    setIsGenerating(true);
    try {
      const conversationContext = messages
        .filter(m => !m.thinking)
        .map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n');

      console.log('Generating final document...');
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      console.log('Request URL:', apiUrl);

      let promptText = `You are an expert in IT security and information security documentation. Create a professional "${selectedDocType?.name}" based on the conversation below.

CONVERSATION:
${conversationContext}

IMPORTANT GUIDELINES:
1. Format as a professional document with version 1.0, clear headers, and logical document flow
2. Use clear, professional, and simple language
3. Include all standard sections expected in this type of security document, even if not explicitly discussed
4. For any missing information, use placeholder text marked as "TBA-[TOPIC]" rather than omitting sections
5. Be thorough but concise - include all necessary information without unnecessary length
6. Focus on creating a strong template that meets industry best practices for IT/information security
7. Include an executive summary at the beginning
8. Include document metadata (version, date, owner, etc.) at the top
9. End with appendices as appropriate for this document type

FORMATTING REQUIREMENTS:
1. Use clean, numbered headers (1, 1.1, 1.1.1) instead of hash symbols (#)
2. For bullet points, use ONLY dash (-) at the start of each point. NEVER use asterisks (*), stars, or any other symbols
3. Ensure proper indentation and consistent spacing between sections
4. Use ALL CAPS for main section titles
5. Use Title Case for subsection titles
6. Add a blank line between paragraphs and sections for readability
7. Keep line lengths reasonable - avoid extremely long paragraphs
8. For lists, use consistent formatting throughout
9. NEVER use asterisk (*) symbols anywhere in the document - they are completely forbidden

CRITICAL: Output ONLY the final document content. Do NOT include any hypothetical user responses, explanations of what you're doing, or anything outside the actual document content. Start directly with the document title and metadata.

Create the complete document now, formatted for immediate use by the organization.`;

      // Add specific instructions for process documentation
      if (selectedDocType?.id === 'process') {
        // Extract process name from the conversation
        let processName = "specified security process";

        // First check if we have it in session storage
        const storedProcessName = sessionStorage.getItem('documentProcessName');
        if (storedProcessName) {
          processName = storedProcessName;
        } else {
          // Try to extract from first user message that answers the first question
          const firstQuestion = documentTypes.find(t => t.id === 'process')?.initialQuestions[0] || '';
          const firstAnswer = messages.find(m =>
            m.type === 'user' &&
            messages[messages.indexOf(m) - 1]?.content?.includes(firstQuestion)
          );

          if (firstAnswer) {
            processName = firstAnswer.content.trim();
            sessionStorage.setItem('documentProcessName', processName);
          }
        }

        promptText = `You are an expert in IT security and information security documentation.

PROCESS NAME: "${processName}"

You must create a professional Security Process Documentation SPECIFICALLY for the "${processName}" process based on the conversation below.

CONVERSATION:
${conversationContext}

CRITICAL INSTRUCTIONS:
1. You are documenting the "${processName}" process ONLY
2. The document title MUST be "${processName} Process"
3. Every section MUST relate specifically to "${processName}"
4. Do NOT create documentation for "Incident Response" or any other process unless "${processName}" is literally "Incident Response"
5. If the process is "IAM" or "Identity and Access Management", focus ONLY on identity and access management procedures
6. Stay focused ONLY on "${processName}" throughout the entire document

DOCUMENT STRUCTURE:
1. Document title: "${processName} Process"
2. Document metadata (version 1.0, date, owner, etc.)
3. Executive summary of the "${processName}" process
4. Scope and objectives specific to "${processName}"
5. "${processName}" process owner and stakeholders
6. Detailed "${processName}" process steps
7. Roles and responsibilities within the "${processName}" process
8. Inputs and outputs of the "${processName}" process
9. "${processName}" metrics and measurements
10. Related "${processName}" policies and references
11. Appendices as needed for "${processName}"

FORMATTING REQUIREMENTS:
1. Use clean, numbered headers (1, 1.1, 1.1.1) instead of hash symbols (#)
2. For bullet points, use ONLY dash (-) at the start of each point. NEVER use asterisks (*), stars, or any other symbols
3. Ensure proper indentation and consistent spacing between sections
4. Use ALL CAPS for main section titles
5. Use Title Case for subsection titles
6. Add a blank line between paragraphs and sections for readability
7. Keep line lengths reasonable - avoid extremely long paragraphs
8. For lists, use consistent formatting throughout
9. NEVER use asterisk (*) symbols anywhere in the document - they are completely forbidden

CRITICAL: Output ONLY the final document content. Start directly with the document title and metadata. Do NOT switch to a different process type.

Create the complete "${processName}" process document now, formatted for immediate use by the organization.`;
      }

      const requestBody = {
        model: 'microsoft/wizardlm-2-8x22b:nitro',
        messages: [{
          role: 'user',
          content: promptText
        }],
        temperature: 0.7,
        max_tokens: 4000
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Audit Readiness Hub'
        },
        body: JSON.stringify(requestBody)
      });

      // Fix for handling headers - ensure it works in all browsers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error?.message || 'API request failed');
        } catch (e) {
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      const documentContent = data.choices?.[0]?.message?.content ||
                             data.message?.content ||
                             data.text ||
                             '';

      if (!documentContent) {
        throw new Error('No valid document content received from AI');
      }

      setGeneratedContent(documentContent);

      // Only show the success message if it's a manual generation
      if (!autoGenerateEnabled) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'system',
            content: 'Document successfully generated! You can now download it.'
          }
        ]);
      }

    } catch (error) {
      console.error('Detailed error:', error);
      let errorMessage = 'An unexpected error occurred';

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Please check your internet connection and ensure the API key is correct';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setGeneratedContent(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = async () => {
    if (!generatedContent || !selectedDocType) return;

    try {
      // Show loading state
      setIsGenerating(true);

      // Parse content into sections for docx conversion
      const lines = generatedContent.split('\n');
      const docxContent: any[] = [];

      // Process line by line for docx format
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Check for title (usually first non-empty line)
        if (i === lines.findIndex(l => l.trim())) {
          docxContent.push(
            new Paragraph({
              text: line,
              heading: HeadingLevel.TITLE,
              thematicBreak: true
            })
          );
          continue;
        }

        // Check for metadata (Version, Date, etc.)
        if (line.match(/^(Version|Date|Author|Document Owner|Status|Classification|Owner|Reviewer|Approval):/i)) {
          const parts = line.split(':');
          if (parts.length > 1) {
            docxContent.push(
              new Paragraph({
                children: [
                  new TextRun({ text: parts[0] + ':', bold: true }),
                  new TextRun({ text: parts.slice(1).join(':') })
                ]
              })
            );
          } else {
            docxContent.push(new Paragraph({ text: line }));
          }
          continue;
        }

        // Check for section headers
        if (
          line.match(/^\d+(\.\d+)*\s/) || // Numbered headers like "1. " or "1.1 "
          line.toUpperCase() === line && line.length > 3 // ALL CAPS headers
        ) {
          // Determine heading level
          let headingLevelValue;
          if (line.match(/^\d+\s/)) headingLevelValue = HeadingLevel.HEADING_1;
          else if (line.match(/^\d+\.\d+\s/)) headingLevelValue = HeadingLevel.HEADING_2;
          else if (line.match(/^\d+\.\d+\.\d+\s/)) headingLevelValue = HeadingLevel.HEADING_3;
          else if (line.toUpperCase() === line && line.length > 3) headingLevelValue = HeadingLevel.HEADING_1;
          else headingLevelValue = HeadingLevel.HEADING_1;

          docxContent.push(
            new Paragraph({
              text: line,
              heading: headingLevelValue,
              spacing: {
                before: 200,
                after: 80
              }
            })
          );
          continue;
        }

        // Check for bullet points
        if (line.match(/^[\*\-•]\s/)) {
          docxContent.push(
            new Paragraph({
              text: line.replace(/^[\*\-•]\s/, ''),
              bullet: {
                level: 0
              }
            })
          );
          continue;
        }

        // Regular paragraph
        docxContent.push(new Paragraph({ text: line }));
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxContent
          }
        ]
      });

      // Generate DOCX file
      const fileName = `${selectedDocType?.name?.toLowerCase().replace(/\s+/g, '-') || 'document'}.docx`;

      // Use Packer to generate the DOCX file
      const blob = await Packer.toBlob(doc);
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error generating DOCX:', error);
      // Fallback to text download if docx generation fails
      const blob = new Blob([generatedContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDocType?.name?.toLowerCase().replace(/\s+/g, '-') || 'document'}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGenerator = () => {
    setIsTypeSelected(false);
    setSelectedType('');
    setMessages([]);
    setUserInput('');
    setGeneratedContent('');
    setAutoGenerateEnabled(true);
  };

  // Add a hook to monitor editor visibility
  // React.useEffect(() => {
  //   if (showGraphicalEditor) {
  //     console.log('Graphical editor is visible, showGraphicalEditor =', showGraphicalEditor);
  //   }
  // }, [showGraphicalEditor]);

  // Handler function to open the graphical editor
  const openGraphicalEditor = React.useCallback(() => {
    console.log('Opening professional diagram editor');
    // Navigate directly to the graphical editor
    window.location.href = '/editor';
  }, []);

  // Handler to return from graphical editor - not used currently but kept for reference
  // const handleBackFromEditor = React.useCallback(() => {
  //   console.log('Returning from diagram editor');
  //   setShowGraphicalEditor(false);
  // }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      height: '100vh',
      bgcolor: 'background.default',
      backgroundImage: 'linear-gradient(180deg, rgba(22, 28, 36, 0.08) 0%, rgba(22, 28, 36, 0) 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Container maxWidth={false} sx={{
        py: { xs: 2, md: 2 },
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1800px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={{ xs: 2, md: 2 }}
        >
          <Box mb={{ xs: 2, sm: 0 }}>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                mb: 1,
                background: 'linear-gradient(45deg, #007B55, #00AB55)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              AI Document Generator
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              Create professional security documentation with AI assistance.
            </Typography>
          </Box>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={autoGenerateEnabled}
                  onChange={() => setAutoGenerateEnabled(!autoGenerateEnabled)}
                  color="primary"
                />
              }
              label={autoGenerateEnabled ? "Auto-Generate ON" : "Auto-Generate OFF"}
              sx={{
                bgcolor: 'background.paper',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
              }}
            />
            {generatedContent && (
              <Button
                variant="outlined"
                onClick={resetGenerator}
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: 2,
                  px: 2
                }}
              >
                Start New
              </Button>
            )}
          </Box>
        </Box>

        {/* Document Type Selector - Now horizontal instead of tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            p: { xs: 2, md: 3 }
          }}
        >
          {!isTypeSelected ? (
            <>
              <Typography variant="h6" gutterBottom>
                Select a document type to get started
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the type of document you want to create. The AI will guide you through a series of questions.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(3, 1fr)'
                  },
                  gap: 2
                }}
              >
                {documentTypes.map((type) => (
                  <Paper
                    key={type.id}
                    elevation={0}
                    onClick={() => {
                      if (type.id === 'create-custom') {
                        // Use the dedicated handler for opening the dialog
                        openGraphicalEditor();
                      } else if (type.id === 'enterprise-ar-editor') {
                        // Open the new Enterprise AR Editor
                        window.open('/ar-editor-showcase', '_blank');
                      } else {
                        setSelectedType(type.id);
                        handleTypeSelection();
                      }
                    }}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: type.id === 'enterprise-ar-editor' ? 'error.main' : type.id === 'create-custom' ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        borderColor: type.id === 'enterprise-ar-editor' ? 'error.main' : 'primary.main',
                        transform: 'translateY(-2px)'
                      },
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      position: 'relative',
                      ...(type.id === 'enterprise-ar-editor' && {
                        background: 'linear-gradient(45deg, rgba(255,82,82,0.08), rgba(255,171,0,0.08))',
                        borderWidth: '2px',
                        boxShadow: '0 8px 24px rgba(255,82,82,0.15)',
                        transform: 'scale(1.02)'
                      }),
                      ...(type.id === 'create-custom' && {
                        background: 'linear-gradient(45deg, rgba(0,171,85,0.05), rgba(0,123,85,0.05))',
                        borderWidth: '2px'
                      })
                    }}
                  >
                    {type.id === 'enterprise-ar-editor' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                          bgcolor: 'error.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(255,82,82,0.4)',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        🔥 NEW
                      </Box>
                    )}
                    {type.id === 'create-custom' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          px: 1,
                          py: 0.5,
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(0,171,85,0.24)'
                        }}
                      >
                        LEGACY
                      </Box>
                    )}
                    <Box
                      sx={{
                        bgcolor: type.id === 'enterprise-ar-editor' 
                          ? 'linear-gradient(45deg, #FF5252, #FFAB00)' 
                          : type.id === 'create-custom' 
                          ? 'primary.main' 
                          : 'primary.lighter',
                        color: (type.id === 'create-custom' || type.id === 'enterprise-ar-editor') ? 'white' : 'primary.main',
                        borderRadius: '50%',
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        ...(type.id === 'enterprise-ar-editor' && {
                          background: 'linear-gradient(45deg, #FF5252, #FFAB00)',
                          boxShadow: '0 4px 12px rgba(255,82,82,0.3)'
                        })
                      }}
                    >
                      {React.cloneElement(type.icon as React.ReactElement, {
                        fontSize: 'medium'
                      })}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {type.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2
                        }}
                      >
                        {type.description}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box
                sx={{
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {selectedDocType?.icon && React.cloneElement(selectedDocType.icon as React.ReactElement, {
                  fontSize: 'medium'
                })}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedDocType?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDocType?.description}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // Reset all state
                  setIsTypeSelected(false);
                  setSelectedType('');
                  setMessages([]);
                }}
                sx={{
                  ml: 'auto',
                  borderRadius: 2
                }}
              >
                Change
              </Button>
            </Box>
          )}
        </Paper>

        {/* Main content: Chat and Preview */}
        {isTypeSelected && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              flexGrow: 1,
              height: { xs: 'auto', md: 'calc(100vh - 180px)' },
              maxHeight: { md: 'calc(100vh - 180px)' },
              overflow: 'hidden'
            }}
          >
            {/* Chat Area */}
            <Paper
              elevation={0}
              sx={{
                width: { xs: '100%', md: '50%' },
                borderRadius: 4,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: { xs: 0, md: 1 },
                height: { xs: '600px', md: '100%' }
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {selectedDocType?.name || 'Document'} Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Answer questions to generate your document
                </Typography>
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  p: { xs: 1.5, md: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  bgcolor: 'grey.50'
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                      justifyContent: message.type === 'system' ? 'center' : 'flex-start',
                      gap: 1.5,
                      maxWidth: '100%'
                    }}
                  >
                    {message.type === 'ai' && (
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 36,
                          height: 36,
                          boxShadow: '0 2px 8px rgba(0,171,85,0.24)'
                        }}
                      >
                        <BotIcon fontSize="small" />
                      </Avatar>
                    )}

                    {message.type === 'user' && (
                      <Avatar
                        sx={{
                          bgcolor: 'grey.300',
                          width: 36,
                          height: 36
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        py: 1.5,
                        px: 2,
                        maxWidth: message.type === 'system' ? '100%' : '80%',
                        bgcolor: message.type === 'user'
                          ? 'primary.main'
                          : message.type === 'system'
                            ? 'warning.lighter'
                            : 'background.paper',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                        borderRadius: 3,
                        ...(message.type === 'system' && {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          width: '100%',
                          border: '1px solid',
                          borderColor: 'warning.light',
                          color: 'warning.dark'
                        }),
                        ...(message.type === 'ai' && {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main'
                        }),
                        ...(message.type === 'user' && {
                          boxShadow: '0 2px 8px rgba(0,171,85,0.16)'
                        })
                      }}
                    >
                      {message.type === 'system' && <WarningIcon fontSize="small" />}

                      {message.thinking ? (
                        <CircularProgress size={20} sx={{ m: 1 }} />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            ...customStyles,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {message.content}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type your answer here..."
                  size="medium"
                  multiline
                  maxRows={4}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleUserInput();
                    }
                  }}
                  disabled={isGenerating}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'grey.50'
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleUserInput}
                  disabled={isGenerating || !userInput.trim()}
                  sx={{
                    alignSelf: 'flex-end',
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'grey.300',
                      color: 'grey.500'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>

            {/* Preview Area */}
            <Paper
              elevation={0}
              sx={{
                width: { xs: '100%', md: '50%' },
                borderRadius: 4,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: { xs: 0, md: 1 },
                height: { xs: '600px', md: '100%' }
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Document Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live preview of your generated document
                  </Typography>
                </Box>
                {generatedContent && (
                  <Button
                    variant="contained"
                    onClick={downloadDocument}
                    startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                    size="small"
                    disabled={isGenerating}
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    {isGenerating ? 'Preparing...' : 'Download DOCX'}
                  </Button>
                )}
              </Box>

              <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'white', p: { xs: 1.5, md: 2 } }}>
                {generatedContent ? (
                  <Box
                    className="markdown-content"
                    sx={{
                      p: { xs: 1, md: 2 },
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: 'inset 0 0 0 1px rgba(145, 158, 171, 0.16)',
                      maxWidth: '100%',
                      height: '100%',
                      overflowY: 'auto',
                      mx: 'auto'
                    }}
                  >
                    <DocumentFormatter content={generatedContent} />
                  </Box>
                ) : (
                  <Box sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 3,
                    p: 3
                  }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        No Document Generated Yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 400, mx: 'auto' }}
                      >
                        Chat with the AI assistant to start generating your document.
                        {autoGenerateEnabled && ' Document will automatically generate after your interactions.'}
                      </Typography>
                    </Box>

                    {!autoGenerateEnabled && messages.length >= 2 && (
                      <Button
                        variant="contained"
                        onClick={generateFinalDocument}
                        disabled={isGenerating}
                        startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <DescriptionIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          boxShadow: '0 8px 16px rgba(0,171,85,0.24)'
                        }}
                      >
                        {isGenerating ? 'Generating...' : 'Generate Document'}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DocumentGenerator;