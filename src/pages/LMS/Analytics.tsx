import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Target,
  Clock,
  Award,
  Brain,
  CheckCircle,
  Play,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const LMSAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { user, currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Check if user is in demo mode
  const isDemoMode = currentOrganization?.metadata?.is_demo === true;

  useEffect(() => {
    loadAnalytics();
  }, [isDemoMode]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Return comprehensive demo data for LMS training analytics
        setAnalytics({
          overview: {
            totalCourses: 24,
            activeLearners: 347,
            completionRate: 78.5,
            totalHoursLearned: 2847,
            certificatesIssued: 89,
            averageScore: 85.2
          },
          coursePerformance: [
            { name: 'Cybersecurity Fundamentals', enrollments: 89, completions: 74, avgScore: 87.3, rating: 4.8 },
            { name: 'Phishing Awareness', enrollments: 67, completions: 58, avgScore: 91.2, rating: 4.9 },
            { name: 'ISO 27001 Training', enrollments: 45, completions: 32, avgScore: 82.1, rating: 4.6 },
            { name: 'GDPR Compliance', enrollments: 78, completions: 65, avgScore: 89.4, rating: 4.7 },
            { name: 'Incident Response', enrollments: 34, completions: 28, avgScore: 84.6, rating: 4.5 }
          ],
          learnerProgress: {
            beginner: { count: 125, avgProgress: 65 },
            intermediate: { count: 156, avgProgress: 78 },
            advanced: { count: 66, avgProgress: 84 }
          },
          timeAnalytics: {
            dailyActiveUsers: [23, 28, 31, 26, 34, 29, 32],
            weeklyCompletions: [12, 15, 18, 14, 21, 19, 16],
            monthlyTrends: {
              enrollments: 15.7,
              completions: 12.4,
              engagement: 8.9
            }
          },
          skillsProgress: [
            { skill: 'Security Awareness', level: 'Advanced', progress: 89, learners: 234 },
            { skill: 'Compliance Knowledge', level: 'Intermediate', progress: 76, learners: 189 },
            { skill: 'Risk Management', level: 'Beginner', progress: 58, learners: 145 },
            { skill: 'Incident Response', level: 'Intermediate', progress: 71, learners: 98 }
          ],
          topPerformers: [
            { name: 'Sarah Chen', coursesCompleted: 8, avgScore: 94.2, badges: 12 },
            { name: 'Michael Rodriguez', coursesCompleted: 7, avgScore: 91.8, badges: 10 },
            { name: 'Emily Johnson', coursesCompleted: 6, avgScore: 93.5, badges: 9 }
          ]
        });
        setLoading(false);
        return;
      }
      
      // Here you would fetch real LMS analytics data
      // const realData = await lmsAnalyticsService.getAnalytics();
      // setAnalytics(realData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading LMS analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lms')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Training Analytics</h1>
              <p className="text-white/90">Monitor learning progress and performance metrics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="rounded-xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{analytics?.overview.totalCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Learners</p>
                  <p className="text-2xl font-bold">{analytics?.overview.activeLearners}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">{analytics?.overview.completionRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hours Learned</p>
                  <p className="text-2xl font-bold">{analytics?.overview.totalHoursLearned.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certificates</p>
                  <p className="text-2xl font-bold">{analytics?.overview.certificatesIssued}</p>
                </div>
                <Award className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold">{analytics?.overview.averageScore}%</p>
                </div>
                <Target className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
            <TabsTrigger value="learners">Learner Progress</TabsTrigger>
            <TabsTrigger value="skills">Skills Development</TabsTrigger>
            <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Performance Overview
                </CardTitle>
                <CardDescription>
                  Track enrollment, completion rates, and learner satisfaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.coursePerformance.map((course, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{course.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{course.enrollments} enrolled</span>
                            <span>{course.completions} completed</span>
                            <span>★ {course.rating}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {course.avgScore}% avg score
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{Math.round((course.completions / course.enrollments) * 100)}%</span>
                        </div>
                        <Progress value={(course.completions / course.enrollments) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learners" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-xl border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Learner Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics?.learnerProgress || {}).map(([level, data]: [string, any]) => (
                      <div key={level} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{level}</span>
                          <span className="text-sm text-gray-600">{data.count} learners</span>
                        </div>
                        <Progress value={data.avgProgress} className="h-2" />
                        <div className="text-xs text-gray-500">{data.avgProgress}% average progress</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{performer.name}</p>
                            <p className="text-sm text-gray-600">{performer.coursesCompleted} courses • {performer.avgScore}% avg</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{performer.badges} badges</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Skills Development Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.skillsProgress.map((skill, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-semibold">{skill.skill}</h4>
                          <p className="text-sm text-gray-600">{skill.learners} learners • {skill.level} level</p>
                        </div>
                        <Badge variant="outline">{skill.progress}%</Badge>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      +{analytics?.timeAnalytics.monthlyTrends.enrollments}%
                    </div>
                    <div className="text-sm text-gray-600">New Enrollments</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      +{analytics?.timeAnalytics.monthlyTrends.completions}%
                    </div>
                    <div className="text-sm text-gray-600">Course Completions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      +{analytics?.timeAnalytics.monthlyTrends.engagement}%
                    </div>
                    <div className="text-sm text-gray-600">Engagement Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LMSAnalytics;