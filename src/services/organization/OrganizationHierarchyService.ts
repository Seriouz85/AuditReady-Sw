import { supabase } from '@/lib/supabase';

export interface Department {
  id: string;
  name: string;
  description?: string;
  parent_department_id?: string;
  organization_id: string;
  head_user_id?: string;
  budget?: number;
  cost_center?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  head_user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  parent_department?: Department;
  child_departments?: Department[];
  teams?: Team[];
  users?: OrganizationUser[];
  user_count?: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  department_id: string;
  lead_user_id?: string;
  organization_id: string;
  team_type: 'permanent' | 'project' | 'cross_functional';
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  
  // Related data
  lead_user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  department?: Department;
  members?: TeamMember[];
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'lead' | 'member' | 'contributor';
  joined_at: string;
  status: 'active' | 'inactive';
  
  // Related data
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    job_title?: string;
  };
  team?: Team;
}

export interface OrganizationUser {
  id: string;
  user_id: string;
  organization_id: string;
  department_id?: string;
  job_title?: string;
  employee_id?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'on_leave';
  role_id: string;
  
  // Related data
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  };
  department?: Department;
  teams?: Team[];
}

export interface OrganizationChart {
  departments: Department[];
  teams: Team[];
  users: OrganizationUser[];
  hierarchy: {
    [departmentId: string]: {
      children: string[];
      users: string[];
      teams: string[];
    };
  };
}

export interface DepartmentStats {
  total_users: number;
  active_users: number;
  teams_count: number;
  compliance_score?: number;
  budget_utilization?: number;
}

class OrganizationHierarchyService {
  
  // Department management
  async getDepartments(organizationId: string): Promise<Department[]> {
    try {
      // In production, query actual database
      // For demo, return mock data
      const mockDepartments: Department[] = [
        {
          id: 'dept-exec',
          name: 'Executive',
          description: 'Executive leadership and strategic direction',
          organization_id: organizationId,
          head_user_id: 'demo-ceo',
          location: 'New York HQ',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          head_user: {
            id: 'demo-ceo',
            name: 'Demo CEO',
            email: 'ceo@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CEO'
          },
          child_departments: [],
          user_count: 3
        },
        {
          id: 'dept-tech',
          name: 'Technology',
          description: 'Information technology and development',
          organization_id: organizationId,
          head_user_id: 'demo-cto',
          budget: 2500000,
          cost_center: 'CC-TECH-001',
          location: 'San Francisco Office',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          head_user: {
            id: 'demo-cto',
            name: 'Demo CTO',
            email: 'cto@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CTO'
          },
          child_departments: [],
          user_count: 25
        },
        {
          id: 'dept-security',
          name: 'Information Security',
          description: 'Cybersecurity and compliance operations',
          parent_department_id: 'dept-tech',
          organization_id: organizationId,
          head_user_id: 'demo-ciso',
          budget: 800000,
          cost_center: 'CC-SEC-001',
          location: 'San Francisco Office',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          head_user: {
            id: 'demo-ciso',
            name: 'Demo CISO',
            email: 'ciso@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO'
          },
          child_departments: [],
          user_count: 8
        },
        {
          id: 'dept-hr',
          name: 'Human Resources',
          description: 'People operations and talent management',
          organization_id: organizationId,
          head_user_id: 'demo-hr-director',
          budget: 450000,
          cost_center: 'CC-HR-001',
          location: 'New York HQ',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          head_user: {
            id: 'demo-hr-director',
            name: 'Demo HR Director',
            email: 'hr@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo HR Director'
          },
          child_departments: [],
          user_count: 6
        },
        {
          id: 'dept-finance',
          name: 'Finance',
          description: 'Financial planning and accounting',
          organization_id: organizationId,
          head_user_id: 'demo-cfo',
          budget: 350000,
          cost_center: 'CC-FIN-001',
          location: 'New York HQ',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          head_user: {
            id: 'demo-cfo',
            name: 'Demo CFO',
            email: 'cfo@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CFO'
          },
          child_departments: [],
          user_count: 12
        }
      ];

      return mockDepartments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async createDepartment(params: {
    organizationId: string;
    name: string;
    description?: string;
    parentDepartmentId?: string;
    headUserId?: string;
    budget?: number;
    costCenter?: string;
    location?: string;
  }): Promise<{ success: boolean; department?: Department; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        name: params.name,
        description: params.description,
        parent_department_id: params.parentDepartmentId,
        organization_id: params.organizationId,
        head_user_id: params.headUserId,
        budget: params.budget,
        cost_center: params.costCenter,
        location: params.location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        child_departments: [],
        teams: [],
        users: [],
        user_count: 0
      };

      // In production, insert into database
      // await supabase.from('departments').insert(newDepartment);

      return { success: true, department: newDepartment };
    } catch (error) {
      console.error('Error creating department:', error);
      return { success: false, error: 'Failed to create department' };
    }
  }

