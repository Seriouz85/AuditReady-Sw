import { analytics } from '@/lib/monitoring/analytics';
import { reportError, reportMessage } from '@/lib/monitoring/sentry';
import { alertingService } from '@/lib/monitoring/alerting';

export type ComplianceFramework = 'SOC2' | 'ISO27001' | 'GDPR' | 'CCPA' | 'HIPAA' | 'PCI_DSS' | 'SOX';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review' | 'remediation_required';
export type AssessmentType = 'self_assessment' | 'internal_audit' | 'external_audit' | 'continuous_monitoring';

interface ComplianceRequirement {
  id: string;
  framework: ComplianceFramework;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  implementationGuidance: string;
  evidenceRequired: string[];
  automatedCheck: boolean;
  checkFunction?: string;
  maturityLevel: 'basic' | 'intermediate' | 'advanced';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface ComplianceAssessment {
  id: string;
  requirementId: string;
  organizationId: string;
  assessmentType: AssessmentType;
  status: ComplianceStatus;
  assessor: string;
  assessmentDate: Date;
  dueDate?: Date;
  findings: ComplianceFinding[];
  evidence: ComplianceEvidence[];
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  remediationPlan?: RemediationPlan;
  metadata: Record<string, any>;
}

interface ComplianceFinding {
  id: string;
  type: 'gap' | 'weakness' | 'non_compliance' | 'observation' | 'strength';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  likelihood: string;
  category: string;
}

interface ComplianceEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration' | 'policy' | 'procedure';
  name: string;
  description: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  metadata: Record<string, any>;
}

interface RemediationPlan {
  id: string;
  title: string;
  description: string;
  tasks: RemediationTask[];
  owner: string;
  dueDate: Date;
  status: 'planning' | 'in_progress' | 'completed' | 'overdue';
  budget?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RemediationTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  estimatedHours: number;
  actualHours?: number;
}

interface ComplianceReport {
  id: string;
  organizationId: string;
  framework: ComplianceFramework;
  reportType: 'gap_analysis' | 'readiness_assessment' | 'audit_report' | 'continuous_monitoring';
  generatedBy: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  overallScore: number;
  complianceLevel: 'non_compliant' | 'partially_compliant' | 'substantially_compliant' | 'fully_compliant';
  summary: string;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextAssessmentDate: Date;
  executiveSummary: string;
  data: Record<string, any>;
}

interface ComplianceMetrics {
  totalRequirements: number;
  compliantRequirements: number;
  nonCompliantRequirements: number;
  pendingRequirements: number;
  overallComplianceScore: number;
  complianceByFramework: Record<ComplianceFramework, number>;
  trendAnalysis: {
    month: string;
    score: number;
  }[];
  riskDistribution: Record<string, number>;
}

class LegalComplianceService {
  private requirements: Map<string, ComplianceRequirement> = new Map();
  private assessments: Map<string, ComplianceAssessment> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();
  private remediationPlans: Map<string, RemediationPlan> = new Map();
  private maxHistoryItems = 1000;

  constructor() {
    this.initializeComplianceRequirements();
    this.startPeriodicAssessments();
    this.startComplianceMonitoring();
  }

