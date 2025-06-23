import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Scale, AlertTriangle, CreditCard, Users, Shield, Calendar } from 'lucide-react';

export default function Terms() {
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
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Terms of Service</h1>
                  <p className="text-sm text-white/80">Terms governing your use of our platform and services</p>
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
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Agreement to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and AuditReady ("Company," "we," "our," or "us") 
                regarding your use of our compliance management platform and services. By accessing or using our services, you agree to be bound 
                by these Terms. If you do not agree to these Terms, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* Acceptance */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Acceptance of Terms
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  By creating an account, accessing our platform, or using any of our services, you represent and warrant that:
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 text-lg">✓</span>
                      <span>You are at least 18 years old or have reached the age of majority in your jurisdiction</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 text-lg">✓</span>
                      <span>You have the legal authority to enter into this agreement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 text-lg">✓</span>
                      <span>You will provide accurate and complete information when creating an account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 text-lg">✓</span>
                      <span>You will comply with all applicable laws and regulations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Service Description
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  AuditReady provides a cloud-based compliance management platform that includes:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">Core Features</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Compliance assessment tools</li>
                      <li>• Risk management systems</li>
                      <li>• Audit trail capabilities</li>
                      <li>• Document management</li>
                      <li>• Reporting and analytics</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">Enterprise Features</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Single Sign-On (SSO)</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Advanced user management</li>
                      <li>• Custom integrations</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                User Responsibilities
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Security</h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                      that occur under your account. You must notify us immediately of any unauthorized use of your account.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptable Use</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">You agree not to:</p>
                  <div className="space-y-2">
                    {[
                      "Use the service for any illegal or unauthorized purpose",
                      "Attempt to gain unauthorized access to any part of the service",
                      "Interfere with or disrupt the service or servers",
                      "Upload malicious code, viruses, or harmful content",
                      "Violate any applicable laws or regulations",
                      "Infringe upon the rights of others",
                      "Use the service to send spam or unsolicited communications"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                Payment Terms
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• <strong>Free Plan:</strong> Limited features, no payment required</li>
                      <li>• <strong>Team Plan:</strong> €499/month, billed monthly or annually</li>
                      <li>• <strong>Business Plan:</strong> €699/month, billed monthly or annually</li>
                      <li>• <strong>Enterprise Plan:</strong> €999/month, custom billing available</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Payment Processing</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                      <li>• Payments processed securely through Stripe</li>
                      <li>• Automatic renewal unless cancelled</li>
                      <li>• Prorated charges for plan upgrades</li>
                      <li>• Refunds subject to our refund policy</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="font-semibold mb-2">Refund Policy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We offer a 30-day money-back guarantee for new subscriptions. Refunds are processed within 5-10 business days 
                    and will be credited to your original payment method.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Intellectual Property Rights
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold mb-2">Our Rights</h3>
                  <p className="text-sm">
                    The service and its original content, features, and functionality are and will remain the exclusive property of 
                    AuditReady and its licensors. The service is protected by copyright, trademark, and other laws.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4">
                  <h3 className="font-semibold mb-2">Your Content</h3>
                  <p className="text-sm">
                    You retain ownership of any content you submit to our service. By submitting content, you grant us a 
                    license to use, store, and process your content solely for the purpose of providing our services.
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-semibold mb-2">License to Use</h3>
                  <p className="text-sm">
                    We grant you a limited, non-exclusive, non-transferable license to use our service in accordance with these Terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                Limitation of Liability
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <strong>IMPORTANT:</strong> To the maximum extent permitted by applicable law, in no event shall AuditReady, 
                    its affiliates, officers, directors, employees, or licensors be liable for any indirect, incidental, special, 
                    consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or 
                    other intangible losses, resulting from your use of the service.
                  </p>
                </div>

                <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                  <p>Our total liability to you for all claims arising from or related to the service shall not exceed:</p>
                  <ul className="space-y-1 ml-6">
                    <li>• The amount you paid us in the 12 months preceding the claim; or</li>
                    <li>• €1,000 if you have not paid us any amounts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Termination
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Termination by You</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    You may terminate your account at any time through your account settings or by contacting our support team. 
                    Upon termination, your access to the service will cease immediately.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Termination by Us</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    We may terminate or suspend your account immediately, without prior notice, if you:
                  </p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-sm ml-6">
                    <li>• Breach these Terms</li>
                    <li>• Violate applicable laws or regulations</li>
                    <li>• Engage in fraudulent or harmful activities</li>
                    <li>• Fail to pay required fees</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Data Retention</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Upon termination, we will retain your data for 30 days to allow for account reactivation. After this period, 
                    your data will be permanently deleted in accordance with our data retention policy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Governing Law and Disputes
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of California, 
                  United States, without regard to its conflict of law provisions.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Dispute Resolution</h3>
                  <p className="text-sm">
                    Any disputes arising from these Terms or your use of the service will be resolved through binding arbitration 
                    in accordance with the Commercial Arbitration Rules of the American Arbitration Association.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Changes to These Terms
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400">
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms 
                on this page and updating the "Last updated" date. Your continued use of the service after such changes constitutes 
                acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  If you have any questions about these Terms, please contact us:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold">Email:</span>{' '}
                      <a href="mailto:legal@auditready.com" className="text-blue-600 hover:underline">
                        legal@auditready.com
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold">Address:</span>{' '}
                      <span>AuditReady, Legal Department, Uppsala, Sweden</span>
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