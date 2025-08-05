import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningService } from '@/services/lms/LearningService';
import { LearningPath } from '@/types/lms';
import CourseBuilder from '@/pages/LMS/CourseBuilder';
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
      {/* Use CourseBuilder for proper course content editing */}
      <CourseBuilder />
    </div>
  );
};

export default EditCourse;