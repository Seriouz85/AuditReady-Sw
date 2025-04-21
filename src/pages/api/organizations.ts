import { NextApiRequest, NextApiResponse } from 'next';
import { Organization } from '@/types/organization';

// Mock organizations data - in a real app, this would come from a database
const organizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Parent Company',
    type: 'Parent Company',
    hierarchyLevel: 1,
    parentId: null,
    securityContact: {
      name: 'John Security',
      email: 'security@parentcompany.com'
    },
    address: {
      street: '123 Main St',
      city: 'Corporate City',
      state: 'CA',
      zip: '90001',
      country: 'USA'
    },
    description: 'Main parent organization',
    complianceScopeTags: ['SOC2', 'ISO27001']
  },
  {
    id: 'org-2',
    name: 'Subsidiary A',
    type: 'Subsidiary',
    hierarchyLevel: 2,
    parentId: 'org-1',
    securityContact: {
      name: 'Alice Security',
      email: 'alice@subsidiaryA.com'
    },
    description: 'Technology division',
    complianceScopeTags: ['SOC2']
  },
  {
    id: 'org-3',
    name: 'Subsidiary B',
    type: 'Subsidiary',
    hierarchyLevel: 2,
    parentId: 'org-1',
    securityContact: {
      name: 'Bob Security',
      email: 'bob@subsidiaryB.com'
    },
    description: 'Financial services division',
    complianceScopeTags: ['SOC2', 'PCI']
  },
  {
    id: 'org-4',
    name: 'Division A1',
    type: 'Division',
    hierarchyLevel: 3,
    parentId: 'org-2',
    securityContact: {
      name: 'Carol Security',
      email: 'carol@divisionA1.com'
    },
    description: 'Software development',
    complianceScopeTags: ['SOC2']
  },
  {
    id: 'org-5',
    name: 'Division A2',
    type: 'Division',
    hierarchyLevel: 3,
    parentId: 'org-2',
    securityContact: {
      name: 'Dave Security',
      email: 'dave@divisionA2.com'
    },
    description: 'IT operations',
    complianceScopeTags: ['SOC2', 'ISO27001']
  },
  {
    id: 'org-6',
    name: 'Division B1',
    type: 'Division',
    hierarchyLevel: 3,
    parentId: 'org-3',
    securityContact: {
      name: 'Eve Security',
      email: 'eve@divisionB1.com'
    },
    description: 'Banking services',
    complianceScopeTags: ['SOC2', 'PCI']
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Add artificial delay to simulate network latency (remove in production)
    setTimeout(() => {
      res.status(200).json(organizations);
    }, 500);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 