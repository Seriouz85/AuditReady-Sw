/**
 * Asset Management Template
 * Professional unified requirements template for asset management and inventory controls
 */

import { UnifiedRequirementTemplate } from '../UnifiedRequirementsTemplateManager';

export const AssetManagementTemplate: UnifiedRequirementTemplate = {
  category: 'Asset Management',
  title: 'Information Asset Management Framework',
  description: 'Comprehensive asset management ensuring proper identification, classification, handling, and protection of all information assets throughout their lifecycle.',
  
  subRequirements: [
    {
      letter: 'a',
      title: 'Asset Inventory and Registration',
      description: 'Maintain comprehensive inventory of all information assets including hardware, software, data, and documentation with accurate tracking and ownership assignment.',
      injectionPoints: ['inventory', 'register', 'asset', 'catalog', 'tracking', 'identification'],
      requirements: [],
      references: []
    },
    {
      letter: 'b', 
      title: 'Asset Classification and Labeling',
      description: 'Classify all information assets according to sensitivity levels and apply appropriate labeling to ensure proper handling and protection measures.',
      injectionPoints: ['classification', 'labeling', 'sensitivity', 'categorization', 'marking'],
      requirements: [],
      references: []
    },
    {
      letter: 'c',
      title: 'Asset Ownership and Accountability',
      description: 'Assign clear ownership and custodial responsibilities for all assets with documented accountability for security and proper usage.',
      injectionPoints: ['ownership', 'responsibility', 'accountability', 'custodian', 'steward'],
      requirements: [],
      references: []
    },
    {
      letter: 'd',
      title: 'Asset Handling and Protection',
      description: 'Establish procedures for proper handling, storage, transmission, and processing of assets according to their classification level.',
      injectionPoints: ['handling', 'storage', 'transmission', 'processing', 'protection'],
      requirements: [],
      references: []
    },
    {
      letter: 'e',
      title: 'Asset Lifecycle Management',
      description: 'Manage assets throughout their complete lifecycle from acquisition through disposal with appropriate security controls at each phase.',
      injectionPoints: ['lifecycle', 'acquisition', 'deployment', 'maintenance', 'retirement'],
      requirements: [],
      references: []
    },
    {
      letter: 'f',
      title: 'Media Management and Control',
      description: 'Implement controls for removable media including authorization, logging, secure transport, and sanitization procedures.',
      injectionPoints: ['media', 'removable', 'transport', 'sanitization', 'disposal'],
      requirements: [],
      references: []
    },
    {
      letter: 'g',
      title: 'Asset Return and Disposal',
      description: 'Ensure secure return of assets upon termination and implement proper disposal procedures including data destruction and environmental compliance.',
      injectionPoints: ['return', 'disposal', 'destruction', 'sanitization', 'termination'],
      requirements: [],
      references: []
    }
  ]
};