/**
 * Microsoft Entra ID (Azure AD) Integration Service
 * Handles enterprise SSO authentication, user provisioning, and group mapping
 */

import { supabase } from '@/lib/supabase';

export interface EntraIdConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authority?: string;
  domainHint?: string;
}

export interface EntraIdUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  groups?: string[];
  roles?: string[];
  isGuest: boolean;
  accountEnabled: boolean;
}

export interface GroupMapping {
  groupId: string;
  groupName: string;
  auditReadyRole: 'admin' | 'manager' | 'auditor' | 'viewer';
  permissions: string[];
}

export interface ProvisioningResult {
  success: boolean;
  userId?: string;
  error?: string;
  action: 'created' | 'updated' | 'skipped' | 'disabled';
}

class EntraIdService {
  private config: EntraIdConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Initialize Entra ID service with configuration
   */
  async initialize(config: EntraIdConfig): Promise<void> {
    this.config = config;
    
    // Validate configuration
    if (!config.tenantId || !config.clientId || !config.clientSecret) {
      throw new Error('Missing required Entra ID configuration');
    }

    // Test connection
    await this.validateConnection();
  }

  /**
   * Validate Entra ID connection and permissions
   */
  private async validateConnection(): Promise<void> {
    try {
      await this.getAccessToken();
    } catch (error) {
      throw new Error(`Failed to connect to Entra ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get access token for Microsoft Graph API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config) {
      throw new Error('Entra ID service not initialized');
    }

    const tokenEndpoint = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token received from Entra ID');
    }
    
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

    return this.accessToken!;
  }

  /**
   * Get user information from Entra ID
   */
  async getUser(userPrincipalName: string): Promise<EntraIdUser | null> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userPrincipalName)}?$select=id,userPrincipalName,displayName,givenName,surname,mail,jobTitle,department,accountEnabled&$expand=memberOf($select=id,displayName)`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user: ${error}`);
    }

    const data = await response.json();
    
    return {
      id: data.id,
      userPrincipalName: data.userPrincipalName,
      displayName: data.displayName,
      givenName: data.givenName,
      surname: data.surname,
      mail: data.mail,
      jobTitle: data.jobTitle,
      department: data.department,
      groups: data.memberOf?.map((group: any) => group.id) || [],
      isGuest: data.userType === 'Guest',
      accountEnabled: data.accountEnabled
    };
  }

  /**
   * Get all users from Entra ID (paginated)
   */
  async getAllUsers(pageSize: number = 100): Promise<EntraIdUser[]> {
    const token = await this.getAccessToken();
    const users: EntraIdUser[] = [];
    let nextLink: string | null = `https://graph.microsoft.com/v1.0/users?$select=id,userPrincipalName,displayName,givenName,surname,mail,jobTitle,department,accountEnabled&$top=${pageSize}`;

    while (nextLink) {
      const response: Response = await fetch(nextLink, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get users: ${error}`);
      }

      const data: any = await response.json();
      
      for (const user of data.value) {
        users.push({
          id: user.id,
          userPrincipalName: user.userPrincipalName,
          displayName: user.displayName,
          givenName: user.givenName,
          surname: user.surname,
          mail: user.mail,
          jobTitle: user.jobTitle,
          department: user.department,
          groups: [],
          isGuest: user.userType === 'Guest',
          accountEnabled: user.accountEnabled
        });
      }

      nextLink = data['@odata.nextLink'] || null;
    }

    return users;
  }

  /**
   * Get groups for a user
   */
  async getUserGroups(userId: string): Promise<string[]> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/memberOf?$select=id,displayName`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user groups: ${error}`);
    }

    const data = await response.json();
    return data.value.map((group: any) => group.id);
  }

  /**
   * Provision user from Entra ID to AuditReady
   */
  async provisionUser(entraUser: EntraIdUser, groupMappings: GroupMapping[]): Promise<ProvisioningResult> {
    try {
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id, user_id, entra_id')
        .eq('entra_id', entraUser.id)
        .single();

      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: entraUser.givenName,
            last_name: entraUser.surname,
            email: entraUser.mail,
            job_title: entraUser.jobTitle,
            department: entraUser.department,
            is_active: entraUser.accountEnabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', (existingUser as any).id);

        if (error) {
          return { success: false, error: error.message, action: 'skipped' };
        }

        // Update roles based on group mappings
        await this.updateUserRoles((existingUser as any).user_id, entraUser.groups || [], groupMappings);

        return { 
          success: true, 
          userId: (existingUser as any).user_id, 
          action: entraUser.accountEnabled ? 'updated' : 'disabled' 
        };
      }

      // Create new user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: entraUser.mail,
        email_confirm: true,
        user_metadata: {
          first_name: entraUser.givenName,
          last_name: entraUser.surname,
          entra_id: entraUser.id,
          provisioned_from: 'entra_id'
        }
      });

      if (authError || !authUser.user) {
        return { success: false, error: authError?.message || 'Failed to create auth user', action: 'skipped' };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.user.id,
          first_name: entraUser.givenName,
          last_name: entraUser.surname,
          email: entraUser.mail,
          job_title: entraUser.jobTitle,
          department: entraUser.department,
          entra_id: entraUser.id,
          is_active: entraUser.accountEnabled,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authUser.user.id);
        return { success: false, error: profileError.message, action: 'skipped' };
      }

      // Assign roles based on group mappings
      await this.updateUserRoles(authUser.user.id, entraUser.groups || [], groupMappings);

      return { success: true, userId: authUser.user.id, action: 'created' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        action: 'skipped' 
      };
    }
  }

  /**
   * Update user roles based on Entra ID group memberships
   */
  private async updateUserRoles(userId: string, userGroups: string[], groupMappings: GroupMapping[]): Promise<void> {
    // Find applicable role mappings
    const applicableRoles = groupMappings.filter(mapping => 
      userGroups.includes(mapping.groupId)
    );

    if (applicableRoles.length === 0) {
      // Assign default viewer role if no groups match
      const { data: viewerRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'viewer')
        .single();

      if (viewerRole) {
        await supabase
          .from('user_role_assignments')
          .upsert({
            user_id: userId,
            role_id: viewerRole.id,
            assigned_at: new Date().toISOString()
          });
      }
      return;
    }

    // Remove existing role assignments
    await supabase
      .from('user_role_assignments')
      .delete()
      .eq('user_id', userId);

    // Assign new roles
    for (const roleMapping of applicableRoles) {
      const { data: role } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', roleMapping.auditReadyRole)
        .single();

      if (role) {
        await supabase
          .from('user_role_assignments')
          .insert({
            user_id: userId,
            role_id: role.id,
            assigned_at: new Date().toISOString()
          });
      }
    }
  }

  /**
   * Deprovision user (disable account)
   */
  async deprovisionUser(entraId: string): Promise<ProvisioningResult> {
    try {
      const { data: userProfile, error: findError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('entra_id', entraId)
        .single();

      if (findError || !userProfile) {
        return { success: false, error: 'User not found', action: 'skipped' };
      }

      // Disable user account
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('entra_id', entraId);

      if (error) {
        return { success: false, error: error.message, action: 'skipped' };
      }

      return { success: true, userId: (userProfile as any).user_id, action: 'disabled' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        action: 'skipped' 
      };
    }
  }

  /**
   * Sync all users from Entra ID
   */
  async syncAllUsers(groupMappings: GroupMapping[]): Promise<{
    total: number;
    created: number;
    updated: number;
    disabled: number;
    errors: number;
  }> {
    const results = { total: 0, created: 0, updated: 0, disabled: 0, errors: 0 };

    try {
      const entraUsers = await this.getAllUsers();
      results.total = entraUsers.length;

      for (const entraUser of entraUsers) {
        // Get user groups
        entraUser.groups = await this.getUserGroups(entraUser.id);

        const result = await this.provisionUser(entraUser, groupMappings);

        if (result.success) {
          switch (result.action) {
            case 'created': results.created++; break;
            case 'updated': results.updated++; break;
            case 'disabled': results.disabled++; break;
          }
        } else {
          results.errors++;
          console.error(`Failed to provision user ${entraUser.userPrincipalName}:`, result.error);
        }
      }

    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }

    return results;
  }

  /**
   * Get OIDC configuration for client-side authentication
   */
  getOIDCConfig(): any {
    if (!this.config) {
      throw new Error('Entra ID service not initialized');
    }

    return {
      authority: this.config.authority || `https://login.microsoftonline.com/${this.config.tenantId}/v2.0`,
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      response_mode: 'query',
      domain_hint: this.config.domainHint
    };
  }
}

export const entraIdService = new EntraIdService();
export default EntraIdService;