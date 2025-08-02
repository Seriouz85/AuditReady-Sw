import React from 'react';
import CourseCreationForm from '@/components/LMS/CourseCreationForm';

interface CreateLearningPathProps {
  onClose?: () => void;
}

const CreateLearningPath: React.FC<CreateLearningPathProps> = ({ onClose }) => {
  return <CourseCreationForm onClose={onClose} />;
};

export default CreateLearningPath;