import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Upload, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Trash2,
  FileText,
  Calendar
} from 'lucide-react';
import { enrollmentService } from '@/services/lms/EnrollmentService';
import { learningService } from '@/services/lms/LearningService';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from '@/utils/toast';
import { LearningPath } from '@/types/lms';

interface EnrollmentManagerProps {
  courseId?: string;
  showCourseSelection?: boolean;
}

export const EnrollmentManager: React.FC<EnrollmentManagerProps> = ({ 
  courseId,
  showCourseSelection = true 
}) => {
  const { user, isDemo } = useAuth();
  const { organization } = useOrganization();
  
  const [activeTab, setActiveTab] = useState('enroll');
  const [courses, setCourses] = useState<LearningPath[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  
  // Enrollment form state
  const [enrollmentForm, setEnrollmentForm] = useState({
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
    sendNotification: true
  });
  
  // Invitation form state
  const [invitationForm, setInvitationForm] = useState({
    emails: '',
    message: '',
    assignCourses: true
  });
  
  // Bulk upload state
  const [bulkUploadData, setBulkUploadData] = useState<any[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    activeUsers: 0,
    pendingInvitations: 0
  });

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization, selectedCourse]);

  const loadData = async () => {
    if (!organization) return;
    
    try {
      setLoading(true);
      
      if (isDemo) {
        // Load demo data
        loadDemoData();
      } else {
        // Load real data
        const [coursesData, statsData] = await Promise.all([
          learningService.getOrganizationCourses(organization.id),
          enrollmentService.getEnrollmentStats(organization.id)
        ]);
        
        setCourses(coursesData);
        setStats(statsData);
        
        if (selectedCourse) {
          const [available, enrolled] = await Promise.all([
            enrollmentService.getOrganizationUsers(organization.id, selectedCourse),
            enrollmentService.getEnrolledUsers(selectedCourse)
          ]);
          
          setAvailableUsers(available);
          setEnrolledUsers(enrolled);
        }
      }
    } catch (error) {
      console.error('Error loading enrollment data:', error);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadDemoData = () => {
    // Demo courses
    setCourses([
      {
        id: 'demo-course-1',
        title: 'Cybersecurity Fundamentals',
        description: 'Learn the basics of cybersecurity',
        organization_id: 'demo-org',
        category: 'security',
        difficulty_level: 'beginner',
        estimated_duration: 120,
        total_modules: 5,
        is_published: true,
        is_mandatory: true,
        created_by: 'demo-user',
        updated_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
    
    // Demo users
    setAvailableUsers([
      { id: 'user-1', email: 'john@democorp.com', name: 'John Smith', role: 'employee' },
      { id: 'user-2', email: 'jane@democorp.com', name: 'Jane Doe', role: 'manager' },
      { id: 'user-3', email: 'bob@democorp.com', name: 'Bob Johnson', role: 'employee' }
    ]);
    
    // Demo enrolled users
    setEnrolledUsers([
      {
        id: 'enrollment-1',
        assigned_to: 'user-4',
        user: { id: 'user-4', email: 'alice@democorp.com', name: 'Alice Brown', role: 'employee' },
        progress: { progress_percentage: 75, completed_at: null, last_accessed_at: new Date().toISOString() },
        created_at: new Date().toISOString(),
        due_date: null,
        priority: 'medium'
      }
    ]);
    
    // Demo stats
    setStats({
      totalUsers: 25,
      totalCourses: 8,
      totalEnrollments: 45,
      completionRate: 68,
      activeUsers: 18,
      pendingInvitations: 3
    });
  };

  const handleEnrollUsers = async () => {
    if (!selectedCourse || selectedUsers.length === 0) {
      toast.error('Please select a course and users to enroll');
      return;
    }
    
    try {
      setEnrolling(true);
      
      if (isDemo) {
        toast.success(`Enrolled ${selectedUsers.length} users (demo mode)`);
        setSelectedUsers([]);
        return;
      }
      
      const success = await enrollmentService.enrollUsers({
        userIds: selectedUsers,
        learningPathId: selectedCourse,
        dueDate: enrollmentForm.dueDate || undefined,
        priority: enrollmentForm.priority,
        notes: enrollmentForm.notes || undefined,
        sendNotification: enrollmentForm.sendNotification
      });
      
      if (success) {
        setSelectedUsers([]);
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error enrolling users:', error);
      toast.error('Failed to enroll users');
    } finally {
      setEnrolling(false);
    }
  };
  
  const handleInviteUsers = async () => {
    const emails = invitationForm.emails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }
    
    if (!organization) {
      toast.error('Organization context required');
      return;
    }
    
    try {
      const invitations = emails.map(email => ({
        email,
        organizationId: organization.id,
        learningPathIds: invitationForm.assignCourses && selectedCourse ? [selectedCourse] : []
      }));
      
      if (isDemo) {
        toast.success(`Sent ${emails.length} invitations (demo mode)`);
        setInvitationForm({ emails: '', message: '', assignCourses: true });
        return;
      }
      
      const success = await enrollmentService.inviteUsers(invitations);
      if (success) {
        setInvitationForm({ emails: '', message: '', assignCourses: true });
        loadData();
      }
    } catch (error) {
      console.error('Error inviting users:', error);
      toast.error('Failed to send invitations');
    }
  };
  
  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
        
        setBulkUploadData(data);
        setShowBulkDialog(true);
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };
  
  const handleUnenrollUser = async (userId: string) => {
    if (!selectedCourse) return;
    
    try {
      if (isDemo) {
        toast.success('User unenrolled (demo mode)');
        return;
      }
      
      const success = await enrollmentService.unenrollUser(userId, selectedCourse);
      if (success) {
        loadData();
      }
    } catch (error) {
      console.error('Error unenrolling user:', error);
      toast.error('Failed to unenroll user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(stats.completionRate)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingInvitations}</p>
              </div>
              <Send className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Selection */}
      {showCourseSelection && (
        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course to manage enrollments" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="enroll">Enroll Users</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled Users</TabsTrigger>
            <TabsTrigger value="invite">Invite New Users</TabsTrigger>
          </TabsList>

          <TabsContent value="enroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enroll Existing Users</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    <label htmlFor="bulk-upload" className="cursor-pointer">
                      Bulk Upload
                    </label>
                    <input
                      id="bulk-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleBulkUpload}
                    />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enrollment Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="due-date">Due Date (Optional)</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={enrollmentForm.dueDate}
                      onChange={(e) => setEnrollmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={enrollmentForm.priority} 
                      onValueChange={(value: any) => setEnrollmentForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="send-notification"
                        checked={enrollmentForm.sendNotification}
                        onCheckedChange={(checked) => 
                          setEnrollmentForm(prev => ({ ...prev, sendNotification: !!checked }))
                        }
                      />
                      <Label htmlFor="send-notification">Send notification</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes for the enrolled users..."
                    value={enrollmentForm.notes}
                    onChange={(e) => setEnrollmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                {/* User Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Select Users to Enroll</h4>
                    <Badge variant="outline">
                      {selectedUsers.length} selected
                    </Badge>
                  </div>
                  
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {availableUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 border-b last:border-b-0">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.name || user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleEnrollUsers}
                  disabled={enrolling || selectedUsers.length === 0}
                  className="w-full"
                >
                  {enrolling ? 'Enrolling...' : `Enroll ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledUsers.map(enrollment => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{enrollment.user?.name || enrollment.user?.email}</p>
                            <p className="text-sm text-muted-foreground">{enrollment.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{enrollment.progress?.progress_percentage || 0}%</span>
                            </div>
                            <Progress value={enrollment.progress?.progress_percentage || 0} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.progress?.last_accessed_at 
                            ? new Date(enrollment.progress.last_accessed_at).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          {enrollment.progress?.completed_at ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : enrollment.progress?.progress_percentage > 0 ? (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700">
                              Not Started
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnenrollUser(enrollment.user?.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invite New Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emails">Email Addresses</Label>
                  <Textarea
                    id="emails"
                    placeholder="Enter email addresses, one per line...
example1@company.com
example2@company.com"
                    value={invitationForm.emails}
                    onChange={(e) => setInvitationForm(prev => ({ ...prev, emails: e.target.value }))}
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a custom message to the invitation..."
                    value={invitationForm.message}
                    onChange={(e) => setInvitationForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assign-courses"
                    checked={invitationForm.assignCourses}
                    onCheckedChange={(checked) => 
                      setInvitationForm(prev => ({ ...prev, assignCourses: !!checked }))
                    }
                  />
                  <Label htmlFor="assign-courses">
                    Automatically assign selected course to new users
                  </Label>
                </div>

                <Button onClick={handleInviteUsers} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Preview</DialogTitle>
            <DialogDescription>
              Review the data before proceeding with bulk enrollment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {bulkUploadData[0] && Object.keys(bulkUploadData[0]).map(key => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulkUploadData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {bulkUploadData.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing first 10 rows of {bulkUploadData.length} total rows.
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (organization) {
                  await enrollmentService.bulkEnrollFromData(bulkUploadData, organization.id);
                  setShowBulkDialog(false);
                  setBulkUploadData([]);
                  loadData();
                }
              }}
            >
              Process {bulkUploadData.length} Records
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};