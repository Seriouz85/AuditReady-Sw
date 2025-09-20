/**
 * Risk Management Template
 * Professional unified requirements template for information security risk management
 */

import { UnifiedRequirementTemplate } from '../UnifiedRequirementsTemplateManager';

export const RiskManagementTemplate: UnifiedRequirementTemplate = {
  category: 'Risk Management',
  title: 'Information Security Risk Management Framework',
  description: 'Comprehensive risk management process ensuring systematic identification, assessment, treatment, and monitoring of information security risks.',
  
  subRequirements: [
    {
      letter: 'a',
      title: 'Risk Assessment Methodology',
      description: 'Establish systematic risk assessment methodology including risk identification, analysis, and evaluation criteria aligned with business objectives.',
      injectionPoints: ['risk assessment', 'methodology', 'identification', 'analysis', 'evaluation'],
      requirements: [],
      references: []
    },
    {
      letter: 'b',
      title: 'Risk Identification and Analysis',
      description: 'Conduct comprehensive risk identification across all assets, threats, and vulnerabilities with detailed impact and likelihood analysis.',
      injectionPoints: ['risk identification', 'threat', 'vulnerability', 'impact', 'likelihood'],
      requirements: [],
      references: []
    },
    {
      letter: 'c',
      title: 'Risk Evaluation and Prioritization',
      description: 'Evaluate identified risks against established criteria and prioritize based on business impact and organizational risk appetite.',
      injectionPoints: ['risk evaluation', 'prioritization', 'criteria', 'appetite', 'tolerance'],
      requirements: [],
      references: []
    },
    {
      letter: 'd',
      title: 'Risk Treatment Planning',
      description: 'Develop comprehensive risk treatment plans selecting appropriate options: avoid, reduce, transfer, or accept risks with documented justification.',
      injectionPoints: ['risk treatment', 'mitigation', 'controls', 'plan', 'strategy'],
      requirements: [],
      references: []
    },
    {
      letter: 'e',
      title: 'Risk Monitoring and Review',
      description: 'Implement continuous risk monitoring with regular reviews to identify changes in risk landscape and effectiveness of treatments.',
      injectionPoints: ['monitoring', 'review', 'continuous', 'effectiveness', 'changes'],
      requirements: [],
      references: []
    },
    {
      letter: 'f',
      title: 'Risk Communication and Reporting',
      description: 'Establish clear risk communication channels and regular reporting to stakeholders including management and risk committees.',
      injectionPoints: ['communication', 'reporting', 'stakeholder', 'management', 'committee'],
      requirements: [],
      references: []
    },
    {
      letter: 'g',
      title: 'Risk Documentation and Records',
      description: 'Maintain comprehensive risk documentation including assessments, treatments, decisions, and monitoring results for audit and compliance.',
      injectionPoints: ['documentation', 'records', 'audit trail', 'evidence', 'compliance'],
      requirements: [],
      references: []
    }
  ]
};