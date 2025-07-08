import { apiClient } from './client';
import { 
  Organization, 
  ComplianceFramework, 
  Assessment, 
  Document,
  RequirementStatus,
  Risk,
  Course,
  CourseEnrollment,
  LearningProgress
} from '@/types/database';

// Organization endpoints
export const organizationApi = {
  getAll: () => apiClient.get<Organization[]>('/organizations'),
  getById: (id: string) => apiClient.get<Organization>(`/organizations/${id}`),
  create: (data: Partial<Organization>) => apiClient.post<Organization>('/organizations', data),
  update: (id: string, data: Partial<Organization>) => apiClient.patch<Organization>(`/organizations/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/organizations/${id}`),
  
  // Organization users
  getUsers: (orgId: string) => apiClient.get<any[]>(`/organizations/${orgId}/users`),
  inviteUser: (orgId: string, email: string, role: string) => 
    apiClient.post<any>(`/organizations/${orgId}/invite`, { email, role }),
  removeUser: (orgId: string, userId: string) => 
    apiClient.delete<void>(`/organizations/${orgId}/users/${userId}`),
};

// Compliance endpoints
export const complianceApi = {
  // Frameworks
  getFrameworks: (orgId: string) => apiClient.get<ComplianceFramework[]>(`/compliance/frameworks?org_id=${orgId}`),
  getFramework: (id: string) => apiClient.get<ComplianceFramework>(`/compliance/frameworks/${id}`),
  createFramework: (data: Partial<ComplianceFramework>) => apiClient.post<ComplianceFramework>('/compliance/frameworks', data),
  updateFramework: (id: string, data: Partial<ComplianceFramework>) => apiClient.patch<ComplianceFramework>(`/compliance/frameworks/${id}`, data),
  deleteFramework: (id: string) => apiClient.delete<void>(`/compliance/frameworks/${id}`),
  
  // Requirements
  getRequirements: (frameworkId: string) => apiClient.get<any[]>(`/compliance/frameworks/${frameworkId}/requirements`),
  getRequirementStatuses: (orgId: string, frameworkId?: string) => {
    const params = frameworkId ? `?org_id=${orgId}&framework_id=${frameworkId}` : `?org_id=${orgId}`;
    return apiClient.get<RequirementStatus[]>(`/compliance/requirement-statuses${params}`);
  },
  updateRequirementStatus: (id: string, data: Partial<RequirementStatus>) => 
    apiClient.patch<RequirementStatus>(`/compliance/requirement-statuses/${id}`, data),
  
  // Gap analysis
  getGapAnalysis: (orgId: string, frameworkId: string) => 
    apiClient.get<any>(`/compliance/gap-analysis?org_id=${orgId}&framework_id=${frameworkId}`),
};

// Assessment endpoints
export const assessmentApi = {
  getAll: (orgId: string) => apiClient.get<Assessment[]>(`/assessments?org_id=${orgId}`),
  getById: (id: string) => apiClient.get<Assessment>(`/assessments/${id}`),
  create: (data: Partial<Assessment>) => apiClient.post<Assessment>('/assessments', data),
  update: (id: string, data: Partial<Assessment>) => apiClient.patch<Assessment>(`/assessments/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/assessments/${id}`),
  
  // Assessment responses
  getResponses: (assessmentId: string) => apiClient.get<any[]>(`/assessments/${assessmentId}/responses`),
  submitResponse: (assessmentId: string, data: any) => 
    apiClient.post<any>(`/assessments/${assessmentId}/responses`, data),
  
  // Assessment templates
  getTemplates: () => apiClient.get<any[]>('/assessment-templates'),
  createFromTemplate: (templateId: string, orgId: string) => 
    apiClient.post<Assessment>('/assessments/from-template', { templateId, orgId }),
};

