import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Cookie, 
  Settings, 
  Eye, 
  BarChart3, 
  Shield, 
  Globe, 
  CheckCircle,
  Calendar,
  Users,
  Info,
  AlertTriangle
} from 'lucide-react';

export default function Cookies() {
  const navigate = useNavigate();

  const cookieTypes = [
    {
      name: "Essential Cookies",
      purpose: "Required for basic website functionality",
      examples: ["Authentication", "Session management", "Security tokens"],
      retention: "Session or 1 year",
      canDisable: false,
      icon: <Shield className="w-5 h-5" />,
      color: "green"
    },
    {
      name: "Functional Cookies",
      purpose: "Remember your preferences and settings",
      examples: ["Language preferences", "Theme selection", "Regional settings"],
      retention: "1 year",
      canDisable: true,
      icon: <Settings className="w-5 h-5" />,
      color: "blue"
    },
    {
      name: "Analytics Cookies",
      purpose: "Help us understand how you use our platform",
      examples: ["Page views", "User interactions", "Performance metrics"],
      retention: "2 years",
      canDisable: true,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "purple"
    },
    {
      name: "Marketing Cookies",
      purpose: "Deliver relevant content and track campaign effectiveness",
      examples: ["Ad targeting", "Campaign tracking", "Social media integration"],
      retention: "1 year",
      canDisable: true,
      icon: <Eye className="w-5 h-5" />,
      color: "orange"
    }
  ];

  const thirdPartyCookies = [
    {
      service: "Stripe",
      purpose: "Payment processing and fraud prevention",
      category: "Essential",
      privacy_policy: "https://stripe.com/privacy"
    },
    {
      service: "Supabase",
      purpose: "Database and authentication services",
      category: "Essential",
      privacy_policy: "https://supabase.com/privacy"
    },
    {
      service: "Google Analytics",
      purpose: "Website analytics and performance monitoring",
      category: "Analytics",
      privacy_policy: "https://policies.google.com/privacy"
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
                  <Cookie className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Cookie Policy</h1>
                  <p className="text-sm text-white/80">How we use cookies to improve your experience and protect your privacy</p>
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
                <Info className="w-6 h-6 mr-2 text-blue-600" />
                What Are Cookies?
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Cookies are small text files that are stored on your device when you visit our website. They help us 
                  provide you with a better experience by remembering your preferences, keeping you signed in, and helping 
                  us understand how you use our platform.
                </p>
                <p>
                  At AuditReady, we respect your privacy and are committed to being transparent about our use of cookies. 
                  This policy explains what cookies we use, why we use them, and how you can control them.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Cookie className="w-6 h-6 mr-2 text-blue-600" />
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                {cookieTypes.map((type, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-${type.color}-100 dark:bg-${type.color}-900/30 rounded-lg`}>
                          {type.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{type.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{type.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={type.canDisable ? "secondary" : "default"}
                          className={type.canDisable ? "" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}
                        >
                          {type.canDisable ? "Optional" : "Required"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Examples:</h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          {type.examples.map((example, i) => (
                            <li key={i} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Retention Period:</h4>
                        <p className="text-gray-600 dark:text-gray-400">{type.retention}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                Third-Party Cookies
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400 mb-6">
                <p>
                  We work with trusted third-party services that may set their own cookies on your device. 
                  These services help us provide essential functionality and improve our platform.
                </p>
              </div>

              <div className="space-y-4">
                {thirdPartyCookies.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{service.service}</h3>
                        <Badge 
                          variant={service.category === 'Essential' ? 'default' : 'secondary'}
                          className={service.category === 'Essential' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        >
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{service.purpose}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={service.privacy_policy} target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-blue-600" />
                Managing Your Cookie Preferences
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Browser Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You can control cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>View cookies stored on your device</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Delete existing cookies</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Block future cookies</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Set cookie preferences by website</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Important Notice</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Disabling essential cookies may affect the functionality of our platform. Some features may not 
                        work properly, and you may experience issues with authentication and security.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Platform Cookie Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You can manage your cookie preferences for our platform through your account settings:
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button onClick={() => navigate('/settings/privacy')}>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Preferences
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser-Specific Instructions */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Browser-Specific Instructions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Chrome</h3>
                  <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>1. Click the three dots menu</li>
                    <li>2. Go to Settings → Privacy and security</li>
                    <li>3. Click on "Cookies and other site data"</li>
                    <li>4. Choose your preferred settings</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Firefox</h3>
                  <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>1. Click the menu button</li>
                    <li>2. Go to Settings → Privacy & Security</li>
                    <li>3. Under "Cookies and Site Data"</li>
                    <li>4. Adjust your preferences</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Safari</h3>
                  <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>1. Go to Safari → Preferences</li>
                    <li>2. Click the Privacy tab</li>
                    <li>3. Choose "Block all cookies" or</li>
                    <li>4. Customize your settings</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Edge</h3>
                  <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>1. Click the three dots menu</li>
                    <li>2. Go to Settings → Cookies and site permissions</li>
                    <li>3. Click on "Cookies and site data"</li>
                    <li>4. Configure your preferences</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates and Changes */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Updates to This Policy
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices, 
                  technology, or legal requirements. When we make significant changes, we will:
                </p>
                
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    <span>Update the "Last updated" date at the top of this policy</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    <span>Notify you through our platform or via email</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    <span>Provide you with an opportunity to review and update your preferences</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Questions About Cookies?
              </h2>
              
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  If you have questions about our use of cookies or this policy, please contact us:
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
                      <span className="font-semibold">Subject:</span>{' '}
                      <span>Cookie Policy Inquiry</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      We will respond to your inquiry within 48 hours.
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