import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/LMS/VideoPlayer';
import { InteractiveQuiz } from '@/components/LMS/InteractiveQuiz';
import { AssignmentSubmission } from '@/components/LMS/AssignmentSubmission';
import { BookmarkNotes } from '@/components/LMS/BookmarkNotes';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  CheckCircle,
  Circle,
  Book,
  Clock,
  Users,
  Star,
  Download,
  Share,
  Bookmark,
  Volume2,
  Settings,
  Maximize,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  FileQuestion,
  Trophy,
  Target,
  StickyNote
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: string;
  completed: boolean;
  content?: string;
  videoUrl?: string;
  description?: string;
}

interface CourseSection {
  id: string;
  title: string;
  modules: CourseModule[];
  completed: boolean;
  expanded: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  duration: string;
  rating: number;
  students: number;
  sections: CourseSection[];
  progress: number;
}

// Demo course data
const demoCoursePart: Course = {
  id: 'demo-cybersecurity-101',
  title: 'Introduction to Cybersecurity Compliance',
  description: 'Master the fundamentals of cybersecurity compliance frameworks including GDPR, ISO 27001, and industry best practices through practical examples and real-world scenarios.',
  instructor: {
    name: 'Dr. Sarah Chen',
    title: 'Senior Cybersecurity Consultant',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=sarah'
  },
  duration: '2h 30m',
  rating: 4.8,
  students: 1247,
  progress: 35,
  sections: [
    {
      id: 'section-1',
      title: 'Introduction to Cybersecurity',
      completed: true,
      expanded: true,
      modules: [
        {
          id: 'mod-1-1',
          title: 'Welcome and Course Overview',
          type: 'video',
          duration: '8:30',
          completed: true,
          videoUrl: 'https://www.youtube.com/watch?v=jPA6gbsT2IQ',
          description: 'Introduction to the course structure and learning objectives'
        },
        {
          id: 'mod-1-2',
          title: 'What is Cybersecurity?',
          type: 'text',
          duration: '12 min read',
          completed: true,
          content: '<h3>Understanding Cybersecurity Fundamentals</h3><p>Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.</p><p>Key areas include:</p><ul><li>Network Security</li><li>Information Security</li><li>Application Security</li><li>Endpoint Security</li></ul>'
        },
        {
          id: 'mod-1-3',
          title: 'Knowledge Check: Basic Concepts',
          type: 'quiz',
          duration: '5 min',
          completed: true,
          content: 'Quiz covering fundamental cybersecurity concepts'
        }
      ]
    },
    {
      id: 'section-2',
      title: 'Compliance Frameworks',
      completed: false,
      expanded: true,
      modules: [
        {
          id: 'mod-2-1',
          title: 'Introduction to GDPR',
          type: 'text',
          duration: '15 min read',
          completed: true,
          content: `
            <div class="space-y-8">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h2 class="text-2xl font-bold text-blue-900 mb-3">🛡️ General Data Protection Regulation (GDPR)</h2>
                <p class="text-lg text-blue-800 leading-relaxed">The most comprehensive data protection law in the world, designed to give individuals control over their personal data and reshape the way organizations approach data privacy.</p>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">📋</span>
                    Key Principles
                  </h3>
                  <ul class="space-y-3 text-gray-700">
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Lawfulness:</strong> Data processing must have a legal basis</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Transparency:</strong> Clear information about data use</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Purpose Limitation:</strong> Data used only for specified purposes</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Data Minimization:</strong> Collect only necessary data</span>
                    </li>
                  </ul>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">⚖️</span>
                    Individual Rights
                  </h3>
                  <ul class="space-y-3 text-gray-700">
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Right to Information:</strong> Know how data is used</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Right of Access:</strong> Obtain copies of personal data</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Right to Rectification:</strong> Correct inaccurate data</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Right to Erasure:</strong> "Right to be forgotten"</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
                  <span class="text-2xl mr-3">💰</span>
                  Financial Impact
                </h3>
                <div class="grid md:grid-cols-2 gap-4 text-yellow-800">
                  <div class="bg-yellow-100 rounded-lg p-4">
                    <div class="text-2xl font-bold">€20M</div>
                    <div class="text-sm">or 4% of annual turnover</div>
                    <div class="text-xs mt-1">Maximum fine for severe violations</div>
                  </div>
                  <div class="bg-yellow-100 rounded-lg p-4">
                    <div class="text-2xl font-bold">€10M</div>
                    <div class="text-sm">or 2% of annual turnover</div>
                    <div class="text-xs mt-1">Maximum fine for other violations</div>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">🌍 Global Scope</h3>
                <p class="text-gray-700 leading-relaxed mb-4">
                  GDPR applies to <strong>any organization</strong> that processes personal data of EU residents, regardless of where the organization is located. This extraterritorial reach has made GDPR a global standard for data protection.
                </p>
                <div class="grid md:grid-cols-3 gap-4 mt-4">
                  <div class="text-center p-4 bg-white rounded-lg border">
                    <div class="text-2xl font-bold text-blue-600">500M+</div>
                    <div class="text-sm text-gray-600">EU Citizens Protected</div>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg border">
                    <div class="text-2xl font-bold text-green-600">May 2018</div>
                    <div class="text-sm text-gray-600">Enforcement Started</div>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg border">
                    <div class="text-2xl font-bold text-purple-600">Global</div>
                    <div class="text-sm text-gray-600">Application Scope</div>
                  </div>
                </div>
              </div>
            </div>
          `,
          description: 'Comprehensive overview of GDPR principles, rights, and global impact'
        },
        {
          id: 'mod-2-2',
          title: 'GDPR Implementation Guide',
          type: 'video',
          duration: '18:45',
          completed: false,
          videoUrl: 'https://www.youtube.com/watch?v=aEnwF1Iut4s',
          description: 'Comprehensive guide to implementing GDPR compliance in your organization'
        },
        {
          id: 'mod-2-3',
          title: 'ISO 27001 Overview',
          type: 'text',
          duration: '18 min read',
          completed: false,
          content: `
            <div class="space-y-8">
              <div class="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <h2 class="text-2xl font-bold text-purple-900 mb-3">🔒 ISO/IEC 27001:2022</h2>
                <p class="text-lg text-purple-800 leading-relaxed">The international standard for Information Security Management Systems (ISMS), providing a systematic approach to managing sensitive company information.</p>
              </div>

              <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">🎯</span>
                  ISMS Framework Structure
                </h3>
                
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">📋</span>
                    </div>
                    <h4 class="font-semibold text-blue-900 mb-2">PLAN</h4>
                    <p class="text-sm text-gray-600">Establish ISMS policies and procedures</p>
                  </div>
                  <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">⚡</span>
                    </div>
                    <h4 class="font-semibold text-green-900 mb-2">DO</h4>
                    <p class="text-sm text-gray-600">Implement and operate security controls</p>
                  </div>
                  <div class="text-center">
                    <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">📊</span>
                    </div>
                    <h4 class="font-semibold text-orange-900 mb-2">CHECK</h4>
                    <p class="text-sm text-gray-600">Monitor and review ISMS performance</p>
                  </div>
                  <div class="text-center">
                    <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">🔄</span>
                    </div>
                    <h4 class="font-semibold text-purple-900 mb-2">ACT</h4>
                    <p class="text-sm text-gray-600">Maintain and improve the ISMS</p>
                  </div>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
                  <h3 class="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                    <span class="text-2xl mr-3">🏗️</span>
                    Core Components
                  </h3>
                  <ul class="space-y-3 text-indigo-800">
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Information Security Policy:</strong> High-level direction and support</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Risk Assessment:</strong> Identify and evaluate information security risks</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Risk Treatment:</strong> Select and implement security controls</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Statement of Applicability:</strong> Document control objectives and controls</span>
                    </li>
                  </ul>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h3 class="text-xl font-semibold text-green-900 mb-4 flex items-center">
                    <span class="text-2xl mr-3">✅</span>
                    Key Benefits
                  </h3>
                  <ul class="space-y-3 text-green-800">
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Enhanced Security:</strong> Systematic protection of information assets</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Regulatory Compliance:</strong> Meet legal and contractual requirements</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Business Continuity:</strong> Maintain operations during incidents</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Competitive Advantage:</strong> Demonstrate security commitment</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span class="text-2xl mr-3">📚</span>
                  Annex A: 93 Security Controls
                </h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <div class="text-lg font-bold text-blue-600 mb-1">A.5</div>
                    <div class="text-sm font-medium text-gray-900 mb-1">Information Security Policies</div>
                    <div class="text-xs text-gray-600">2 controls</div>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <div class="text-lg font-bold text-green-600 mb-1">A.6</div>
                    <div class="text-sm font-medium text-gray-900 mb-1">Organization of Information Security</div>
                    <div class="text-xs text-gray-600">7 controls</div>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <div class="text-lg font-bold text-purple-600 mb-1">A.7</div>
                    <div class="text-sm font-medium text-gray-900 mb-1">Human Resource Security</div>
                    <div class="text-xs text-gray-600">6 controls</div>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <div class="text-lg font-bold text-orange-600 mb-1">A.8</div>
                    <div class="text-sm font-medium text-gray-900 mb-1">Asset Management</div>
                    <div class="text-xs text-gray-600">10 controls</div>
                  </div>
                </div>
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p class="text-sm text-blue-800">
                    <strong>Pro Tip:</strong> The 2022 version restructured controls into 4 themes: Organizational (37), People (8), Physical (14), and Technological (34) controls for better clarity and implementation.
                  </p>
                </div>
              </div>

              <div class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-amber-900 mb-4 flex items-center">
                  <span class="text-2xl mr-3">🎯</span>
                  Implementation Timeline
                </h3>
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="text-center p-4 bg-white rounded-lg border border-amber-200">
                    <div class="text-2xl font-bold text-amber-600 mb-2">3-6 months</div>
                    <div class="text-sm font-medium text-gray-900">Gap Analysis & Planning</div>
                    <div class="text-xs text-gray-600 mt-1">Initial assessment and project setup</div>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg border border-amber-200">
                    <div class="text-2xl font-bold text-amber-600 mb-2">6-12 months</div>
                    <div class="text-sm font-medium text-gray-900">ISMS Implementation</div>
                    <div class="text-xs text-gray-600 mt-1">Deploy controls and processes</div>
                  </div>
                  <div class="text-center p-4 bg-white rounded-lg border border-amber-200">
                    <div class="text-2xl font-bold text-amber-600 mb-2">2-3 months</div>
                    <div class="text-sm font-medium text-gray-900">Certification Process</div>
                    <div class="text-xs text-gray-600 mt-1">Audit preparation and execution</div>
                  </div>
                </div>
              </div>
            </div>
          `,
          description: 'Understanding the ISO 27001 standard for information security management systems'
        },
        {
          id: 'mod-2-4',
          title: 'Compliance Assessment',
          type: 'assignment',
          duration: '30 min',
          completed: false,
          content: 'Practical assessment of compliance frameworks understanding'
        }
      ]
    },
    {
      id: 'section-3',
      title: 'Risk Management',
      completed: false,
      expanded: false,
      modules: [
        {
          id: 'mod-3-1',
          title: 'Risk Assessment Methodologies',
          type: 'text',
          duration: '22 min read',
          completed: false,
          content: `
            <div class="space-y-8">
              <div class="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <h2 class="text-2xl font-bold text-red-900 mb-3">🎯 Risk Assessment Methodologies</h2>
                <p class="text-lg text-red-800 leading-relaxed">Systematic approaches to identifying, analyzing, and evaluating information security risks within an organization.</p>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">🔍</span>
                    Qualitative Assessment
                  </h3>
                  <ul class="space-y-3 text-gray-700">
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Descriptive Analysis:</strong> Uses categories like High, Medium, Low</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Expert Judgment:</strong> Relies on experience and intuition</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Rapid Results:</strong> Faster implementation and completion</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Cost Effective:</strong> Lower resource requirements</span>
                    </li>
                  </ul>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">📊</span>
                    Quantitative Assessment
                  </h3>
                  <ul class="space-y-3 text-gray-700">
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Numerical Analysis:</strong> Uses mathematical calculations and metrics</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Data-Driven:</strong> Based on historical data and statistics</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Precise Results:</strong> Specific monetary values and probabilities</span>
                    </li>
                    <li class="flex items-start">
                      <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Audit Trail:</strong> Transparent and repeatable methodology</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-purple-900 mb-6 flex items-center">
                  <span class="text-2xl mr-3">⚡</span>
                  Popular Risk Assessment Frameworks
                </h3>
                
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div class="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 class="font-bold text-purple-900 mb-2">NIST SP 800-30</h4>
                    <p class="text-sm text-purple-700 mb-3">Guide for Conducting Risk Assessments</p>
                    <div class="text-xs text-purple-600">
                      <div>✓ Comprehensive methodology</div>
                      <div>✓ Federal government standard</div>
                      <div>✓ Detailed implementation guidance</div>
                    </div>
                  </div>
                  
                  <div class="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 class="font-bold text-purple-900 mb-2">ISO 27005</h4>
                    <p class="text-sm text-purple-700 mb-3">Information Security Risk Management</p>
                    <div class="text-xs text-purple-600">
                      <div>✓ International standard</div>
                      <div>✓ Aligns with ISO 27001</div>
                      <div>✓ Process-oriented approach</div>
                    </div>
                  </div>
                  
                  <div class="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 class="font-bold text-purple-900 mb-2">OCTAVE</h4>
                    <p class="text-sm text-purple-700 mb-3">Operationally Critical Threat, Asset, and Vulnerability Evaluation</p>
                    <div class="text-xs text-purple-600">
                      <div>✓ Self-directed approach</div>
                      <div>✓ Business-focused</div>
                      <div>✓ Carnegie Mellon developed</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span class="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">🔄</span>
                  Risk Assessment Process
                </h3>
                
                <div class="grid md:grid-cols-4 gap-4">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">🎯</span>
                    </div>
                    <h4 class="font-semibold text-blue-900 mb-2">1. Prepare</h4>
                    <p class="text-sm text-gray-600">Define scope, methodology, and team</p>
                  </div>
                  <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">🔍</span>
                    </div>
                    <h4 class="font-semibold text-green-900 mb-2">2. Conduct</h4>
                    <p class="text-sm text-gray-600">Identify threats, vulnerabilities, impacts</p>
                  </div>
                  <div class="text-center">
                    <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">📊</span>
                    </div>
                    <h4 class="font-semibold text-orange-900 mb-2">3. Communicate</h4>
                    <p class="text-sm text-gray-600">Share results with stakeholders</p>
                  </div>
                  <div class="text-center">
                    <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span class="text-2xl">🔄</span>
                    </div>
                    <h4 class="font-semibold text-purple-900 mb-2">4. Maintain</h4>
                    <p class="text-sm text-gray-600">Monitor and update assessments</p>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-amber-900 mb-4 flex items-center">
                  <span class="text-2xl mr-3">⚠️</span>
                  Common Risk Assessment Challenges
                </h3>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold text-amber-800 mb-3">Organizational Challenges</h4>
                    <ul class="space-y-2 text-amber-800 text-sm">
                      <li>• Lack of management support</li>
                      <li>• Insufficient resources and expertise</li>
                      <li>• Poor stakeholder engagement</li>
                      <li>• Inconsistent risk tolerance levels</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-semibold text-amber-800 mb-3">Technical Challenges</h4>
                    <ul class="space-y-2 text-amber-800 text-sm">
                      <li>• Incomplete asset inventories</li>
                      <li>• Difficulty quantifying intangible assets</li>
                      <li>• Rapidly evolving threat landscape</li>
                      <li>• Integration with existing processes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          `,
          description: 'Comprehensive overview of risk assessment methodologies and frameworks'
        },
        {
          id: 'mod-3-2',
          title: 'Risk Mitigation Strategies',
          type: 'text',
          duration: '15 min read',
          completed: false,
          content: `
            <div class="space-y-8">
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h2 class="text-2xl font-bold text-green-900 mb-3">🛡️ Risk Mitigation Strategies</h2>
                <p class="text-lg text-green-800 leading-relaxed">Comprehensive approaches to reducing, transferring, accepting, or avoiding information security risks based on organizational risk appetite and business objectives.</p>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">🚫</span>
                    Risk Avoidance
                  </h3>
                  <p class="text-gray-700 mb-3">Eliminating the risk by not engaging in the activity that creates it.</p>
                  <div class="bg-red-50 p-3 rounded-lg">
                    <p class="text-sm text-red-800"><strong>Example:</strong> Not implementing a new cloud service due to unacceptable security risks.</p>
                  </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">📉</span>
                    Risk Reduction
                  </h3>
                  <p class="text-gray-700 mb-3">Implementing controls to decrease likelihood or impact of risks.</p>
                  <div class="bg-blue-50 p-3 rounded-lg">
                    <p class="text-sm text-blue-800"><strong>Example:</strong> Installing firewalls, encryption, and access controls.</p>
                  </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">🔄</span>
                    Risk Transfer
                  </h3>
                  <p class="text-gray-700 mb-3">Shifting risk to third parties through contracts or insurance.</p>
                  <div class="bg-purple-50 p-3 rounded-lg">
                    <p class="text-sm text-purple-800"><strong>Example:</strong> Cyber insurance policies or outsourcing to managed security providers.</p>
                  </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">✅</span>
                    Risk Acceptance
                  </h3>
                  <p class="text-gray-700 mb-3">Acknowledging and accepting the risk when mitigation costs exceed benefits.</p>
                  <div class="bg-green-50 p-3 rounded-lg">
                    <p class="text-sm text-green-800"><strong>Example:</strong> Accepting low-impact risks with minimal business consequences.</p>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-indigo-900 mb-6 flex items-center">
                  <span class="text-2xl mr-3">🔧</span>
                  Control Categories
                </h3>
                
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="bg-white rounded-lg p-4 border border-indigo-200">
                    <h4 class="font-bold text-indigo-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-indigo-100 rounded mr-2 flex items-center justify-center text-xs">🚧</span>
                      Preventive Controls
                    </h4>
                    <ul class="text-sm text-indigo-700 space-y-1">
                      <li>• Access controls</li>
                      <li>• Firewalls</li>
                      <li>• Encryption</li>
                      <li>• Security awareness training</li>
                      <li>• Physical security measures</li>
                    </ul>
                  </div>
                  
                  <div class="bg-white rounded-lg p-4 border border-indigo-200">
                    <h4 class="font-bold text-indigo-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-indigo-100 rounded mr-2 flex items-center justify-center text-xs">👁️</span>
                      Detective Controls
                    </h4>
                    <ul class="text-sm text-indigo-700 space-y-1">
                      <li>• Intrusion detection systems</li>
                      <li>• Log monitoring</li>
                      <li>• Security audits</li>
                      <li>• Vulnerability assessments</li>
                      <li>• Antivirus software</li>
                    </ul>
                  </div>
                  
                  <div class="bg-white rounded-lg p-4 border border-indigo-200">
                    <h4 class="font-bold text-indigo-900 mb-3 flex items-center">
                      <span class="w-6 h-6 bg-indigo-100 rounded mr-2 flex items-center justify-center text-xs">🚨</span>
                      Corrective Controls
                    </h4>
                    <ul class="text-sm text-indigo-700 space-y-1">
                      <li>• Incident response procedures</li>
                      <li>• Backup and recovery systems</li>
                      <li>• Patch management</li>
                      <li>• Security orchestration</li>
                      <li>• Business continuity plans</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span class="text-2xl mr-3">💰</span>
                  Cost-Benefit Analysis Framework
                </h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="bg-white rounded-lg p-4 border">
                    <h4 class="font-semibold text-gray-900 mb-3">Cost Factors</h4>
                    <ul class="text-sm text-gray-700 space-y-2">
                      <li>• Initial implementation costs</li>
                      <li>• Ongoing operational expenses</li>
                      <li>• Training and education costs</li>
                      <li>• Technology and infrastructure</li>
                      <li>• Compliance and audit expenses</li>
                    </ul>
                  </div>
                  
                  <div class="bg-white rounded-lg p-4 border">
                    <h4 class="font-semibold text-gray-900 mb-3">Benefit Factors</h4>
                    <ul class="text-sm text-gray-700 space-y-2">
                      <li>• Reduced incident probability</li>
                      <li>• Minimized impact severity</li>
                      <li>• Regulatory compliance benefits</li>
                      <li>• Enhanced business reputation</li>
                      <li>• Competitive advantages</li>
                    </ul>
                  </div>
                </div>
                
                <div class="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p class="text-sm text-yellow-800">
                    <strong>Formula:</strong> Annual Loss Expectancy (ALE) = Single Loss Expectancy (SLE) × Annual Rate of Occurrence (ARO)
                  </p>
                </div>
              </div>
            </div>
          `,
          description: 'Comprehensive guide to risk mitigation strategies and control implementation'
        }
      ]
    }
  ]
};

