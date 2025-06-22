import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  Layers, 
  Shield, 
  Zap, 
  Database, 
  Settings, 
  Users, 
  FileText,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  Copy,
  Check,
  ArrowLeft,
  Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  subsections?: DocSubSection[];
}

interface DocSubSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const CodeBlock: React.FC<{ children: string; language?: string }> = ({ children, language = 'tsx' }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">{language}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <pre className="text-sm text-gray-100 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default function Documentation() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">AuditReady Platform</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              AuditReady is a comprehensive compliance management platform built with modern technologies. 
              It provides automated assessments, real-time monitoring, and AI-powered insights for enterprise compliance needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Modern Stack</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  React 18, TypeScript, Tailwind CSS, Vite
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Backend</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supabase, PostgreSQL, Real-time subscriptions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Security</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  MFA, Enterprise SSO, RLS, Conditional Access
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'architecture',
      title: 'Architecture & Features',
      icon: <Layers className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Implementation Phases</h3>
            <div className="space-y-4">
              {[
                { phase: 'Phase 1-6', title: 'Core Platform', status: 'Completed', color: 'green' },
                { phase: 'Phase 7', title: 'Enterprise Integrations', status: 'Completed', color: 'green' },
                { phase: 'Phase 8', title: 'Codebase Optimization', status: 'Completed', color: 'green' },
                { phase: 'Phase 9', title: 'Tailwind CSS Migration', status: 'Completed', color: 'green' },
                { phase: 'Phase 10', title: 'Testing & QA', status: 'In Progress', color: 'blue' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium">{item.phase}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">{item.title}</span>
                  </div>
                  <Badge variant={item.color === 'green' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Multi-tenant architecture with RLS</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Real-time collaboration features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Enterprise SSO (Microsoft Entra ID)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Multi-factor authentication</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>AI-powered compliance insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Automated assessment workflows</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Advanced reporting & exports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Multi-domain support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'development',
      title: 'Development Guide',
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Start</h3>
            <CodeBlock language="bash">
{`# Clone the repository
git clone https://github.com/Seriouz85/audit-readiness-hub.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Project Structure</h3>
            <CodeBlock language="text">
{`src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── optimized/      # Performance-optimized components
│   └── security/       # Security-related components
├── pages/              # Route components
├── services/           # Business logic services
│   ├── security/       # MFA & conditional access
│   └── domain/         # Multi-domain support
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── types/              # TypeScript type definitions`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Environment Configuration</h3>
            <CodeBlock language="bash">
{`# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Optional: Microsoft Entra ID
VITE_ENTRA_CLIENT_ID=your-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id`}
            </CodeBlock>
          </div>
        </div>
      )
    },
    {
      id: 'styling',
      title: 'Styling & Design System',
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Tailwind CSS Best Practices</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The platform uses Tailwind CSS exclusively. All legacy CSS has been migrated to utility classes.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Component Patterns</h4>
                <CodeBlock>
{`// Card component
<Card className="rounded-lg border bg-card p-6 shadow-sm">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// Button variants
<Button className="bg-blue-600 hover:bg-blue-700">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Danger</Button>`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Dark Mode Support</h4>
                <CodeBlock>
{`// Always include dark mode variants
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

// Responsive with dark mode
className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800"`}
                </CodeBlock>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Custom Animations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'animate-float', desc: 'Gentle floating effect' },
                { name: 'animate-shimmer', desc: 'Loading shimmer effect' },
                { name: 'animate-fade-in', desc: 'Fade in entrance' },
                { name: 'animate-slide-in', desc: 'Slide in from top' }
              ].map((anim, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <code className="text-sm font-mono text-blue-600">{anim.name}</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{anim.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Authentication',
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Authentication Methods</h3>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Multi-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Support for TOTP and SMS-based MFA with backup codes.
                  </p>
                  <CodeBlock>
{`import { mfaService } from '@/services/security/MFAService';

// Setup TOTP
const setupData = await mfaService.setupTOTP(userId);

// Verify MFA code
const result = await mfaService.verifyMFA({
  code: '123456',
  providerId: 'totp-provider'
});`}
                  </CodeBlock>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conditional Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Enterprise-grade conditional access policies based on location, device, and risk.
                  </p>
                  <CodeBlock>
{`import { conditionalAccessService } from '@/services/security/ConditionalAccessService';

// Evaluate access request
const request = conditionalAccessService.createAccessRequest(userId, 'dashboard');
const result = await conditionalAccessService.evaluateAccess(request);

if (result.decision === 'challenge') {
  // Require additional authentication
}`}
                  </CodeBlock>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      title: 'Performance Optimization',
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">React Optimization</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Performance-optimized components and hooks for better rendering efficiency.
            </p>
            
            <CodeBlock>
{`import { useOptimizedCallback, useStableCallback } from '@/hooks/useOptimizedCallback';
import { OptimizedButton, OptimizedCard } from '@/components/optimized/OptimizedComponents';

// Optimized callback that only recreates when dependencies change
const handleClick = useOptimizedCallback(() => {
  // Handle click
}, [dependency]);

// Stable callback that never changes reference
const stableHandler = useStableCallback((id) => {
  // Handle action
});`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Code Splitting</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Admin components are lazy-loaded to reduce initial bundle size by 500KB+.
            </p>
            
            <CodeBlock>
{`// Lazy loading admin components
const AdminDashboard = lazy(() => 
  import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard }))
);

// Usage with Suspense
<Suspense fallback={<AdminLoadingSpinner />}>
  <AdminDashboard />
</Suspense>`}
            </CodeBlock>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              AuditReady Documentation
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive guides, API references, and best practices for the AuditReady compliance platform
            </p>
          </div>
          
          {/* Search */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Contents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <nav className="space-y-1 p-4">
                      {filteredSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between p-2 text-left text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            {section.icon}
                            <span>{section.title}</span>
                          </div>
                          {expandedSections.includes(section.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {filteredSections.map((section) => (
                expandedSections.includes(section.id) && (
                  <Card key={section.id} className="animate-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-2xl">
                        {section.icon}
                        <span>{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {section.content}
                    </CardContent>
                  </Card>
                )
              ))}
              
              {filteredSections.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-900 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Built with modern technologies for enterprise compliance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/Seriouz85/audit-readiness-hub" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}