  private initializeComplianceRequirements(): void {
    // SOC 2 Requirements
    this.addRequirement({
      id: 'soc2-cc6.1',
      framework: 'SOC2',
      category: 'Common Criteria',
      subcategory: 'Logical and Physical Access Controls',
      title: 'Access Control Management',
      description: 'The entity implements logical and physical access controls to protect the system',
      implementationGuidance: 'Implement role-based access controls, multi-factor authentication, and regular access reviews',
      evidenceRequired: ['Access control policies', 'User access matrices', 'Authentication logs', 'Access review reports'],
      automatedCheck: true,
      checkFunction: 'checkAccessControls',
      maturityLevel: 'intermediate',
      priority: 'high',
      tags: ['access-control', 'authentication', 'authorization']
    });

    this.addRequirement({
      id: 'soc2-cc7.1',
      framework: 'SOC2',
      category: 'Common Criteria',
      subcategory: 'System Operations',
      title: 'System Monitoring',
      description: 'The entity monitors system components and the operation of controls',
      implementationGuidance: 'Implement comprehensive logging, monitoring, and alerting systems',
      evidenceRequired: ['Monitoring policies', 'Log analysis reports', 'Incident reports', 'Alert configurations'],
      automatedCheck: true,
      checkFunction: 'checkSystemMonitoring',
      maturityLevel: 'advanced',
      priority: 'high',
      tags: ['monitoring', 'logging', 'incident-response']
    });

    // ISO 27001 Requirements
    this.addRequirement({
      id: 'iso27001-a.12.6.1',
      framework: 'ISO27001',
      category: 'Operations Security',
      subcategory: 'Technical Vulnerability Management',
      title: 'Management of Technical Vulnerabilities',
      description: 'Information about technical vulnerabilities of information systems shall be obtained in a timely fashion',
      implementationGuidance: 'Establish vulnerability scanning, patch management, and security testing processes',
      evidenceRequired: ['Vulnerability scan reports', 'Patch management procedures', 'Security testing results'],
      automatedCheck: true,
      checkFunction: 'checkVulnerabilityManagement',
      maturityLevel: 'intermediate',
      priority: 'high',
      tags: ['vulnerability-management', 'patching', 'security-testing']
    });

    // GDPR Requirements
    this.addRequirement({
      id: 'gdpr-art.25',
      framework: 'GDPR',
      category: 'Data Protection',
      subcategory: 'Privacy by Design',
      title: 'Data Protection by Design and Default',
      description: 'Implement appropriate technical and organizational measures to ensure privacy protection',
      implementationGuidance: 'Implement privacy-preserving technologies, data minimization, and purpose limitation',
      evidenceRequired: ['Privacy impact assessments', 'Data processing records', 'Privacy policies'],
      automatedCheck: false,
      maturityLevel: 'advanced',
      priority: 'critical',
      tags: ['privacy', 'data-protection', 'gdpr']
    });

    this.addRequirement({
      id: 'gdpr-art.32',
      framework: 'GDPR',
      category: 'Security',
      subcategory: 'Security of Processing',
      title: 'Security of Personal Data Processing',
      description: 'Implement appropriate technical and organizational measures to ensure security',
      implementationGuidance: 'Implement encryption, access controls, and security monitoring for personal data',
      evidenceRequired: ['Encryption policies', 'Security assessments', 'Incident response procedures'],
      automatedCheck: true,
      checkFunction: 'checkDataSecurity',
      maturityLevel: 'intermediate',
      priority: 'critical',
      tags: ['data-security', 'encryption', 'gdpr']
    });

    // CCPA Requirements
    this.addRequirement({
      id: 'ccpa-1798.100',
      framework: 'CCPA',
      category: 'Consumer Rights',
      subcategory: 'Right to Know',
      title: 'Consumer Right to Know About Personal Information',
      description: 'Consumers have the right to request disclosure of personal information collection and use',
      implementationGuidance: 'Implement data inventory, disclosure processes, and consumer request handling',
      evidenceRequired: ['Data inventory', 'Privacy notices', 'Consumer request logs'],
      automatedCheck: false,
      maturityLevel: 'basic',
      priority: 'medium',
      tags: ['consumer-rights', 'transparency', 'ccpa']
    });

    // SOX Requirements
    this.addRequirement({
      id: 'sox-404',
      framework: 'SOX',
      category: 'Internal Controls',
      subcategory: 'Financial Reporting',
      title: 'Assessment of Internal Control',
      description: 'Management must assess the effectiveness of internal control over financial reporting',
      implementationGuidance: 'Implement controls testing, documentation, and management assessment processes',
      evidenceRequired: ['Control documentation', 'Testing results', 'Management assessment reports'],
      automatedCheck: false,
      maturityLevel: 'advanced',
      priority: 'high',
      tags: ['financial-controls', 'sox', 'internal-controls']
    });
  }

