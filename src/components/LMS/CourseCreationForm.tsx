import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/utils/toast';
import { learningService } from '@/services/lms/LearningService';
import { useAuth } from '@/contexts/AuthContext';
import { LearningPath } from '@/types/lms';
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Users,
  Clock,
  Target,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface CourseCreationFormProps {
  onClose?: () => void;
  onSuccess?: (course: LearningPath) => void;
}

const CourseCreationForm: React.FC<CourseCreationFormProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category: 'custom' as 'security' | 'compliance' | 'technical' | 'soft-skills' | 'custom',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimated_duration_minutes: 60,
    target_audience: '',
    learning_objectives: [] as string[],
    is_published: false,
    is_mandatory: false,
    is_featured: false,
    language: 'en'
  });

  const [objectives, setObjectives] = useState<string[]>(['']);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addObjective = () => {
    setObjectives(prev => [...prev, '']);
  };

  const updateObjective = (index: number, value: string) => {
    setObjectives(prev => prev.map((obj, i) => i === index ? value : obj));
  };

  const removeObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !organization) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setIsLoading(true);

    try {
      const courseData: Partial<LearningPath> = {
        ...formData,
        organization_id: organization.id,
        tags: tags.length > 0 ? tags : undefined,
        learning_objectives: objectives.filter(obj => obj.trim()),
        total_modules: 0, // Will be updated as content is added
        status: formData.is_published ? 'published' : 'draft'
      };

      const createdCourse = await learningService.createCourse(courseData);
      
      if (createdCourse) {
        toast.success('Course created successfully!');
        onSuccess?.(createdCourse);
        
        // Navigate to course builder
        navigate(`/lms/courses/${createdCourse.id}/edit`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/lms');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground">
              Design and publish a new learning path for your organization
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="soft-skills">Soft Skills</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Brief one-line description"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the course content and objectives"
                className="min-h-[100px]"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => handleInputChange('estimated_duration_minutes', parseInt(e.target.value) || 0)}
                  min="1"
                  placeholder="60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="e.g., New employees, Managers, IT Staff"
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {objectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  placeholder={`Learning objective ${index + 1}`}
                />
                {objectives.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addObjective}>
              Add Objective
            </Button>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag (press Enter or click Add)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X 
                    className="h-3 w-3 ml-1" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Course Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published">Publish Immediately</Label>
                <p className="text-sm text-muted-foreground">Make this course available to learners</p>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mandatory">Mandatory Course</Label>
                <p className="text-sm text-muted-foreground">Require all users to complete this course</p>
              </div>
              <Switch
                id="mandatory"
                checked={formData.is_mandatory}
                onCheckedChange={(checked) => handleInputChange('is_mandatory', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="featured">Featured Course</Label>
                <p className="text-sm text-muted-foreground">Highlight this course on the dashboard</p>
              </div>
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreationForm;