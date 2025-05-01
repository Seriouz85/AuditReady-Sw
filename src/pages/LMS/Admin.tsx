import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft,
  Settings,
  Users,
  Mail,
  FileText,
  Link as LinkIcon,
  DatabaseIcon,
  LogIn,
  BookOpen,
  BarChart,
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTimeBasedGreeting } from '@/lib/tracking';

const LMSAdmin: React.FC = () => {
  const [greeting] = useState(getTimeBasedGreeting());
  
  const currentUser = {
    name: 'Admin',
    role: 'Training Manager',
    organization: 'Audit Readiness Hub'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header Section */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="container max-w-7xl mx-auto p-8">
          <Link to="/app" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-2">
                {greeting}, {currentUser.name} <span className="text-yellow-400">✨</span>
              </h1>
              <p className="text-white/80 text-lg mb-6">LMS Administration Dashboard</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <BookOpen className="text-yellow-300 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Active Courses</p>
                    <p className="text-xl font-semibold">8</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <Users className="text-indigo-300 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Active Users</p>
                    <p className="text-xl font-semibold">124</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center">
                  <div className="rounded-full bg-white/20 p-2 mr-3">
                    <BarChart className="text-amber-300 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Completion Rate</p>
                    <p className="text-xl font-semibold">78%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 inline-flex items-center">
                <Avatar className="h-12 w-12 border-2 border-white mr-4">
                  <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=admin1`} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <p className="font-semibold">{currentUser.role}</p>
                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                      Administrator
                    </Badge>
                  </div>
                  <p className="text-sm text-white/70">{currentUser.organization}</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 text-white/5">
                  <Settings className="h-36 w-36" />
                </div>
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <Button className="w-full justify-start text-left bg-white/10 hover:bg-white/20 text-white border-0">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  
                  <Button className="w-full justify-start text-left bg-white/10 hover:bg-white/20 text-white border-0">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitations
                  </Button>
                  
                  <Button className="w-full justify-start text-left bg-white/10 hover:bg-white/20 text-white border-0">
                    <BarChart className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/lms" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to User View
          </Link>
        </div>
        
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-8 p-1 w-full flex flex-wrap md:w-auto">
            <TabsTrigger value="courses" className="flex-1 md:flex-none">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 md:flex-none">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 md:flex-none">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 md:flex-none">
              <BarChart className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Courses</h2>
              <Link to="/lms/create/content">
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </div>
            
            <Card className="p-6 rounded-xl shadow">
              <h3 className="text-lg font-medium mb-4">Course Launch Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5 border border-dashed rounded-xl bg-slate-50 hover:bg-white hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">Email Invitations</h4>
                      <p className="text-sm text-muted-foreground mb-3">Send personalized email invitations to participants</p>
                      <Button variant="outline" size="sm" className="rounded-full gap-1">
                        Configure 
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-5 border border-dashed rounded-xl bg-slate-50 hover:bg-white hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <LinkIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">SharePoint Integration</h4>
                      <p className="text-sm text-muted-foreground mb-3">Create links for internal SharePoint pages</p>
                      <Button variant="outline" size="sm" className="rounded-full gap-1">
                        Configure 
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Active Course Links</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <FileText className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Security Awareness Training {i}</p>
                          <p className="text-xs text-muted-foreground">Created 2 days ago • 24 active users</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Copy Link</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            
            <Card className="p-6 rounded-xl shadow">
              <h3 className="text-lg font-medium mb-4">Organization Users</h3>
              
              <div className="space-y-4">
                {Array.from({length: 5}).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/avataaars/svg?seed=user${i+10}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">User Name {i+1}</p>
                        <p className="text-xs text-muted-foreground">user{i+1}@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={i % 3 === 0 ? "bg-green-100 text-green-800" : i % 3 === 1 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}>
                        {i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Instructor" : "Learner"}
                      </Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-lg bg-indigo-100 p-3 text-indigo-700">
                    <DatabaseIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Entra ID (Azure AD) Integration</h3>
                    <p className="text-sm text-muted-foreground">Connect to your organization's directory service</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Connection Status</p>
                      <div className="flex items-center mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                        <p className="text-xs text-muted-foreground">Not Connected</p>
                      </div>
                    </div>
                    <Button>Connect</Button>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">Connecting to Entra ID enables single sign-on for your users and simplifies user management.</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 rounded-xl shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Single Sign-On (SSO) Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure federated login options</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">SSO Status</p>
                      <div className="flex items-center mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                        <p className="text-xs text-muted-foreground">Disabled</p>
                      </div>
                    </div>
                    <Button>Configure</Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <LinkIcon className="h-4 w-4 text-blue-700" />
                        </div>
                        <p className="font-medium text-sm">Course Access URLs</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-green-100 p-2">
                          <Mail className="h-4 w-4 text-green-700" />
                        </div>
                        <p className="font-medium text-sm">Email Templates</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Analytics & Reports</h2>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
            
            <Card className="p-6 rounded-xl shadow">
              <h3 className="text-lg font-medium mb-4">Course Performance</h3>
              
              <div className="h-64 w-full bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <p className="text-muted-foreground">Course completion analytics chart will appear here</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border bg-slate-50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Average Completion Rate</h4>
                  <p className="text-2xl font-bold">78%</p>
                </Card>
                
                <Card className="p-4 border bg-slate-50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Active Learners</h4>
                  <p className="text-2xl font-bold">124</p>
                </Card>
                
                <Card className="p-4 border bg-slate-50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Avg. Satisfaction</h4>
                  <p className="text-2xl font-bold">4.6/5</p>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Button className="rounded-full p-6 h-auto w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all">
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default LMSAdmin; 