  // Team management
  async getTeams(organizationId: string, departmentId?: string): Promise<Team[]> {
    try {
      // In production, query actual database
      // For demo, return mock data
      const mockTeams: Team[] = [
        {
          id: 'team-security-ops',
          name: 'Security Operations',
          description: 'Daily security monitoring and incident response',
          department_id: 'dept-security',
          lead_user_id: 'demo-sec-manager',
          organization_id: organizationId,
          team_type: 'permanent',
          status: 'active',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          lead_user: {
            id: 'demo-sec-manager',
            name: 'Demo Security Manager',
            email: 'sec.manager@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Security Manager'
          },
          member_count: 5
        },
        {
          id: 'team-compliance',
          name: 'Compliance Team',
          description: 'Regulatory compliance and audit management',
          department_id: 'dept-security',
          lead_user_id: 'demo-compliance-lead',
          organization_id: organizationId,
          team_type: 'permanent',
          status: 'active',
          created_at: '2024-01-20T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z',
          lead_user: {
            id: 'demo-compliance-lead',
            name: 'Demo Compliance Lead',
            email: 'compliance@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Compliance Lead'
          },
          member_count: 3
        },
        {
          id: 'team-incident-response',
          name: 'Incident Response',
          description: 'Cross-functional incident response and crisis management',
          department_id: 'dept-security',
          lead_user_id: 'demo-ir-lead',
          organization_id: organizationId,
          team_type: 'cross_functional',
          status: 'active',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
          lead_user: {
            id: 'demo-ir-lead',
            name: 'Demo IR Lead',
            email: 'incident@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo IR Lead'
          },
          member_count: 8
        },
        {
          id: 'team-dev-platform',
          name: 'Platform Development',
          description: 'Core platform and infrastructure development',
          department_id: 'dept-tech',
          lead_user_id: 'demo-dev-lead',
          organization_id: organizationId,
          team_type: 'permanent',
          status: 'active',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
          lead_user: {
            id: 'demo-dev-lead',
            name: 'Demo Dev Lead',
            email: 'dev.lead@democorp.com',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Dev Lead'
          },
          member_count: 12
        }
      ];

      if (departmentId) {
        return mockTeams.filter(team => team.department_id === departmentId);
      }

      return mockTeams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  async createTeam(params: {
    organizationId: string;
    departmentId: string;
    name: string;
    description?: string;
    leadUserId?: string;
    teamType: 'permanent' | 'project' | 'cross_functional';
  }): Promise<{ success: boolean; team?: Team; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: params.name,
        description: params.description,
        department_id: params.departmentId,
        lead_user_id: params.leadUserId,
        organization_id: params.organizationId,
        team_type: params.teamType,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        members: [],
        member_count: 0
      };

      // In production, insert into database
      // await supabase.from('teams').insert(newTeam);

      return { success: true, team: newTeam };
    } catch (error) {
      console.error('Error creating team:', error);
      return { success: false, error: 'Failed to create team' };
    }
  }

  // Team membership management
  async addTeamMember(params: {
    teamId: string;
    userId: string;
    role: 'lead' | 'member' | 'contributor';
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // In production, insert into team_members table
      // await supabase.from('team_members').insert({
      //   team_id: params.teamId,
      //   user_id: params.userId,
      //   role: params.role,
      //   status: 'active',
      //   joined_at: new Date().toISOString()
      // });

      return { success: true };
    } catch (error) {
      console.error('Error adding team member:', error);
      return { success: false, error: 'Failed to add team member' };
    }
  }

