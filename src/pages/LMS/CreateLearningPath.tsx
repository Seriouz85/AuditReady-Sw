import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  User,
  Globe,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface CreateLearningPathProps {
  onClose?: () => void;
}

const CreateLearningPath: React.FC<CreateLearningPathProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);

  const categories = [
    'Prototyping',
    'UI/UX',
    'Design',
    'Card',
    'Not Urgent',
    'Line',
    'Rounded',
    'Initial',
    'Wireframe',
    'Component',
    'Text Style',
    'Color Style'
  ];

  const contentTypes = [
    { icon: 'Stage', label: 'Stage' },
    { icon: 'Course', label: 'Course' },
    { icon: 'Page', label: 'Page' },
    { icon: 'Quiz', label: 'Quiz' },
    { icon: 'Upload', label: 'Upload' },
    { icon: 'Library', label: 'Library' },
  ];

  const handleCategoryClick = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Card className="aspect-video flex items-center justify-center bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to update thumbnail</p>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Learning Path Title"
                    className="text-lg font-semibold"
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Let your learner know a little about the learning path"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Estimate duration</label>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input placeholder="e.g. 2 weeks" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trainer</label>
                    <div className="flex items-center mt-1">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input placeholder="Select trainer" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Language</label>
                  <div className="flex items-center mt-1">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Input placeholder="Select language" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Add Content</h3>
              <div className="grid grid-cols-3 gap-4">
                {contentTypes.map((type) => (
                  <Button
                    key={type.label}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary">{type.icon}</span>
                    </div>
                    <span>{type.label}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create Learning Path</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button>Save as Draft</Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant={currentStep === 1 ? "default" : "outline"}>
              Overview
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant={currentStep === 2 ? "default" : "outline"}>
              Add Content
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">Assign learners</Badge>
          </div>
        </div>
      </div>

      {renderStepContent()}

      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        {currentStep < 3 && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="gap-2 ml-auto"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateLearningPath; 