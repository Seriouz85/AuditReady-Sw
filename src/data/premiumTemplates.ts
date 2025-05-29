/**
 * Premium Mermaid Template Library
 * Professional templates for security, compliance, and business processes
 */

export interface PremiumTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'business' | 'technical' | 'project';
  complexity: 'simple' | 'medium' | 'complex';
  isPremium: boolean;
  thumbnail: string;
  tags: string[];
  mermaidCode: string;
  usageCount?: number;
  rating?: number;
}

export const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  // Security Templates
  {
    id: 'iso27001-isms',
    name: 'ISO 27001 ISMS Implementation',
    description: 'Complete Information Security Management System implementation flow',
    category: 'security',
    complexity: 'complex',
    isPremium: true,
    thumbnail: '🛡️',
    tags: ['ISO 27001', 'ISMS', 'Security Management', 'Compliance'],
    usageCount: 1250,
    rating: 4.8,
    mermaidCode: `flowchart TD
    A[Leadership Commitment] --> B[Scope Definition]
    B --> C[Risk Assessment]
    C --> D[Risk Treatment Plan]
    D --> E[Statement of Applicability]
    E --> F[ISMS Implementation]
    F --> G[Internal Audit]
    G --> H[Management Review]
    H --> I{Continual Improvement}
    I -->|Issues Found| C
    I -->|Satisfactory| J[Certification Audit]
    J --> K[ISO 27001 Certificate]

    subgraph "Plan Phase"
        A
        B
        C
        D
        E
    end

    subgraph "Do Phase"
        F
    end

    subgraph "Check Phase"
        G
        H
    end

    subgraph "Act Phase"
        I
    end

    style A fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style K fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style I fill:#fff3e0,stroke:#f57c00,stroke-width:2px`
  },

  {
    id: 'nist-cybersecurity-framework',
    name: 'NIST Cybersecurity Framework',
    description: 'Complete NIST CSF implementation with all five functions',
    category: 'security',
    complexity: 'complex',
    isPremium: true,
    thumbnail: '🔒',
    tags: ['NIST', 'Cybersecurity', 'Framework', 'Risk Management'],
    usageCount: 980,
    rating: 4.9,
    mermaidCode: `flowchart LR
    subgraph "IDENTIFY"
        ID1[Asset Management]
        ID2[Business Environment]
        ID3[Governance]
        ID4[Risk Assessment]
        ID5[Risk Management Strategy]
        ID6[Supply Chain Risk Management]
    end

    subgraph "PROTECT"
        PR1[Identity Management]
        PR2[Awareness & Training]
        PR3[Data Security]
        PR4[Information Protection]
        PR5[Maintenance]
        PR6[Protective Technology]
    end

    subgraph "DETECT"
        DE1[Anomalies & Events]
        DE2[Security Monitoring]
        DE3[Detection Processes]
    end

    subgraph "RESPOND"
        RS1[Response Planning]
        RS2[Communications]
        RS3[Analysis]
        RS4[Mitigation]
        RS5[Improvements]
    end

    subgraph "RECOVER"
        RC1[Recovery Planning]
        RC2[Improvements]
        RC3[Communications]
    end

    IDENTIFY --> PROTECT
    PROTECT --> DETECT
    DETECT --> RESPOND
    RESPOND --> RECOVER
    RECOVER --> IDENTIFY

    style IDENTIFY fill:#e3f2fd
    style PROTECT fill:#e8f5e8
    style DETECT fill:#fff3e0
    style RESPOND fill:#fce4ec
    style RECOVER fill:#f3e5f5`
  },

  {
    id: 'incident-response-playbook',
    name: 'Incident Response Playbook',
    description: 'Comprehensive incident response workflow with escalation paths',
    category: 'security',
    complexity: 'medium',
    isPremium: true,
    thumbnail: '🚨',
    tags: ['Incident Response', 'Security Operations', 'Playbook', 'CSIRT'],
    usageCount: 1450,
    rating: 4.7,
    mermaidCode: `flowchart TD
    A[Incident Detected] --> B{Severity Assessment}
    B -->|Low| C[Standard Response]
    B -->|Medium| D[Escalated Response]
    B -->|High| E[Emergency Response]
    B -->|Critical| F[Crisis Management]

    C --> G[Document & Analyze]
    D --> H[Team Assembly]
    E --> I[Executive Notification]
    F --> J[Crisis Team Activation]

    H --> K[Investigation]
    I --> K
    J --> K

    K --> L[Containment]
    L --> M[Eradication]
    M --> N[Recovery]
    N --> O[Post-Incident Review]
    O --> P[Lessons Learned]

    G --> Q[Close Incident]
    P --> Q

    style A fill:#ffebee,stroke:#c62828,stroke-width:2px
    style F fill:#d32f2f,stroke:#b71c1c,stroke-width:3px,color:#fff
    style Q fill:#e8f5e8,stroke:#388e3c,stroke-width:2px`
  },

  // Compliance Templates
  {
    id: 'sox-compliance-audit',
    name: 'SOX Compliance Audit Process',
    description: 'Sarbanes-Oxley compliance audit workflow for financial controls',
    category: 'compliance',
    complexity: 'complex',
    isPremium: true,
    thumbnail: '📊',
    tags: ['SOX', 'Financial Controls', 'Audit', 'Compliance'],
    usageCount: 750,
    rating: 4.6,
    mermaidCode: `flowchart TD
    A[SOX Compliance Planning] --> B[Scoping & Risk Assessment]
    B --> C[Control Documentation]
    C --> D[Control Testing Design]
    D --> E[Walkthrough Testing]
    E --> F{Control Effectiveness}
    F -->|Effective| G[Operating Effectiveness Testing]
    F -->|Deficient| H[Remediation Required]
    H --> I[Control Redesign]
    I --> E
    G --> J{Testing Results}
    J -->|Pass| K[Management Certification]
    J -->|Fail| L[Deficiency Reporting]
    L --> M[Management Response]
    M --> N[Remediation Plan]
    N --> O[Retesting]
    O --> J
    K --> P[External Auditor Review]
    P --> Q[SOX Certification]

    style A fill:#e1f5fe
    style Q fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    style L fill:#fff3e0,stroke:#f57c00,stroke-width:2px`
  },

  // Business Process Templates
  {
    id: 'vendor-risk-assessment',
    name: 'Vendor Risk Assessment Process',
    description: 'Complete third-party vendor risk evaluation and management',
    category: 'business',
    complexity: 'medium',
    isPremium: true,
    thumbnail: '🤝',
    tags: ['Vendor Management', 'Risk Assessment', 'Third Party', 'Due Diligence'],
    usageCount: 890,
    rating: 4.5,
    mermaidCode: `flowchart TD
    A[Vendor Identification] --> B[Initial Screening]
    B --> C{Risk Category}
    C -->|Low Risk| D[Basic Assessment]
    C -->|Medium Risk| E[Standard Assessment]
    C -->|High Risk| F[Enhanced Assessment]

    D --> G[Contract Review]
    E --> H[Security Questionnaire]
    F --> I[On-site Assessment]

    H --> J[Financial Review]
    I --> K[Technical Evaluation]

    G --> L{Approval Decision}
    J --> L
    K --> L

    L -->|Approved| M[Contract Execution]
    L -->|Conditional| N[Remediation Plan]
    L -->|Rejected| O[Vendor Rejection]

    N --> P[Remediation Tracking]
    P --> Q{Remediation Complete}
    Q -->|Yes| M
    Q -->|No| R[Extended Timeline]
    R --> P

    M --> S[Ongoing Monitoring]
    S --> T[Annual Review]
    T --> U{Continue Relationship}
    U -->|Yes| S
    U -->|No| V[Contract Termination]

    style A fill:#e3f2fd
    style M fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    style O fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    style V fill:#fff3e0,stroke:#f57c00,stroke-width:2px`
  },

  // Project Management Templates
  {
    id: 'agile-security-integration',
    name: 'Agile Security Integration',
    description: 'DevSecOps workflow integrating security into agile development',
    category: 'project',
    complexity: 'medium',
    isPremium: true,
    thumbnail: '⚡',
    tags: ['DevSecOps', 'Agile', 'Security', 'SDLC'],
    usageCount: 1100,
    rating: 4.8,
    mermaidCode: `flowchart LR
    subgraph "Sprint Planning"
        A[Security Requirements]
        B[Threat Modeling]
        C[Security Stories]
    end

    subgraph "Development"
        D[Secure Coding]
        E[Code Review]
        F[SAST Scanning]
    end

    subgraph "Testing"
        G[Security Testing]
        H[DAST Scanning]
        I[Penetration Testing]
    end

    subgraph "Deployment"
        J[Security Validation]
        K[Production Deployment]
        L[Runtime Monitoring]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M[Sprint Review]
    M --> N[Security Retrospective]
    N --> A

    style A fill:#e3f2fd
    style F fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#ffebee
    style L fill:#e8f5e8`
  },

  // Technical Templates
  {
    id: 'zero-trust-architecture',
    name: 'Zero Trust Architecture',
    description: 'Complete zero trust security model implementation',
    category: 'technical',
    complexity: 'complex',
    isPremium: true,
    thumbnail: '🔐',
    tags: ['Zero Trust', 'Architecture', 'Security Model', 'Network Security'],
    usageCount: 650,
    rating: 4.9,
    mermaidCode: `flowchart TD
    subgraph "Identity & Access"
        A[Multi-Factor Authentication]
        B[Identity Verification]
        C[Privileged Access Management]
    end

    subgraph "Device Security"
        D[Device Registration]
        E[Device Compliance]
        F[Device Monitoring]
    end

    subgraph "Network Security"
        G[Micro-segmentation]
        H[Software-Defined Perimeter]
        I[Network Monitoring]
    end

    subgraph "Data Protection"
        J[Data Classification]
        K[Data Encryption]
        L[Data Loss Prevention]
    end

    subgraph "Application Security"
        M[Application Authentication]
        N[API Security]
        O[Runtime Protection]
    end

    subgraph "Analytics & Monitoring"
        P[Behavioral Analytics]
        Q[Threat Detection]
        R[Incident Response]
    end

    A --> G
    B --> H
    C --> I
    D --> J
    E --> K
    F --> L
    G --> M
    H --> N
    I --> O
    J --> P
    K --> Q
    L --> R

    style A fill:#e3f2fd
    style G fill:#e8f5e8
    style J fill:#fff3e0
    style M fill:#f3e5f5
    style P fill:#fce4ec`
  },

  // Special Templates
  {
    id: 'infinity-loop-process',
    name: 'Infinity Loop Process Flow',
    description: 'Continuous improvement process with interconnected phases and text annotations',
    category: 'business',
    complexity: 'medium',
    isPremium: true,
    thumbnail: '∞',
    tags: ['Continuous Improvement', 'Process Loop', 'Infinity', 'Cycle'],
    usageCount: 420,
    rating: 4.7,
    mermaidCode: `flowchart TD
    subgraph "Continuous Improvement Loop"
        A[("1<br/>🔒<br/>Security<br/>Assessment")]
        B[("2<br/>📊<br/>Risk<br/>Analysis")]
        C[("3<br/>🛡️<br/>Implementation<br/>Planning")]
        D[("4<br/>⚙️<br/>Process<br/>Execution")]
        E[("5<br/>📋<br/>Monitoring<br/>& Review")]
        F[("6<br/>🎯<br/>Optimization<br/>& Feedback")]

        A --> B
        B --> C
        C --> D
        D --> E
        E --> F
        F --> A
    end

    %% Text annotations around the loop
    TA["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TB["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TC["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TD["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TE["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TF["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]

    %% Styling for infinity loop appearance
    style A fill:#3b82f6,stroke:#fff,stroke-width:3px,color:#fff
    style B fill:#8b5cf6,stroke:#fff,stroke-width:3px,color:#fff
    style C fill:#06b6d4,stroke:#fff,stroke-width:3px,color:#fff
    style D fill:#8b5cf6,stroke:#fff,stroke-width:3px,color:#fff
    style E fill:#d946ef,stroke:#fff,stroke-width:3px,color:#fff
    style F fill:#3b82f6,stroke:#fff,stroke-width:3px,color:#fff

    %% Text box styling
    style TA fill:transparent,stroke:none,color:#1e293b
    style TB fill:transparent,stroke:none,color:#1e293b
    style TC fill:transparent,stroke:none,color:#1e293b
    style TD fill:transparent,stroke:none,color:#1e293b
    style TE fill:transparent,stroke:none,color:#1e293b
    style TF fill:transparent,stroke:none,color:#1e293b`
  }
];

export const getTemplatesByCategory = (category: string): PremiumTemplate[] => {
  return PREMIUM_TEMPLATES.filter(template => template.category === category);
};

export const getPopularTemplates = (limit: number = 5): PremiumTemplate[] => {
  return PREMIUM_TEMPLATES
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
};

export const searchTemplates = (query: string): PremiumTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return PREMIUM_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
