import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  BarChart2, 
  FileText, 
  Calendar, 
  BookMarked, 
  Copy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface Quiz {
  id: number;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low' | 'Not Urgent';
  questionsCount: number;
  completionRate: number;
  accuracy: number;
  timeEstimate: string;
  lastModified: string;
  tags: string[];
}

const QuizView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Sample quiz data
  const quizzes: Quiz[] = [
    {
      id: 1,
      title: 'UI Design Fundamentals & Best Practice',
      category: 'Design',
      priority: 'Not Urgent',
      questionsCount: 12,
      completionRate: 64,
      accuracy: 80,
      timeEstimate: '30 min',
      lastModified: '2 days ago',
      tags: ['UI/UX', 'Prototyping']
    },
    {
      id: 2,
      title: 'Financial Reporting Ethics Assessment',
      category: 'Finance',
      priority: 'High',
      questionsCount: 25,
      completionRate: 30,
      accuracy: 75,
      timeEstimate: '45 min',
      lastModified: '1 week ago',
      tags: ['Audit', 'Compliance']
    },
    {
      id: 3,
      title: 'Cybersecurity Awareness Test',
      category: 'IT',
      priority: 'Medium',
      questionsCount: 15,
      completionRate: 0,
      accuracy: 0,
      timeEstimate: '20 min',
      lastModified: '3 days ago',
      tags: ['Security', 'Compliance']
    },
    {
      id: 4,
      title: 'Risk Assessment Methodology',
      category: 'Risk',
      priority: 'Not Urgent',
      questionsCount: 18,
      completionRate: 100,
      accuracy: 92,
      timeEstimate: '35 min',
      lastModified: '2 weeks ago',
      tags: ['Audit', 'Risk Management']
    }
  ];

  // Filter quizzes based on search and active filter
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          quiz.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quiz.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'completed') return matchesSearch && quiz.completionRate === 100;
    if (activeFilter === 'in-progress') return matchesSearch && quiz.completionRate > 0 && quiz.completionRate < 100;
    if (activeFilter === 'not-started') return matchesSearch && quiz.completionRate === 0;
    
    return matchesSearch;
  });

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-orange-100 text-orange-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      case 'Not Urgent': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Quiz Card component
  const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => (
    <Card className="p-5 hover:shadow-lg transition-all cursor-pointer">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{quiz.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{quiz.category}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(quiz.priority)}`}>
                {quiz.priority}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <BarChart2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Questions</span>
            <div className="flex items-center gap-1 mt-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">{quiz.questionsCount}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Accuracy</span>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{quiz.accuracy}%</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Time</span>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{quiz.timeEstimate}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Completion</span>
            <span className="text-xs font-medium">{quiz.completionRate}%</span>
          </div>
          <Progress value={quiz.completionRate} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {quiz.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 inline mr-1" />
            {quiz.lastModified}
          </span>
        </div>
      </div>
    </Card>
  );

  // Add New Quiz Dialog Content
  const AddNewQuizDialog = () => (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-xl">Add New Quiz</DialogTitle>
      </DialogHeader>
      
      <div className="mt-4 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Quiz Title</label>
            <Input placeholder="Enter quiz title" className="mt-1" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input placeholder="Select or create category" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <div className="flex space-x-2 mt-1">
                <Badge className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200">High</Badge>
                <Badge className="cursor-pointer bg-orange-100 text-orange-700 hover:bg-orange-200">Medium</Badge>
                <Badge className="cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200">Low</Badge>
                <Badge className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200">Not Urgent</Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Add Questions From</h3>
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <span>Create New</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookMarked className="h-5 w-5 text-primary" />
              </div>
              <span>From Library</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Copy className="h-5 w-5 text-primary" />
              </div>
              <span>Duplicate Existing</span>
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button>Create Quiz</Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Quiz
            </Button>
          </DialogTrigger>
          <AddNewQuizDialog />
        </Dialog>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search quizzes..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Tabs defaultValue="all" onValueChange={setActiveFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="not-started">Not Started</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map(quiz => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No quizzes found</h2>
          <p className="mt-2 text-muted-foreground">Try adjusting your filters or create a new quiz.</p>
        </div>
      )}
    </div>
  );
};

export default QuizView; 