// Document endpoints
export const documentApi = {
  getAll: (orgId: string) => apiClient.get<Document[]>(`/documents?org_id=${orgId}`),
  getById: (id: string) => apiClient.get<Document>(`/documents/${id}`),
  upload: (file: File, metadata: any, onProgress?: (progress: number) => void) => 
    apiClient.uploadFile('/documents/upload', file, onProgress),
  update: (id: string, data: Partial<Document>) => apiClient.patch<Document>(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/documents/${id}`),
  
  // Document generation
  generateFromTemplate: (templateId: string, data: any) => 
    apiClient.post<Document>('/documents/generate', { templateId, data }),
  generateWithAI: (prompt: string, frameworkId?: string) => 
    apiClient.post<Document>('/documents/generate-ai', { prompt, frameworkId }),
};

// Risk endpoints
export const riskApi = {
  getAll: (orgId: string) => apiClient.get<Risk[]>(`/risks?org_id=${orgId}`),
  getById: (id: string) => apiClient.get<Risk>(`/risks/${id}`),
  create: (data: Partial<Risk>) => apiClient.post<Risk>('/risks', data),
  update: (id: string, data: Partial<Risk>) => apiClient.patch<Risk>(`/risks/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/risks/${id}`),
  
  // Risk analysis
  analyzeRisk: (riskId: string) => apiClient.post<any>(`/risks/${riskId}/analyze`),
  predictRisks: (orgId: string) => apiClient.post<any[]>('/risks/predict', { orgId }),
  
  // Risk matrix
  getMatrix: (orgId: string) => apiClient.get<any>(`/risks/matrix?org_id=${orgId}`),
  updateMatrix: (orgId: string, matrix: any) => apiClient.put<any>('/risks/matrix', { orgId, matrix }),
};

// Learning Management System endpoints
export const lmsApi = {
  // Courses
  getCourses: (orgId: string) => apiClient.get<Course[]>(`/lms/courses?org_id=${orgId}`),
  getCourse: (id: string) => apiClient.get<Course>(`/lms/courses/${id}`),
  createCourse: (data: Partial<Course>) => apiClient.post<Course>('/lms/courses', data),
  updateCourse: (id: string, data: Partial<Course>) => apiClient.patch<Course>(`/lms/courses/${id}`, data),
  deleteCourse: (id: string) => apiClient.delete<void>(`/lms/courses/${id}`),
  
  // Enrollments
  getEnrollments: (userId: string) => apiClient.get<CourseEnrollment[]>(`/lms/enrollments?user_id=${userId}`),
  enrollUser: (courseId: string, userId: string) => 
    apiClient.post<CourseEnrollment>('/lms/enrollments', { courseId, userId }),
  unenrollUser: (enrollmentId: string) => apiClient.delete<void>(`/lms/enrollments/${enrollmentId}`),
  
  // Progress
  getProgress: (enrollmentId: string) => apiClient.get<LearningProgress>(`/lms/progress/${enrollmentId}`),
  updateProgress: (enrollmentId: string, data: Partial<LearningProgress>) => 
    apiClient.patch<LearningProgress>(`/lms/progress/${enrollmentId}`, data),
  
  // Content
  uploadContent: (courseId: string, file: File, onProgress?: (progress: number) => void) => 
    apiClient.uploadFile(`/lms/courses/${courseId}/content`, file, onProgress),
};

// Analytics endpoints
export const analyticsApi = {
  getComplianceOverview: (orgId: string) => 
    apiClient.get<any>(`/analytics/compliance-overview?org_id=${orgId}`),
  getRiskDashboard: (orgId: string) => 
    apiClient.get<any>(`/analytics/risk-dashboard?org_id=${orgId}`),
  getAssessmentMetrics: (orgId: string) => 
    apiClient.get<any>(`/analytics/assessment-metrics?org_id=${orgId}`),
  getUserActivity: (orgId: string, userId?: string) => {
    const params = userId ? `?org_id=${orgId}&user_id=${userId}` : `?org_id=${orgId}`;
    return apiClient.get<any>(`/analytics/user-activity${params}`);
  },
  exportReport: (type: string, orgId: string, filters?: any) => 
    apiClient.post<Blob>('/analytics/export', { type, orgId, filters }, { responseType: 'blob' }),
};

// AI endpoints
export const aiApi = {
  generateDocument: (prompt: string, context?: any) => 
    apiClient.post<any>('/ai/generate-document', { prompt, context }),
  generateProcessFlow: (description: string) => 
    apiClient.post<any>('/ai/generate-process-flow', { description }),
  analyzeRisk: (riskData: any) => 
    apiClient.post<any>('/ai/analyze-risk', riskData),
  suggestControls: (frameworkId: string, requirementId: string) => 
    apiClient.post<any[]>('/ai/suggest-controls', { frameworkId, requirementId }),
  summarizeDocument: (documentId: string) => 
    apiClient.post<any>('/ai/summarize-document', { documentId }),
};

// Integration endpoints
export const integrationApi = {
  // GitHub
  connectGitHub: (orgId: string, token: string) => 
    apiClient.post<any>('/integrations/github/connect', { orgId, token }),
  syncRepositories: (orgId: string) => 
    apiClient.post<any[]>('/integrations/github/sync-repos', { orgId }),
  
  // Microsoft
  connectAzure: (orgId: string, credentials: any) => 
    apiClient.post<any>('/integrations/azure/connect', { orgId, credentials }),
  getAzureApps: (orgId: string) => 
    apiClient.get<any[]>(`/integrations/azure/apps?org_id=${orgId}`),
  
  // SharePoint
  connectSharePoint: (orgId: string, credentials: any) => 
    apiClient.post<any>('/integrations/sharepoint/connect', { orgId, credentials }),
  publishToSharePoint: (documentId: string, siteId: string) => 
    apiClient.post<any>('/integrations/sharepoint/publish', { documentId, siteId }),
};

// News and updates
export const newsApi = {
  getLatestNews: (limit?: number) => 
    apiClient.get<any[]>(`/news/latest${limit ? `?limit=${limit}` : ''}`),
  getRelevantNews: (orgId: string) => 
    apiClient.get<any[]>(`/news/relevant?org_id=${orgId}`),
};