import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function populateISO27001() {
  console.log('Populating ISO 27001 requirements...');
  
  // First, delete existing ISO 27001 requirements
  const { error: deleteError } = await supabase
    .from('requirements_library')
    .delete()
    .eq('standard_id', '55742f4e-769b-4efe-912c-1371de5e1cd6');
    
  if (deleteError) {
    console.error('Error deleting existing ISO 27001:', deleteError);
    return;
  }

  // ISO 27001 requirements data with correct column names
  const iso27001Requirements = [
    // Section 4: Context of the organization
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '4.1',
      section: '4',
      title: 'Understanding the organization and its context',
      description: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.',
      official_description: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.',
      implementation_guidance: 'Identify and document all relevant internal and external factors that impact information security.',
      audit_ready_guidance: '**Purpose**: Understand internal and external factors affecting the ISMS.\n**Implementation**:\n• Conduct environmental scanning for external factors\n• Analyze internal capabilities and constraints\n• Document relevant issues and their impact\n• Review context at planned intervals',
      priority: 'high',
      tags: ['governance', 'context', 'planning'],
      category: 'Context of Organization',
      order_index: 1
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '4.2',
      section: '4',
      title: 'Understanding the needs and expectations of interested parties',
      description: 'The organization shall determine: a) the interested parties that are relevant to the information security management system; b) the relevant requirements of these interested parties; c) which of these requirements will be addressed through the information security management system.',
      official_description: 'The organization shall determine: a) the interested parties that are relevant to the information security management system; b) the relevant requirements of these interested parties; c) which of these requirements will be addressed through the information security management system.',
      implementation_guidance: 'Identify stakeholders and their security requirements.',
      audit_ready_guidance: '**Purpose**: Identify and understand stakeholder requirements for information security.\n**Implementation**:\n• Identify all relevant interested parties\n• Document their security requirements\n• Determine which requirements to address\n• Maintain stakeholder communication',
      priority: 'high',
      tags: ['governance', 'stakeholders', 'requirements'],
      category: 'Context of Organization',
      order_index: 2
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '4.3',
      section: '4',
      title: 'Determining the scope of the information security management system',
      description: 'The organization shall determine the boundaries and applicability of the information security management system to establish its scope.',
      official_description: 'The organization shall determine the boundaries and applicability of the information security management system to establish its scope.',
      implementation_guidance: 'Define which parts of the organization are covered by the ISMS.',
      audit_ready_guidance: '**Purpose**: Define clear boundaries and applicability of the ISMS.\n**Implementation**:\n• Define physical and logical boundaries\n• Consider internal and external issues\n• Document interfaces and dependencies\n• Make scope available as documented information',
      priority: 'high',
      tags: ['governance', 'scope', 'documentation'],
      category: 'Context of Organization',
      order_index: 3
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '4.4',
      section: '4',
      title: 'Information security management system',
      description: 'The organization shall establish, implement, maintain and continually improve an information security management system.',
      official_description: 'The organization shall establish, implement, maintain and continually improve an information security management system.',
      implementation_guidance: 'Implement a systematic approach to managing information security.',
      audit_ready_guidance: '**Purpose**: Establish and maintain the ISMS according to ISO 27001 requirements.\n**Implementation**:\n• Establish ISMS processes and interactions\n• Implement according to standard requirements\n• Maintain and continually improve\n• Document process interactions',
      priority: 'high',
      tags: ['governance', 'isms', 'processes'],
      category: 'Context of Organization',
      order_index: 4
    },
    // Section 5: Leadership
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '5.1',
      section: '5',
      title: 'Leadership and commitment',
      description: 'Top management shall demonstrate leadership and commitment with respect to the information security management system.',
      official_description: 'Top management shall demonstrate leadership and commitment with respect to the information security management system.',
      implementation_guidance: 'Ensure top management demonstrates leadership and commitment to the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure top management actively leads and supports the ISMS.\n**Implementation**:\n• Establish security policy and objectives\n• Integrate ISMS into business processes\n• Provide adequate resources\n• Communicate importance of security\n• Monitor ISMS effectiveness',
      priority: 'high',
      tags: ['governance', 'leadership', 'management'],
      category: 'Leadership',
      order_index: 5
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '5.2',
      section: '5',
      title: 'Policy',
      description: 'Top management shall establish an information security policy.',
      official_description: 'Top management shall establish an information security policy.',
      implementation_guidance: 'Establish and maintain an information security policy.',
      audit_ready_guidance: '**Purpose**: Establish appropriate information security policy with management commitment.\n**Implementation**:\n• Develop policy appropriate to organization\n• Include security objectives framework\n• Commit to requirements and improvement\n• Communicate policy throughout organization',
      priority: 'high',
      tags: ['governance', 'policy', 'documentation'],
      category: 'Leadership',
      order_index: 6
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '5.3',
      section: '5',
      title: 'Organizational roles, responsibilities and authorities',
      description: 'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated.',
      official_description: 'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated.',
      implementation_guidance: 'Define and communicate information security roles and responsibilities.',
      audit_ready_guidance: '**Purpose**: Assign and communicate security roles, responsibilities and authorities.\n**Implementation**:\n• Define security roles and responsibilities\n• Assign authorities for ISMS conformance\n• Establish reporting lines to management\n• Communicate roles throughout organization',
      priority: 'high',
      tags: ['governance', 'roles', 'responsibilities'],
      category: 'Leadership',
      order_index: 7
    },
    // Section 6: Planning
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '6.1.1',
      section: '6',
      title: 'General (Actions to address risks and opportunities)',
      description: 'When planning for the information security management system, the organization shall consider the issues referred to in 4.1 and requirements in 4.2.',
      official_description: 'When planning for the information security management system, the organization shall consider the issues referred to in 4.1 and requirements in 4.2.',
      implementation_guidance: 'Plan the ISMS considering context and requirements to address risks and opportunities.',
      audit_ready_guidance: '**Purpose**: Identify risks and opportunities when planning the ISMS.\n**Implementation**:\n• Consider context and requirements\n• Identify relevant risks and opportunities\n• Plan actions to address them\n• Integrate into ISMS processes',
      priority: 'high',
      tags: ['planning', 'risk', 'opportunities'],
      category: 'Planning',
      order_index: 8
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '6.1.2',
      section: '6',
      title: 'Information security risk assessment',
      description: 'The organization shall define and apply an information security risk assessment process.',
      official_description: 'The organization shall define and apply an information security risk assessment process.',
      implementation_guidance: 'Define and implement a risk assessment process.',
      audit_ready_guidance: '**Purpose**: Establish systematic process for assessing information security risks.\n**Implementation**:\n• Define risk assessment criteria\n• Identify information security risks\n• Analyze risk likelihood and impact\n• Evaluate risks against criteria\n• Document assessment process',
      priority: 'high',
      tags: ['risk-management', 'assessment', 'analysis'],
      category: 'Planning',
      order_index: 9
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '6.1.3',
      section: '6',
      title: 'Information security risk treatment',
      description: 'The organization shall define and apply an information security risk treatment process.',
      official_description: 'The organization shall define and apply an information security risk treatment process.',
      implementation_guidance: 'Define and implement a risk treatment process.',
      audit_ready_guidance: '**Purpose**: Establish process for treating identified information security risks.\n**Implementation**:\n• Select risk treatment options\n• Determine necessary controls\n• Create Statement of Applicability\n• Develop risk treatment plan\n• Obtain risk owner approval',
      priority: 'high',
      tags: ['risk-management', 'treatment', 'controls'],
      category: 'Planning',
      order_index: 10
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '6.2',
      section: '6',
      title: 'Information security objectives and planning to achieve them',
      description: 'The organization shall establish information security objectives at relevant functions and levels.',
      official_description: 'The organization shall establish information security objectives at relevant functions and levels.',
      implementation_guidance: 'Establish measurable security objectives and plans to achieve them.',
      audit_ready_guidance: '**Purpose**: Set measurable information security objectives with clear plans.\n**Implementation**:\n• Establish objectives aligned with policy\n• Ensure objectives are measurable\n• Plan actions, resources, and timelines\n• Assign responsibilities\n• Define evaluation criteria',
      priority: 'high',
      tags: ['planning', 'objectives', 'measurement'],
      category: 'Planning',
      order_index: 11
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '6.3',
      section: '6',
      title: 'Planning of changes',
      description: 'When the organization determines the need for changes to the information security management system, the changes shall be carried out in a planned manner.',
      official_description: 'When the organization determines the need for changes to the information security management system, the changes shall be carried out in a planned manner.',
      implementation_guidance: 'Plan and control changes to the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure changes to ISMS are planned and controlled.\n**Implementation**:\n• Identify need for ISMS changes\n• Plan change implementation\n• Consider risks of changes\n• Control change execution\n• Review change effectiveness',
      priority: 'medium',
      tags: ['planning', 'change-management', 'control'],
      category: 'Planning',
      order_index: 12
    },
    // Section 7: Support
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '7.1',
      section: '7',
      title: 'Resources',
      description: 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the information security management system.',
      official_description: 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the information security management system.',
      implementation_guidance: 'Provide adequate resources for the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure adequate resources for ISMS implementation and improvement.\n**Implementation**:\n• Identify resource requirements\n• Provide necessary resources\n• Consider human and technical resources\n• Allocate budget appropriately\n• Monitor resource adequacy',
      priority: 'high',
      tags: ['support', 'resources', 'management'],
      category: 'Support',
      order_index: 13
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '7.2',
      section: '7',
      title: 'Competence',
      description: 'The organization shall determine necessary competence and ensure persons are competent.',
      official_description: 'The organization shall determine necessary competence and ensure persons are competent.',
      implementation_guidance: 'Ensure personnel have necessary security competence.',
      audit_ready_guidance: '**Purpose**: Ensure personnel are competent for their security responsibilities.\n**Implementation**:\n• Define competence requirements\n• Assess current competencies\n• Provide training where needed\n• Maintain competence records\n• Evaluate training effectiveness',
      priority: 'high',
      tags: ['support', 'competence', 'training'],
      category: 'Support',
      order_index: 14
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '7.3',
      section: '7',
      title: 'Awareness',
      description: 'Persons doing work under the organization\'s control shall be aware of the information security policy.',
      official_description: 'Persons doing work under the organization\'s control shall be aware of the information security policy.',
      implementation_guidance: 'Ensure personnel are aware of security policies and their responsibilities.',
      audit_ready_guidance: '**Purpose**: Create security awareness among all personnel.\n**Implementation**:\n• Communicate security policy\n• Explain individual contributions\n• Clarify consequences of non-compliance\n• Conduct regular awareness sessions\n• Measure awareness effectiveness',
      priority: 'high',
      tags: ['support', 'awareness', 'training'],
      category: 'Support',
      order_index: 15
    },
    // Continue with remaining sections...
    // Section 8: Operation
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '8.1',
      section: '8',
      title: 'Operational planning and control',
      description: 'The organization shall plan, implement and control the processes needed to meet requirements.',
      official_description: 'The organization shall plan, implement and control the processes needed to meet requirements.',
      implementation_guidance: 'Plan and control operations to meet security requirements.',
      audit_ready_guidance: '**Purpose**: Plan and control operational processes for information security.\n**Implementation**:\n• Establish operational criteria\n• Implement process controls\n• Document operational procedures\n• Control planned changes\n• Review unintended changes',
      priority: 'high',
      tags: ['operation', 'planning', 'control'],
      category: 'Operation',
      order_index: 16
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '8.2',
      section: '8',
      title: 'Information security risk assessment',
      description: 'The organization shall perform information security risk assessments at planned intervals.',
      official_description: 'The organization shall perform information security risk assessments at planned intervals.',
      implementation_guidance: 'Conduct regular risk assessments.',
      audit_ready_guidance: '**Purpose**: Perform risk assessments at planned intervals and when changes occur.\n**Implementation**:\n• Schedule regular assessments\n• Assess when changes occur\n• Use established criteria\n• Document assessment results\n• Track risk trends',
      priority: 'high',
      tags: ['operation', 'risk-assessment', 'monitoring'],
      category: 'Operation',
      order_index: 17
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '8.3',
      section: '8',
      title: 'Information security risk treatment',
      description: 'The organization shall implement the information security risk treatment plan.',
      official_description: 'The organization shall implement the information security risk treatment plan.',
      implementation_guidance: 'Implement the risk treatment plan.',
      audit_ready_guidance: '**Purpose**: Execute risk treatment plans and document results.\n**Implementation**:\n• Execute treatment plans\n• Monitor implementation progress\n• Document treatment results\n• Verify control effectiveness\n• Update plans as needed',
      priority: 'high',
      tags: ['operation', 'risk-treatment', 'implementation'],
      category: 'Operation',
      order_index: 18
    },
    // Section 9: Performance evaluation
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '9.1',
      section: '9',
      title: 'Monitoring, measurement, analysis and evaluation',
      description: 'The organization shall evaluate the information security performance and the effectiveness of the information security management system.',
      official_description: 'The organization shall evaluate the information security performance and the effectiveness of the information security management system.',
      implementation_guidance: 'Monitor and measure ISMS performance.',
      audit_ready_guidance: '**Purpose**: Monitor, measure and evaluate ISMS performance and effectiveness.\n**Implementation**:\n• Define monitoring requirements\n• Select measurement methods\n• Schedule monitoring activities\n• Assign monitoring responsibilities\n• Document and analyze results',
      priority: 'high',
      tags: ['evaluation', 'monitoring', 'measurement'],
      category: 'Performance Evaluation',
      order_index: 19
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '9.2',
      section: '9',
      title: 'Internal audit',
      description: 'The organization shall conduct internal audits at planned intervals.',
      official_description: 'The organization shall conduct internal audits at planned intervals.',
      implementation_guidance: 'Conduct regular internal audits of the ISMS.',
      audit_ready_guidance: '**Purpose**: Conduct internal audits to verify ISMS conformance and effectiveness.\n**Implementation**:\n• Plan audit schedule\n• Define audit scope and criteria\n• Select qualified auditors\n• Conduct systematic audits\n• Report audit findings',
      priority: 'high',
      tags: ['evaluation', 'audit', 'compliance'],
      category: 'Performance Evaluation',
      order_index: 20
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '9.3',
      section: '9',
      title: 'Management review',
      description: 'Top management shall review the organization\'s information security management system at planned intervals.',
      official_description: 'Top management shall review the organization\'s information security management system at planned intervals.',
      implementation_guidance: 'Conduct management reviews of the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure top management reviews ISMS for continued suitability.\n**Implementation**:\n• Schedule regular reviews\n• Prepare review inputs\n• Conduct management reviews\n• Document review outcomes\n• Track action items',
      priority: 'high',
      tags: ['evaluation', 'management-review', 'governance'],
      category: 'Performance Evaluation',
      order_index: 21
    },
    // Section 10: Improvement
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '10.1',
      section: '10',
      title: 'Continual improvement',
      description: 'The organization shall continually improve the suitability, adequacy and effectiveness of the information security management system.',
      official_description: 'The organization shall continually improve the suitability, adequacy and effectiveness of the information security management system.',
      implementation_guidance: 'Continuously improve the ISMS.',
      audit_ready_guidance: '**Purpose**: Drive continual improvement of ISMS effectiveness.\n**Implementation**:\n• Identify improvement opportunities\n• Implement improvement actions\n• Measure improvement results\n• Share improvement learnings\n• Embed improvement culture',
      priority: 'high',
      tags: ['improvement', 'continual', 'effectiveness'],
      category: 'Improvement',
      order_index: 22
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      control_id: '10.2',
      section: '10',
      title: 'Nonconformity and corrective action',
      description: 'When a nonconformity occurs, the organization shall react and take action.',
      official_description: 'When a nonconformity occurs, the organization shall react and take action.',
      implementation_guidance: 'Manage nonconformities and implement corrective actions.',
      audit_ready_guidance: '**Purpose**: Effectively manage nonconformities and prevent recurrence.\n**Implementation**:\n• React to nonconformities promptly\n• Analyze root causes\n• Implement corrective actions\n• Verify action effectiveness\n• Update ISMS as needed',
      priority: 'high',
      tags: ['improvement', 'nonconformity', 'corrective-action'],
      category: 'Improvement',
      order_index: 23
    }
  ];

  // Insert requirements in batches
  const batchSize = 5;
  for (let i = 0; i < iso27001Requirements.length; i += batchSize) {
    const batch = iso27001Requirements.slice(i, i + batchSize);
    const { error } = await supabase
      .from('requirements_library')
      .insert(batch);
      
    if (error) {
      console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i/batchSize + 1} (${batch.length} requirements)`);
    }
  }
  
  console.log('ISO 27001 population complete!');
}

async function populateISO27002() {
  console.log('Populating ISO 27002 requirements (sample)...');
  
  // First, delete existing ISO 27002 requirements
  const { error: deleteError } = await supabase
    .from('requirements_library')
    .delete()
    .eq('standard_id', '8508cfb0-3457-4226-b39a-851be52ef7ea');
    
  if (deleteError) {
    console.error('Error deleting existing ISO 27002:', deleteError);
    return;
  }

  // Sample of ISO 27002 requirements - add all 93 later
  const iso27002Requirements = [
    {
      standard_id: '8508cfb0-3457-4226-b39a-851be52ef7ea',
      control_id: 'A.5.1',
      section: 'A5',
      title: 'Policies for information security',
      description: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
      official_description: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
      implementation_guidance: 'Develop and maintain comprehensive information security policies.',
      audit_ready_guidance: '**Purpose**: Provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.\n**Implementation**:\n• Define comprehensive information security policy approved by management\n• Communicate policies to all employees and relevant external parties\n• Implement policy acknowledgment process for all personnel\n• Review policies regularly and update when significant changes occur',
      priority: 'high',
      tags: ['governance', 'policy', 'management'],
      category: 'Organizational Controls',
      order_index: 1
    },
    {
      standard_id: '8508cfb0-3457-4226-b39a-851be52ef7ea',
      control_id: 'A.8.23',
      section: 'A8',
      title: 'Web filtering',
      description: 'Access to external websites shall be managed to reduce exposure to malicious content.',
      official_description: 'Access to external websites shall be managed to reduce exposure to malicious content.',
      implementation_guidance: 'Implement web filtering to reduce malicious exposure.',
      audit_ready_guidance: '**Purpose**: Manage access to external websites to reduce exposure to malicious content.\n**Implementation**:\n• Deploy web filtering solutions\n• Categorize and block access to malicious websites\n• Monitor web traffic for security threats\n• Provide user awareness on web security risks',
      priority: 'medium',
      tags: ['Email & Web Browser Protections', 'filtering', 'malicious-content'],
      category: 'Technology Controls',
      order_index: 82
    }
  ];

  // Insert requirements
  const { error } = await supabase
    .from('requirements_library')
    .insert(iso27002Requirements);
    
  if (error) {
    console.error('Error inserting ISO 27002:', error);
  } else {
    console.log(`Inserted ${iso27002Requirements.length} ISO 27002 requirements`);
  }
  
  console.log('ISO 27002 population complete!');
}

async function verifyResults() {
  console.log('\nVerifying results...');
  
  // Check ISO 27001
  const { data: iso27001, error: iso27001Error } = await supabase
    .from('requirements_library')
    .select('*', { count: 'exact', head: true })
    .eq('standard_id', '55742f4e-769b-4efe-912c-1371de5e1cd6');
    
  if (iso27001Error) {
    console.error('Error checking ISO 27001:', iso27001Error);
  } else {
    console.log(`ISO 27001: ${iso27001} requirements`);
  }
  
  // Check ISO 27002
  const { data: iso27002, error: iso27002Error } = await supabase
    .from('requirements_library')
    .select('*', { count: 'exact', head: true })
    .eq('standard_id', '8508cfb0-3457-4226-b39a-851be52ef7ea');
    
  if (iso27002Error) {
    console.error('Error checking ISO 27002:', iso27002Error);
  } else {
    console.log(`ISO 27002: ${iso27002} requirements`);
  }
}

async function main() {
  try {
    await populateISO27001();
    await populateISO27002();
    await verifyResults();
    console.log('\nDatabase population complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();