const CourseViewer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course] = useState<Course>(demoCoursePart);
  const [currentModule, setCurrentModule] = useState<CourseModule>(course.sections[1].modules[1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionsState, setSectionsState] = useState(course.sections);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const toggleSection = (sectionId: string) => {
    setSectionsState(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const selectModule = (module: CourseModule) => {
    setCurrentModule(module);
    setIsPlaying(false);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'text': return FileText;
      case 'quiz': return FileQuestion;
      case 'assignment': return Target;
      default: return FileText;
    }
  };

  const getNextModule = () => {
    const allModules = sectionsState.flatMap(section => section.modules);
    const currentIndex = allModules.findIndex(m => m.id === currentModule.id);
    return allModules[currentIndex + 1] || null;
  };

  const getPreviousModule = () => {
    const allModules = sectionsState.flatMap(section => section.modules);
    const currentIndex = allModules.findIndex(m => m.id === currentModule.id);
    return allModules[currentIndex - 1] || null;
  };

  const markModuleComplete = () => {
    // In real app, this would update the backend
    console.log('Marking module complete:', currentModule.id);
    const nextModule = getNextModule();
    if (nextModule) {
      setCurrentModule(nextModule);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Course Navigation */}
      <div className="w-80 bg-white border-r shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/lms')}
              className="text-white hover:bg-white/20 mb-4 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Book className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight">{course.title}</h1>
                <p className="text-blue-100 text-sm mt-1">Interactive Learning Experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Clock className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Users className="h-4 w-4 text-green-200" />
                <span className="text-blue-100">{course.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Star className="h-4 w-4 fill-current text-yellow-300" />
                <span className="text-blue-100">{course.rating}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-gray-600">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        {/* Course Content Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {sectionsState.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-left hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {section.expanded ? (
                      <ChevronDown className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          Section {sectionIndex + 1}
                        </span>
                        {section.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900">{section.title}</h3>
                    </div>
                  </div>
                </Button>

                {/* Section Modules */}
                {section.expanded && (
                  <div className="ml-6 space-y-1">
                    {section.modules.map((module, moduleIndex) => {
                      const Icon = getModuleIcon(module.type);
                      const isActive = currentModule.id === module.id;
                      
                      return (
                        <Button
                          key={module.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start p-2 h-auto text-left ${
                            isActive ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                          onClick={() => selectModule(module)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center gap-2">
                              {module.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                module.type === 'video' ? 'bg-red-100' :
                                module.type === 'text' ? 'bg-blue-100' :
                                module.type === 'quiz' ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                <Icon className={`h-3 w-3 ${
                                  module.type === 'video' ? 'text-red-600' :
                                  module.type === 'text' ? 'text-blue-600' :
                                  module.type === 'quiz' ? 'text-green-600' : 'text-orange-600'
                                }`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{module.title}</h4>
                              <p className="text-xs text-gray-500">{module.duration}</p>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Info */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={course.instructor.avatar} />
              <AvatarFallback>
                {course.instructor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{course.instructor.name}</h4>
              <p className="text-xs text-gray-600">{course.instructor.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  currentModule.type === 'video' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  currentModule.type === 'text' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  currentModule.type === 'quiz' ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                }`}>
                  {React.createElement(getModuleIcon(currentModule.type), {
                    className: 'h-6 w-6 text-white'
                  })}
                </div>
                <div>
                  <h1 className="font-bold text-2xl text-gray-900 mb-1">{currentModule.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                      <Clock className="h-4 w-4" />
                      {currentModule.duration}
                    </span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
                    </Badge>
                    {currentModule.completed && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant={showBookmarks ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className={showBookmarks ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"}
                >
                  <StickyNote className="h-4 w-4 mr-2" />
                  {showBookmarks ? 'Hide Notes' : 'Take Notes'}
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentModule.type === 'video' ? (
            <div className="space-y-6">
              {/* Advanced Video Player */}
              <div className="aspect-video">
                <VideoPlayer
                  src={currentModule.videoUrl || 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'}
                  title={currentModule.title}
                  description={currentModule.description}
                  onProgress={(progress, currentTime) => {
                    // Track video progress for analytics
                    setCurrentVideoTime(currentTime);
                    console.log(`Video progress: ${progress}% at ${currentTime}s`);
                  }}
                  onComplete={() => {
                    console.log('Video completed');
                    markModuleComplete();
                  }}
                  className="w-full h-full"
                />
              </div>
              
              {/* Video Description */}
              {currentModule.description && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3">About this video</h3>
                  <p className="text-gray-700">{currentModule.description}</p>
                </Card>
              )}
            </div>
          ) : currentModule.type === 'text' ? (
            <Card className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: currentModule.content || '<p>Text content would be displayed here.</p>' 
                }}
              />
            </Card>
          ) : currentModule.type === 'quiz' ? (
            <InteractiveQuiz
              title={currentModule.title}
              description="Test your understanding of the concepts covered in this section."
              passingScore={70}
              allowRetries={true}
              showExplanations={true}
              timeLimit={10} // 10 minutes
              onComplete={(score, attempts) => {
                console.log(`Quiz completed with score: ${score}%`, attempts);
                if (score >= 70) {
                  markModuleComplete();
                }
              }}
              onProgress={(current, total) => {
                console.log(`Quiz progress: ${current}/${total}`);
              }}
            />
          ) : (
            <AssignmentSubmission
              title={currentModule.title}
              description="Complete this practical assignment to apply what you've learned in this module."
              instructions="Analyze a real-world cybersecurity compliance scenario and provide recommendations based on the frameworks covered in this course."
              dueDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // Due in 7 days
              maxPoints={50}
              allowedFileTypes={['.pdf', '.doc', '.docx', '.txt']}
              maxFileSize={10}
              maxFiles={3}
              onSubmit={(content, files) => {
                console.log('Assignment submitted:', { content, files });
                markModuleComplete();
              }}
              onSaveDraft={(content, files) => {
                console.log('Draft saved:', { content, files });
              }}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              disabled={!getPreviousModule()}
              onClick={() => getPreviousModule() && setCurrentModule(getPreviousModule()!)}
            >
              <SkipBack className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={markModuleComplete}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              
              <Button 
                disabled={!getNextModule()}
                onClick={() => getNextModule() && setCurrentModule(getNextModule()!)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        </div>

        {/* Enhanced BookmarkNotes Sidebar */}
        {showBookmarks && (
          <div className="w-96 border-l bg-gradient-to-b from-blue-50 to-white shadow-lg">
            <div className="h-full flex flex-col">
              {/* Notes Header */}
              <div className="p-6 border-b bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900">Study Notes</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowBookmarks(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Notes for: <span className="font-medium text-blue-700">{currentModule.title}</span>
                </p>
              </div>
              
              {/* Notes Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <BookmarkNotes
                  moduleId={currentModule.id}
                  moduleName={currentModule.title}
                  moduleType={currentModule.type}
                  currentPosition={currentModule.type === 'video' ? currentVideoTime : 0}
                  onJumpTo={(position) => {
                    if (currentModule.type === 'video') {
                      // In a real implementation, this would seek the video to the position
                      setCurrentVideoTime(position);
                      console.log(`Jumping to ${position}s in video`);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseViewer;