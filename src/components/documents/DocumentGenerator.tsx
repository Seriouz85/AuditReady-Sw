import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileOutput, 
  Download, 
  Loader2, 
  Send, 
  Bot, 
  RefreshCw,
  FileType,
  CheckCircle2,
  User,
  AlertTriangle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    icon: <FileType className="h-6 w-6" />,
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
    icon: <FileType className="h-6 w-6" />,
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
    icon: <FileType className="h-6 w-6" />,
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
    icon: <FileType className="h-6 w-6" />,
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
    icon: <FileType className="h-6 w-6" />,
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
    icon: <FileType className="h-6 w-6" />,
    initialQuestions: [
      'What security issue or initiative does this action plan address?',
      'What is the target completion timeframe?',
      'Who are the key stakeholders responsible for implementation?'
    ]
  }
];

const DocumentGenerator = ({ apiKey }: DocumentGeneratorProps) => {
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [isTypeSelected, setIsTypeSelected] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState<string>('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [userInput, setUserInput] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [autoGenerateEnabled, setAutoGenerateEnabled] = React.useState(true);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const selectedDocType = documentTypes.find(t => t.id === selectedType);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTypeSelection = () => {
    if (!selectedType) return;
    
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
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const testBody = {
        contents: [{
          parts: [{
            text: "Hello, this is a test message. Please respond with 'OK' if you receive this."
          }]
        }]
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

    // Test API connection before proceeding
    const isConnected = await testApiConnection();
    if (!isConnected) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'Error: Unable to connect to AI service. Please check your API key and internet connection.'
      }]);
      return;
    }

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
      console.log('Making API request to Gemini...');
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      console.log('Request URL:', apiUrl.replace(apiKey, '[REDACTED]'));
      
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
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        body: JSON.stringify(requestBody)
      });

      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
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

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                         data.candidates?.[0]?.content?.text ||
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
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      console.log('Request URL:', apiUrl.replace(apiKey, '[REDACTED]'));
      
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

FORMAT GUIDELINES:
1. Use clear, professional, and simple language
2. For any missing information, use placeholder text marked as "TBA-[TOPIC]" rather than omitting sections
3. Be thorough but concise - include all necessary information without unnecessary length
4. Include flow diagrams instructions where appropriate

CRITICAL: Output ONLY the final document content. Start directly with the document title and metadata. Do NOT switch to a different process type.

Create the complete "${processName}" process document now, formatted for immediate use by the organization.`;
      }
      
      const requestBody = {
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        body: JSON.stringify(requestBody)
      });

      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
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

      const documentContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                             data.candidates?.[0]?.content?.text ||
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

  const downloadDocument = () => {
    if (!generatedContent || !selectedDocType) return;
    
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDocType.name.toLowerCase().replace(/\s+/g, '-')}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetGenerator = () => {
    setIsTypeSelected(false);
    setSelectedType('');
    setMessages([]);
    setUserInput('');
    setGeneratedContent('');
    setAutoGenerateEnabled(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Document Generator</h1>
          <p className="text-muted-foreground">Create professional documents with AI assistance</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {autoGenerateEnabled ? (
            <Button 
              variant="outline" 
              onClick={() => setAutoGenerateEnabled(false)}
              className="flex items-center gap-1 whitespace-nowrap min-w-[170px]"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Auto-Generate ON</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setAutoGenerateEnabled(true)}
              className="flex items-center gap-1 whitespace-nowrap min-w-[170px]"
            >
              <div className="h-4 w-4 border border-muted-foreground rounded-full flex-shrink-0" />
              <span>Auto-Generate OFF</span>
            </Button>
          )}
          {generatedContent && (
            <>
              <Button 
                variant="outline" 
                onClick={resetGenerator}
                className="whitespace-nowrap"
              >
                <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" />
                Start New
              </Button>
              <Button 
                onClick={downloadDocument}
                className="whitespace-nowrap"
              >
                <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                Download DOCX
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {!isTypeSelected ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Select Document Type</CardTitle>
              <CardDescription>Choose the type of document you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {documentTypes.map(type => (
                  <Button
                    key={type.id}
                    variant={selectedType === type.id ? "default" : "outline"}
                    size="doctype"
                    className={cn(
                      "relative w-full flex flex-col items-start text-left rounded-lg border min-h-[110px] !p-3 overflow-hidden group",
                      selectedType === type.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {React.cloneElement(type.icon as React.ReactElement, {
                        className: cn(
                          "h-5 w-5 shrink-0",
                          selectedType === type.id ? "text-primary-foreground" : "text-primary"
                        )
                      })}
                      <h3 className="font-semibold text-sm break-words w-full leading-tight line-clamp-1">{type.name}</h3>
                    </div>
                    <div className="w-full mt-0.5 mb-auto">
                      <p className={cn(
                        "text-xs text-muted-foreground w-full leading-snug whitespace-normal break-words",
                        selectedType === type.id && "text-primary-foreground/90"
                      )}>
                        {type.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
              <Button 
                className="mt-6 w-full" 
                onClick={handleTypeSelection}
                disabled={!selectedType}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Apply Selection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="h-[500px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat with AI</CardTitle>
                <CardDescription>Ask questions to generate your {documentTypes.find(t => t.id === selectedType)?.name.toLowerCase()}</CardDescription>
                <Button 
                  variant="link" 
                  onClick={resetGenerator} 
                  className="p-0 h-auto text-sm">
                  <CheckCircle2 className="mr-2 h-4 w-4 flex-shrink-0" />
                  Change Document Type
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
                <ScrollArea className="flex-1 -mr-4 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3 w-full",
                          message.type === 'user' ? 'justify-end' : 'justify-start',
                          message.type === 'system' && 'justify-center'
                        )}
                      >
                        {message.type === 'ai' && (
                           <Avatar className="h-8 w-8 flex-shrink-0">
                             <AvatarFallback className="bg-primary/10 text-primary"><Bot size={18} /></AvatarFallback>
                           </Avatar>
                        )}
                        <div className={cn(
                          "max-w-[75%] p-3 rounded-lg shadow-sm",
                          message.type === 'user' ? 'bg-primary text-primary-foreground' : '',
                          message.type === 'ai' ? 'bg-muted' : '',
                          message.type === 'system' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50 text-center text-xs w-full max-w-full' : ''
                        )}>
                          {message.type === 'system' && <AlertTriangle className="inline-block h-4 w-4 mr-2" />}
                          {message.thinking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <div style={customStyles} className={cn(
                              "whitespace-pre-wrap break-words",
                               message.type === 'system' ? 'inline' : ''
                             )}>
                              {message.content}
                            </div>
                          )}
                        </div>
                        
                        {message.type === 'user' && (
                           <Avatar className="h-8 w-8 flex-shrink-0">
                             <AvatarFallback className="bg-foreground/10"><User size={18} /></AvatarFallback>
                           </Avatar>
                         )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Textarea
                    value={userInput} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserInput(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleUserInput();
                      }
                    }}
                    placeholder="Type your request..."
                    disabled={isGenerating}
                    className="flex-1 resize-none min-h-[40px]"
                    rows={1}
                  />
                  <Button onClick={handleUserInput} disabled={isGenerating || !userInput.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="h-[500px] flex flex-col">
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <CardDescription>Live preview of the generated document</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {generatedContent ? (
                    <div className="markdown-content">
                      <div className="whitespace-pre-wrap font-mono text-sm break-words overflow-wrap-anywhere" style={customStyles}>
                        {generatedContent}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-4">
                      <FileOutput className="h-12 w-12 text-muted-foreground flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">No Document Generated Yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Chat with the AI to start generating your document.
                          {autoGenerateEnabled && ' Document will automatically generate after your interactions.'}
                        </p>
                      </div>
                      {!autoGenerateEnabled && (
                        <Button 
                          onClick={generateFinalDocument}
                          disabled={isGenerating || messages.length < 2} 
                          className="mt-2 whitespace-nowrap"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FileOutput className="mr-2 h-4 w-4 flex-shrink-0" />
                              Generate Document
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentGenerator; 