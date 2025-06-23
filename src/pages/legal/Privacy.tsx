import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Globe, Mail, Calendar } from 'lucide-react';
import { ScrollToTop } from '@/components/ScrollToTop';

export default function Privacy() {
  const navigate = useNavigate();

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
                  <h1 className="text-2xl font-bold">Privacy Policy</h1>
                  <p className="text-sm text-white/80">How we collect, use, and protect your information</p>
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
          {/* Introduction */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                AuditReady ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our compliance management platform and related services. 
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not 
                access the site.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Account Information:</strong> Name, email address, password, organization details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Profile Information:</strong> Job title, department, phone number, profile picture</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Payment Information:</strong> Billing address, payment method details (processed by Stripe)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage Information</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Log Data:</strong> IP address, browser type, operating system, access times, pages viewed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Device Information:</strong> Device type, unique device identifiers, mobile network information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span><strong>Cookies:</strong> Session cookies, preference cookies, security cookies</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Compliance Data</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Assessment responses and compliance documentation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Risk management data and audit trails</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Organization-specific compliance requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
                How We Use Your Information
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Service Delivery</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Provide and maintain our compliance management platform</li>
                    <li>• Process transactions and send related information</li>
                    <li>• Respond to customer service requests and support needs</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Platform Improvement</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Analyze usage patterns to improve our services</li>
                    <li>• Develop new features and functionality</li>
                    <li>• Conduct research and analysis</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Communication</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Send administrative information and updates</li>
                    <li>• Provide customer support and respond to inquiries</li>
                    <li>• Send marketing communications (with consent)</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Security & Compliance</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Detect and prevent fraud and abuse</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Enforce our terms and policies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                Information Sharing and Disclosure
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p className="mb-4">
                  We do not sell, trade, or rent your personal information. We may share your information in the following situations:
                </p>
                
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h3 className="font-semibold">Service Providers</h3>
                    <p className="text-sm">We share information with third-party vendors who perform services on our behalf, such as payment processing, data analysis, and email delivery.</p>
                  </div>

                  <div className="border-l-4 border-purple-600 pl-4">
                    <h3 className="font-semibold">Legal Requirements</h3>
                    <p className="text-sm">We may disclose information if required by law or in response to valid requests by public authorities.</p>
                  </div>

                  <div className="border-l-4 border-green-600 pl-4">
                    <h3 className="font-semibold">Business Transfers</h3>
                    <p className="text-sm">In the event of a merger, acquisition, or asset sale, your information may be transferred to the acquiring entity.</p>
                  </div>

                  <div className="border-l-4 border-orange-600 pl-4">
                    <h3 className="font-semibold">Consent</h3>
                    <p className="text-sm">We may share your information with your consent or at your direction.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                Data Security
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Technical Measures</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Encryption in transit and at rest</li>
                      <li>• Secure data centers</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and authentication</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">Organizational Measures</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Employee training and awareness</li>
                      <li>• Limited access on need-to-know basis</li>
                      <li>• Confidentiality agreements</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-blue-600" />
                Your Rights and Choices
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>You have the following rights regarding your personal information:</p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <span className="text-blue-600 font-semibold">Access</span>
                    </div>
                    <p className="text-sm">Request a copy of the personal information we hold about you</p>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                      <span className="text-purple-600 font-semibold">Update</span>
                    </div>
                    <p className="text-sm">Correct or update your personal information</p>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                      <span className="text-green-600 font-semibold">Delete</span>
                    </div>
                    <p className="text-sm">Request deletion of your personal information</p>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                      <span className="text-orange-600 font-semibold">Opt-out</span>
                    </div>
                    <p className="text-sm">Opt-out of marketing communications</p>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                      <span className="text-red-600 font-semibold">Portability</span>
                    </div>
                    <p className="text-sm">Request your data in a portable format</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                Contact Us
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold">Email:</span>{' '}
                      <a href="mailto:privacy@auditready.com" className="text-blue-600 hover:underline">
                        privacy@auditready.com
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold">Address:</span>{' '}
                      <span>AuditReady, Data Protection Officer, Uppsala, Sweden</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Updates to This Policy
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}