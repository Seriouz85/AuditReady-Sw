import { DiagramTemplate } from '../types/diagram/types';

// All template objects and the templates export from templates.tsx go here.
// (Content will be moved from templates.tsx)

// --- Example IT Security Templates ---

const itSecurityIncidentResponse: DiagramTemplate = {
  id: 'it-security-incident-response',
  name: 'Incident Response Flow',
  description: 'A flowchart for IT security incident response procedures.',
  category: 'Process',
  nodes: [
    { id: 'detect', type: 'process', label: 'Detect Incident', x: 100, y: 100, width: 140, height: 60, color: '#1976d2', textColor: '#fff' },
    { id: 'analyze', type: 'process', label: 'Analyze', x: 300, y: 100, width: 140, height: 60, color: '#388e3c', textColor: '#fff' },
    { id: 'contain', type: 'process', label: 'Contain', x: 500, y: 100, width: 140, height: 60, color: '#fbc02d', textColor: '#fff' },
    { id: 'eradicate', type: 'process', label: 'Eradicate', x: 700, y: 100, width: 140, height: 60, color: '#d32f2f', textColor: '#fff' },
    { id: 'recover', type: 'process', label: 'Recover', x: 900, y: 100, width: 140, height: 60, color: '#0288d1', textColor: '#fff' },
    { id: 'lessons', type: 'process', label: 'Lessons Learned', x: 1100, y: 100, width: 140, height: 60, color: '#7b1fa2', textColor: '#fff' },
  ],
  edges: [
    { id: 'e1', source: 'detect', target: 'analyze', type: 'arrow', style: { stroke: '#1976d2', strokeWidth: 2 } },
    { id: 'e2', source: 'analyze', target: 'contain', type: 'arrow', style: { stroke: '#388e3c', strokeWidth: 2 } },
    { id: 'e3', source: 'contain', target: 'eradicate', type: 'arrow', style: { stroke: '#fbc02d', strokeWidth: 2 } },
    { id: 'e4', source: 'eradicate', target: 'recover', type: 'arrow', style: { stroke: '#d32f2f', strokeWidth: 2 } },
    { id: 'e5', source: 'recover', target: 'lessons', type: 'arrow', style: { stroke: '#0288d1', strokeWidth: 2 } },
  ],
};

const itSecurityAccessControl: DiagramTemplate = {
  id: 'it-security-access-control',
  name: 'Access Control Matrix',
  description: 'A simple matrix for visualizing access control in IT security.',
  category: 'Infographic',
  nodes: [
    { id: 'user', type: 'actor', label: 'User', x: 100, y: 200, width: 120, height: 50, color: '#0288d1', textColor: '#fff' },
    { id: 'admin', type: 'actor', label: 'Admin', x: 100, y: 300, width: 120, height: 50, color: '#388e3c', textColor: '#fff' },
    { id: 'db', type: 'entity', label: 'Database', x: 400, y: 200, width: 120, height: 50, color: '#fbc02d', textColor: '#fff' },
    { id: 'server', type: 'entity', label: 'Server', x: 400, y: 300, width: 120, height: 50, color: '#d32f2f', textColor: '#fff' },
  ],
  edges: [
    { id: 'e1', source: 'user', target: 'db', type: 'association', style: { stroke: '#0288d1', strokeWidth: 2 } },
    { id: 'e2', source: 'admin', target: 'db', type: 'association', style: { stroke: '#388e3c', strokeWidth: 2 } },
    { id: 'e3', source: 'admin', target: 'server', type: 'association', style: { stroke: '#d32f2f', strokeWidth: 2 } },
  ],
};

// --- Export Templates ---
export const templates = {
  'it-security-incident-response': itSecurityIncidentResponse,
  'it-security-access-control': itSecurityAccessControl,
}; 