  private startPeriodicAssessments(): void {
    // Run automated compliance checks every day
    setInterval(() => {
      this.runAutomatedAssessments();
    }, 86400000); // 24 hours

    // Generate monthly compliance reports
    setInterval(() => {
      this.generatePeriodicReports();
    }, 30 * 86400000); // 30 days
  }

  private startComplianceMonitoring(): void {
    // Monitor for compliance-related events every hour
    setInterval(() => {
      this.monitorComplianceHealth();
    }, 3600000); // 1 hour
  }

  addRequirement(requirement: ComplianceRequirement): void {
    this.requirements.set(requirement.id, requirement);
    
    analytics.track('compliance_requirement_added', {
      requirement_id: requirement.id,
      framework: requirement.framework,
      category: requirement.category,
      priority: requirement.priority
    });
  }

  async conductAssessment(
    requirementId: string,
    organizationId: string,
    assessmentType: AssessmentType,
    assessor: string
  ): Promise<string> {
    const requirement = this.requirements.get(requirementId);
    if (!requirement) {
      throw new Error(`Requirement ${requirementId} not found`);
    }

    const assessmentId = `assessment_${requirementId}_${Date.now()}`;
    let status: ComplianceStatus = 'pending_review';
    let score = 0;
    const findings: ComplianceFinding[] = [];

    // Run automated check if available
    if (requirement.automatedCheck && requirement.checkFunction) {
      try {
        const checkResult = await this.runAutomatedCheck(requirement.checkFunction, organizationId);
        status = checkResult.compliant ? 'compliant' : 'non_compliant';
        score = checkResult.score;
        findings.push(...checkResult.findings);
      } catch (error) {
        reportError(error instanceof Error ? error : new Error('Automated check failed'), {
          requirement_id: requirementId,
          organization_id: organizationId,
          check_function: requirement.checkFunction
        });
      }
    }

    const assessment: ComplianceAssessment = {
      id: assessmentId,
      requirementId,
      organizationId,
      assessmentType,
      status,
      assessor,
      assessmentDate: new Date(),
      findings,
      evidence: [],
      score,
      riskLevel: this.calculateRiskLevel(score, findings),
      metadata: {
        automated: requirement.automatedCheck,
        framework: requirement.framework,
        category: requirement.category
      }
    };

    this.assessments.set(assessmentId, assessment);

    // Create remediation plan if non-compliant
    if (status === 'non_compliant' || score < 70) {
      await this.createRemediationPlan(assessment);
    }

    analytics.track('compliance_assessment_conducted', {
      assessment_id: assessmentId,
      requirement_id: requirementId,
      organization_id: organizationId,
      status,
      score,
      findings_count: findings.length
    });

    return assessmentId;
  }

  private async runAutomatedCheck(
    checkFunction: string,
    organizationId: string
  ): Promise<{ compliant: boolean; score: number; findings: ComplianceFinding[] }> {
    const findings: ComplianceFinding[] = [];
    let score = 100;
    let compliant = true;

    switch (checkFunction) {
      case 'checkAccessControls':
        return this.checkAccessControls(organizationId);
      case 'checkSystemMonitoring':
        return this.checkSystemMonitoring(organizationId);
      case 'checkVulnerabilityManagement':
        return this.checkVulnerabilityManagement(organizationId);
      case 'checkDataSecurity':
        return this.checkDataSecurity(organizationId);
      default:
        throw new Error(`Unknown check function: ${checkFunction}`);
    }
  }

