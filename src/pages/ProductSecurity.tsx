import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Key, 
  Database, 
  Users, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  Server,
  Globe,
  Zap,
  FileText,
  Award,
  Calendar,
  Code,
  Settings,
  Activity,
  Layers
} from 'lucide-react';

export default function ProductSecurity() {
  const navigate = useNavigate();

  const securityLayers = [
    {
      title: "Application Security",
      description: "Frontend and API protection",
      icon: <Code className="w-6 h-6" />,
      color: "blue",
      measures: [
        {
          name: "Content Security Policy",
          description: "XSS and injection attack prevention with strict CSP headers",
          implementation: "Implemented",
          technical: "nonce-based CSP with strict-dynamic for safe script execution"
        },
        {
          name: "Input Validation",
          description: "Comprehensive form validation using Zod schemas",
          implementation: "Implemented", 
          technical: "TypeScript-first schema validation with runtime type checking"
        },
        {
          name: "Error Boundaries",
          description: "Production-ready error handling and graceful recovery",
          implementation: "Implemented",
          technical: "React Error Boundaries with Sentry integration for monitoring"
        },
        {
          name: "Secure Headers",
          description: "Security headers including HSTS, X-Frame-Options, and CSP",
          implementation: "Implemented",
          technical: "Helmet.js configuration with security-focused header policies"
        }
      ]
    },
    {
      title: "Authentication & Access",
      description: "Identity and access management",
      icon: <Key className="w-6 h-6" />,
      color: "purple",
      measures: [
        {
          name: "Multi-Factor Authentication",
          description: "TOTP, SMS, and email-based MFA with backup codes",
          implementation: "Implemented",
          technical: "Supabase Auth with custom MFA providers and backup code generation"
        },
        {
          name: "Enterprise SSO",
          description: "Microsoft Entra ID integration with SAML/OIDC",
          implementation: "Implemented",
          technical: "OAuth 2.0/OpenID Connect with automatic user provisioning"
        },
        {
          name: "Conditional Access",
          description: "Advanced security rules and device compliance",
          implementation: "Implemented",
          technical: "Custom middleware for location, device, and risk-based access control"
        },
        {
          name: "Session Management",
          description: "Secure token handling with automatic refresh",
          implementation: "Implemented",
          technical: "JWT tokens with sliding expiration and secure httpOnly cookies"
        }
      ]
    },
    {
      title: "Data Protection",
      description: "Information security and privacy",
      icon: <Database className="w-6 h-6" />,
      color: "green",
      measures: [
        {
          name: "Encryption at Rest",
          description: "AES-256 encryption for all stored data",
          implementation: "Implemented",
          technical: "PostgreSQL transparent data encryption with automatic key rotation"
        },
        {
          name: "Encryption in Transit",
          description: "TLS 1.3 for all data transmission",
          implementation: "Implemented",
          technical: "End-to-end HTTPS with perfect forward secrecy and HSTS"
        },
        {
          name: "Row Level Security",
          description: "Database-level multi-tenant isolation",
          implementation: "Implemented",
          technical: "PostgreSQL RLS policies with organization-based data segregation"
        },
        {
          name: "Data Anonymization",
          description: "Automated PII detection and masking",
          implementation: "Implemented",
          technical: "Custom data classification with automatic redaction rules"
        }
      ]
    },
    {
      title: "Infrastructure Security",
      description: "Platform and network protection",
      icon: <Server className="w-6 h-6" />,
      color: "red",
      measures: [
        {
          name: "Cloud Security",
          description: "Enterprise-grade cloud infrastructure protection",
          implementation: "Implemented",
          technical: "Supabase enterprise hosting with SOC 2 Type II compliance"
        },
        {
          name: "Network Isolation",
          description: "VPC isolation with firewall protection",
          implementation: "Implemented",
          technical: "Private networking with WAF and DDoS protection via Cloudflare"
        },
        {
          name: "Backup & Recovery",
          description: "Automated backup with point-in-time recovery",
          implementation: "Implemented",
          technical: "Daily automated backups with 30-day retention and 4-hour RTO"
        },
        {
          name: "Monitoring & Alerting",
          description: "24/7 security monitoring and incident response",
          implementation: "Implemented",
          technical: "Sentry error tracking with custom security event monitoring"
        }
      ]
    }
  ];

  const complianceStandards = [
    {
      name: "SOC 2 Type II",
      status: "Certified",
      description: "Security, availability, and confidentiality controls",
      lastAudit: "2024",
      color: "green"
    },
    {
      name: "ISO 27001",
      status: "In Progress",
      description: "Information security management system",
      lastAudit: "2025",
      color: "blue"
    },
    {
      name: "GDPR",
      status: "Compliant",
      description: "European data protection regulation",
      lastAudit: "2024",
      color: "green"
    },
    {
      name: "CCPA",
      status: "Compliant", 
      description: "California consumer privacy act",
      lastAudit: "2024",
      color: "green"
    }
  ];

  const securityMetrics = [
    { label: "Uptime SLA", value: "99.9%", icon: <Activity className="w-5 h-5" /> },
    { label: "Security Layers", value: "12+", icon: <Layers className="w-5 h-5" /> },
    { label: "Compliance Standards", value: "8+", icon: <Award className="w-5 h-5" /> },
    { label: "Security Audits", value: "Quarterly", icon: <Shield className="w-5 h-5" /> }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600 border-blue-200 dark:border-blue-800",
      purple: "from-purple-500 to-purple-600 border-purple-200 dark:border-purple-800",
      green: "from-green-500 to-green-600 border-green-200 dark:border-green-800",
      red: "from-red-500 to-red-600 border-red-200 dark:border-red-800"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white shadow-lg">
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
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Product Security</h1>
                  <p className="text-sm text-white/80">Enterprise-grade security architecture with defense-in-depth protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* Security Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {securityMetrics.map((metric, index) => (
                <Card key={index} className="text-center border-2">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                        {metric.icon}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security Architecture Overview */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Security Architecture</h2>
                    <p className="text-sm text-white/80 font-normal">Defense-in-depth security model</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    AuditReady implements a comprehensive security architecture based on industry best practices 
                    and zero-trust principles. Our multi-layered approach ensures data protection at every level 
                    of the application stack.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Code className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Application</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Secure coding practices</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Key className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Identity</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Zero-trust authentication</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Data</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">End-to-end encryption</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Server className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Infrastructure</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cloud-native security</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Layers */}
            <div className="space-y-8">
              {securityLayers.map((layer, index) => (
                <Card key={index} className={`border-2 ${getColorClasses(layer.color)}`}>
                  <CardHeader className={`bg-gradient-to-r ${getColorClasses(layer.color)} text-white rounded-t-lg`}>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        {layer.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{layer.title}</h2>
                        <p className="text-sm text-white/80 font-normal">{layer.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {layer.measures.map((measure, measureIndex) => (
                        <div key={measureIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {measure.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {measure.description}
                              </p>
                            </div>
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ml-4">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {measure.implementation}
                            </Badge>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Technical Implementation: </span>
                            <span className="text-gray-600 dark:text-gray-400">{measure.technical}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compliance & Certifications */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Compliance & Certifications</h2>
                    <p className="text-sm text-white/80 font-normal">Industry-standard compliance and auditing</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {complianceStandards.map((standard, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{standard.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{standard.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Last audit: {standard.lastAudit}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={standard.color === 'green' ? 'default' : 'secondary'}
                        className={standard.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                      >
                        {standard.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Best Practices */}
            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Development Security Practices</h2>
                    <p className="text-sm text-white/80 font-normal">Secure development lifecycle</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Code Security</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        TypeScript for type safety and runtime validation
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ESLint security rules and automated code analysis
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Dependency vulnerability scanning with Snyk
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Automated security testing in CI/CD pipeline
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Deployment Security</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Immutable infrastructure with Infrastructure as Code
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Secret management with environment-based configs
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Container security scanning and hardening
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Zero-downtime deployments with rollback capabilities
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Response */}
            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Incident Response</h2>
                    <p className="text-sm text-white/80 font-normal">24/7 security monitoring and response</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-2">&lt; 5min</div>
                      <h3 className="font-semibold mb-1">Detection</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Automated alerting</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-2">&lt; 15min</div>
                      <h3 className="font-semibold mb-1">Response</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Team notification</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">&lt; 1hr</div>
                      <h3 className="font-semibold mb-1">Containment</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Issue isolation</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">&lt; 4hrs</div>
                      <h3 className="font-semibold mb-1">Resolution</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Full recovery</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Contact Security Team</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Security Email:</span>{' '}
                        <a href="mailto:security@auditready.com" className="text-blue-600 hover:underline">
                          security@auditready.com
                        </a>
                      </div>
                      <div>
                        <span className="font-semibold">24/7 Security Hotline:</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">Available for enterprise customers</span>
                      </div>
                      <div>
                        <span className="font-semibold">Bug Bounty:</span>{' '}
                        <a href="mailto:bugbounty@auditready.com" className="text-blue-600 hover:underline">
                          bugbounty@auditready.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}