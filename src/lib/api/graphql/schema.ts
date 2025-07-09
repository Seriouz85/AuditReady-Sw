import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  # Enums
  enum ComplianceStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLIANT
    NON_COMPLIANT
    PARTIALLY_COMPLIANT
  }

  enum AssessmentStatus {
    draft
    active
    completed
    archived
  }

  enum RiskLevel {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum UserRole {
    viewer
    member
    admin
    owner
  }

  # Types
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    role: UserRole!
    organizations: [Organization!]!
    createdAt: Date!
    updatedAt: Date!
  }

  type Organization {
    id: ID!
    name: String!
    industry: String
    size: String
    description: String
    subscription: Subscription
    users: [User!]!
    assessments: [Assessment!]!
    complianceStatus: ComplianceOverview!
    riskScore: RiskAnalysis!
    createdAt: Date!
    updatedAt: Date!
  }

  type Subscription {
    id: ID!
    plan: String!
    status: String!
    currentPeriodEnd: Date
    features: [String!]!
  }

  type Assessment {
    id: ID!
    title: String!
    framework: ComplianceFramework!
    status: AssessmentStatus!
    progress: Float!
    score: Float
    assignedTo: [User!]!
    requirements: [Requirement!]!
    findings: [Finding!]!
    dueDate: Date
    completedAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type ComplianceFramework {
    id: ID!
    name: String!
    version: String!
    description: String
    categories: [Category!]!
    totalRequirements: Int!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    requirements: [Requirement!]!
  }

  type Requirement {
    id: ID!
    title: String!
    description: String!
    category: Category!
    priority: String!
    status: ComplianceStatus!
    evidence: [Evidence!]!
    implementationGuide: String
    tags: [String!]!
  }

  type Evidence {
    id: ID!
    title: String!
    type: String!
    url: String
    uploadedBy: User!
    uploadedAt: Date!
    verified: Boolean!
    verifiedBy: User
    verifiedAt: Date
  }

  type Finding {
    id: ID!
    title: String!
    description: String!
    severity: RiskLevel!
    status: String!
    remediation: String
    requirement: Requirement!
    createdAt: Date!
    resolvedAt: Date
  }

  type ComplianceOverview {
    overallScore: Float!
    frameworks: [FrameworkStatus!]!
    trendsData: [ComplianceTrend!]!
    upcomingDeadlines: [Deadline!]!
  }

  type FrameworkStatus {
    framework: String!
    score: Float!
    status: ComplianceStatus!
    requirementsCompleted: Int!
    totalRequirements: Int!
  }

  type ComplianceTrend {
    date: Date!
    score: Float!
    framework: String
  }

  type Deadline {
    id: ID!
    title: String!
    dueDate: Date!
    framework: String!
    priority: RiskLevel!
  }

  type RiskAnalysis {
    overallScore: Float!
    level: RiskLevel!
    categories: [RiskCategory!]!
    recommendations: [RiskRecommendation!]!
    predictions: [RiskPrediction!]!
  }

  type RiskCategory {
    name: String!
    score: Float!
    level: RiskLevel!
    factors: [String!]!
  }

  type RiskRecommendation {
    id: ID!
    title: String!
    description: String!
    impact: String!
    effort: String!
    category: String!
    potentialRiskReduction: Float!
  }

  type RiskPrediction {
    timeframe: String!
    predictedScore: Float!
    predictedLevel: RiskLevel!
    confidence: Float!
    factors: [String!]!
  }

  type MLInsight {
    id: ID!
    type: String!
    title: String!
    description: String!
    confidence: Float!
    impact: String!
    suggestedActions: [String!]!
    relatedData: JSON
    createdAt: Date!
  }

  type DocumentAnalysis {
    id: ID!
    documentName: String!
    documentType: String!
    extractedRequirements: [ExtractedRequirement!]!
    mappedFrameworks: [String!]!
    confidence: Float!
    processingTime: Int!
    createdAt: Date!
  }

  type ExtractedRequirement {
    text: String!
    category: String!
    mappedTo: [Requirement!]!
    confidence: Float!
  }

  type AnomalyAlert {
    id: ID!
    type: String!
    severity: RiskLevel!
    title: String!
    description: String!
    detectedAt: Date!
    resolved: Boolean!
    affectedAreas: [String!]!
    recommendedActions: [String!]!
  }

  # Queries
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(organizationId: ID!): [User!]!

    # Organization queries
    organization(id: ID!): Organization
    organizations: [Organization!]!
    organizationStats(id: ID!): OrganizationStats!

    # Assessment queries
    assessment(id: ID!): Assessment
    assessments(
      organizationId: ID!
      status: AssessmentStatus
      framework: String
    ): [Assessment!]!

    # Compliance queries
    complianceOverview(organizationId: ID!): ComplianceOverview!
    complianceFrameworks: [ComplianceFramework!]!
    requirements(
      assessmentId: ID!
      status: ComplianceStatus
      category: String
    ): [Requirement!]!

    # Risk queries
    riskAnalysis(organizationId: ID!): RiskAnalysis!
    riskPredictions(
      organizationId: ID!
      timeframe: String
    ): [RiskPrediction!]!

    # ML/AI queries
    mlInsights(
      organizationId: ID!
      type: String
      limit: Int
    ): [MLInsight!]!
    
    documentAnalysis(id: ID!): DocumentAnalysis
    recentDocumentAnalyses(
      organizationId: ID!
      limit: Int
    ): [DocumentAnalysis!]!

    # Anomaly queries
    anomalies(
      organizationId: ID!
      severity: RiskLevel
      resolved: Boolean
    ): [AnomalyAlert!]!
  }

  # Mutations
  type Mutation {
    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    
    # Organization mutations
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!
    
    # Assessment mutations
    createAssessment(input: CreateAssessmentInput!): Assessment!
    updateAssessment(id: ID!, input: UpdateAssessmentInput!): Assessment!
    deleteAssessment(id: ID!): Boolean!
    
    # Requirement mutations
    updateRequirement(id: ID!, input: UpdateRequirementInput!): Requirement!
    bulkUpdateRequirements(input: [BulkRequirementUpdate!]!): [Requirement!]!
    
    # Evidence mutations
    uploadEvidence(input: UploadEvidenceInput!): Evidence!
    verifyEvidence(id: ID!): Evidence!
    deleteEvidence(id: ID!): Boolean!
    
    # ML/AI mutations
    analyzeDocument(input: AnalyzeDocumentInput!): DocumentAnalysis!
    generateComplianceReport(
      organizationId: ID!
      framework: String!
      format: String!
    ): String! # Returns URL
    
    # Risk mutations
    acknowledgeAnomaly(id: ID!): AnomalyAlert!
    createRiskMitigation(input: CreateRiskMitigationInput!): RiskRecommendation!
  }

  # Subscriptions
  type Subscription {
    # Real-time compliance updates
    complianceScoreUpdated(organizationId: ID!): ComplianceOverview!
    
    # Risk monitoring
    riskLevelChanged(organizationId: ID!): RiskAnalysis!
    anomalyDetected(organizationId: ID!): AnomalyAlert!
    
    # Assessment tracking
    assessmentProgressUpdated(assessmentId: ID!): Assessment!
    requirementStatusChanged(assessmentId: ID!): Requirement!
    
    # ML insights
    newMLInsight(organizationId: ID!): MLInsight!
  }

  # Input types
  input UpdateProfileInput {
    firstName: String
    lastName: String
    email: String
  }

  input CreateOrganizationInput {
    name: String!
    industry: String
    size: String
    description: String
  }

  input UpdateOrganizationInput {
    name: String
    industry: String
    size: String
    description: String
  }

  input CreateAssessmentInput {
    title: String!
    frameworkId: ID!
    organizationId: ID!
    dueDate: Date
    assignedUserIds: [ID!]
  }

  input UpdateAssessmentInput {
    title: String
    status: AssessmentStatus
    dueDate: Date
    assignedUserIds: [ID!]
  }

  input UpdateRequirementInput {
    status: ComplianceStatus
    notes: String
    implementationDetails: String
  }

  input BulkRequirementUpdate {
    requirementId: ID!
    status: ComplianceStatus!
  }

  input UploadEvidenceInput {
    requirementId: ID!
    title: String!
    type: String!
    url: String
    file: Upload
  }

  input AnalyzeDocumentInput {
    organizationId: ID!
    documentUrl: String
    file: Upload
    frameworks: [String!]
  }

  input CreateRiskMitigationInput {
    organizationId: ID!
    title: String!
    description: String!
    category: String!
    estimatedImpact: Float!
  }

  # Additional types for stats
  type OrganizationStats {
    totalAssessments: Int!
    activeAssessments: Int!
    complianceScore: Float!
    riskScore: Float!
    totalUsers: Int!
    upcomingDeadlines: Int!
  }

  # File upload scalar
  scalar Upload
`;