  private async checkAccessControls(organizationId: string): Promise<{ compliant: boolean; score: number; findings: ComplianceFinding[] }> {
    const findings: ComplianceFinding[] = [];
    let score = 100;

    // Simulate access control checks
    const checks = [
      { name: 'MFA Enabled', weight: 30, passed: Math.random() > 0.1 },
      { name: 'RBAC Implemented', weight: 25, passed: Math.random() > 0.2 },
      { name: 'Regular Access Reviews', weight: 20, passed: Math.random() > 0.3 },
      { name: 'Privileged Account Management', weight: 25, passed: Math.random() > 0.15 }
    ];

    for (const check of checks) {
      if (!check.passed) {
        score -= check.weight;
        findings.push({
          id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'gap',
          severity: check.weight > 25 ? 'high' : 'medium',
          title: `${check.name} Not Implemented`,
          description: `The organization lacks proper implementation of ${check.name.toLowerCase()}`,
          recommendation: `Implement ${check.name.toLowerCase()} controls according to best practices`,
          impact: 'Increased risk of unauthorized access',
          likelihood: 'Medium',
          category: 'Access Control'
        });
      }
    }

    return { compliant: score >= 80, score, findings };
  }

  private async checkSystemMonitoring(organizationId: string): Promise<{ compliant: boolean; score: number; findings: ComplianceFinding[] }> {
    const findings: ComplianceFinding[] = [];
    let score = 100;

    const checks = [
      { name: 'Security Event Logging', weight: 25, passed: Math.random() > 0.1 },
      { name: 'Real-time Monitoring', weight: 25, passed: Math.random() > 0.2 },
      { name: 'Incident Response', weight: 25, passed: Math.random() > 0.15 },
      { name: 'Log Retention', weight: 25, passed: Math.random() > 0.1 }
    ];

    for (const check of checks) {
      if (!check.passed) {
        score -= check.weight;
        findings.push({
          id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'weakness',
          severity: 'medium',
          title: `Insufficient ${check.name}`,
          description: `The monitoring capabilities for ${check.name.toLowerCase()} need improvement`,
          recommendation: `Enhance ${check.name.toLowerCase()} implementation`,
          impact: 'Reduced ability to detect and respond to security incidents',
          likelihood: 'Medium',
          category: 'Monitoring'
        });
      }
    }

    return { compliant: score >= 75, score, findings };
  }

  private async checkVulnerabilityManagement(organizationId: string): Promise<{ compliant: boolean; score: number; findings: ComplianceFinding[] }> {
    const findings: ComplianceFinding[] = [];
    let score = 100;

    const checks = [
      { name: 'Regular Vulnerability Scanning', weight: 30, passed: Math.random() > 0.2 },
      { name: 'Patch Management Process', weight: 30, passed: Math.random() > 0.15 },
      { name: 'Security Testing', weight: 20, passed: Math.random() > 0.25 },
      { name: 'Vulnerability Tracking', weight: 20, passed: Math.random() > 0.1 }
    ];

    for (const check of checks) {
      if (!check.passed) {
        score -= check.weight;
        findings.push({
          id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'gap',
          severity: check.weight >= 30 ? 'high' : 'medium',
          title: `${check.name} Deficiency`,
          description: `The organization's ${check.name.toLowerCase()} process requires improvement`,
          recommendation: `Establish robust ${check.name.toLowerCase()} procedures`,
          impact: 'Increased exposure to security vulnerabilities',
          likelihood: 'High',
          category: 'Vulnerability Management'
        });
      }
    }

    return { compliant: score >= 85, score, findings };
  }

  private async checkDataSecurity(organizationId: string): Promise<{ compliant: boolean; score: number; findings: ComplianceFinding[] }> {
    const findings: ComplianceFinding[] = [];
    let score = 100;

    const checks = [
      { name: 'Data Encryption at Rest', weight: 25, passed: Math.random() > 0.1 },
      { name: 'Data Encryption in Transit', weight: 25, passed: Math.random() > 0.05 },
      { name: 'Data Loss Prevention', weight: 25, passed: Math.random() > 0.3 },
      { name: 'Data Classification', weight: 25, passed: Math.random() > 0.4 }
    ];

    for (const check of checks) {
      if (!check.passed) {
        score -= check.weight;
        findings.push({
          id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'non_compliance',
          severity: 'high',
          title: `${check.name} Not Implemented`,
          description: `Data security control ${check.name.toLowerCase()} is not properly implemented`,
          recommendation: `Implement ${check.name.toLowerCase()} controls immediately`,
          impact: 'Risk of data breach and regulatory violations',
          likelihood: 'Medium',
          category: 'Data Security'
        });
      }
    }

    return { compliant: score >= 90, score, findings };
  }

