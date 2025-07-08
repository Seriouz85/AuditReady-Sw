import { vi } from 'vitest';

// Mock API responses
export const mockApiResponses = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  organization: {
    id: 'test-org-id',
    name: 'Test Organization',
    slug: 'test-org',
  },
  frameworks: [
    {
      id: 'iso27001',
      name: 'ISO 27001',
      version: '2022',
      description: 'Information Security Management',
    },
    {
      id: 'nist',
      name: 'NIST Cybersecurity Framework',
      version: '2.0',
      description: 'NIST CSF 2.0',
    },
  ],
  assessments: [
    {
      id: 'test-assessment-1',
      title: 'Q1 Security Assessment',
      status: 'in_progress',
      progress: 65,
    },
    {
      id: 'test-assessment-2',
      title: 'GDPR Compliance Review',
      status: 'completed',
      progress: 100,
    },
  ],
};

// Mock API client
export const createMockApiClient = () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  callFunction: vi.fn(),
  uploadFile: vi.fn(),
  batch: vi.fn(),
  getCancelToken: vi.fn(),
});

// Mock specific API endpoints
export const mockOrganizationApi = {
  getAll: vi.fn().mockResolvedValue([mockApiResponses.organization]),
  getById: vi.fn().mockResolvedValue(mockApiResponses.organization),
  create: vi.fn().mockResolvedValue(mockApiResponses.organization),
  update: vi.fn().mockResolvedValue(mockApiResponses.organization),
  delete: vi.fn().mockResolvedValue(undefined),
  getUsers: vi.fn().mockResolvedValue([]),
  inviteUser: vi.fn().mockResolvedValue({ id: 'invite-id' }),
  removeUser: vi.fn().mockResolvedValue(undefined),
};

export const mockComplianceApi = {
  getFrameworks: vi.fn().mockResolvedValue(mockApiResponses.frameworks),
  getFramework: vi.fn().mockResolvedValue(mockApiResponses.frameworks[0]),
  createFramework: vi.fn().mockResolvedValue(mockApiResponses.frameworks[0]),
  updateFramework: vi.fn().mockResolvedValue(mockApiResponses.frameworks[0]),
  deleteFramework: vi.fn().mockResolvedValue(undefined),
  getRequirements: vi.fn().mockResolvedValue([]),
  getRequirementStatuses: vi.fn().mockResolvedValue([]),
  updateRequirementStatus: vi.fn().mockResolvedValue({}),
  getGapAnalysis: vi.fn().mockResolvedValue({
    total: 100,
    fulfilled: 60,
    partial: 20,
    not_fulfilled: 15,
    not_applicable: 5,
  }),
};

export const mockAssessmentApi = {
  getAll: vi.fn().mockResolvedValue(mockApiResponses.assessments),
  getById: vi.fn().mockResolvedValue(mockApiResponses.assessments[0]),
  create: vi.fn().mockResolvedValue(mockApiResponses.assessments[0]),
  update: vi.fn().mockResolvedValue(mockApiResponses.assessments[0]),
  delete: vi.fn().mockResolvedValue(undefined),
  getResponses: vi.fn().mockResolvedValue([]),
  submitResponse: vi.fn().mockResolvedValue({}),
  getTemplates: vi.fn().mockResolvedValue([]),
  createFromTemplate: vi.fn().mockResolvedValue(mockApiResponses.assessments[0]),
};

export const mockDocumentApi = {
  getAll: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue({}),
  upload: vi.fn().mockResolvedValue({ id: 'doc-id' }),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
  generateFromTemplate: vi.fn().mockResolvedValue({}),
  generateWithAI: vi.fn().mockResolvedValue({}),
};

export const mockRiskApi = {
  getAll: vi.fn().mockResolvedValue([]),
  getById: vi.fn().mockResolvedValue({}),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
  analyzeRisk: vi.fn().mockResolvedValue({}),
  predictRisks: vi.fn().mockResolvedValue([]),
  getMatrix: vi.fn().mockResolvedValue({}),
  updateMatrix: vi.fn().mockResolvedValue({}),
};

export const mockLmsApi = {
  getCourses: vi.fn().mockResolvedValue([]),
  getCourse: vi.fn().mockResolvedValue({}),
  createCourse: vi.fn().mockResolvedValue({}),
  updateCourse: vi.fn().mockResolvedValue({}),
  deleteCourse: vi.fn().mockResolvedValue(undefined),
  getEnrollments: vi.fn().mockResolvedValue([]),
  enrollUser: vi.fn().mockResolvedValue({}),
  unenrollUser: vi.fn().mockResolvedValue(undefined),
  getProgress: vi.fn().mockResolvedValue({}),
  updateProgress: vi.fn().mockResolvedValue({}),
  uploadContent: vi.fn().mockResolvedValue({}),
};

export const mockAnalyticsApi = {
  getComplianceOverview: vi.fn().mockResolvedValue({}),
  getRiskDashboard: vi.fn().mockResolvedValue({}),
  getAssessmentMetrics: vi.fn().mockResolvedValue({}),
  getUserActivity: vi.fn().mockResolvedValue({}),
  exportReport: vi.fn().mockResolvedValue(new Blob()),
};

export const mockAiApi = {
  generateDocument: vi.fn().mockResolvedValue({}),
  generateProcessFlow: vi.fn().mockResolvedValue({}),
  analyzeRisk: vi.fn().mockResolvedValue({}),
  suggestControls: vi.fn().mockResolvedValue([]),
  summarizeDocument: vi.fn().mockResolvedValue({}),
};

// Complete mock of all API endpoints
export const mockApi = {
  organization: mockOrganizationApi,
  compliance: mockComplianceApi,
  assessment: mockAssessmentApi,
  document: mockDocumentApi,
  risk: mockRiskApi,
  lms: mockLmsApi,
  analytics: mockAnalyticsApi,
  ai: mockAiApi,
};