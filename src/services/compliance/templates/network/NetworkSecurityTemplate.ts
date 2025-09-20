/**
 * Network Security Template
 * Professional unified requirements template for network security controls and management
 */

import { UnifiedRequirementTemplate } from '../UnifiedRequirementsTemplateManager';

export const NetworkSecurityTemplate: UnifiedRequirementTemplate = {
  category: 'Network Security Management',
  title: 'Network Security Controls Framework',
  description: 'Comprehensive network security controls ensuring protection of network infrastructure, traffic monitoring, and secure communication channels.',
  
  subRequirements: [
    {
      letter: 'a',
      title: 'Network Architecture and Segmentation',
      description: 'Design secure network architecture with proper segmentation, DMZ implementation, and isolation of critical systems.',
      injectionPoints: ['network', 'architecture', 'segmentation', 'dmz', 'isolation'],
      requirements: [],
      references: []
    },
    {
      letter: 'b',
      title: 'Network Access Controls',
      description: 'Implement robust network access controls including firewalls, intrusion prevention, and access restrictions based on business needs.',
      injectionPoints: ['firewall', 'access control', 'intrusion', 'prevention', 'filtering'],
      requirements: [],
      references: []
    },
    {
      letter: 'c',
      title: 'Network Monitoring and Detection',
      description: 'Deploy comprehensive network monitoring with intrusion detection systems, traffic analysis, and anomaly detection capabilities.',
      injectionPoints: ['monitoring', 'detection', 'intrusion detection', 'traffic', 'anomaly'],
      requirements: [],
      references: []
    },
    {
      letter: 'd',
      title: 'Secure Network Communications',
      description: 'Ensure secure communications through encryption, VPN implementation, and secure protocols for data transmission.',
      injectionPoints: ['encryption', 'vpn', 'secure communication', 'protocols', 'transmission'],
      requirements: [],
      references: []
    },
    {
      letter: 'e',
      title: 'Wireless Network Security',
      description: 'Implement strong wireless security controls including WPA3 encryption, access point management, and guest network isolation.',
      injectionPoints: ['wireless', 'wifi', 'access point', 'encryption', 'guest network'],
      requirements: [],
      references: []
    },
    {
      letter: 'f',
      title: 'Network Configuration Management',
      description: 'Maintain secure network device configurations with change management, hardening standards, and regular security updates.',
      injectionPoints: ['configuration', 'hardening', 'change management', 'updates', 'patches'],
      requirements: [],
      references: []
    },
    {
      letter: 'g',
      title: 'Network Incident Response',
      description: 'Establish network-specific incident response procedures for security events, breaches, and network disruptions.',
      injectionPoints: ['incident response', 'breach', 'disruption', 'forensics', 'containment'],
      requirements: [],
      references: []
    }
  ]
};