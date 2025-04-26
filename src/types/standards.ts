export interface Standard {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'privacy' | 'compliance';
  version: string;
  requirements: string[];
  applicable?: boolean;
} 