/**
 * Access Control & Identity Management Template
 * Professional unified requirements template for access control and identity management
 */

import { UnifiedRequirementTemplate } from '../UnifiedRequirementsTemplateManager';

export const AccessControlTemplate: UnifiedRequirementTemplate = {
  category: 'Access Control & Identity Management',
  title: 'Comprehensive Access Control and Identity Management Framework',
  description: 'Complete identity lifecycle management framework ensuring secure authentication, authorization, and access governance across all systems and resources.',
  
  subRequirements: [
    {
      letter: 'a',
      title: 'Identity Lifecycle Management',
      description: 'Implement comprehensive identity lifecycle processes including provisioning, modification, review, and deprovisioning aligned with business processes and HR systems.',
      injectionPoints: ['identity', 'lifecycle', 'provisioning', 'deprovisioning', 'joiner', 'mover', 'leaver'],
      requirements: [],
      references: []
    },
    {
      letter: 'b',
      title: 'Multi-Factor Authentication (MFA)',
      description: 'Deploy strong multi-factor authentication for all privileged accounts, remote access, and sensitive systems with adaptive authentication based on risk signals.',
      injectionPoints: ['authentication', 'multi-factor', 'MFA', '2FA', 'factor', 'strong authentication'],
      requirements: [],
      references: []
    },
    {
      letter: 'c',
      title: 'Role-Based Access Control (RBAC)',
      description: 'Establish comprehensive role-based access control with clearly defined roles, responsibilities, and access permissions aligned with business functions and separation of duties.',
      injectionPoints: ['role-based', 'RBAC', 'roles', 'permissions', 'authorization', 'least privilege'],
      requirements: [],
      references: []
    },
    {
      letter: 'd',
      title: 'Privileged Access Management (PAM)',
      description: 'Implement privileged access management with just-in-time access, session monitoring, credential vaulting, and comprehensive auditing for all administrative activities.',
      injectionPoints: ['privileged', 'administrative', 'PAM', 'just-in-time', 'elevated', 'admin'],
      requirements: [],
      references: []
    },
    {
      letter: 'e',
      title: 'Access Review and Certification',
      description: 'Conduct regular access reviews and certifications with manager approval, automated workflows, and removal of unnecessary access rights to maintain principle of least privilege.',
      injectionPoints: ['access review', 'certification', 'recertification', 'approval', 'attestation', 'validation'],
      requirements: [],
      references: []
    },
    {
      letter: 'f',
      title: 'Account Management and Security',
      description: 'Implement secure account management including password policies, account lockout mechanisms, dormant account monitoring, and timely account termination procedures.',
      injectionPoints: ['account', 'password', 'lockout', 'dormant', 'inactive', 'termination'],
      requirements: [],
      references: []
    },
    {
      letter: 'g',
      title: 'Single Sign-On (SSO) and Federation',
      description: 'Deploy enterprise single sign-on solutions with federated identity management to reduce password fatigue while maintaining strong security controls.',
      injectionPoints: ['single sign-on', 'SSO', 'federation', 'SAML', 'OAuth', 'identity provider'],
      requirements: [],
      references: []
    },
    {
      letter: 'h',
      title: 'Access Control Monitoring and Logging',
      description: 'Implement comprehensive logging and monitoring of all access control events including authentication attempts, authorization decisions, and privileged activities.',
      injectionPoints: ['logging', 'monitoring', 'audit trail', 'access logs', 'authentication logs', 'tracking'],
      requirements: [],
      references: []
    },
    {
      letter: 'i',
      title: 'Network Access Control (NAC)',
      description: 'Deploy network access control solutions to validate device compliance, enforce security policies, and control network access based on device and user identity.',
      injectionPoints: ['network access', 'NAC', 'device control', 'endpoint', 'network security', 'device compliance'],
      requirements: [],
      references: []
    },
    {
      letter: 'j',
      title: 'Remote Access Security',
      description: 'Establish secure remote access mechanisms including VPN solutions, zero-trust network access, and enhanced security controls for remote and mobile users.',
      injectionPoints: ['remote access', 'VPN', 'zero trust', 'ZTNA', 'remote work', 'mobile access'],
      requirements: [],
      references: []
    }
  ]
};