import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

  // ISO 27001 requirements data
  const iso27001Requirements = [
    // Section 4: Context of the organization
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '4.1',
      section: '4',
      title: 'Understanding the organization and its context',
      official_description: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.',
      implementation_guidance: 'Identify and document all relevant internal and external factors that impact information security.',
      audit_ready_guidance: '**Purpose**: Understand internal and external factors affecting the ISMS.\n**Implementation**:\n• Conduct environmental scanning for external factors\n• Analyze internal capabilities and constraints\n• Document relevant issues and their impact\n• Review context at planned intervals',
      priority: 'high',
      tags: ['governance', 'context', 'planning']
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '4.2',
      section: '4',
      title: 'Understanding the needs and expectations of interested parties',
      official_description: 'The organization shall determine: a) the interested parties that are relevant to the information security management system; b) the relevant requirements of these interested parties; c) which of these requirements will be addressed through the information security management system.',
      implementation_guidance: 'Identify stakeholders and their security requirements.',
      audit_ready_guidance: '**Purpose**: Identify and understand stakeholder requirements for information security.\n**Implementation**:\n• Identify all relevant interested parties\n• Document their security requirements\n• Determine which requirements to address\n• Maintain stakeholder communication',
      priority: 'high',
      tags: ['governance', 'stakeholders', 'requirements'],
      // sort_order: 2
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '4.3',
      section: '4',
      title: 'Determining the scope of the information security management system',
      official_description: 'The organization shall determine the boundaries and applicability of the information security management system to establish its scope.',
      implementation_guidance: 'Define which parts of the organization are covered by the ISMS.',
      audit_ready_guidance: '**Purpose**: Define clear boundaries and applicability of the ISMS.\n**Implementation**:\n• Define physical and logical boundaries\n• Consider internal and external issues\n• Document interfaces and dependencies\n• Make scope available as documented information',
      priority: 'high',
      tags: ['governance', 'scope', 'documentation'],
      // sort_order: 3
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '4.4',
      section: '4',
      title: 'Information security management system',
      official_description: 'The organization shall establish, implement, maintain and continually improve an information security management system.',
      implementation_guidance: 'Implement a systematic approach to managing information security.',
      audit_ready_guidance: '**Purpose**: Establish and maintain the ISMS according to ISO 27001 requirements.\n**Implementation**:\n• Establish ISMS processes and interactions\n• Implement according to standard requirements\n• Maintain and continually improve\n• Document process interactions',
      priority: 'high',
      tags: ['governance', 'isms', 'processes'],
      // sort_order: 4
    },
    // Section 5: Leadership
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '5.1',
      section: '5',
      title: 'Leadership and commitment',
      official_description: 'Top management shall demonstrate leadership and commitment with respect to the information security management system.',
      implementation_guidance: 'Ensure top management demonstrates leadership and commitment to the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure top management actively leads and supports the ISMS.\n**Implementation**:\n• Establish security policy and objectives\n• Integrate ISMS into business processes\n• Provide adequate resources\n• Communicate importance of security\n• Monitor ISMS effectiveness',
      priority: 'high',
      tags: ['governance', 'leadership', 'management'],
      // sort_order: 5
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '5.2',
      section: '5',
      title: 'Policy',
      official_description: 'Top management shall establish an information security policy.',
      implementation_guidance: 'Establish and maintain an information security policy.',
      audit_ready_guidance: '**Purpose**: Establish appropriate information security policy with management commitment.\n**Implementation**:\n• Develop policy appropriate to organization\n• Include security objectives framework\n• Commit to requirements and improvement\n• Communicate policy throughout organization',
      priority: 'high',
      tags: ['governance', 'policy', 'documentation'],
      // sort_order: 6
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '5.3',
      section: '5',
      title: 'Organizational roles, responsibilities and authorities',
      official_description: 'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated.',
      implementation_guidance: 'Define and communicate information security roles and responsibilities.',
      audit_ready_guidance: '**Purpose**: Assign and communicate security roles, responsibilities and authorities.\n**Implementation**:\n• Define security roles and responsibilities\n• Assign authorities for ISMS conformance\n• Establish reporting lines to management\n• Communicate roles throughout organization',
      priority: 'high',
      tags: ['governance', 'roles', 'responsibilities'],
      // sort_order: 7
    },
    // Section 6: Planning
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '6.1.1',
      section: '6',
      title: 'General (Actions to address risks and opportunities)',
      official_description: 'When planning for the information security management system, the organization shall consider the issues referred to in 4.1 and requirements in 4.2.',
      implementation_guidance: 'Plan the ISMS considering context and requirements to address risks and opportunities.',
      audit_ready_guidance: '**Purpose**: Identify risks and opportunities when planning the ISMS.\n**Implementation**:\n• Consider context and requirements\n• Identify relevant risks and opportunities\n• Plan actions to address them\n• Integrate into ISMS processes',
      priority: 'high',
      tags: ['planning', 'risk', 'opportunities'],
      // sort_order: 8
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '6.1.2',
      section: '6',
      title: 'Information security risk assessment',
      official_description: 'The organization shall define and apply an information security risk assessment process.',
      implementation_guidance: 'Define and implement a risk assessment process.',
      audit_ready_guidance: '**Purpose**: Establish systematic process for assessing information security risks.\n**Implementation**:\n• Define risk assessment criteria\n• Identify information security risks\n• Analyze risk likelihood and impact\n• Evaluate risks against criteria\n• Document assessment process',
      priority: 'high',
      tags: ['risk-management', 'assessment', 'analysis'],
      // sort_order: 9
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '6.1.3',
      section: '6',
      title: 'Information security risk treatment',
      official_description: 'The organization shall define and apply an information security risk treatment process.',
      implementation_guidance: 'Define and implement a risk treatment process.',
      audit_ready_guidance: '**Purpose**: Establish process for treating identified information security risks.\n**Implementation**:\n• Select risk treatment options\n• Determine necessary controls\n• Create Statement of Applicability\n• Develop risk treatment plan\n• Obtain risk owner approval',
      priority: 'high',
      tags: ['risk-management', 'treatment', 'controls'],
      // sort_order: 10
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '6.2',
      section: '6',
      title: 'Information security objectives and planning to achieve them',
      official_description: 'The organization shall establish information security objectives at relevant functions and levels.',
      implementation_guidance: 'Establish measurable security objectives and plans to achieve them.',
      audit_ready_guidance: '**Purpose**: Set measurable information security objectives with clear plans.\n**Implementation**:\n• Establish objectives aligned with policy\n• Ensure objectives are measurable\n• Plan actions, resources, and timelines\n• Assign responsibilities\n• Define evaluation criteria',
      priority: 'high',
      tags: ['planning', 'objectives', 'measurement'],
      // sort_order: 11
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '6.3',
      section: '6',
      title: 'Planning of changes',
      official_description: 'When the organization determines the need for changes to the information security management system, the changes shall be carried out in a planned manner.',
      implementation_guidance: 'Plan and control changes to the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure changes to ISMS are planned and controlled.\n**Implementation**:\n• Identify need for ISMS changes\n• Plan change implementation\n• Consider risks of changes\n• Control change execution\n• Review change effectiveness',
      priority: 'medium',
      tags: ['planning', 'change-management', 'control'],
      // sort_order: 12
    },
    // Section 7: Support
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.1',
      section: '7',
      title: 'Resources',
      official_description: 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the information security management system.',
      implementation_guidance: 'Provide adequate resources for the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure adequate resources for ISMS implementation and improvement.\n**Implementation**:\n• Identify resource requirements\n• Provide necessary resources\n• Consider human and technical resources\n• Allocate budget appropriately\n• Monitor resource adequacy',
      priority: 'high',
      tags: ['support', 'resources', 'management'],
      // sort_order: 13
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.2',
      section: '7',
      title: 'Competence',
      official_description: 'The organization shall determine necessary competence and ensure persons are competent.',
      implementation_guidance: 'Ensure personnel have necessary security competence.',
      audit_ready_guidance: '**Purpose**: Ensure personnel are competent for their security responsibilities.\n**Implementation**:\n• Define competence requirements\n• Assess current competencies\n• Provide training where needed\n• Maintain competence records\n• Evaluate training effectiveness',
      priority: 'high',
      tags: ['support', 'competence', 'training'],
      // sort_order: 14
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.3',
      section: '7',
      title: 'Awareness',
      official_description: 'Persons doing work under the organization\'s control shall be aware of the information security policy.',
      implementation_guidance: 'Ensure personnel are aware of security policies and their responsibilities.',
      audit_ready_guidance: '**Purpose**: Create security awareness among all personnel.\n**Implementation**:\n• Communicate security policy\n• Explain individual contributions\n• Clarify consequences of non-compliance\n• Conduct regular awareness sessions\n• Measure awareness effectiveness',
      priority: 'high',
      tags: ['support', 'awareness', 'training'],
      // sort_order: 15
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.4',
      section: '7',
      title: 'Communication',
      official_description: 'The organization shall determine the need for internal and external communications relevant to the information security management system.',
      implementation_guidance: 'Establish effective communication processes for security matters.',
      audit_ready_guidance: '**Purpose**: Plan and implement effective security communication.\n**Implementation**:\n• Define communication requirements\n• Establish communication channels\n• Determine target audiences\n• Assign communication responsibilities\n• Monitor communication effectiveness',
      priority: 'medium',
      tags: ['support', 'communication', 'processes'],
      // sort_order: 16
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.5.1',
      section: '7',
      title: 'General (Documented information)',
      official_description: 'The organization\'s information security management system shall include documented information required by this document.',
      implementation_guidance: 'Maintain required ISMS documentation.',
      audit_ready_guidance: '**Purpose**: Ensure ISMS includes all required documented information.\n**Implementation**:\n• Identify documentation requirements\n• Create required documents\n• Determine additional documentation needs\n• Establish documentation standards\n• Maintain document currency',
      priority: 'medium',
      tags: ['support', 'documentation', 'records'],
      // sort_order: 17
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.5.2',
      section: '7',
      title: 'Creating and updating',
      official_description: 'When creating and updating documented information, the organization shall ensure appropriate identification and description.',
      implementation_guidance: 'Control creation and updating of documented information.',
      audit_ready_guidance: '**Purpose**: Ensure proper control when creating and updating documents.\n**Implementation**:\n• Use consistent identification\n• Define format standards\n• Implement review processes\n• Obtain proper approvals\n• Track document versions',
      priority: 'medium',
      tags: ['support', 'documentation', 'control'],
      // sort_order: 18
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '7.5.3',
      section: '7',
      title: 'Control of documented information',
      official_description: 'Documented information shall be controlled to ensure it is available and suitable for use.',
      implementation_guidance: 'Control access and changes to documented information.',
      audit_ready_guidance: '**Purpose**: Protect and control documented information throughout lifecycle.\n**Implementation**:\n• Control document distribution\n• Manage access permissions\n• Protect document integrity\n• Track changes and versions\n• Define retention periods',
      priority: 'medium',
      tags: ['support', 'documentation', 'control'],
      // sort_order: 19
    },
    // Section 8: Operation
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '8.1',
      section: '8',
      title: 'Operational planning and control',
      official_description: 'The organization shall plan, implement and control the processes needed to meet requirements.',
      implementation_guidance: 'Plan and control operations to meet security requirements.',
      audit_ready_guidance: '**Purpose**: Plan and control operational processes for information security.\n**Implementation**:\n• Establish operational criteria\n• Implement process controls\n• Document operational procedures\n• Control planned changes\n• Review unintended changes',
      priority: 'high',
      tags: ['operation', 'planning', 'control'],
      // sort_order: 20
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '8.2',
      section: '8',
      title: 'Information security risk assessment',
      official_description: 'The organization shall perform information security risk assessments at planned intervals.',
      implementation_guidance: 'Conduct regular risk assessments.',
      audit_ready_guidance: '**Purpose**: Perform risk assessments at planned intervals and when changes occur.\n**Implementation**:\n• Schedule regular assessments\n• Assess when changes occur\n• Use established criteria\n• Document assessment results\n• Track risk trends',
      priority: 'high',
      tags: ['operation', 'risk-assessment', 'monitoring'],
      // sort_order: 21
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '8.3',
      section: '8',
      title: 'Information security risk treatment',
      official_description: 'The organization shall implement the information security risk treatment plan.',
      implementation_guidance: 'Implement the risk treatment plan.',
      audit_ready_guidance: '**Purpose**: Execute risk treatment plans and document results.\n**Implementation**:\n• Execute treatment plans\n• Monitor implementation progress\n• Document treatment results\n• Verify control effectiveness\n• Update plans as needed',
      priority: 'high',
      tags: ['operation', 'risk-treatment', 'implementation'],
      // sort_order: 22
    },
    // Section 9: Performance evaluation
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '9.1',
      section: '9',
      title: 'Monitoring, measurement, analysis and evaluation',
      official_description: 'The organization shall evaluate the information security performance and the effectiveness of the information security management system.',
      implementation_guidance: 'Monitor and measure ISMS performance.',
      audit_ready_guidance: '**Purpose**: Monitor, measure and evaluate ISMS performance and effectiveness.\n**Implementation**:\n• Define monitoring requirements\n• Select measurement methods\n• Schedule monitoring activities\n• Assign monitoring responsibilities\n• Document and analyze results',
      priority: 'high',
      tags: ['evaluation', 'monitoring', 'measurement'],
      // sort_order: 23
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '9.2.1',
      section: '9',
      title: 'General (Internal audit)',
      official_description: 'The organization shall conduct internal audits at planned intervals.',
      implementation_guidance: 'Conduct regular internal audits of the ISMS.',
      audit_ready_guidance: '**Purpose**: Conduct internal audits to verify ISMS conformance and effectiveness.\n**Implementation**:\n• Plan audit schedule\n• Define audit scope and criteria\n• Select qualified auditors\n• Conduct systematic audits\n• Report audit findings',
      priority: 'high',
      tags: ['evaluation', 'audit', 'compliance'],
      // sort_order: 24
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '9.2.2',
      section: '9',
      title: 'Internal audit programme',
      official_description: 'The organization shall plan, establish, implement and maintain an audit programme.',
      implementation_guidance: 'Establish and maintain an internal audit programme.',
      audit_ready_guidance: '**Purpose**: Establish comprehensive internal audit programme for the ISMS.\n**Implementation**:\n• Develop audit programme\n• Consider process importance\n• Ensure auditor independence\n• Report to management\n• Maintain audit records',
      priority: 'high',
      tags: ['evaluation', 'audit', 'programme'],
      // sort_order: 25
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '9.3.1',
      section: '9',
      title: 'General (Management review)',
      official_description: 'Top management shall review the organization\'s information security management system at planned intervals.',
      implementation_guidance: 'Conduct management reviews of the ISMS.',
      audit_ready_guidance: '**Purpose**: Ensure top management reviews ISMS for continued suitability.\n**Implementation**:\n• Schedule regular reviews\n• Prepare review inputs\n• Conduct management reviews\n• Document review outcomes\n• Track action items',
      priority: 'high',
      tags: ['evaluation', 'management-review', 'governance'],
      // sort_order: 26
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '9.3.2',
      section: '9',
      title: 'Management review inputs',
      official_description: 'The management review shall include consideration of relevant inputs.',
      implementation_guidance: 'Provide comprehensive inputs for management review.',
      audit_ready_guidance: '**Purpose**: Ensure management review considers all relevant inputs.\n**Implementation**:\n• Review previous actions\n• Analyze performance trends\n• Compile audit results\n• Gather stakeholder feedback\n• Present risk status',
      priority: 'high',
      tags: ['evaluation', 'management-review', 'inputs'],
      // sort_order: 27
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '9.3.3',
      section: '9',
      title: 'Management review results',
      official_description: 'The results of the management review shall include decisions related to continual improvement.',
      implementation_guidance: 'Document management review outcomes and decisions.',
      audit_ready_guidance: '**Purpose**: Document decisions and improvement opportunities from management review.\n**Implementation**:\n• Document review decisions\n• Identify improvement opportunities\n• Plan necessary changes\n• Assign action items\n• Track implementation',
      priority: 'high',
      tags: ['evaluation', 'management-review', 'results'],
      // sort_order: 28
    },
    // Section 10: Improvement
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '10.1',
      section: '10',
      title: 'Continual improvement',
      official_description: 'The organization shall continually improve the suitability, adequacy and effectiveness of the information security management system.',
      implementation_guidance: 'Continuously improve the ISMS.',
      audit_ready_guidance: '**Purpose**: Drive continual improvement of ISMS effectiveness.\n**Implementation**:\n• Identify improvement opportunities\n• Implement improvement actions\n• Measure improvement results\n• Share improvement learnings\n• Embed improvement culture',
      priority: 'high',
      tags: ['improvement', 'continual', 'effectiveness'],
      // sort_order: 29
    },
    {
      standard_id: '55742f4e-769b-4efe-912c-1371de5e1cd6',
      requirement_code: '10.2',
      section: '10',
      title: 'Nonconformity and corrective action',
      official_description: 'When a nonconformity occurs, the organization shall react and take action.',
      implementation_guidance: 'Manage nonconformities and implement corrective actions.',
      audit_ready_guidance: '**Purpose**: Effectively manage nonconformities and prevent recurrence.\n**Implementation**:\n• React to nonconformities promptly\n• Analyze root causes\n• Implement corrective actions\n• Verify action effectiveness\n• Update ISMS as needed',
      priority: 'high',
      tags: ['improvement', 'nonconformity', 'corrective-action'],
      // sort_order: 30
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
  console.log('Populating ISO 27002 requirements...');
  
  // First, delete existing ISO 27002 requirements
  const { error: deleteError } = await supabase
    .from('requirements_library')
    .delete()
    .eq('standard_id', '8508cfb0-3457-4226-b39a-851be52ef7ea');
    
  if (deleteError) {
    console.error('Error deleting existing ISO 27002:', deleteError);
    return;
  }

  // Read the full ISO 27002 migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '052_complete_iso27002_restoration.sql');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  
  // Extract INSERT VALUES from the migration file
  const valuesMatch = migrationContent.match(/INSERT INTO requirements_library.*?VALUES\s*([\s\S]*?);/);
  if (!valuesMatch) {
    console.error('Could not parse ISO 27002 migration file');
    return;
  }
  
  // Parse the VALUES section
  const valuesSection = valuesMatch[1];
  const requirementMatches = valuesSection.matchAll(/\(gen_random_uuid\(\),\s*'8508cfb0-3457-4226-b39a-851be52ef7ea',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*ARRAY\[([^\]]+)\],\s*(\d+),\s*NOW\(\),\s*NOW\(\)\)/g);
  
  const iso27002Requirements = [];
  for (const match of requirementMatches) {
    const [_, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tagsStr, sort_order] = match;
    
    // Parse tags array
    const tags = tagsStr.split(',').map(tag => tag.trim().replace(/'/g, ''));
    
    iso27002Requirements.push({
      standard_id: '8508cfb0-3457-4226-b39a-851be52ef7ea',
      requirement_code: requirement_code.replace(/'/g, ''),
      section: section.replace(/'/g, ''),
      title: title.replace(/'/g, '').replace(/''/g, "'"),
      official_description: official_description.replace(/'/g, '').replace(/''/g, "'"),
      implementation_guidance: implementation_guidance.replace(/'/g, '').replace(/''/g, "'"),
      audit_ready_guidance: audit_ready_guidance.replace(/'/g, '').replace(/''/g, "'"),
      priority: priority.replace(/'/g, ''),
      tags,
      // sort_order: parseInt(sort_order)
      sort_order: parseInt(sort_order)
    });
  }
  
  console.log(`Found ${iso27002Requirements.length} ISO 27002 requirements to insert`);
  
  // Insert requirements in batches
  const batchSize = 10;
  for (let i = 0; i < iso27002Requirements.length; i += batchSize) {
    const batch = iso27002Requirements.slice(i, i + batchSize);
    const { error } = await supabase
      .from('requirements_library')
      .insert(batch);
      
    if (error) {
      console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i/batchSize + 1} (${batch.length} requirements)`);
    }
  }
  
  console.log('ISO 27002 population complete!');
}

async function verifyResults() {
  console.log('\nVerifying results...');
  
  // Check ISO 27001
  const { data: iso27001Count } = await supabase
    .from('requirements_library')
    .select('id', { count: 'exact', head: true })
    .eq('standard_id', '55742f4e-769b-4efe-912c-1371de5e1cd6');
    
  console.log(`ISO 27001: ${iso27001Count} requirements`);
  
  // Check ISO 27002
  const { data: iso27002Count } = await supabase
    .from('requirements_library')
    .select('id', { count: 'exact', head: true })
    .eq('standard_id', '8508cfb0-3457-4226-b39a-851be52ef7ea');
    
  console.log(`ISO 27002: ${iso27002Count} requirements`);
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