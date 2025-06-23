import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Key, 
  Server, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Globe,
  Users,
  Database,
  Calendar,
  Award
} from 'lucide-react';

export default function Security() {
  const navigate = useNavigate();

  const certifications = [
    { name: "SOC 2 Type II", status: "Certified", color: "green" },
    { name: "ISO 27001", status: "In Progress", color: "blue" },
    { name: "GDPR Compliant", status: "Certified", color: "green" },
    { name: "CCPA Compliant", status: "Certified", color: "green" }
  ];

  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption",
      status: "Implemented"
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Multi-Factor Authentication",
      description: "Support for TOTP, SMS, and hardware security keys for enhanced account protection",
      status: "Implemented"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Access Controls",
      description: "Role-based access controls with principle of least privilege",
      status: "Implemented"
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Infrastructure Security",
      description: "Hosted on enterprise-grade cloud infrastructure with 24/7 monitoring",
      status: "Implemented"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <h1 className="text-2xl font-bold">Security</h1>
                  <p className="text-sm text-white/80">Our comprehensive security measures and compliance standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Security Overview */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Security Overview
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  At AuditReady, we understand that security is paramount when handling sensitive compliance data. 
                  Our security program is built on industry best practices and continuously evolving to address 
                  emerging threats and maintain the highest standards of data protection.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Database className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Data Protection</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enterprise-grade encryption and access controls
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Compliance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SOC 2, GDPR, and industry standard compliance
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Eye className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Monitoring</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      24/7 security monitoring and incident response
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Architecture */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Multi-Layer Security Architecture
              </h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Network Layer</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">WAF, DDoS protection, VPC isolation</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Server className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Application Layer</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Code scanning, dependency checks, SAST/DAST</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Database className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Data Layer</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">End-to-end encryption, backup security</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Identity Layer</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MFA, SSO, RBAC, zero-trust</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold mb-4 text-center">Real-Time Security Monitoring</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Continuous monitoring and threat detection</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 15min</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Average incident response time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Security uptime and availability</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Implementation */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Technical Security Implementation
              </h2>
              
              <div className="space-y-6">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xl">{feature.title}</h3>
                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Encryption */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                Data Encryption
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      Encryption in Transit
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>TLS 1.3 for all API communications</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>HTTPS enforced for all web traffic</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Certificate pinning for mobile apps</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Perfect Forward Secrecy (PFS)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Database className="w-5 h-5 mr-2 text-blue-600" />
                      Encryption at Rest
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>AES-256 encryption for all stored data</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Encrypted database backups</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Hardware Security Modules (HSM)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Key rotation and management</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Key Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All encryption keys are managed using industry-standard key management practices, including regular 
                    rotation, secure storage in Hardware Security Modules (HSMs), and strict access controls. Keys are 
                    never stored in plain text and are separated from the encrypted data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Controls */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Access Controls
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authentication</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>Multi-Factor Authentication (MFA):</strong> Required for all accounts with support for TOTP, SMS, and hardware keys
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                        <strong>Single Sign-On (SSO):</strong> Enterprise integration with SAML 2.0 and OAuth 2.0
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>Password Policies:</strong> Strong password requirements with complexity rules
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authorization</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                        <strong>Role-Based Access (RBAC):</strong> Granular permissions based on user roles and responsibilities
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                        <strong>Principle of Least Privilege:</strong> Users receive minimum access required for their role
                      </div>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                        <strong>Regular Access Reviews:</strong> Quarterly reviews of user permissions and access rights
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Security */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Server className="w-6 h-6 mr-2 text-blue-600" />
                Infrastructure Security
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Cloud Provider</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hosted on enterprise-grade infrastructure with 99.9% uptime SLA
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Network Security</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      VPC isolation, firewalls, and DDoS protection
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Monitoring</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      24/7 security monitoring and automated threat detection
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Security Measures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Web Application Firewall (WAF)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Intrusion Detection System (IDS)</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Automated vulnerability scanning</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Regular penetration testing</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Security patch management</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Incident response procedures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Framework */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                Compliance Framework & Standards
              </h2>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-bold mb-4 text-center">AuditReady: Built for Compliance Excellence</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Our platform doesn't just talk about compliance—we live it. Every feature, control, and process 
                    is designed to meet the highest compliance standards while helping you achieve yours.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">ISO 27001</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Information Security Management</p>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">In Progress</Badge>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div>✓ Risk Assessment Framework</div>
                      <div>✓ Security Policies & Procedures</div>
                      <div>✓ Continuous Monitoring</div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="w-12 h-12 mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">SOC 2 Type II</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Security & Availability Controls</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Certified</Badge>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div>✓ Annual Independent Audits</div>
                      <div>✓ Security Control Testing</div>
                      <div>✓ Operational Effectiveness</div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="w-12 h-12 mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">GDPR & CCPA</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Privacy & Data Protection</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Compliant</Badge>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div>✓ Privacy by Design</div>
                      <div>✓ Data Subject Rights</div>
                      <div>✓ Breach Notification</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Supported Compliance Frameworks</h3>
                    <div className="space-y-3">
                      {[
                        { name: "NIST Cybersecurity Framework", status: "Implemented", frameworks: "CSF 2.0" },
                        { name: "PCI DSS", status: "Level 1 Service Provider", frameworks: "v4.0" },
                        { name: "HIPAA/HITECH", status: "Business Associate Ready", frameworks: "164.312" },
                        { name: "FedRAMP", status: "Moderate Baseline", frameworks: "Rev 5" },
                        { name: "FISMA", status: "Moderate Impact", frameworks: "SP 800-53" }
                      ].map((framework, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div>
                            <div className="font-semibold">{framework.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{framework.frameworks}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {framework.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Industry-Specific Compliance</h3>
                    <div className="space-y-3">
                      {[
                        { sector: "Financial Services", standards: "SOX, Basel III, MiFID II", maturity: "Advanced" },
                        { sector: "Healthcare", standards: "HIPAA, HITECH, FDA 21 CFR Part 11", maturity: "Advanced" },
                        { sector: "Government", standards: "FedRAMP, FISMA, CJIS", maturity: "Moderate" },
                        { sector: "Education", standards: "FERPA, COPPA", maturity: "Basic" },
                        { sector: "Energy & Utilities", standards: "NERC CIP, IEC 62443", maturity: "Planned" }
                      ].map((sector, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{sector.sector}</div>
                            <Badge 
                              variant={sector.maturity === 'Advanced' ? 'default' : 'secondary'}
                              className={sector.maturity === 'Advanced' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                            >
                              {sector.maturity}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{sector.standards}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-8 rounded-xl border border-amber-200 dark:border-amber-800">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-amber-600" />
                    Continuous Compliance Monitoring
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-amber-600 mb-2">Real-Time</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Control monitoring and alerting</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600 mb-2">Weekly</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compliance posture assessments</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600 mb-2">Annual</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Third-party audits and reviews</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Our Compliance Commitment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As a compliance management platform, we practice what we preach. Our security and compliance posture 
                    is continuously monitored, regularly audited, and transparently reported. We maintain the same high 
                    standards we help our customers achieve, ensuring our platform serves as a trusted foundation for your 
                    compliance journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incident Response */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                Incident Response
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  We maintain a comprehensive incident response plan to quickly identify, contain, and resolve security incidents.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 mb-2">1</div>
                    <h3 className="font-semibold mb-1">Detection</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Automated monitoring and alerting</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">2</div>
                    <h3 className="font-semibold mb-1">Response</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Immediate containment and assessment</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
                    <h3 className="font-semibold mb-1">Mitigation</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Remediation and system restoration</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">4</div>
                    <h3 className="font-semibold mb-1">Recovery</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Post-incident analysis and improvement</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Notification Policy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    In the unlikely event of a security incident that may affect your data, we will:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Notify affected customers within 24 hours of discovery</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Provide regular updates on our investigation and remediation efforts</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Share a detailed post-incident report upon resolution</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Security Team */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Contact Our Security Team
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  If you have security concerns, questions about our security practices, or need to report a security vulnerability, 
                  please contact our security team:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold">Security Email:</span>{' '}
                      <a href="mailto:security@auditready.com" className="text-blue-600 hover:underline">
                        security@auditready.com
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold">Bug Bounty Program:</span>{' '}
                      <a href="mailto:bugbounty@auditready.com" className="text-blue-600 hover:underline">
                        bugbounty@auditready.com
                      </a>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      We take all security reports seriously and will respond within 24 hours.
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