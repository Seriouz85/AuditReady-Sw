export interface OrganizationNode {
  id: string;
  name: string;
  role?: string;
  email?: string;
  department?: string;
  highlight?: boolean;
  children?: OrganizationNode[];
  // Additional properties from Organization 
  type?: string;
  hierarchyLevel?: number;
  parentId?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  hierarchyLevel: number;
  parentId?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  securityContact?: {
    name: string;
    email: string;
  };
  legalContact?: {
    name: string;
    email: string;
  };
  description?: string;
  complianceScopeTags?: string[];
} 