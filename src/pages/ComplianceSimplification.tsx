import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanMarkdownFormatting, cleanComplianceSubRequirement } from '@/utils/textFormatting';
import { SectorSpecificEnhancer } from '@/services/compliance/SectorSpecificEnhancer';
import { 
  ArrowLeft, 
 
  Shield, 
  Zap, 
  Target,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Lightbulb,
  Users,
  BookOpen,
  Lock,
  Settings,
  Eye,
  Filter,
  Building2,
  Factory
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useComplianceMappingData, useIndustrySectors } from '@/services/compliance/ComplianceUnificationService';
import { CorrectedGovernanceService } from '@/services/compliance/CorrectedGovernanceService';
import { AILoadingAnimation } from '@/components/compliance/AILoadingAnimation';
import { PentagonVisualization } from '@/components/compliance/PentagonVisualization';
import { useFrameworkCounts } from '@/hooks/useFrameworkCounts';
import { useQueryClient } from '@tanstack/react-query';
import { FrameworkFilterService } from '@/services/compliance/FrameworkFilterService';
import * as XLSX from 'xlsx';

export default function ComplianceSimplification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  
  // Get dynamic framework counts from database
  const { data: frameworkCounts, isLoading: isLoadingCounts } = useFrameworkCounts();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [unifiedCategoryFilter, setUnifiedCategoryFilter] = useState('all');
  
  // Industry sector selection state
  const [selectedIndustrySector, setSelectedIndustrySector] = useState<string | null>(null);
  
  // Framework selection state
  const [selectedFrameworks, setSelectedFrameworks] = useState<{
    iso27001: boolean;
    iso27002: boolean;
    cisControls: 'ig1' | 'ig2' | 'ig3' | null;
    gdpr: boolean;
    nis2: boolean;
  }>({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: false,
    nis2: false
  });
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  
  // Unified Guidance modal state
  const [showUnifiedGuidance, setShowUnifiedGuidance] = useState(false);
  const [selectedGuidanceCategory, setSelectedGuidanceCategory] = useState<string>('');
  const [frameworksSelected, setFrameworksSelected] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3' as 'ig1' | 'ig2' | 'ig3' | null,
    gdpr: false,
    nis2: false
  });

  // Function to get enhanced guidance content for categories with framework references
  const getGuidanceContent = (category: string) => {
    // Strip number prefixes for proper lookup (e.g., "01. Risk Management" -> "Risk Management")
    const cleanCategory = category.replace(/^\d+\.\s*/, '');
    
    // Get selected frameworks to customize content
    const selectedFrameworksList = Object.entries(frameworksSelected)
      .filter(([_, selected]) => selected)
      .map(([framework, _]) => framework);
    
    // Create framework-specific references
    const getFrameworkReferences = (categoryName: string) => {
      const references: Record<string, string> = {
        'Governance & Leadership': getGovernanceReferences(),
        'Risk Management': getRiskReferences(),
        'Access Control & Identity Management': getAccessControlReferences(),
        'Asset Management': getAssetReferences(),
        'Physical & Environmental Security': getPhysicalReferences(),
        'Communications & Operations Management': getOperationsReferences(),
        'System Acquisition, Development & Maintenance': getDevelopmentReferences(),
        'Information Security Incident Management': getIncidentReferences(),
        'Business Continuity Management': getContinuityReferences(),
        'Compliance': getComplianceReferences()
      };
      
      return references[categoryName] || '';
    };

    // Framework reference functions
    const getGovernanceReferences = () => {
      let references = '**Framework References for Selected Standards:**\n\n';
      
      if (selectedFrameworksList.includes('iso27001')) {
        references += '**ISO 27001:** Clause 5.1 (Leadership), 7.2 (Competence), 9.3 (Management Review), A.7.1 (Personnel Security)\n';
      }
      if (selectedFrameworksList.includes('iso27002')) {
        references += '**ISO 27002:** A.6.1 (Security Roles), A.7.1.1 (Background Screening), A.7.1.2 (Terms of Employment), A.7.2.1 (Training), A.7.3.1 (Disciplinary Process)\n';
      }
      if (selectedFrameworksList.includes('cisControls')) {
        references += '**CIS Controls:** Control 14 (Security Awareness), Control 17 (Security Skills Assessment)\n';
      }
      if (selectedFrameworksList.includes('gdpr')) {
        references += '**GDPR:** Article 32 (Security Measures), Article 39 (DPO Tasks and Duties)\n';
      }
      if (selectedFrameworksList.includes('nis2')) {
        references += '**NIS2:** Article 20 (Cybersecurity Risk Management), Article 21 (Corporate Accountability)\n';
      }
      
      return references + '\n';
    };

    const getRiskReferences = () => {
      let references = '**Framework References for Selected Standards:**\n\n';
      
      if (selectedFrameworksList.includes('iso27001')) {
        references += '**ISO 27001:** Clause 6.1.2 (Risk Assessment), 6.1.3 (Risk Treatment), 8.2 (Risk Assessment), 8.3 (Risk Treatment)\n';
      }
      if (selectedFrameworksList.includes('iso27002')) {
        references += '**ISO 27002:** A.5.1 (Information Security Policies), A.12.6 (Technical Vulnerability Management)\n';
      }
      if (selectedFrameworksList.includes('cisControls')) {
        references += '**CIS Controls:** Control 4 (Secure Configuration), Control 7 (Continuous Vulnerability Management)\n';
      }
      if (selectedFrameworksList.includes('gdpr')) {
        references += '**GDPR:** Article 35 (Data Protection Impact Assessment), Article 32 (Security of Processing)\n';
      }
      if (selectedFrameworksList.includes('nis2')) {
        references += '**NIS2:** Article 20 (Cybersecurity Risk Management), Article 23 (Incident Reporting)\n';
      }
      
      return references + '\n';
    };

    const getAccessControlReferences = () => {
      let references = '**Framework References for Selected Standards:**\n\n';
      
      if (selectedFrameworksList.includes('iso27001')) {
        references += '**ISO 27001:** A.9 (Access Control), A.9.1 (Business Requirements), A.9.2 (User Access Management)\n';
      }
      if (selectedFrameworksList.includes('iso27002')) {
        references += '**ISO 27002:** A.9.1.1 (Access Control Policy), A.9.2.1 (User Registration), A.9.2.6 (Privileged Access Rights)\n';
      }
      if (selectedFrameworksList.includes('cisControls')) {
        references += '**CIS Controls:** Control 5 (Account Management), Control 6 (Access Control Management), Control 16 (Application Security)\n';
      }
      if (selectedFrameworksList.includes('gdpr')) {
        references += '**GDPR:** Article 32 (Security of Processing), Article 25 (Data Protection by Design)\n';
      }
      if (selectedFrameworksList.includes('nis2')) {
        references += '**NIS2:** Article 20 (Access Control), Article 21 (Identity Management)\n';
      }
      
      return references + '\n';
    };

    // Placeholder functions for other categories
    const getAssetReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Asset management requirements vary by selected standards.\n\n' : '';
    const getPhysicalReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Physical security requirements vary by selected standards.\n\n' : '';
    const getOperationsReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Operations management requirements vary by selected standards.\n\n' : '';
    const getDevelopmentReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Development lifecycle requirements vary by selected standards.\n\n' : '';
    const getIncidentReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Incident management requirements vary by selected standards.\n\n' : '';
    const getContinuityReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Business continuity requirements vary by selected standards.\n\n' : '';
    const getComplianceReferences = () => selectedFrameworksList.length > 0 ? '**Framework References:** Compliance requirements vary by selected standards.\n\n' : '';

    const guidanceMap: Record<string, string> = {
      'Governance & Leadership': `${getFrameworkReferences('Governance & Leadership')}

**Strategic Business Foundation**

Governance & Leadership establishes the executive framework and organizational structure necessary for systematic information security management. This forms the cornerstone of regulatory compliance and business resilience.

**Leadership Requirements**

Executive leadership must demonstrate measurable commitment through:

**Board-Level Information Security Oversight**
Quarterly reporting requirements with executive accountability for security performance and strategic direction

**Documented Security Policies**
Senior management approval and annual review cycles ensuring policies remain current and effective

**Resource Allocation**
Demonstrable security integration into business strategy through appropriate budget allocation and staffing

**Clear Accountability Structures**
Defined roles and responsibilities across all organizational levels with appropriate authority and decision-making power

**Strategic Security Planning**
Alignment with business objectives and regulatory requirements through integrated planning processes

**Human Resources (HR) Security Framework**

Personnel security controls ensure trustworthy workforce management:

**Background Screening**
Comprehensive verification procedures proportional to access levels, including criminal background checks, employment verification, and reference validation for positions handling sensitive information

**Disciplinary Action Procedures**
${selectedFrameworksList.includes('iso27002') ? 
'Progressive disciplinary measures including verbal warnings, written warnings, suspension, and termination for security violations. Immediate termination procedures for serious security breaches with security clearance revocation and post-employment obligations enforcement.' : 
'Established procedures for addressing security policy violations through appropriate disciplinary measures.'
}

**Security Competence Management**
Role-based security training programs with documented completion tracking, specialized training for high-risk positions, and regular competence assessments to ensure personnel can fulfill security responsibilities effectively

**Monitoring & Compliance Operations**

Systematic oversight ensures ongoing effectiveness and regulatory adherence:

**Management Reviews**
Formal quarterly reviews of Information Security Management System (ISMS) performance, including security metrics analysis, incident trend evaluation, and corrective action tracking

**Internal Audit Programs**
Annual security audits conducted by qualified personnel, with documented findings, corrective action plans, and management response procedures

**Continuous Improvement**
Structured processes for identifying security improvements, implementing corrective actions, and measuring effectiveness through key performance indicators

**Implementation Phases**

**Foundation Phase**
Define security governance charter, establish security committee structure, and create initial policy framework

**Operationalization Phase**
Implement management review processes, deploy training programs, and establish audit procedures

**Maturation Phase**
Develop advanced metrics, enhance continuous improvement processes, and integrate security governance with broader enterprise governance

**Critical Success Factors**

✅ Executive leadership actively champions security initiatives with visible commitment
✅ Security roles and responsibilities are clearly defined and communicated across all organizational levels
✅ Regular management reviews drive continuous improvement and strategic alignment
✅ HR security processes ensure personnel trustworthiness and competence
✅ Audit and monitoring activities provide objective assessment of security effectiveness
      `,
      
      'Risk Management': `${getFrameworkReferences('Risk Management')}

**Strategic Risk Assessment Framework**

Risk management provides the systematic foundation for identifying, analyzing, and treating information security risks across the enterprise. This process ensures business continuity while meeting regulatory compliance requirements.

**Risk Identification and Assessment**

Comprehensive risk evaluation encompasses:

**Asset-Based Risk Analysis**
Systematic identification of information assets, their vulnerabilities, and potential threats, including business process dependencies and technology infrastructure risks

**Business Impact Analysis**
Quantitative and qualitative assessment of potential consequences, including financial impact, operational disruption, regulatory penalties, and reputational damage

**Threat Landscape Evaluation**
Regular assessment of emerging threats, attack vectors, and industry-specific risks relevant to your business sector and geographic presence

**Risk Register Maintenance**
Dynamic documentation of identified risks with likelihood assessments, impact evaluations, and risk ownership assignments

**Risk Treatment Strategies**

Systematic approach to risk mitigation:

**Risk Acceptance**
Formal acceptance of risks within organizational tolerance levels, with documented justification and regular review cycles

**Risk Mitigation**
Implementation of security controls to reduce risk likelihood or impact to acceptable levels, with effectiveness monitoring and control testing

**Risk Transfer**
Strategic use of insurance, contractual arrangements, and third-party services to transfer specific risk exposures

**Risk Avoidance**
Elimination of activities or systems that present unacceptable risk levels when mitigation options are insufficient

**Continuous Risk Monitoring**

Ongoing risk oversight ensures current and effective risk management:

**Key Risk Indicators (KRIs)**
Measurable metrics that provide early warning of increasing risk exposure, with defined thresholds and escalation procedures

**Regular Risk Reviews**
Monthly operational risk assessments and quarterly strategic risk evaluations, with trend analysis and emerging risk identification

**Change Impact Assessment**
Evaluation of risk implications for all significant business, technology, and operational changes

**Third-Party Risk Management**
Ongoing assessment and monitoring of vendor and supplier risks, including due diligence, contract management, and performance monitoring

**Implementation Methodology**

Establish effective risk management through structured phases:
1. **Foundation**: Develop risk management policy, establish risk appetite and tolerance levels, and create risk governance structure
2. **Assessment**: Conduct comprehensive initial risk assessment, populate risk register, and prioritize treatment activities
3. **Treatment**: Implement risk mitigation controls, establish monitoring procedures, and create risk reporting mechanisms
4. **Optimization**: Mature risk management processes, enhance predictive capabilities, and integrate with strategic planning

**Critical Success Indicators**

✅ Comprehensive risk register maintained with current and accurate risk assessments
✅ Risk treatment plans implemented with measurable effectiveness metrics
✅ Regular risk monitoring provides actionable insights for decision-making
✅ Risk management processes support compliance with applicable regulatory requirements
✅ Risk-informed decision making demonstrated across all organizational levels
      `,
      
      'Access Control & Identity Management': `${getFrameworkReferences('Access Control & Identity Management')}

**Comprehensive Identity and Access Framework**

Access control and identity management establish systematic controls for user authentication, authorization, and access lifecycle management across all information systems and resources.

**Identity Lifecycle Management**

Complete identity governance encompasses:

**User Provisioning**
Standardized onboarding processes with role-based access assignment, automated account creation workflows, and integration with HR systems for seamless identity management

**Access Certification**  
Regular access reviews and recertification processes, with manager attestation for direct reports and automated compliance reporting for audit purposes

**Deprovisioning**
Immediate account disabling upon termination or role changes, with systematic access removal procedures and asset recovery protocols

**Identity Federation**
Single sign-on (SSO) implementation supporting SAML, OAuth, and OpenID Connect protocols for streamlined user experience and centralized identity management

**Authentication and Authorization Controls**

Multi-layered security controls ensure appropriate access:

**Multi-Factor Authentication (MFA)**
Mandatory MFA for all privileged accounts and sensitive system access, supporting multiple authentication factors including hardware tokens, mobile applications, and biometric verification

**Privileged Access Management**
Dedicated PAM solutions with password vaulting, session recording, just-in-time access provisioning, and privileged activity monitoring with comprehensive audit trails

**Role-Based Access Control (RBAC)**
Systematic role design based on job functions and least privilege principles, with standardized role templates and automated role assignment workflows

**Attribute-Based Access Control**
Dynamic authorization decisions based on user attributes, resource sensitivity, environmental context, and risk-based authentication factors

**Access Governance and Monitoring**

Continuous oversight ensures access control effectiveness:

**Access Analytics**
Regular analysis of user access patterns, identification of excessive privileges, detection of dormant accounts, and monitoring of access policy violations

**Segregation of Duties**
Implementation of preventive and detective controls to prevent conflicting access combinations, with automated violation detection and remediation workflows

**Network Access Control**  
802.1X authentication for wired and wireless networks, device compliance verification, and dynamic VLAN assignment based on user identity and device trust status

**Application Security**
Fine-grained authorization controls within applications, API access management, and integration with enterprise identity providers

**Regulatory Compliance Support**

Access controls support multiple regulatory requirements:

**GDPR Data Subject Rights**
Identity verification procedures for data subject requests, access logging for audit purposes, and data subject consent management

**SOX Compliance**
Segregation of duties controls for financial systems, access certification processes, and IT general controls documentation

**ISO 27001**
Comprehensive access control framework addressing user access management, privileged access, and remote access security

**Implementation Strategy**

Systematic deployment across enterprise:

**Phase 1: Assessment**
Current state access review, gap analysis against security requirements, and risk-based prioritization of remediation activities

**Phase 2: Foundation**  
Core identity infrastructure deployment, basic RBAC implementation, and essential security controls activation

**Phase 3: Enhancement**
Advanced access controls, privileged access management, and automated governance processes

**Phase 4: Optimization**
Analytics-driven access optimization, zero-trust architecture elements, and advanced threat detection integration

**Operational Excellence Indicators**

✅ Comprehensive identity lifecycle management with automated provisioning and deprovisioning
✅ Multi-factor authentication deployed across all privileged and remote access scenarios
✅ Regular access certification processes with documented manager approval and audit trails
✅ Privileged access management controls with session monitoring and just-in-time access
✅ Access analytics providing insights into access patterns and policy compliance
      `,
      
      'Incident Response & Recovery': `
**Comprehensive Incident Management Framework**

Incident response and recovery capabilities provide systematic procedures for detecting, responding to, and recovering from security incidents while meeting regulatory notification requirements and maintaining business continuity.

**Critical Regulatory Notification Requirements**

Time-sensitive compliance obligations must be integrated into incident response procedures:

**GDPR Personal Data Breach Notification**
Supervisory authority notification within 72 hours of awareness (Article 33), including breach nature, affected data categories and subjects, likely consequences, and remediation measures taken

**NIS2 Early Warning System**
Essential and important entities must provide early warning notifications within 24 hours to competent national authorities for significant incidents affecting service availability

**NIS2 Detailed Incident Reports**
Comprehensive incident analysis and final report submission within 72 hours, including technical root cause analysis, impact assessment, and remediation timeline

**Data Subject Notification**
Individual notification requirements when breaches likely result in high risk to personal rights and freedoms, using clear language explaining consequences and mitigation actions

**Incident Detection and Classification**

Systematic incident identification and prioritization:

**24/7 Security Monitoring**
Continuous threat detection using SIEM platforms, threat intelligence integration, and automated alerting systems with defined escalation thresholds

**Incident Classification Framework**
Severity-based categorization (Critical, High, Medium, Low) considering service impact, data exposure, regulatory implications, and business disruption potential

**Automated Response Triggers**
Integration with security tools for immediate containment actions, threat intelligence correlation, and stakeholder notification based on incident type and severity

**Evidence Preservation**
Forensic evidence collection procedures maintaining chain of custody for potential legal proceedings and regulatory investigations

**Response Team Structure and Procedures**

Organized response capabilities ensure effective incident management:
- **Incident Response Team**: Cross-functional team including Incident Commander, Technical Lead, Communications Lead, Legal Counsel, and Business Continuity Manager with 24/7 availability
- **Escalation Procedures**: Clear decision-making authority and escalation paths, including criteria for executive notification and external assistance engagement
- **Communication Management**: Internal stakeholder updates, customer notifications, media response coordination, and regulatory communications using pre-approved templates and messaging
- **Containment Strategy**: Immediate isolation procedures, short-term remediation measures, and long-term security improvements with documented effectiveness assessment

**Recovery and Business Continuity**

Systematic restoration of normal operations:
- **Recovery Planning**: Prioritized system restoration procedures, backup validation and restoration processes, and alternative operational procedures during recovery phases
- **Service Restoration**: Phased approach to service recovery with security validation, performance testing, and enhanced monitoring during initial restoration periods
- **Post-Incident Activities**: Comprehensive after-action reviews, lessons learned documentation, procedure updates, and improvement recommendations implementation
- **Stakeholder Communication**: Regular updates to customers, partners, and regulators throughout recovery process with transparent status reporting

**Continuous Improvement and Preparedness**

Ongoing enhancement of incident response capabilities:
- **Regular Testing**: Quarterly tabletop exercises, annual full-scale simulations, and scenario-based training programs with documented improvement actions
- **Metrics and Reporting**: Incident response performance metrics, regulatory compliance tracking, and effectiveness measurements with trend analysis
- **Threat Intelligence Integration**: Incorporation of current threat landscape information, attack pattern analysis, and industry-specific threat indicators
- **Supply Chain Coordination**: Incident response procedures for third-party service providers, vendor notification requirements, and coordinated response activities

**Implementation Requirements**

Essential elements for effective incident response:
1. **Foundation**: Incident response policy, team structure establishment, and basic procedure development with regulatory requirement integration
2. **Operationalization**: Response team training, communication procedure testing, and technology infrastructure deployment
3. **Optimization**: Advanced threat detection capabilities, automated response procedures, and comprehensive recovery testing

**Performance Indicators**

✅ Mean time to detection (MTTD) and mean time to response (MTTR) meet organizational targets
✅ Regulatory notification requirements consistently met within required timeframes
✅ Incident response team demonstrates competence through regular testing and actual incident performance
✅ Post-incident reviews result in measurable improvements to response capabilities
✅ Business continuity objectives achieved during incident response and recovery activities
      `
    };
    
    return guidanceMap[cleanCategory] || `
**Guidance for ${cleanCategory}**

This category covers important compliance requirements that help ensure your organization meets industry standards and regulations.

**Key Focus Areas:**
- Understanding the specific requirements for this category
- Implementing practical controls and procedures
- Maintaining documentation and evidence
- Regular monitoring and improvement

**Next Steps:**
1. Review the detailed requirements below
2. Assess your current state against these requirements
3. Create an implementation plan for any gaps
4. Document your procedures and controls

For more specific guidance on this category, please consult with your compliance team or external advisors.
    `;
  };

  // Fetch industry sectors
  const { data: industrySectors, isLoading: isLoadingSectors } = useIndustrySectors();
  
  // Fetch compliance mapping data from Supabase
  // Transform selectedFrameworks to match the expected format for the hook
  const frameworksForHook = {
    iso27001: Boolean(selectedFrameworks['iso27001']),
    iso27002: Boolean(selectedFrameworks['iso27002']),
    cisControls: Boolean(selectedFrameworks['cisControls']), // Pass boolean for the query
    gdpr: Boolean(selectedFrameworks['gdpr']),
    nis2: Boolean(selectedFrameworks['nis2'])
  };
  
  const { data: fetchedComplianceMapping, isLoading: isLoadingMappings } = useComplianceMappingData(frameworksForHook, selectedIndustrySector || undefined);
  
  // Use database data
  const complianceMappingData = fetchedComplianceMapping || [];
  
  // Fetch ALL frameworks data for maximum statistics calculation (overview tab)
  const allFrameworksSelection = {
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3', // Maximum coverage with IG3
    gdpr: true,
    nis2: true
  };
  
  const { data: maxComplianceMapping } = useComplianceMappingData(allFrameworksSelection);
  
  
  
  // Handle framework selection
  const handleFrameworkToggle = (framework: string, value: boolean | 'ig1' | 'ig2' | 'ig3' | null) => {
    setFrameworksSelected(prev => ({ ...prev, [framework]: value }));
  };
  
  // Handle generation button
  const handleGenerate = () => {
    console.log('Generate button clicked', { frameworksSelected, selectedFrameworks });
    setIsGenerating(true);
    setShowGeneration(true);
    
    // Force update the frameworks to trigger data refetch
    setSelectedFrameworks({ 
      iso27001: Boolean(frameworksSelected['iso27001']),
      iso27002: Boolean(frameworksSelected['iso27002']),
      cisControls: frameworksSelected['cisControls'] as 'ig1' | 'ig2' | 'ig3' | null,
      gdpr: Boolean(frameworksSelected['gdpr']),
      nis2: Boolean(frameworksSelected['nis2'])
    });
    
    // Force invalidate React Query cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['compliance-mapping-data'] });
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Generation completed, staying on current tab');
      
      // Hide generation animation after showing results
      setTimeout(() => {
        setShowGeneration(false);
      }, 2000);
    }, 2500);
  };

  const exportToCSV = () => {
    // Get selected frameworks for dynamic column generation
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return `${framework} (${value.toUpperCase()})`;
        }
        return framework;
      });

    // Create dynamic headers based on selected frameworks
    const baseHeaders = [
      'Category',
      'Description of Category',
      'Unified Requirements',
      'Unified Guidance'
    ];
    
    // Add framework-specific columns only for selected frameworks
    const frameworkHeaders = [];
    if (selectedFrameworks.iso27001) frameworkHeaders.push('ISO 27001 Controls');
    if (selectedFrameworks.iso27002) frameworkHeaders.push('ISO 27002 Controls');
    if (selectedFrameworks.cisControls) {
      const igLevel = selectedFrameworks.cisControls.toUpperCase();
      frameworkHeaders.push(`CIS Controls (${igLevel})`);
    }
    if (selectedFrameworks.gdpr) frameworkHeaders.push('GDPR Articles');
    if (selectedFrameworks.nis2) frameworkHeaders.push('NIS2 Articles');
    
    // Add industry-specific column if sector is selected
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'Industry-Specific';
      frameworkHeaders.push(`${sectorName} Requirements`);
    }

    const headers = [...baseHeaders, ...frameworkHeaders];
    
    // Create enhanced rows with better formatting
    const rows = (filteredUnifiedMappings || []).map(mapping => {
      const baseRow = [
        mapping.category || '',
        cleanMarkdownFormatting(mapping.auditReadyUnified?.description || ''),
        mapping.auditReadyUnified?.title || '',
        // Format sub-requirements with proper line breaks for CSV
        (mapping.auditReadyUnified?.subRequirements || [])
          .map((req, index) => `${index + 1}. ${cleanComplianceSubRequirement(req)}`)
          .join('\n• ')
      ];

      // Add framework-specific data only for selected frameworks
      const frameworkData = [];
      
      if (selectedFrameworks.iso27001) {
        const iso27001Controls = (mapping.frameworks?.['iso27001'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(iso27001Controls);
      }
      
      if (selectedFrameworks.iso27002) {
        const iso27002Controls = (mapping.frameworks?.['iso27002'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(iso27002Controls);
      }
      
      if (selectedFrameworks.cisControls) {
        const cisControls = (mapping.frameworks?.['cisControls'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(cisControls);
      }
      
      if (selectedFrameworks.gdpr) {
        const gdprArticles = (mapping.frameworks?.['gdpr'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(gdprArticles);
      }
      
      if (selectedFrameworks.nis2) {
        const nis2Articles = (mapping.frameworks?.['nis2'] || [])
          .map(r => `${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(nis2Articles);
      }

      // Add industry-specific requirements if available
      if (selectedIndustrySector && mapping.industrySpecific) {
        const industryReqs = mapping.industrySpecific
          .map(r => `[${r.relevanceLevel.toUpperCase()}] ${r.code}: ${cleanMarkdownFormatting(r.title)}\n${cleanMarkdownFormatting(r.description).substring(0, 120)}...`)
          .join('\n\n• ');
        frameworkData.push(industryReqs);
      }

      return [...baseRow, ...frameworkData];
    });

    // Create enhanced CSV with better formatting
    const csvRows = [];
    
    // Add title and metadata
    csvRows.push([`AuditReady Compliance Simplification Report`]);
    csvRows.push([`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
    csvRows.push([`Selected Frameworks: ${selectedFrameworksList.join(', ')}`]);
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      csvRows.push([`Industry Sector: ${sectorName}`]);
    }
    csvRows.push(['']); // Empty row for spacing
    
    // Add headers
    csvRows.push(headers);
    
    // Add data rows
    csvRows.push(...rows);
    
    // Add footer with summary
    csvRows.push(['']); // Empty row
    csvRows.push([`Total Categories: ${rows.length}`]);
    csvRows.push([`Export Format: Professional CSV with Enhanced Formatting`]);
    csvRows.push([`Note: Import into Excel or Google Sheets for optimal formatting`]);

    // Convert to CSV format with enhanced escaping
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        // Enhanced cell formatting for better readability
        const cleanCell = String(cell || '')
          .replace(/"/g, '""') // Escape quotes
          .replace(/\n/g, '\n') // Preserve line breaks
          .replace(/\r/g, ''); // Remove carriage returns
        
        // Always quote cells to preserve formatting
        return `"${cleanCell}"`;
      }).join(',')
    ).join('\n');

    // Create download with enhanced filename
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Compliance_Report_${timestamp}${frameworkSuffix}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    console.log(`✅ Exported ${rows.length} compliance categories to ${filename}`);
  };

  const exportToXLSX = () => {
    // Get selected frameworks for dynamic column generation
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return `${framework} (${value.toUpperCase()})`;
        }
        return framework;
      });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // 🎨 ENTERPRISE-GRADE REPORT INFO WORKSHEET
    const currentDate = new Date();
    const metaData = [
      // Title Section with branding
      ['🛡️ AuditReady Enterprise Compliance Report', ''],
      ['', ''],
      ['📊 EXECUTIVE SUMMARY', ''],
      ['', ''],
      ['Report Generated:', currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + ' at ' + currentDate.toLocaleTimeString()],
      ['Compliance Frameworks:', selectedFrameworksList.join(', ') || 'All Available'],
      ['Total Categories Analyzed:', (filteredUnifiedMappings || []).length],
      ['Coverage Assessment:', selectedFrameworksList.length > 3 ? 'Comprehensive Multi-Framework Analysis' : 'Focused Framework Analysis'],
      ['', ''],
      ['📋 REPORT SPECIFICATIONS', ''],
      ['', ''],
      ['✓ Category Analysis:', 'Complete coverage of all security domains'],
      ['✓ Framework Mapping:', 'Cross-referenced compliance requirements'],
      ['✓ Unified Guidance:', 'Consolidated implementation roadmap'],
      ['✓ Industry Alignment:', selectedIndustrySector ? 'Sector-specific customization included' : 'General applicability'],
      ['', ''],
      ['🎯 USAGE GUIDELINES', ''],
      ['', ''],
      ['• Executive Review:', 'Focus on Category and Unified Requirements columns'],
      ['• Technical Implementation:', 'Reference Framework-specific control mappings'],
      ['• Audit Preparation:', 'Use Unified Guidance for evidence collection'],
      ['• Risk Assessment:', 'Prioritize categories based on organizational context']
    ];

    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      metaData.splice(7, 0, ['Industry Sector Focus:', `${sectorName} - Enhanced Requirements`]);
    }

    const metaWS = XLSX.utils.aoa_to_sheet(metaData);
    
    // 🎨 STUNNING METADATA STYLING
    metaWS['!cols'] = [
      { wch: 35 }, // Column A - Labels
      { wch: 65 }  // Column B - Values
    ];

    // Apply cell styling for metadata
    const metaRange = XLSX.utils.decode_range(metaWS['!ref'] || 'A1:B25');
    for (let row = metaRange.s.r; row <= metaRange.e.r; row++) {
      for (let col = metaRange.s.c; col <= metaRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!metaWS[cellAddr]) continue;
        
        // Style different sections
        if (row === 0) {
          // Title row
          metaWS[cellAddr].s = {
            font: { bold: true, size: 18, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if ([2, 9, 17].includes(row)) {
          // Section headers
          metaWS[cellAddr].s = {
            font: { bold: true, size: 14, color: { rgb: "2F5233" } },
            fill: { fgColor: { rgb: "F0F8F0" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if ([4, 5, 6, 7, 8, 11, 12, 13, 14, 19, 20, 21, 22].includes(row) && col === 0) {
          // Data labels
          metaWS[cellAddr].s = {
            font: { bold: true, size: 11, color: { rgb: "404040" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
      }
    }

    // 🎨 MAIN DATA WORKSHEET - ENTERPRISE GRADE
    const baseHeaders = [
      '📂 Category',
      '📋 Description of Category',
      '🎯 Unified Requirements',
      '📖 Unified Guidance'
    ];
    
    // Add framework-specific columns with icons
    const frameworkHeaders = [];
    const frameworkIcons = {
      iso27001: '🔒 ISO 27001 Controls',
      iso27002: '🛡️ ISO 27002 Controls',
      cisControls: '⚙️ CIS Controls',
      gdpr: '🇪🇺 GDPR Articles',
      nis2: '🌐 NIS2 Articles'
    };
    
    if (selectedFrameworks.iso27001) frameworkHeaders.push(frameworkIcons.iso27001);
    if (selectedFrameworks.iso27002) frameworkHeaders.push(frameworkIcons.iso27002);
    if (selectedFrameworks.cisControls) {
      const igLevel = selectedFrameworks.cisControls.toUpperCase();
      frameworkHeaders.push(`⚙️ CIS Controls (${igLevel})`);
    }
    if (selectedFrameworks.gdpr) frameworkHeaders.push(frameworkIcons.gdpr);
    if (selectedFrameworks.nis2) frameworkHeaders.push(frameworkIcons.nis2);
    
    // Add industry-specific column with icon
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'Industry-Specific';
      frameworkHeaders.push(`🏢 ${sectorName} Requirements`);
    }

    const headers = [...baseHeaders, ...frameworkHeaders];
    
    // Create data rows with enhanced formatting
    const xlsxRows = [headers];
    
    (filteredUnifiedMappings || []).forEach((mapping, index) => {
      const baseRow = [
        `${index + 1}. ${mapping.category || ''}`,
        cleanMarkdownFormatting(mapping.auditReadyUnified?.description || ''),
        mapping.auditReadyUnified?.title || '',
        // Enhanced sub-requirements with professional formatting
        (mapping.auditReadyUnified?.subRequirements || [])
          .map((req, reqIndex) => `✓ ${cleanComplianceSubRequirement(req)}`)
          .join('\n\n')
      ];

      // Add framework-specific data with enhanced formatting
      const frameworkData = [];
      
      if (selectedFrameworks.iso27001) {
        const iso27001Controls = (mapping.frameworks?.['iso27001'] || [])
          .map((r, idx) => `🔹 ${r.code}: ${cleanMarkdownFormatting(r.title)}\n   ${cleanMarkdownFormatting(r.description)}`)
          .join('\n\n');
        frameworkData.push(iso27001Controls || '— No specific mappings available');
      }
      
      if (selectedFrameworks.iso27002) {
        const iso27002Controls = (mapping.frameworks?.['iso27002'] || [])
          .map((r, idx) => `🔹 ${r.code}: ${cleanMarkdownFormatting(r.title)}\n   ${cleanMarkdownFormatting(r.description)}`)
          .join('\n\n');
        frameworkData.push(iso27002Controls || '— No specific mappings available');
      }
      
      if (selectedFrameworks.cisControls) {
        const cisControls = (mapping.frameworks?.['cisControls'] || [])
          .map((r, idx) => `🔹 ${r.code}: ${cleanMarkdownFormatting(r.title)}\n   ${cleanMarkdownFormatting(r.description)}`)
          .join('\n\n');
        frameworkData.push(cisControls || '— No specific mappings available');
      }
      
      if (selectedFrameworks.gdpr) {
        const gdprArticles = (mapping.frameworks?.['gdpr'] || [])
          .map((r, idx) => `🔹 ${r.code}: ${cleanMarkdownFormatting(r.title)}\n   ${cleanMarkdownFormatting(r.description)}`)
          .join('\n\n');
        frameworkData.push(gdprArticles || '— No specific mappings available');
      }
      
      if (selectedFrameworks.nis2) {
        const nis2Articles = (mapping.frameworks?.['nis2'] || [])
          .map((r, idx) => `🔹 ${r.code}: ${cleanMarkdownFormatting(r.title)}\n   ${cleanMarkdownFormatting(r.description)}`)
          .join('\n\n');
        frameworkData.push(nis2Articles || '— No specific mappings available');
      }

      // Add industry-specific requirements with relevance indicators
      if (selectedIndustrySector && mapping.industrySpecific) {
        const industryReqs = mapping.industrySpecific
          .map(r => {
            const priorityIcon = {
              'critical': '🔴',
              'high': '🟠',
              'standard': '🟡',
              'optional': '🟢'
            }[r.relevanceLevel] || '⚪';
            return `${priorityIcon} [${r.relevanceLevel.toUpperCase()}] ${r.code}: ${cleanMarkdownFormatting(r.title)}\n   ${cleanMarkdownFormatting(r.description)}`;
          })
          .join('\n\n');
        frameworkData.push(industryReqs || '— No industry-specific requirements');
      }

      xlsxRows.push([...baseRow, ...frameworkData]);
    });

    const mainWS = XLSX.utils.aoa_to_sheet(xlsxRows);
    
    // 🎨 CALCULATE AUTO-ADJUSTED COLUMN WIDTHS
    const calculateOptimalWidth = (text: string, isHeader = false) => {
      if (!text) return 15;
      const lines = text.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      let baseWidth = Math.min(Math.max(maxLineLength * 1.2, 15), isHeader ? 35 : 60);
      if (isHeader) baseWidth += 5; // Extra space for headers
      return baseWidth;
    };

    // Calculate optimal column widths based on content
    const optimalWidths = headers.map((header, colIndex) => {
      let maxWidth = calculateOptimalWidth(header, true);
      
      // Check content width for this column
      xlsxRows.slice(1).forEach(row => {
        if (row[colIndex]) {
          const contentWidth = calculateOptimalWidth(String(row[colIndex]));
          maxWidth = Math.max(maxWidth, contentWidth);
        }
      });
      
      return { wch: Math.min(maxWidth, 70) }; // Cap at 70 characters
    });

    mainWS['!cols'] = optimalWidths;

    // 🎨 CALCULATE AUTO-ADJUSTED ROW HEIGHTS
    const range = XLSX.utils.decode_range(mainWS['!ref'] || 'A1:A1');
    mainWS['!rows'] = [];
    
    for (let i = 0; i <= range.e.r; i++) {
      if (i === 0) {
        // Header row with premium styling
        mainWS['!rows'][i] = { hpx: 45 };
      } else {
        // Calculate row height based on content
        let maxLines = 1;
        for (let j = 0; j < headers.length; j++) {
          const cellAddr = XLSX.utils.encode_cell({ r: i, c: j });
          if (mainWS[cellAddr] && mainWS[cellAddr].v) {
            const lines = String(mainWS[cellAddr].v).split('\n').length;
            maxLines = Math.max(maxLines, lines);
          }
        }
        // Set height based on content (minimum 25px, scale with content)
        const optimalHeight = Math.max(25, Math.min(maxLines * 18, 200));
        mainWS['!rows'][i] = { hpx: optimalHeight };
      }
    }

    // 🎨 APPLY STUNNING CELL STYLING
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!mainWS[cellAddr]) continue;

        if (row === 0) {
          // 🎨 PREMIUM HEADER STYLING
          mainWS[cellAddr].s = {
            font: { 
              bold: true, 
              size: 12, 
              color: { rgb: "FFFFFF" },
              name: "Calibri"
            },
            fill: { 
              fgColor: { rgb: col < 4 ? "1F4E79" : "2F5233" } // Different colors for base vs framework columns
            },
            alignment: { 
              horizontal: "center", 
              vertical: "center",
              wrapText: true 
            },
            border: {
              top: { style: "thick", color: { rgb: "FFFFFF" } },
              bottom: { style: "thick", color: { rgb: "FFFFFF" } },
              left: { style: "thick", color: { rgb: "FFFFFF" } },
              right: { style: "thick", color: { rgb: "FFFFFF" } }
            }
          };
        } else {
          // 🎨 ALTERNATING ROW COLORS WITH PREMIUM STYLING
          const isEvenRow = (row - 1) % 2 === 0;
          const backgroundColor = isEvenRow ? "F8F9FA" : "FFFFFF";
          const textColor = col === 0 ? "1F4E79" : "404040"; // Category column in blue
          
          mainWS[cellAddr].s = {
            font: { 
              size: 10,
              color: { rgb: textColor },
              name: "Calibri",
              bold: col === 0 // Bold category names
            },
            fill: { fgColor: { rgb: backgroundColor } },
            alignment: { 
              horizontal: col === 0 ? "left" : "left",
              vertical: "top",
              wrapText: true,
              indent: col === 0 ? 1 : 0
            },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
          };
        }
      }
    }

    // 🎨 CREATE SUMMARY STATISTICS WORKSHEET
    const summaryData = [
      ['📊 COMPLIANCE COVERAGE ANALYSIS', ''],
      ['', ''],
      ['Framework', 'Requirements Mapped', 'Coverage %', 'Status'],
      ['', '', '', ''],
    ];

    // Add framework statistics
    selectedFrameworksList.forEach(framework => {
      const totalMapped = (filteredUnifiedMappings || []).reduce((count, mapping) => {
        const frameworkKey = framework.includes('(') ? framework.split('(')[0].trim() : framework;
        const mappedFrameworks = Object.keys(mapping.frameworks || {});
        return count + (mappedFrameworks.includes(frameworkKey) ? 1 : 0);
      }, 0);
      
      const coverage = Math.round((totalMapped / Math.max((filteredUnifiedMappings || []).length, 1)) * 100);
      const status = coverage >= 90 ? '✅ Excellent' : coverage >= 70 ? '🟡 Good' : coverage >= 50 ? '🟠 Moderate' : '🔴 Limited';
      
      summaryData.push([framework, totalMapped.toString(), `${coverage}%`, status]);
    });

    summaryData.push(['', '', '', '']);
    summaryData.push(['Total Categories Analyzed', (filteredUnifiedMappings || []).length.toString(), '100%', '✅ Complete']);
    summaryData.push(['Report Generation Date', new Date().toLocaleDateString(), '', '']);
    summaryData.push(['Compliance Readiness Score', 
      selectedFrameworksList.length >= 3 ? 'High Multi-Framework Coverage' : 'Focused Framework Analysis', 
      '', 
      selectedFrameworksList.length >= 3 ? '🏆 Enterprise' : '⭐ Professional'
    ]);

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWS['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

    // Style summary worksheet
    const summaryRange = XLSX.utils.decode_range(summaryWS['!ref'] || 'A1:D10');
    for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
      for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!summaryWS[cellAddr]) continue;
        
        if (row === 0) {
          summaryWS[cellAddr].s = {
            font: { bold: true, size: 16, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if (row === 2) {
          summaryWS[cellAddr].s = {
            font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1F4E79" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      }
    }

    // Add worksheets to workbook in order
    XLSX.utils.book_append_sheet(wb, metaWS, '📋 Report Overview');
    XLSX.utils.book_append_sheet(wb, summaryWS, '📊 Coverage Analysis');
    XLSX.utils.book_append_sheet(wb, mainWS, '🛡️ Compliance Mapping');

    // Create premium filename
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Enterprise_Compliance_Report_${timestamp}${frameworkSuffix}.xlsx`;

    // Export with enterprise branding
    XLSX.writeFile(wb, filename);
    
    console.log(`🏆 Exported enterprise-grade compliance report: ${filename}`);
    console.log(`📊 ${(filteredUnifiedMappings || []).length} categories analyzed across ${selectedFrameworksList.length} frameworks`);
  };

  const filteredMappings = useMemo(() => {
    let filtered = complianceMappingData || [];
    
    // First, filter to show only GDPR group when GDPR is selected, or non-GDPR groups when other frameworks are selected
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2']) {
      // GDPR only - show only the unified GDPR group
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      // Other frameworks without GDPR - show only non-GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      // Mixed selection - show all relevant groups
      filtered = complianceMappingData || [];
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Filter by framework selection
    filtered = filtered.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks['gdpr']) return null;
        
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.['gdpr'] || []
          }
        };
      }
      
      // For non-GDPR groups, filter based on selected frameworks
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks['iso27001'] && mapping.frameworks?.['iso27001'] ? mapping.frameworks['iso27001'] : [],
          iso27002: selectedFrameworks['iso27002'] && mapping.frameworks?.['iso27002'] ? mapping.frameworks['iso27002'] : [],
          nis2: selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          gdpr: [], // Never show GDPR in non-GDPR groups
          cisControls: selectedFrameworks['cisControls'] && mapping.frameworks?.['cisControls'] ? mapping.frameworks['cisControls'] : []
        }
      };
      
      // Only include the mapping if it has at least one framework with controls
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Filter by traditional framework filter (for backwards compatibility)
    if (filterFramework !== 'all') {
      filtered = filtered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.['iso27001']?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.['iso27002']?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.['cisControls']?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks['gdpr']?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(mapping => mapping.id === filterCategory);
    }
    
    // Apply dynamic numbering: GDPR always comes last
    const nonGdprGroups = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    // Number non-GDPR groups sequentially
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    // Number GDPR groups to come after non-GDPR groups
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, filterCategory, complianceMappingData]);

  // Create category options that match exactly what's displayed in filteredMappings
  const categoryOptions = useMemo(() => {
    // Use the SAME data that's actually displayed, but without the category filter applied
    let baseFiltered = complianceMappingData || [];
    
    // Apply the SAME framework filtering logic as filteredMappings
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2']) {
      baseFiltered = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'])) {
      baseFiltered = complianceMappingData || [];
    } else {
      baseFiltered = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }
    
    // Apply the SAME framework content filtering
    baseFiltered = baseFiltered.map(mapping => {
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks['gdpr']) return null;
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.['gdpr'] || []
          }
        };
      }
      
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks['iso27001'] && mapping.frameworks?.['iso27001'] ? mapping.frameworks['iso27001'] : [],
          iso27002: selectedFrameworks['iso27002'] && mapping.frameworks?.['iso27002'] ? mapping.frameworks['iso27002'] : [],
          nis2: selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          gdpr: [],
          cisControls: selectedFrameworks['cisControls'] && mapping.frameworks?.['cisControls'] ? 
            mapping.frameworks['cisControls'].filter(control => {
              const ig3OnlyControls = [
                '1.5', '2.7', '3.13', '3.14', '4.12', '6.8', '8.12', '9.7', 
                '12.8', '13.1', '13.7', '13.8', '13.9', '13.11', 
                '15.5', '15.6', '15.7', '16.12', '16.13', '16.14', 
                '17.9', '18.4', '18.5'
              ];
              
              if (selectedFrameworks['cisControls'] === 'ig1') {
                return !ig3OnlyControls.includes(control.code) && 
                       !control.code.startsWith('13.') && 
                       !control.code.startsWith('16.') && 
                       !control.code.startsWith('17.') && 
                       !control.code.startsWith('18.');
              } else if (selectedFrameworks['cisControls'] === 'ig2') {
                return !ig3OnlyControls.includes(control.code);
              } else if (selectedFrameworks['cisControls'] === 'ig3') {
                return true;
              }
              return false;
            }) : []
        }
      };
      
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Apply SAME framework filter
    if (filterFramework !== 'all') {
      baseFiltered = baseFiltered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return (mapping.frameworks?.['iso27001']?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.['iso27002']?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.['cisControls']?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks['gdpr']?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Apply the SAME numbering logic as filteredMappings
    const nonGdprGroups = baseFiltered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = baseFiltered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, complianceMappingData]); // Note: deliberately excluding filterCategory

  // Create filtered unified requirements for the unified tab (removes unselected framework references)
  const filteredUnifiedMappings = useMemo(() => {
    return filteredMappings.map(mapping => ({
      ...mapping,
      auditReadyUnified: FrameworkFilterService.filterUnifiedRequirement(
        mapping.auditReadyUnified,
        selectedFrameworks
      )
    }));
  }, [filteredMappings, selectedFrameworks]);

  // Calculate MAXIMUM statistics for overview (ALL frameworks selected)
  const maximumOverviewStats = useMemo(() => {
    if (!maxComplianceMapping || maxComplianceMapping.length === 0) {
      return {
        maxRequirements: 310, // Actual maximum from database
        unifiedGroups: 21,
        reduction: 289,
        reductionPercentage: '93.2',
        efficiencyRatio: 15
      };
    }
    
    // Calculate with ALL frameworks selected
    const allFrameworksData = maxComplianceMapping || [];
    
    // Filter to ensure we have all groups (including GDPR)
    const processedData = allFrameworksData.filter(mapping => {
      const hasAnyFramework = 
        (mapping.frameworks?.['iso27001']?.length || 0) > 0 ||
        (mapping.frameworks?.['iso27002']?.length || 0) > 0 ||
        (mapping.frameworks?.['cisControls']?.length || 0) > 0 ||
        (mapping.frameworks?.['gdpr']?.length || 0) > 0 ||
        (mapping.frameworks?.['nis2']?.length || 0) > 0;
      return hasAnyFramework;
    });
    
    // Calculate total requirements across ALL frameworks
    const totalRequirements = processedData.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.['iso27001']?.length || 0;
      const iso27002Count = mapping.frameworks?.['iso27002']?.length || 0;
      const cisControlsCount = mapping.frameworks?.['cisControls']?.length || 0;
      const gdprCount = mapping.frameworks?.['gdpr']?.length || 0;
      const nis2Count = mapping.frameworks?.['nis2']?.length || 0;
      
      return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count;
    }, 0);
    
    const unifiedGroups = processedData.length;
    const reduction = totalRequirements - unifiedGroups;
    const reductionPercentage = totalRequirements > 0 ? ((reduction / totalRequirements) * 100).toFixed(1) : '0.0';
    const efficiencyRatio = unifiedGroups > 0 ? Math.round(totalRequirements / unifiedGroups) : 0;
    
    return {
      maxRequirements: totalRequirements,
      unifiedGroups,
      reduction,
      reductionPercentage,
      efficiencyRatio
    };
  }, [maxComplianceMapping]);

  // Calculate dynamic statistics based on selected frameworks
  // const dynamicOverviewStats = useMemo(() => {
  //   // Calculate total maximum requirements across selected frameworks only
  //   const maxRequirements = filteredMappings.reduce((total, mapping) => {
  //     const iso27001Count = mapping.frameworks?.['iso27001']?.length || 0;
  //     const iso27002Count = mapping.frameworks?.['iso27002']?.length || 0;
  //     const cisControlsCount = mapping.frameworks?.['cisControls']?.length || 0;
  //     const gdprCount = mapping.frameworks?.['gdpr']?.length || 0;
  //     const nis2Count = mapping.frameworks?.['nis2']?.length || 0;
  //     
  //     return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount + nis2Count;
  //   }, 0);
  //   
  //   // Number of unified groups based on filtered mappings
  //   const unifiedGroups = filteredMappings.length;
  //   
  //   // Calculate reduction metrics with safe fallbacks
  //   const reduction = maxRequirements - unifiedGroups;
  //   const reductionPercentage = maxRequirements > 0 ? ((reduction / maxRequirements) * 100).toFixed(1) : '0.0';
  //   const efficiencyRatio = unifiedGroups > 0 ? Math.round(maxRequirements / unifiedGroups) : 0;
  //   
  //   return {
  //     maxRequirements,
  //     unifiedGroups,
  //     reduction,
  //     reductionPercentage,
  //     efficiencyRatio
  //   };
  // }, [filteredMappings]);

  // Show enhanced AI loading state while fetching data
  if (isLoadingMappings || isLoadingCounts) {
    return <AILoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">Compliance Simplification</h1>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">How AuditReady AI unifies overlapping compliance requirements</p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full self-start lg:self-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                  <span className="text-xs text-muted-foreground ml-auto">Compatible</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToXLSX} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                  Export as Excel
                  <span className="text-xs text-muted-foreground ml-auto">Enhanced</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span>Framework Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="unified" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Zap className="w-4 h-4" />
              <span>Unified Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="overlap" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Framework Overlap</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Problem Statement */}
            <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-800/30 pb-4">
                <CardTitle className="flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-md shadow-red-500/20">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The Compliance Complexity Problem</h2>
                      <div className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">CHALLENGE</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Why traditional compliance is overwhelming organizations worldwide</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Overlapping Requirements</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Multiple frameworks often have similar requirements with different wording, creating confusion and redundancy.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Implementation Confusion</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Teams struggle to understand which requirements apply and how to avoid duplicate work across frameworks.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Settings className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Resource Inefficiency</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Organizations waste time and resources implementing the same control multiple times for different frameworks.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Solution Statement */}
            <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-blue-950/50 border-b border-green-100 dark:border-green-800/30 pb-4">
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg shadow-md shadow-green-500/20">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The AuditReady Solution</h2>
                        <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">SOLUTION</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered compliance unification that transforms complexity into clarity</p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-4"
                  >
                    <Button
                      onClick={() => setActiveTab('mapping')}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg shadow-blue-500/25 border-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Unify Frameworks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Intelligent Unification</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Our AI transforms {maximumOverviewStats.maxRequirements} scattered requirements from multiple frameworks into just {maximumOverviewStats.unifiedGroups} comprehensive requirement groups, reducing complexity by {maximumOverviewStats.reductionPercentage}%.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Complete Coverage</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Every detail from source frameworks is preserved in our unified requirements, ensuring nothing is lost.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="text-center"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-3 w-fit mx-auto">
                      <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Clear Implementation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Plain language descriptions with actionable sub-requirements make implementation straightforward and effective.
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  value: `${maximumOverviewStats.maxRequirements}→${maximumOverviewStats.unifiedGroups}`, 
                  label: "Requirements Simplified", 
                  desc: `From ${maximumOverviewStats.maxRequirements} scattered requirements to ${maximumOverviewStats.unifiedGroups} unified groups`, 
                  color: "blue",
                  bgClass: "bg-blue-50 dark:bg-blue-900/20",
                  textClass: "text-blue-600 dark:text-blue-400"
                },
                { 
                  value: `${maximumOverviewStats.reductionPercentage}%`, 
                  label: "Complexity Reduction", 
                  desc: `${maximumOverviewStats.reduction} fewer requirements to manage`, 
                  color: "green",
                  bgClass: "bg-green-50 dark:bg-green-900/20",
                  textClass: "text-green-600 dark:text-green-400"
                },
                { 
                  value: `${maximumOverviewStats.efficiencyRatio}:1`, 
                  label: "Efficiency Ratio", 
                  desc: `${maximumOverviewStats.efficiencyRatio} traditional requirements per 1 unified group`, 
                  color: "purple",
                  bgClass: "bg-purple-50 dark:bg-purple-900/20",
                  textClass: "text-purple-600 dark:text-purple-400"
                },
                { 
                  value: "100%", 
                  label: "Coverage Maintained", 
                  desc: "All original requirements preserved", 
                  color: "emerald",
                  bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
                  textClass: "text-emerald-600 dark:text-emerald-400"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="flex"
                >
                  <Card className={`text-center border border-slate-200 dark:border-slate-700 rounded-xl ${stat.bgClass} hover:shadow-md transition-all duration-200 flex-1`}>
                    <CardContent className="p-4">
                      <div className={`text-2xl font-bold ${stat.textClass} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-2">
                        {stat.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {stat.desc}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Framework Mapping Tab */}
          <TabsContent value="mapping" className="space-y-6">
            {/* Framework Selection Interface - Enhanced */}
            <div className="relative">
              {/* AI Generation Overlay */}
              <AnimatePresence>
                {showGeneration && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[10000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: isGenerating ? Infinity : 0 
                      }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      {isGenerating ? 'AI Analyzing Frameworks...' : 'Unified Requirements Generated!'}
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md"
                    >
                      {isGenerating 
                        ? 'Our AI is processing your selected frameworks and creating optimized unified requirements...'
                        : 'Your customized compliance roadmap is ready! Scroll down to see the unified requirements.'
                      }
                    </motion.p>
                    {!isGenerating && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="mt-4 flex items-center space-x-2 text-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Generation Complete</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-3 text-xl">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI-Powered Framework Unification
                    </span>
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Select your compliance frameworks and watch our AI instantly generate unified, simplified requirements tailored to your organization
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Framework Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                    
                    {/* ISO 27001 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['iso27001']
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                      }`}
                      onClick={() => handleFrameworkToggle('iso27001', !frameworksSelected['iso27001'])}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['iso27001'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['iso27001'] ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${frameworksSelected['iso27001'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27001</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Info Security Management</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                            {frameworkCounts?.iso27001 || 24} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected['iso27001'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* ISO 27002 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['iso27002']
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-green-300'
                      }`}
                      onClick={() => handleFrameworkToggle('iso27002', !frameworksSelected['iso27002'])}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['iso27002'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-green-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['iso27002'] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Lock className={`w-5 h-5 ${frameworksSelected['iso27002'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27002</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Information Security Controls</p>
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                            {frameworkCounts?.iso27002 || 93} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected['iso27002'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* CIS Controls Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['cisControls']
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                      }`}
                      onClick={(e) => {
                        // If clicking on the card background (not on IG buttons), deselect CIS Controls
                        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.space-y-1') === null) {
                          handleFrameworkToggle('cisControls', null);
                        }
                      }}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['cisControls'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-purple-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['cisControls'] ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Settings className={`w-5 h-5 ${frameworksSelected['cisControls'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">CIS Controls</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Cybersecurity Best Practices</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">
                            {(() => {
                              const igLevel = frameworksSelected['cisControls'];
                              if (!frameworkCounts || isLoadingCounts) {
                                return igLevel === 'ig1' ? 36 : igLevel === 'ig2' ? 82 : 155;
                              }
                              return igLevel === 'ig1' ? (frameworkCounts.cisIG1 || 36) : 
                                     igLevel === 'ig2' ? (frameworkCounts.cisIG2 || 82) : 
                                     (frameworkCounts.cisIG3 || 155);
                            })()} requirements
                          </p>
                        </div>
                        
                        {/* IG Level Selection */}
                        <div className="space-y-1 w-full">
                          {['ig1', 'ig2', 'ig3'].map((level) => (
                            <motion.button
                              key={level}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full p-1.5 rounded-lg text-xs font-medium transition-all ${
                                frameworksSelected['cisControls'] === level
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                              }`}
                              onClick={() => handleFrameworkToggle('cisControls', frameworksSelected['cisControls'] === level ? null : level as 'ig1' | 'ig2' | 'ig3')}
                            >
                              {level.toUpperCase()} - {level === 'ig1' ? 'Basic' : level === 'ig2' ? 'Foundational' : 'Organizational'}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      {frameworksSelected['cisControls'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* GDPR Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['gdpr']
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                      }`}
                      onClick={() => handleFrameworkToggle('gdpr', !frameworksSelected['gdpr'])}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['gdpr'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-orange-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['gdpr'] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <BookOpen className={`w-5 h-5 ${frameworksSelected['gdpr'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Data Protection Regulation</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                            {frameworkCounts?.gdpr || 25} requirements
                          </p>
                        </div>
                      </div>
                      {frameworksSelected['gdpr'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* NIS2 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                        frameworksSelected['nis2']
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                      }`}
                      onClick={(e) => {
                        // Only toggle if clicking the card background, not the dropdown
                        if (!(e.target as HTMLElement).closest('.industry-dropdown')) {
                          handleFrameworkToggle('nis2', !frameworksSelected['nis2']);
                        }
                      }}
                    >
                      {/* Selected Badge at Top */}
                      {frameworksSelected['nis2'] && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                        <div className={`p-2 rounded-full ${frameworksSelected['nis2'] ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${frameworksSelected['nis2'] ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Cybersecurity Directive</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                            {frameworkCounts?.nis2 || 17} requirements
                          </p>
                        </div>
                        
                        {/* Industry Sector Selection - Inside the card */}
                        {frameworksSelected['nis2'] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full mt-2 industry-dropdown"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700 relative z-50">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Building2 className="w-2 h-2 text-indigo-600" />
                                <span className="text-[9px] font-medium text-indigo-700 dark:text-indigo-300">Sector</span>
                                <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-indigo-300 text-indigo-600">
                                  NIS2
                                </Badge>
                              </div>
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <Select 
                                  value={selectedIndustrySector || 'none'} 
                                  onValueChange={(value) => setSelectedIndustrySector(value === 'none' ? null : value)}
                                >
                                  <SelectTrigger 
                                    className="w-full text-[9px] h-4 border-indigo-300 focus:border-indigo-500 px-1 py-0"
                                  >
                                    <SelectValue placeholder="All Industries" className="text-[9px] leading-none" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-48 overflow-y-auto z-[9999]">
                                    <SelectItem value="none" className="text-xs py-1 px-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                                        <span className="text-xs">All Industries</span>
                                      </div>
                                    </SelectItem>
                                    {isLoadingSectors ? (
                                      <SelectItem value="loading" disabled>
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 animate-pulse"></div>
                                          <span className="text-xs">Loading...</span>
                                        </div>
                                      </SelectItem>
                                    ) : (industrySectors || []).map((sector) => (
                                      <SelectItem key={sector.id} value={sector.id} className="text-xs py-1 px-2">
                                        <div className="flex items-center gap-2 w-full">
                                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            sector.nis2Essential ? 'bg-red-500' : 
                                            sector.nis2Important ? 'bg-orange-500' : 
                                            'bg-green-500'
                                          }`}></div>
                                          <span className="text-xs truncate flex-1 min-w-0">{sector.name}</span>
                                          {sector.nis2Essential && (
                                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                              Essential
                                            </Badge>
                                          )}
                                          {sector.nis2Important && !sector.nis2Essential && (
                                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                              Important
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {selectedIndustrySector && industrySectors && (
                                <div className="mt-0.5 p-0.5 bg-white dark:bg-indigo-800/50 rounded text-[7px] border border-indigo-200 dark:border-indigo-600">
                                  <p className="text-indigo-800 dark:text-indigo-200 leading-tight">
                                    {industrySectors.find(s => s.id === selectedIndustrySector)?.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {frameworksSelected['nis2'] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Quick Selection Presets */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-center">Quick Presets</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { name: 'Comprehensive Security', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig3' as const, gdpr: false, nis2: false } },
                        { name: 'Privacy Focused', frameworks: { iso27001: false, iso27002: false, cisControls: null, gdpr: true, nis2: false } },
                        { name: 'EU Compliance', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig2' as const, gdpr: true, nis2: true } },
                        { name: 'Basic Security', frameworks: { iso27001: true, iso27002: false, cisControls: 'ig1' as const, gdpr: false, nis2: false } }
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFrameworksSelected(preset.frameworks);
                          }}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <div className="border-t pt-8">
                    <div className="flex justify-center">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!frameworksSelected['iso27001'] && !frameworksSelected['iso27002'] && !frameworksSelected['cisControls'] && !frameworksSelected['gdpr'] && !frameworksSelected['nis2'])}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-xl shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-6 h-6 mr-3"
                            >
                              <Zap className="w-6 h-6" />
                            </motion.div>
                            Generating Unified Requirements...
                          </>
                        ) : (
                          <>
                            <Zap className="w-6 h-6 mr-3" />
                            Generate Unified Requirements
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
                      Select frameworks above and click to generate your unified compliance requirements
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Framework Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Framework:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
                    { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
                    { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
                    { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
                    { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> },
                    { id: 'nis2', label: 'NIS2', icon: <Shield className="w-4 h-4" /> }
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filterFramework === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterFramework(filter.id)}
                      className="flex items-center space-x-1 rounded-full"
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Category:</span>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[400px] max-w-lg">
                    <SelectValue placeholder="Select a category to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((mapping) => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Framework Connections */}
            <div className="space-y-8">
              <AnimatePresence>
                {filteredMappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">{mapping.category}</h3>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Framework Grid - Different layout for GDPR vs other frameworks */}
                        {mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948' ? (
                          /* GDPR-only layout */
                          <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-900 dark:text-orange-100">GDPR Articles</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-orange-900">
                                {(mapping.frameworks['gdpr'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="font-medium text-sm text-orange-900 dark:text-orange-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Regular layout for ISO/CIS/NIS2 frameworks - Only show selected frameworks */
                          <div className={`grid gap-0 border-b border-slate-200 dark:border-slate-700 grid-cols-1 ${
                            // Calculate grid columns based on selected frameworks
                            (() => {
                              const selectedCount = 
                                (selectedFrameworks['iso27001'] ? 1 : 0) +
                                (selectedFrameworks['iso27002'] ? 1 : 0) +
                                (selectedFrameworks['cisControls'] ? 1 : 0) +
                                (selectedFrameworks['nis2'] ? 1 : 0);
                              
                              if (selectedCount === 1) return 'lg:grid-cols-1';
                              if (selectedCount === 2) return 'sm:grid-cols-2';
                              if (selectedCount === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
                              if (selectedCount === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
                              return 'sm:grid-cols-2 lg:grid-cols-3'; // fallback
                            })()
                          }`}>
                          
                          {/* ISO 27001 Column - Only show if selected */}
                          {selectedFrameworks['iso27001'] && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">ISO 27001</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900">
                                {(mapping.frameworks?.['iso27001'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="font-medium text-sm text-blue-900 dark:text-blue-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ISO 27002 Column - Only show if selected */}
                          {selectedFrameworks['iso27002'] && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Lock className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-green-900 dark:text-green-100">ISO 27002</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900">
                                {(mapping.frameworks?.['iso27002'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                    <div className="font-medium text-sm text-green-900 dark:text-green-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CIS Controls Column - Only show if selected */}
                          {selectedFrameworks['cisControls'] && (
                            <div className="p-4 sm:p-6 border-b sm:border-b-0 border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Settings className="w-5 h-5 text-purple-600" />
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                                  CIS Controls {selectedFrameworks['cisControls'].toUpperCase()}
                                </h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
                                {(mapping.frameworks?.['cisControls'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <div className="font-medium text-sm text-purple-900 dark:text-purple-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* NIS2 Column - Only show if selected */}
                          {selectedFrameworks['nis2'] && (
                            <div className="p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">NIS2</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-indigo-900">
                                {(mapping.frameworks['nis2'] || []).map((req, i) => (
                                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                    <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        )}

                        {/* AuditReady Unified Row */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">AuditReady Unified</h4>
                                <p className="text-xs text-white/90">{mapping.auditReadyUnified.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center bg-white/20 rounded-lg px-3 py-1">
                                <span className="text-xs font-medium block">
                                  {(() => {
                                    if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
                                      // For GDPR groups, show GDPR articles count
                                      const totalGdprReqs = mapping.frameworks['gdpr']?.length || 0;
                                      const unifiedReqs = mapping.auditReadyUnified.subRequirements.length;
                                      const reductionPercent = totalGdprReqs > 1 ? Math.round((1 - unifiedReqs / totalGdprReqs) * 100) : 0;
                                      return `Unifies ${totalGdprReqs} GDPR articles - ${reductionPercent}% simpler`;
                                    } else {
                                      // For regular groups, show framework requirements from selected frameworks only
                                      const totalFrameworkReqs = 
                                        (selectedFrameworks['iso27001'] ? (mapping.frameworks?.['iso27001']?.length || 0) : 0) + 
                                        (selectedFrameworks['iso27002'] ? (mapping.frameworks?.['iso27002']?.length || 0) : 0) + 
                                        (selectedFrameworks['cisControls'] ? (mapping.frameworks?.['cisControls']?.length || 0) : 0) +
                                        (selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2']?.length || 0) : 0);
                                      const reductionPercent = totalFrameworkReqs > 1 ? Math.round((1 - 1 / totalFrameworkReqs) * 100) : 0;
                                      return totalFrameworkReqs > 0 ? `Replaces ${totalFrameworkReqs} requirements - ${reductionPercent}% reduction` : 'No requirements from selected frameworks';
                                    }
                                  })()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMapping(selectedMapping === mapping.id ? null : mapping.id)}
                                className="text-white hover:bg-white/20 whitespace-nowrap text-xs px-2 py-1 h-auto"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{selectedMapping === mapping.id ? 'Hide' : 'Show'} Sub-Requirements</span>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Detailed View */}
                        <AnimatePresence>
                          {selectedMapping === mapping.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-50 dark:bg-gray-800/50"
                            >
                              <div className="p-4 sm:p-6">
                                <h5 className="font-semibold mb-4 text-gray-900 dark:text-white">Unified Sub-Requirements</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapping.auditReadyUnified.subRequirements.map((subReq, i) => (
                                  <div key={i} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{cleanComplianceSubRequirement(subReq)}</span>
                                  </div>
                                ))}
                              </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Unified Requirements Tab */}
          <TabsContent value="unified" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AuditReady Unified Requirements</h2>
                    <p className="text-sm text-white/80 font-normal">Simplified, comprehensive compliance requirements</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Framework Unification Introduction */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-blue-600" />
                      Framework Integration Overview
                    </h3>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Generated Requirements</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {filteredUnifiedMappings.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">unified groups</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    The following unified requirements have been generated by consolidating controls from your selected compliance frameworks{selectedFrameworks['nis2'] && selectedIndustrySector ? ' with sector-specific enhancements for ' + (industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'selected sector') : ''}:
                  </p>
                  {selectedFrameworks['nis2'] && selectedIndustrySector && SectorSpecificEnhancer.hasSectorEnhancements(selectedIndustrySector) && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center space-x-2">
                        <Factory className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Sector-Specific Enhancements Active
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        {SectorSpecificEnhancer.getEnhancementSummary(selectedIndustrySector)} for {industrySectors?.find(s => s.id === selectedIndustrySector)?.name}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedFrameworks['iso27001'] && (
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        ISO 27001
                      </Badge>
                    )}
                    {selectedFrameworks['iso27002'] && (
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        <Lock className="w-3 h-3 mr-1" />
                        ISO 27002
                      </Badge>
                    )}
                    {selectedFrameworks['cisControls'] && (
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Settings className="w-3 h-3 mr-1" />
                        CIS Controls {selectedFrameworks['cisControls'].toUpperCase()}
                      </Badge>
                    )}
                    {selectedFrameworks['gdpr'] && (
                      <Badge className="bg-orange-500 text-white px-3 py-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        GDPR
                      </Badge>
                    )}
                    {selectedFrameworks['nis2'] && (
                      <Badge className="bg-indigo-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        NIS2
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Each unified requirement below eliminates duplicate controls and combines overlapping requirements into streamlined, actionable guidelines.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{filteredUnifiedMappings.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Total Groups</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {filteredUnifiedMappings.reduce((total, group) => {
                          const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                            group.auditReadyUnified.subRequirements || [],
                            group.category,
                            selectedIndustrySector,
                            selectedFrameworks['nis2']
                          );
                          return total + enhancedSubReqs.length;
                        }, 0)}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Total Sub-requirements{selectedFrameworks['nis2'] && selectedIndustrySector ? ' (Enhanced)' : ''}</div>
                    </div>
                  </div>
                </div>
                
                {/* Category Filter Dropdown */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Filter Categories:</span>
                  </div>
                  <Select 
                    value={unifiedCategoryFilter}
                    onValueChange={(value) => {
                      setUnifiedCategoryFilter(value);
                    }}
                  >
                    <SelectTrigger className="w-full max-w-lg mt-2">
                      <SelectValue placeholder="Filter requirement categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {filteredUnifiedMappings.map((mapping) => (
                        <SelectItem key={mapping.id} value={mapping.id}>
                          {mapping.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-6">
                  {filteredUnifiedMappings.filter(mapping => 
                    unifiedCategoryFilter === 'all' || mapping.id === unifiedCategoryFilter
                  ).map((mapping, index) => (
                    <motion.div
                      key={mapping.id}
                      id={`unified-${mapping.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {mapping.category.replace(/^\d+\. /, '')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {cleanMarkdownFormatting(mapping.auditReadyUnified.description)}
                          </p>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {mapping.category}
                          </Badge>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mb-2 text-xs px-3 py-1 text-emerald-700 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-emerald-900/20"
                            onClick={() => {
                              setSelectedGuidanceCategory(mapping.category);
                              setShowUnifiedGuidance(true);
                            }}
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Unified Guidance
                          </Button>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Replaces</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(mapping.frameworks?.['iso27001']?.length || 0) + (mapping.frameworks?.['iso27002']?.length || 0) + (mapping.frameworks?.['cisControls']?.length || 0) + (mapping.frameworks?.['gdpr']?.length || 0)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">requirements</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(() => {
                              const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                                mapping.auditReadyUnified.subRequirements || [],
                                mapping.category,
                                selectedIndustrySector,
                                selectedFrameworks['nis2']
                              );
                              return enhancedSubReqs.length;
                            })()} sub-requirements{selectedFrameworks['nis2'] && selectedIndustrySector && SectorSpecificEnhancer.hasSectorEnhancements(selectedIndustrySector) ? ' (enhanced)' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Implementation Guidelines:</h4>
                        <div className="space-y-4">
                          {(() => {
                            // Apply sector-specific enhancements if NIS2 and sector are selected
                            const enhancedSubReqs = SectorSpecificEnhancer.enhanceSubRequirements(
                              mapping.auditReadyUnified.subRequirements || [],
                              mapping.category,
                              selectedIndustrySector,
                              selectedFrameworks['nis2']
                            );
                            
                            // Group enhanced sub-requirements for better organization
                            let groupedSubReqs: Record<string, string[]> = {};
                            
                            // Special grouping for Governance & Leadership category - use CorrectedGovernanceService
                            if (mapping.category.includes('Governance') || mapping.category.includes('Leadership')) {
                              // Check if this category should use corrected governance structure
                              if (CorrectedGovernanceService.isGovernanceCategory(mapping.category)) {
                                const correctedStructure = CorrectedGovernanceService.getCorrectedStructure();
                                groupedSubReqs = correctedStructure.sections;
                              } else {
                                // Fallback to original logic if needed
                                const leadership: string[] = [];
                                const hr: string[] = [];
                                const monitoring: string[] = [];
                                
                                enhancedSubReqs.forEach(req => {
                                  const lowerReq = req.toLowerCase();
                                  
                                  if (lowerReq.includes('competence management') || lowerReq.includes('personnel security framework')) {
                                    hr.push(req);
                                  }
                                  else if (lowerReq.includes('relationships') || lowerReq.includes('third party governance') || 
                                          lowerReq.includes('incident response governance') || lowerReq.includes('continuous improvement') ||
                                          lowerReq.includes('monitoring & reporting') || lowerReq.includes('change management & control')) {
                                    monitoring.push(req);
                                  }
                                  else {
                                    leadership.push(req);
                                  }
                                });
                                
                                groupedSubReqs = {
                                  'Leadership': leadership,
                                  'HR': hr,
                                  'Monitoring & Compliance': monitoring
                                };
                              }
                            } else {
                              // Default grouping for other categories
                              groupedSubReqs = {
                                'Core Requirements': enhancedSubReqs.filter((_, i) => i < Math.ceil(enhancedSubReqs.length / 3)),
                                'Implementation Standards': enhancedSubReqs.filter((_, i) => i >= Math.ceil(enhancedSubReqs.length / 3) && i < Math.ceil(enhancedSubReqs.length * 2 / 3)),
                                'Monitoring & Compliance': enhancedSubReqs.filter((_, i) => i >= Math.ceil(enhancedSubReqs.length * 2 / 3))
                              };
                            }
                            
                            return Object.entries(groupedSubReqs).map(([groupName, requirements]) => (
                              requirements.length > 0 && (
                                <div key={groupName} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                  <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    {groupName}
                                  </h5>
                                  <div className="space-y-2">
                                    {(requirements as string[]).map((subReq: string, i: number) => (
                                      <div key={i} className="flex items-start space-x-2 text-sm">
                                        <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{subReq}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            ));
                          })()}
                        </div>
                        
                        {/* Industry-Specific Requirements Section */}
                        {selectedIndustrySector && mapping.industrySpecific && mapping.industrySpecific.length > 0 && (
                          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-3 flex items-center">
                              <Factory className="w-4 h-4 mr-2" />
                              Industry-Specific Requirements
                              <Badge variant="outline" className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                {industrySectors?.find(s => s.id === selectedIndustrySector)?.name}
                              </Badge>
                            </h5>
                            <div className="space-y-3">
                              {mapping.industrySpecific.map((req, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-green-200/50 dark:border-green-700/50">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        {req.code}
                                      </span>
                                      <Badge variant={
                                        req.relevanceLevel === 'critical' ? 'destructive' :
                                        req.relevanceLevel === 'high' ? 'default' :
                                        req.relevanceLevel === 'standard' ? 'secondary' :
                                        'outline'
                                      } className="text-xs">
                                        {req.relevanceLevel}
                                      </Badge>
                                    </div>
                                  </div>
                                  <h6 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">
                                    {req.title}
                                  </h6>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {req.description.split('•').filter(item => item.trim()).map((item, j) => (
                                      <div key={j} className="flex items-start space-x-2 mb-1">
                                        <ArrowRight className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                        <span>{item.trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Framework Overlap Tab */}
          <TabsContent value="overlap" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Framework Overlap Analysis</h2>
                    <p className="text-sm text-white/80 font-normal">Visual representation of how your selected frameworks overlap</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Check if any frameworks are selected */}
                {(selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['gdpr'] || selectedFrameworks['nis2']) ? (
                  <>
                {/* Overlap Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Object.values(selectedFrameworks).filter(v => v).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Frameworks Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {filteredMappings.reduce((total, mapping) => {
                        const frameworkCount = Object.entries(mapping.frameworks).filter(([key, value]) => {
                          if (key === 'gdpr' || key === 'nis2') return value && value.length > 0;
                          if (key === 'cisControls') return value.length > 0;
                          return value.length > 0;
                        }).length;
                        return total + (frameworkCount > 1 ? 1 : 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Groups with Overlap</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(() => {
                        const overlapRate = filteredMappings.reduce((total, mapping) => {
                          const activeFrameworks = Object.entries(mapping.frameworks).filter(([key, value]) => {
                            if (key === 'gdpr' || key === 'nis2') return value && value.length > 0;
                            if (key === 'cisControls') return value.length > 0;
                            return value.length > 0;
                          });
                          const maxReqs = activeFrameworks.length > 0 ? Math.max(...activeFrameworks.map(([_, reqs]) => reqs.length)) : 0;
                          const totalReqs = activeFrameworks.reduce((sum, [_, reqs]) => sum + reqs.length, 0);
                          return total + (totalReqs > 0 ? ((totalReqs - maxReqs) / totalReqs) * 100 : 0);
                        }, 0);
                        return Math.round(overlapRate / Math.max(filteredMappings.length, 1));
                      })()}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Overlap Rate</div>
                  </div>
                </div>
                
                {/* Framework Coverage Visualization */}
                <PentagonVisualization 
                  selectedFrameworks={{
                    iso27001: selectedFrameworks['iso27001'],
                    iso27002: selectedFrameworks['iso27002'],
                    cisControls: Boolean(selectedFrameworks['cisControls']),
                    gdpr: selectedFrameworks['gdpr'],
                    nis2: selectedFrameworks['nis2']
                  }}
                  mappingData={filteredMappings}
                />
                
                
                {/* Framework Legend */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Frameworks</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedFrameworks['iso27001'] && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">ISO 27001</span>
                      </div>
                    )}
                    {selectedFrameworks['iso27002'] && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">ISO 27002</span>
                      </div>
                    )}
                    {selectedFrameworks['cisControls'] && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="text-sm">CIS Controls ({selectedFrameworks['cisControls'].toUpperCase()})</span>
                      </div>
                    )}
                    {selectedFrameworks['gdpr'] && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm">GDPR</span>
                      </div>
                    )}
                    {selectedFrameworks['nis2'] && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                        <span className="text-sm">NIS2</span>
                      </div>
                    )}
                  </div>
                </div>
                </>
                ) : (
                  /* No frameworks selected state */
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Eye className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Frameworks Selected
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Select frameworks in the "Framework Mapping" tab and click "Generate Unified Requirements" to see overlap analysis and efficiency insights.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>ISO 27001/27002</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-purple-500" />
                          <span>CIS Controls</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-orange-500" />
                          <span>GDPR</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-indigo-500" />
                          <span>NIS2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Unified Guidance Modal */}
      <Dialog open={showUnifiedGuidance} onOpenChange={setShowUnifiedGuidance}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-gray-900 dark:text-white">
                  {selectedGuidanceCategory.replace(/^\d+\. /, '')}
                </span>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Implementation Guidance
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Framework-specific guidance and best practices tailored to your selected compliance standards
            </DialogDescription>
          </DialogHeader>
          <div className="prose dark:prose-invert max-w-none pt-6">
            {getGuidanceContent(selectedGuidanceCategory).split('\n').map((line, index) => {
              // Remove any remaining asterisks from content
              const cleanLine = line.replace(/\*/g, '');
              
              if (cleanLine.trim() === '') return <div key={index} className="h-2" />;
              
              // Framework References section with special styling
              if (cleanLine.includes('Framework References for Selected Standards:')) {
                return (
                  <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
                    <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      📋 Framework References for Selected Standards
                    </h4>
                  </div>
                );
              }
              
              // Framework-specific references
              if (cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls|GDPR|NIS2):/)) {
                return (
                  <div key={index} className="ml-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {cleanLine}
                    </p>
                  </div>
                );
              }
              
              if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
                return (
                  <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {cleanLine.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              
              if (cleanLine.startsWith('✅')) {
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg mb-3">
                    <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                    <p className="text-sm text-green-800 dark:text-green-200">{cleanLine.replace('✅ ', '')}</p>
                  </div>
                );
              }
              
              if (cleanLine.startsWith('❌')) {
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg mb-3">
                    <span className="text-red-600 dark:text-red-400 text-lg">❌</span>
                    <p className="text-sm text-red-800 dark:text-red-200">{cleanLine.replace('❌ ', '')}</p>
                  </div>
                );
              }
              
              if (cleanLine.match(/^\d+\./)) {
                return (
                  <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-3 border-l-4 border-indigo-400">
                    <p className="font-medium text-indigo-800 dark:text-indigo-200">{cleanLine}</p>
                  </div>
                );
              }
              
              return (
                <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                  {cleanLine}
                </p>
              );
            })}
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowUnifiedGuidance(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}