  private calculateRiskLevel(score: number, findings: ComplianceFinding[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;

    if (criticalFindings > 0 || score < 50) return 'critical';
    if (highFindings > 2 || score < 70) return 'high';
    if (highFindings > 0 || score < 85) return 'medium';
    return 'low';
  }

  private async createRemediationPlan(assessment: ComplianceAssessment): Promise<void> {
    const planId = `remediation_${assessment.id}_${Date.now()}`;
    const tasks: RemediationTask[] = [];

    // Create tasks based on findings
    assessment.findings.forEach((finding, index) => {
      tasks.push({
        id: `task_${planId}_${index}`,
        title: `Address: ${finding.title}`,
        description: finding.recommendation,
        assignee: 'compliance-team',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'todo',
        dependencies: [],
        estimatedHours: finding.severity === 'critical' ? 40 : finding.severity === 'high' ? 20 : 10
      });
    });

    const plan: RemediationPlan = {
      id: planId,
      title: `Remediation Plan for ${assessment.requirementId}`,
      description: `Address compliance gaps identified in assessment ${assessment.id}`,
      tasks,
      owner: 'compliance-team',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      status: 'planning',
      priority: assessment.riskLevel as any
    };

    this.remediationPlans.set(planId, plan);
    assessment.remediationPlan = plan;

    analytics.track('remediation_plan_created', {
      plan_id: planId,
      assessment_id: assessment.id,
      tasks_count: tasks.length,
      priority: plan.priority
    });
  }

  async generateComplianceReport(
    organizationId: string,
    framework: ComplianceFramework,
    reportType: 'gap_analysis' | 'readiness_assessment' | 'audit_report' | 'continuous_monitoring'
  ): Promise<string> {
    const reportId = `report_${framework}_${Date.now()}`;
    const assessments = this.getAssessmentsByFramework(organizationId, framework);
    
    const overallScore = this.calculateOverallScore(assessments);
    const complianceLevel = this.determineComplianceLevel(overallScore);
    const findings = assessments.flatMap(a => a.findings);
    const recommendations = this.generateRecommendations(findings);

    const report: ComplianceReport = {
      id: reportId,
      organizationId,
      framework,
      reportType,
      generatedBy: 'system',
      generatedAt: new Date(),
      period: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        end: new Date()
      },
      overallScore,
      complianceLevel,
      summary: this.generateReportSummary(framework, overallScore, findings.length),
      findings,
      recommendations,
      nextAssessmentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      executiveSummary: this.generateExecutiveSummary(framework, overallScore, complianceLevel),
      data: {
        assessments_count: assessments.length,
        compliant_assessments: assessments.filter(a => a.status === 'compliant').length,
        risk_distribution: this.calculateRiskDistribution(assessments)
      }
    };

    this.reports.set(reportId, report);

    analytics.track('compliance_report_generated', {
      report_id: reportId,
      organization_id: organizationId,
      framework,
      report_type: reportType,
      overall_score: overallScore,
      compliance_level: complianceLevel
    });

    return reportId;
  }

  private getAssessmentsByFramework(organizationId: string, framework: ComplianceFramework): ComplianceAssessment[] {
    return Array.from(this.assessments.values()).filter(assessment => {
      const requirement = this.requirements.get(assessment.requirementId);
      return assessment.organizationId === organizationId && 
             requirement?.framework === framework;
    });
  }

