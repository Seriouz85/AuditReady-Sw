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
  Home,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Lock
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'compliance', 'quickstart']);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const toggleSection = (sectionId: string) => {
    // Always expand the clicked section and scroll to it
    setExpandedSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev;
    });
    
    // Set as active section
    setActiveSection(sectionId);
    
    // Scroll to section after a brief delay to allow expansion
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      const scrollContainer = document.querySelector('.lg\\:col-span-3.h-full.overflow-auto');
      
      if (element && scrollContainer) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollTop = elementRect.top - containerRect.top + scrollContainer.scrollTop - 20;
        
        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
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
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded">
                    <Code className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Modern Stack</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  React 18, TypeScript, Tailwind CSS, Vite
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 bg-green-600 text-white rounded">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Backend</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supabase, PostgreSQL, Real-time subscriptions
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 bg-purple-600 text-white rounded">
                    <Shield className="w-4 h-4" />
                  </div>
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
                { phase: 'Phase 1', title: 'Modern State Management', status: 'Completed', color: 'green' },
                { phase: 'Phase 2', title: 'Unified API Architecture', status: 'Completed', color: 'green' },
                { phase: 'Phase 3', title: 'Performance Optimization', status: 'Completed', color: 'green' },
                { phase: 'Phase 4', title: 'Security Framework', status: 'Completed', color: 'green' },
                { phase: 'Phase 5', title: 'Testing Infrastructure', status: 'Completed', color: 'green' },
                { phase: 'Phase 6', title: 'Monitoring & Observability', status: 'Completed', color: 'green' },
                { phase: 'Phase 7', title: 'Database Optimization', status: 'Planned', color: 'blue' },
                { phase: 'Phase 8', title: 'DevOps & CI/CD', status: 'Planned', color: 'blue' }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-blue-600">Core Platform</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Zustand state management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Unified API client with retry logic</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Code splitting & lazy loading</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>React.memo optimization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Redis caching layer</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-green-600">Security & Infrastructure</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Content Security Policy (CSP)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Advanced threat detection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Input validation & sanitization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Infrastructure as Code (Terraform)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Automated backup & disaster recovery</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-purple-600">DevOps & Monitoring</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>GitHub Actions CI/CD</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Comprehensive testing infrastructure</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Sentry error monitoring</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Performance analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span>Legal compliance framework</span>
                  </li>
                </ul>
              </div>
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
│   └── optimized/      # React.memo optimized components
├── pages/              # Route components
├── stores/             # Zustand state management
│   ├── authStore.ts    # Authentication state
│   ├── organizationStore.ts # Organization management
│   ├── complianceStore.ts   # Compliance tracking
│   └── assessmentStore.ts   # Assessment workflows
├── lib/                # Utilities and configurations
│   ├── api/           # Unified API client
│   ├── security/      # Validation, CSP & threat detection
│   ├── monitoring/    # Analytics, Sentry & alerting
│   ├── cache/         # Redis caching layer
│   ├── backup/        # Backup & disaster recovery
│   ├── support/       # Customer support infrastructure
│   └── compliance/    # Legal compliance framework
├── tests/              # Testing infrastructure
│   ├── utils/         # Test utilities
│   ├── mocks/         # API mocks
│   └── __tests__/     # Component & integration tests
├── infrastructure/     # Infrastructure as Code
│   ├── terraform/     # Terraform configuration
│   └── scripts/       # Deployment scripts
├── .github/           # GitHub Actions workflows
│   └── workflows/     # CI/CD pipelines
└── supabase/          # Database migrations
    └── migrations/    # SQL migration files
│   └── fixtures/      # Test data
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Modern Architecture Overview</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The platform now uses modern state management and API architecture for better performance and maintainability.
            </p>
            <CodeBlock>
{`// State Management with Zustand
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationStore } from '@/stores/organizationStore';

// Unified API Client
import { apiClient } from '@/lib/api/client';
const data = await apiClient.get('/organizations');

// Security Validation
import { validateInput, sanitizeHtml } from '@/lib/security/validation';
const clean = sanitizeHtml(userInput);

// Performance Monitoring
import { useAnalytics } from '@/lib/monitoring/analytics';
const { trackFeatureUsage } = useAnalytics();`}
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
    },
    {
      id: 'compliance',
      title: 'Compliance Management',
      icon: <CheckCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Core Compliance Features</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AuditReady provides comprehensive tools for managing compliance across multiple frameworks and standards.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Standards Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>ISO 27001, ISO 27002, SOC 2</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>NIST, CIS Controls, PCI DSS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Custom framework support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Assessment Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Automated assessment workflows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Evidence collection & management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Gap analysis & remediation tracking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Real-time Monitoring</h3>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Risk Detection</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI-powered anomaly detection
                    </p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Continuous Compliance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      24/7 compliance monitoring
                    </p>
                  </div>
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">Audit Trail</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete activity logging
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'quickstart',
      title: 'Quick Start Guide',
      icon: <TrendingUp className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Getting Started with AuditReady</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Follow these steps to quickly set up your compliance management system.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Create Your Organization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign up and set up your organization profile with industry and compliance requirements.
                  </p>
                  <CodeBlock language="bash">
{`# Navigate to signup
/signup

# Complete organization setup
- Organization name
- Industry selection
- Compliance frameworks`}
                  </CodeBlock>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Import Standards</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select and import relevant compliance standards from our library.
                  </p>
                  <CodeBlock>
{`// Navigate to Standards
Dashboard → Standards → Import

// Available standards:
- ISO 27001:2022
- SOC 2 Type II
- NIST Cybersecurity Framework
- CIS Controls v8`}
                  </CodeBlock>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Start Your First Assessment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create an assessment and begin evaluating your compliance posture.
                  </p>
                  <Badge variant="secondary" className="mt-2">Pro Tip: Use templates for faster setup</Badge>
                </div>
              </div>
            </div>
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Documentation</h1>
                <p className="text-sm text-white/80">Guides, API references, and best practices</p>
              </div>
            </div>
            
            {/* Search in header */}
            <div className="hidden md:block w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation - fixed height */}
            <div className="lg:col-span-1">
              <div className="h-full">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Contents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <nav className="space-y-0.5 p-3">
                      {filteredSections.map((section) => {
                        const isActive = activeSection === section.id;
                        const isExpanded = expandedSections.includes(section.id);
                        return (
                          <button
                            key={section.id}
                            onClick={() => toggleSection(section.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium rounded-lg transition-all ${
                              isActive 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                {section.icon}
                              </div>
                              <span>{section.title}</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

            {/* Main Content - scrollable */}
            <div className="lg:col-span-3 h-full overflow-auto">
              <div className="space-y-6 pb-6">
                {filteredSections.map((section) => (
                  expandedSections.includes(section.id) && (
                    <div key={section.id} id={`section-${section.id}`}>
                      <Card className="animate-fade-in bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-shadow">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                          <CardTitle className="flex items-center space-x-3 text-xl">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              {section.icon}
                            </div>
                            <span>{section.title}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {section.content}
                        </CardContent>
                      </Card>
                    </div>
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
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 AuditReady - Enterprise Compliance Platform
              </p>
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <Badge variant="secondary">v1.1.0</Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Systems Operational
                </Badge>
              </div>
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