  async removeTeamMember(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, update team_members table
      // await supabase.from('team_members')
      //   .update({ status: 'inactive' })
      //   .eq('team_id', teamId)
      //   .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      console.error('Error removing team member:', error);
      return { success: false, error: 'Failed to remove team member' };
    }
  }

  // Organization chart and hierarchy
  async getOrganizationChart(organizationId: string): Promise<OrganizationChart> {
    try {
      const [departments, teams, users] = await Promise.all([
        this.getDepartments(organizationId),
        this.getTeams(organizationId),
        this.getOrganizationUsers(organizationId)
      ]);

      // Build hierarchy structure
      const hierarchy: { [departmentId: string]: { children: string[]; users: string[]; teams: string[] } } = {};

      departments.forEach(dept => {
        hierarchy[dept.id] = {
          children: departments.filter(d => d.parent_department_id === dept.id).map(d => d.id),
          users: users.filter(u => u.department_id === dept.id).map(u => u.id),
          teams: teams.filter(t => t.department_id === dept.id).map(t => t.id)
        };
      });

      return {
        departments,
        teams,
        users,
        hierarchy
      };
    } catch (error) {
      console.error('Error building organization chart:', error);
      throw error;
    }
  }

  async getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
    try {
      // In production, query actual organization_users table
      // For demo, return mock data
      const mockUsers: OrganizationUser[] = [
        {
          id: 'org-user-1',
          user_id: 'demo-ciso',
          organization_id: organizationId,
          department_id: 'dept-security',
          job_title: 'Chief Information Security Officer',
          employee_id: 'EMP-001',
          hire_date: '2023-01-15',
          status: 'active',
          role_id: 'ciso',
          user: {
            id: 'demo-ciso',
            email: 'ciso@democorp.com',
            name: 'Demo CISO',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO'
          }
        },
        {
          id: 'org-user-2',
          user_id: 'demo-analyst',
          organization_id: organizationId,
          department_id: 'dept-security',
          job_title: 'Security Analyst',
          employee_id: 'EMP-002',
          hire_date: '2023-06-01',
          status: 'active',
          role_id: 'analyst',
          user: {
            id: 'demo-analyst',
            email: 'analyst@democorp.com',
            name: 'Demo Analyst',
            avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Analyst'
          }
        }
      ];

      return mockUsers;
    } catch (error) {
      console.error('Error fetching organization users:', error);
      throw error;
    }
  }

  // Department statistics
  async getDepartmentStats(departmentId: string): Promise<DepartmentStats> {
    try {
      // In production, calculate from actual data
      // For demo, return mock stats
      const mockStats: Record<string, DepartmentStats> = {
        'dept-security': {
          total_users: 8,
          active_users: 7,
          teams_count: 3,
          compliance_score: 85,
          budget_utilization: 72
        },
        'dept-tech': {
          total_users: 25,
          active_users: 24,
          teams_count: 5,
          compliance_score: 78,
          budget_utilization: 68
        },
        'dept-hr': {
          total_users: 6,
          active_users: 6,
          teams_count: 2,
          compliance_score: 92,
          budget_utilization: 45
        }
      };

      return mockStats[departmentId] || {
        total_users: 0,
        active_users: 0,
        teams_count: 0,
        compliance_score: 0,
        budget_utilization: 0
      };
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  }

  // User department assignment
  async assignUserToDepartment(params: {
    userId: string;
    departmentId: string;
    jobTitle?: string;
    startDate?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, update organization_users table
      // await supabase.from('organization_users')
      //   .update({
      //     department_id: params.departmentId,
      //     job_title: params.jobTitle,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('user_id', params.userId);

      return { success: true };
    } catch (error) {
      console.error('Error assigning user to department:', error);
      return { success: false, error: 'Failed to assign user to department' };
    }
  }

  // Bulk operations
  async bulkUpdateDepartmentAssignments(assignments: Array<{
    userId: string;
    departmentId: string;
    jobTitle?: string;
  }>): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, perform bulk update
      // const updates = assignments.map(assignment => ({
      //   user_id: assignment.userId,
      //   department_id: assignment.departmentId,
      //   job_title: assignment.jobTitle,
      //   updated_at: new Date().toISOString()
      // }));
      // 
      // await supabase.from('organization_users').upsert(updates);

      return { success: true };
    } catch (error) {
      console.error('Error bulk updating department assignments:', error);
      return { success: false, error: 'Failed to update department assignments' };
    }
  }
}

export const organizationHierarchyService = new OrganizationHierarchyService();