  private calculateOverallScore(assessments: ComplianceAssessment[]): number {
    if (assessments.length === 0) return 0;
    return Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length);
  }

  private determineComplianceLevel(score: number): 'non_compliant' | 'partially_compliant' | 'substantially_compliant' | 'fully_compliant' {
    if (score >= 95) return 'fully_compliant';
    if (score >= 80) return 'substantially_compliant';
    if (score >= 60) return 'partially_compliant';
    return 'non_compliant';
  }

  private generateRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations = new Set<string>();
    
    findings.forEach(finding => {
      if (finding.severity === 'critical' || finding.severity === 'high') {
        recommendations.add(finding.recommendation);
      }
    });

    // Add general recommendations
    recommendations.add('Implement regular compliance monitoring and assessment procedures');
    recommendations.add('Establish clear roles and responsibilities for compliance management');
    recommendations.add('Provide regular compliance training to staff');

    return Array.from(recommendations);
  }

  private generateReportSummary(framework: ComplianceFramework, score: number, findingsCount: number): string {
    return `${framework} compliance assessment completed with an overall score of ${score}%. ` +
           `${findingsCount} findings identified requiring attention. ` +
           `${score >= 80 ? 'Organization demonstrates good' : 'Improvement needed in'} compliance posture.`;
  }

  private generateExecutiveSummary(framework: ComplianceFramework, score: number, level: string): string {
    return `Executive Summary: The organization's ${framework} compliance assessment reveals a ${score}% ` +
           `compliance score, indicating ${level.replace('_', ' ')} status. Key areas for improvement ` +
           `have been identified and remediation plans are recommended to enhance compliance posture.`;
  }

  private calculateRiskDistribution(assessments: ComplianceAssessment[]): Record<string, number> {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    assessments.forEach(assessment => {
      distribution[assessment.riskLevel]++;
    });
    return distribution;
  }

  private async runAutomatedAssessments(): Promise<void> {
    // Run automated checks for all requirements that support it
    for (const requirement of this.requirements.values()) {
      if (requirement.automatedCheck && requirement.checkFunction) {
        try {
          // In a real implementation, this would run for all organizations
          await this.conductAssessment(requirement.id, 'demo-org', 'continuous_monitoring', 'system');
        } catch (error) {
          reportError(error instanceof Error ? error : new Error('Automated assessment failed'), {
            requirement_id: requirement.id
          });
        }
      }
    }
  }

  private async generatePeriodicReports(): Promise<void> {
    const frameworks: ComplianceFramework[] = ['SOC2', 'ISO27001', 'GDPR', 'CCPA'];
    
    for (const framework of frameworks) {
      try {
        await this.generateComplianceReport('demo-org', framework, 'continuous_monitoring');
      } catch (error) {
        reportError(error instanceof Error ? error : new Error('Periodic report generation failed'), {
          framework
        });
      }
    }
  }

  private monitorComplianceHealth(): void {
    const recentAssessments = Array.from(this.assessments.values()).filter(
      a => Date.now() - a.assessmentDate.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const criticalFindings = recentAssessments.flatMap(a => a.findings)
      .filter(f => f.severity === 'critical').length;

    const nonCompliantAssessments = recentAssessments.filter(
      a => a.status === 'non_compliant'
    ).length;

    if (criticalFindings > 0 || nonCompliantAssessments > 5) {
      alertingService.recordEvent('compliance_health_degraded', {
        critical_findings: criticalFindings,
        non_compliant_assessments: nonCompliantAssessments,
        total_assessments: recentAssessments.length
      });
    }
  }

  // Public methods for compliance management
  getComplianceMetrics(organizationId: string): ComplianceMetrics {
    const assessments = Array.from(this.assessments.values())
      .filter(a => a.organizationId === organizationId);

    const complianceByFramework: Record<ComplianceFramework, number> = {
      SOC2: 0, ISO27001: 0, GDPR: 0, CCPA: 0, HIPAA: 0, PCI_DSS: 0, SOX: 0
    };

    const frameworkCounts: Record<ComplianceFramework, number> = {
      SOC2: 0, ISO27001: 0, GDPR: 0, CCPA: 0, HIPAA: 0, PCI_DSS: 0, SOX: 0
    };

    assessments.forEach(assessment => {
      const requirement = this.requirements.get(assessment.requirementId);
      if (requirement) {
        complianceByFramework[requirement.framework] += assessment.score;
        frameworkCounts[requirement.framework]++;
      }
    });

    // Calculate averages
    Object.keys(complianceByFramework).forEach(framework => {
      const fw = framework as ComplianceFramework;
      if (frameworkCounts[fw] > 0) {
        complianceByFramework[fw] = Math.round(complianceByFramework[fw] / frameworkCounts[fw]);
      }
    });

    const riskDistribution = this.calculateRiskDistribution(assessments);

    return {
      totalRequirements: this.requirements.size,
      compliantRequirements: assessments.filter(a => a.status === 'compliant').length,
      nonCompliantRequirements: assessments.filter(a => a.status === 'non_compliant').length,
      pendingRequirements: assessments.filter(a => a.status === 'pending_review').length,
      overallComplianceScore: this.calculateOverallScore(assessments),
      complianceByFramework,
      trendAnalysis: this.generateTrendAnalysis(organizationId),
      riskDistribution
    };
  }

  private generateTrendAnalysis(organizationId: string): { month: string; score: number; }[] {
    // Generate sample trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      score: Math.round(70 + Math.random() * 25) // Sample scores between 70-95
    }));
  }

  getAssessments(organizationId: string, filters?: {
    framework?: ComplianceFramework;
    status?: ComplianceStatus;
    riskLevel?: string;
  }): ComplianceAssessment[] {
    let assessments = Array.from(this.assessments.values())
      .filter(a => a.organizationId === organizationId);

    if (filters) {
      if (filters.framework) {
        assessments = assessments.filter(a => {
          const requirement = this.requirements.get(a.requirementId);
          return requirement?.framework === filters.framework;
        });
      }
      if (filters.status) {
        assessments = assessments.filter(a => a.status === filters.status);
      }
      if (filters.riskLevel) {
        assessments = assessments.filter(a => a.riskLevel === filters.riskLevel);
      }
    }

    return assessments.sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime());
  }

  getReports(organizationId: string): ComplianceReport[] {
    return Array.from(this.reports.values())
      .filter(r => r.organizationId === organizationId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  getRemediationPlans(organizationId?: string): RemediationPlan[] {
    let plans = Array.from(this.remediationPlans.values());
    
    if (organizationId) {
      plans = plans.filter(plan => {
        // Find assessment linked to this plan
        const assessment = Array.from(this.assessments.values())
          .find(a => a.remediationPlan?.id === plan.id);
        return assessment?.organizationId === organizationId;
      });
    }

    return plans.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  }

  getRequirements(framework?: ComplianceFramework): ComplianceRequirement[] {
    let requirements = Array.from(this.requirements.values());
    
    if (framework) {
      requirements = requirements.filter(r => r.framework === framework);
    }

    return requirements.sort((a, b) => a.framework.localeCompare(b.framework));
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const assessments = Array.from(this.assessments.values());
    const recentAssessments = assessments.filter(
      a => Date.now() - a.assessmentDate.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    const criticalIssues = recentAssessments.filter(a => a.riskLevel === 'critical').length;
    const nonCompliantCount = recentAssessments.filter(a => a.status === 'non_compliant').length;
    const overallScore = this.calculateOverallScore(recentAssessments);

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (criticalIssues > 5 || overallScore < 60) {
      status = 'unhealthy';
    } else if (criticalIssues > 0 || nonCompliantCount > 10 || overallScore < 80) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        total_assessments: assessments.length,
        recent_assessments: recentAssessments.length,
        critical_issues: criticalIssues,
        non_compliant_count: nonCompliantCount,
        overall_score: overallScore,
        total_requirements: this.requirements.size,
        remediation_plans: this.remediationPlans.size
      }
    };
  }
}

// Create singleton instance
export const legalComplianceService = new LegalComplianceService();

export default legalComplianceService;