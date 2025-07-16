import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  PenTool, 
  Settings, 
  Users, 
  Clock, 
  Calendar,
  FileText,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Star,
  MessageSquare,
  Paperclip,
  Send,
  RotateCcw,
  Award,
  Target,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { EnhancedRichTextEditor } from '@/components/LMS/EnhancedRichTextEditor';
import { toast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: {
    id: string;
    name: string;
    description: string;
    points: number;
  }[];
}

interface AssignmentData {
  id?: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  tags: string[];
  dueDate: string;
  maxPoints: number;
  passingScore: number;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
  maxAttempts: number;
  submissionTypes: string[];
  rubric: RubricCriterion[];
  isPublished: boolean;
  estimatedTime: string;
  resources: { id: string; name: string; url: string; type: string }[];
  groupAssignment: boolean;
  maxGroupSize: number;
  peerReview: boolean;
  autoGrading: boolean;
  plagiarismCheck: boolean;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
  score?: number;
  grade?: string;
  feedback?: string;
  files: { name: string; url: string; type: string }[];
}

const AssignmentEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assignmentId } = useParams<{ assignmentId?: string }>();
  const { setTheme } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setSaving] = useState(false);
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    title: '',
    description: '',
    instructions: '',
    category: 'Assignment',
    tags: [],
    dueDate: '',
    maxPoints: 100,
    passingScore: 70,
    allowLateSubmission: true,
    lateSubmissionPenalty: 10,
    maxAttempts: 1,
    submissionTypes: ['file'],
    rubric: [],
    isPublished: false,
    estimatedTime: '2 hours',
    resources: [],
    groupAssignment: false,
    maxGroupSize: 4,
    peerReview: false,
    autoGrading: false,
    plagiarismCheck: false
  });
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showRubricBuilder, setShowRubricBuilder] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', url: '', type: 'link' });

  const categories = [
    'Assignment',
    'Project',
    'Essay',
    'Presentation',
    'Lab Report',
    'Case Study',
    'Research Paper',
    'Portfolio'
  ];

  const submissionTypeOptions = [
    { value: 'file', label: 'File Upload' },
    { value: 'text', label: 'Text Entry' },
    { value: 'url', label: 'URL Submission' },
    { value: 'media', label: 'Media Upload' }
  ];

  useEffect(() => {
    setTheme('light');
    
    if (assignmentId) {
      loadAssignmentData();
    } else if (location.state?.assignmentData) {
      setAssignmentData(location.state.assignmentData);
    }
  }, [assignmentId, location.state, setTheme]);

  const loadAssignmentData = () => {
    // Demo data for existing assignment
    const demoAssignment: AssignmentData = {
      id: assignmentId,
      title: 'Security Incident Response Plan',
      description: 'Create a comprehensive incident response plan for a cybersecurity breach scenario.',
      instructions: `<h2>Assignment Overview</h2>
        <p>You are tasked with creating a detailed incident response plan for a fictional company that has experienced a data breach.</p>
        
        <h3>Requirements:</h3>
        <ul>
          <li>Identify the type of incident and potential impact</li>
          <li>Outline the step-by-step response procedures</li>
          <li>Define roles and responsibilities</li>
          <li>Include communication protocols</li>
          <li>Provide recovery and lessons learned sections</li>
        </ul>
        
        <h3>Deliverables:</h3>
        <ol>
          <li>Written incident response plan (5-10 pages)</li>
          <li>Presentation slides summarizing key points</li>
          <li>Timeline of response activities</li>
        </ol>`,
      category: 'Assignment',
      tags: ['security', 'incident-response', 'cybersecurity'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxPoints: 100,
      passingScore: 70,
      allowLateSubmission: true,
      lateSubmissionPenalty: 10,
      maxAttempts: 2,
      submissionTypes: ['file', 'text'],
      rubric: [
        {
          id: '1',
          name: 'Content Quality',
          description: 'Accuracy and completeness of the incident response plan',
          maxPoints: 40,
          levels: [
            { id: '1a', name: 'Excellent', description: 'Comprehensive and accurate plan', points: 40 },
            { id: '1b', name: 'Good', description: 'Mostly complete with minor gaps', points: 32 },
            { id: '1c', name: 'Satisfactory', description: 'Basic requirements met', points: 28 },
            { id: '1d', name: 'Needs Improvement', description: 'Missing key components', points: 20 }
          ]
        },
        {
          id: '2',
          name: 'Organization',
          description: 'Structure and clarity of the document',
          maxPoints: 30,
          levels: [
            { id: '2a', name: 'Excellent', description: 'Clear, logical structure', points: 30 },
            { id: '2b', name: 'Good', description: 'Well organized with minor issues', points: 24 },
            { id: '2c', name: 'Satisfactory', description: 'Adequate organization', points: 21 },
            { id: '2d', name: 'Needs Improvement', description: 'Poor organization', points: 15 }
          ]
        }
      ],
      isPublished: false,
      estimatedTime: '4 hours',
      resources: [
        { id: '1', name: 'NIST Incident Response Guide', url: 'https://example.com/nist-guide', type: 'pdf' },
        { id: '2', name: 'Sample Incident Response Plan', url: 'https://example.com/sample-plan', type: 'link' }
      ],
      groupAssignment: false,
      maxGroupSize: 4,
      peerReview: false,
      autoGrading: false,
      plagiarismCheck: true
    };

    // Demo submissions
    const demoSubmissions: Submission[] = [
      {
        id: '1',
        studentId: 'student1',
        studentName: 'John Doe',
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        files: [
          { name: 'incident-response-plan.pdf', url: '/demo-file.pdf', type: 'pdf' },
          { name: 'presentation.pptx', url: '/demo-presentation.pptx', type: 'pptx' }
        ]
      },
      {
        id: '2',
        studentId: 'student2',
        studentName: 'Jane Smith',
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'graded',
        score: 85,
        grade: 'B+',
        feedback: 'Good work overall. The incident response plan is comprehensive and well-structured.',
        files: [
          { name: 'response-plan.docx', url: '/demo-file.docx', type: 'docx' }
        ]
      }
    ];

    setAssignmentData(demoAssignment);
    setSubmissions(demoSubmissions);
  };

  const handleSave = async () => {
    if (!assignmentData.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }

    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Assignment saved successfully');
      
      if (!assignmentId) {
        navigate(`/lms/assignment/${assignmentData.id || 'demo'}`);
      }
    } catch (error) {
      toast.error('Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    setAssignmentData(prev => ({ ...prev, isPublished: !prev.isPublished }));
    toast.success(assignmentData.isPublished ? 'Assignment unpublished' : 'Assignment published');
  };

  const addTag = () => {
    if (newTag.trim() && !assignmentData.tags.includes(newTag.trim())) {
      setAssignmentData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setAssignmentData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addResource = () => {
    if (newResource.name.trim() && newResource.url.trim()) {
      setAssignmentData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...newResource, id: Date.now().toString() }]
      }));
      setNewResource({ name: '', url: '', type: 'link' });
    }
  };

  const removeResource = (resourceId: string) => {
    setAssignmentData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId)
    }));
  };

  const addRubricCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: Date.now().toString(),
      name: 'New Criterion',
      description: '',
      maxPoints: 20,
      levels: [
        { id: '1', name: 'Excellent', description: '', points: 20 },
        { id: '2', name: 'Good', description: '', points: 16 },
        { id: '3', name: 'Satisfactory', description: '', points: 14 },
        { id: '4', name: 'Needs Improvement', description: '', points: 10 }
      ]
    };
    
    setAssignmentData(prev => ({
      ...prev,
      rubric: [...prev.rubric, newCriterion]
    }));
  };

  const updateRubricCriterion = (criterionId: string, updates: Partial<RubricCriterion>) => {
    setAssignmentData(prev => ({
      ...prev,
      rubric: prev.rubric.map(criterion => 
        criterion.id === criterionId ? { ...criterion, ...updates } : criterion
      )
    }));
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { 
            ...submission, 
            status: 'graded', 
            score, 
            feedback,
            grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
          }
        : submission
    ));
    toast.success('Submission graded successfully');
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const late = submissions.filter(s => s.status === 'late').length;
    const avgScore = submissions.filter(s => s.score).reduce((sum, s) => sum + (s.score || 0), 0) / (graded || 1);
    
    return { total, graded, submitted, late, avgScore };
  };

  const stats = getSubmissionStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/lms/library')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Input
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Assignment title"
                    className="text-lg font-semibold border-none focus:ring-0 p-0 h-auto"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant={assignmentData.isPublished ? "default" : "secondary"}>
                      {assignmentData.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <span>•</span>
                    <span>{assignmentData.maxPoints} points</span>
                    <span>•</span>
                    <span>{assignmentData.estimatedTime}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                className="gap-2"
              >
                {assignmentData.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="rubric">Rubric</TabsTrigger>
                <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={assignmentData.description}
                        onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide a brief description of the assignment"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={assignmentData.category} 
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={assignmentData.dueDate}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxPoints">Maximum Points</Label>
                        <Input
                          id="maxPoints"
                          type="number"
                          value={assignmentData.maxPoints}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="estimatedTime">Estimated Time</Label>
                        <Input
                          id="estimatedTime"
                          value={assignmentData.estimatedTime}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                          placeholder="e.g., 2 hours"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {assignmentData.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} size="sm">
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Resources</Label>
                      <div className="space-y-2 mt-2">
                        {assignmentData.resources.map(resource => (
                          <div key={resource.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4" />
                            <span className="flex-1">{resource.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(resource.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <Input
                          value={newResource.name}
                          onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Resource name"
                        />
                        <Input
                          value={newResource.url}
                          onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="URL"
                        />
                        <Button onClick={addResource} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Resource
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="instructions">
                <Card className="p-0">
                  <EnhancedRichTextEditor
                    initialContent={assignmentData.instructions}
                    onSave={(content) => setAssignmentData(prev => ({ ...prev, instructions: content }))}
                    onCancel={() => {}}
                    placeholder="Enter detailed instructions for the assignment..."
                    height="600px"
                    autoSave={true}
                    showWordCount={true}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="rubric">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Grading Rubric</h3>
                    <Button onClick={addRubricCriterion} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Criterion
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {assignmentData.rubric.map((criterion, index) => (
                      <Card key={criterion.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              value={criterion.name}
                              onChange={(e) => updateRubricCriterion(criterion.id, { name: e.target.value })}
                              className="font-medium"
                            />
                            <Input
                              type="number"
                              value={criterion.maxPoints}
                              onChange={(e) => updateRubricCriterion(criterion.id, { maxPoints: parseInt(e.target.value) || 0 })}
                              className="w-24"
                            />
                            <span className="text-sm text-gray-500">pts</span>
                          </div>
                          
                          <Input
                            value={criterion.description}
                            onChange={(e) => updateRubricCriterion(criterion.id, { description: e.target.value })}
                            placeholder="Criterion description"
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                            {criterion.levels.map((level, levelIndex) => (
                              <div key={level.id} className="border rounded p-2 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={level.name}
                                    onChange={(e) => {
                                      const newLevels = [...criterion.levels];
                                      newLevels[levelIndex] = { ...level, name: e.target.value };
                                      updateRubricCriterion(criterion.id, { levels: newLevels });
                                    }}
                                    className="text-sm font-medium"
                                  />
                                  <Input
                                    type="number"
                                    value={level.points}
                                    onChange={(e) => {
                                      const newLevels = [...criterion.levels];
                                      newLevels[levelIndex] = { ...level, points: parseInt(e.target.value) || 0 };
                                      updateRubricCriterion(criterion.id, { levels: newLevels });
                                    }}
                                    className="w-16 text-sm"
                                  />
                                </div>
                                <Textarea
                                  value={level.description}
                                  onChange={(e) => {
                                    const newLevels = [...criterion.levels];
                                    newLevels[levelIndex] = { ...level, description: e.target.value };
                                    updateRubricCriterion(criterion.id, { levels: newLevels });
                                  }}
                                  placeholder="Level description"
                                  className="text-xs"
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="submissions">
                <div className="space-y-4">
                  {/* Submission Stats */}
                  <Card className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                        <div className="text-sm text-gray-500">Graded</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
                        <div className="text-sm text-gray-500">Submitted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.late}</div>
                        <div className="text-sm text-gray-500">Late</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.avgScore.toFixed(1)}</div>
                        <div className="text-sm text-gray-500">Avg Score</div>
                      </div>
                    </div>
                  </Card>

                  {/* Submissions List */}
                  <div className="space-y-2">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{submission.studentName}</div>
                              <div className="text-sm text-gray-500">
                                Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              submission.status === 'graded' ? 'default' :
                              submission.status === 'submitted' ? 'secondary' :
                              submission.status === 'late' ? 'destructive' : 'outline'
                            }>
                              {submission.status}
                            </Badge>
                            
                            {submission.score && (
                              <Badge variant="outline">
                                {submission.score}/{assignmentData.maxPoints}
                              </Badge>
                            )}
                            
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            {submission.status === 'submitted' && (
                              <Button 
                                size="sm"
                                onClick={() => gradeSubmission(submission.id, 85, 'Good work overall!')}
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Grade
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {submission.files.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-2">
                              {submission.files.map((file, index) => (
                                <div key={index} className="flex items-center gap-1 text-sm bg-gray-100 rounded px-2 py-1">
                                  <Paperclip className="h-3 w-3" />
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {submission.feedback && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm">
                              <strong>Feedback:</strong> {submission.feedback}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input
                          id="passingScore"
                          type="number"
                          value={assignmentData.passingScore}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                        <Input
                          id="maxAttempts"
                          type="number"
                          value={assignmentData.maxAttempts}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Submission Types</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {submissionTypeOptions.map(option => (
                          <Badge
                            key={option.value}
                            variant={assignmentData.submissionTypes.includes(option.value) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newTypes = assignmentData.submissionTypes.includes(option.value)
                                ? assignmentData.submissionTypes.filter(t => t !== option.value)
                                : [...assignmentData.submissionTypes, option.value];
                              setAssignmentData(prev => ({ ...prev, submissionTypes: newTypes }));
                            }}
                          >
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Late Submissions</Label>
                          <p className="text-sm text-gray-500">Students can submit after the due date</p>
                        </div>
                        <Switch
                          checked={assignmentData.allowLateSubmission}
                          onCheckedChange={(checked) => setAssignmentData(prev => ({ ...prev, allowLateSubmission: checked }))}
                        />
                      </div>

                      {assignmentData.allowLateSubmission && (
                        <div>
                          <Label htmlFor="lateSubmissionPenalty">Late Submission Penalty (%)</Label>
                          <Input
                            id="lateSubmissionPenalty"
                            type="number"
                            value={assignmentData.lateSubmissionPenalty}
                            onChange={(e) => setAssignmentData(prev => ({ ...prev, lateSubmissionPenalty: parseInt(e.target.value) || 10 }))}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Group Assignment</Label>
                          <p className="text-sm text-gray-500">Allow students to work in groups</p>
                        </div>
                        <Switch
                          checked={assignmentData.groupAssignment}
                          onCheckedChange={(checked) => setAssignmentData(prev => ({ ...prev, groupAssignment: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Peer Review</Label>
                          <p className="text-sm text-gray-500">Enable peer review of submissions</p>
                        </div>
                        <Switch
                          checked={assignmentData.peerReview}
                          onCheckedChange={(checked) => setAssignmentData(prev => ({ ...prev, peerReview: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Plagiarism Check</Label>
                          <p className="text-sm text-gray-500">Check submissions for plagiarism</p>
                        </div>
                        <Switch
                          checked={assignmentData.plagiarismCheck}
                          onCheckedChange={(checked) => setAssignmentData(prev => ({ ...prev, plagiarismCheck: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Assignment Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge variant={assignmentData.isPublished ? "default" : "secondary"}>
                    {assignmentData.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Due Date</span>
                  <span>{assignmentData.dueDate ? new Date(assignmentData.dueDate).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points</span>
                  <span>{assignmentData.maxPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time</span>
                  <span>{assignmentData.estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Submissions</span>
                  <span>{submissions.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Download Submissions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Send Announcement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Award className="h-4 w-4" />
                  Grade All
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentEditor;