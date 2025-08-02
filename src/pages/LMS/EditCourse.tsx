import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningService } from '@/services/lms/LearningService';
import { LearningPath } from '@/types/lms';
import CourseCreationForm from '@/components/LMS/CourseCreationForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toast';

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const courseData = await learningService.getCourseById(id);
      setCourse(courseData);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      navigate('/lms');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedCourse: LearningPath) => {
    toast.success('Course updated successfully');
    navigate('/lms');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Course not found</h3>
        <p className="text-muted-foreground mb-4">
          The course you're looking for doesn't exist or you don't have permission to edit it.
        </p>
        <Button onClick={() => navigate('/lms')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to LMS
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* For now, redirect to course creation form with pre-filled data */}
      {/* In a full implementation, this would be an edit-specific form */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Course: {course.title}</h1>
          <p className="text-muted-foreground">
            Update course information and settings
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Course editing is currently redirected to the course creation form. 
            In a full implementation, this would be a dedicated edit interface with pre-filled course data.
          </p>
        </div>

        <CourseCreationForm 
          onClose={() => navigate('/lms')}
          onSuccess={handleUpdateSuccess}
        />
      </div>
    </div>
  );
};

export default EditCourse;