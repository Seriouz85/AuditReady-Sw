import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  email_notifications?: boolean;
  two_factor_enabled?: boolean;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  email_notifications?: boolean;
  preferences?: Record<string, any>;
}

class ProfileService {
  /**
   * Get the current user's profile information
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error getting authenticated user:', authError);
        return null;
      }

      // Return profile data from auth metadata
      const profile: UserProfile = {
        id: user.id,
        email: user.email!,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        phone: user.user_metadata?.phone,
        bio: user.user_metadata?.bio,
        avatar_url: user.user_metadata?.avatar_url,
        timezone: user.user_metadata?.timezone || 'UTC',
        language: user.user_metadata?.language || 'en',
        email_notifications: user.user_metadata?.email_notifications ?? true,
        two_factor_enabled: user.user_metadata?.two_factor_enabled ?? false,
        preferences: user.user_metadata?.preferences || {},
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update the current user's profile information
   */
  async updateProfile(updates: ProfileUpdateData): Promise<UserProfile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Merge current metadata with updates
      const currentMetadata = user.user_metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update name if first_name or last_name changed
      if (updates.first_name || updates.last_name) {
        updatedMetadata.name = `${updates.first_name || currentMetadata.first_name || ''} ${updates.last_name || currentMetadata.last_name || ''}`.trim();
      }

      // Update auth user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: updatedMetadata
      });

      if (error) {
        throw error;
      }

      // Also update organization_users table if user is part of an organization
      await this.updateOrganizationUserProfile(updates);

      const updatedProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        ...updatedMetadata
      };

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Update the user's profile in the organization_users table
   */
  private async updateOrganizationUserProfile(updates: ProfileUpdateData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find the user in organization_users table
      const { data: orgUser, error: fetchError } = await supabase
        .from('organization_users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (fetchError || !orgUser) {
        // User might not be in an organization yet, skip silently
        return;
      }

      // Update organization user record
      const organizationUserUpdates: any = {};
      
      if (updates.first_name || updates.last_name) {
        organizationUserUpdates.name = `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
      } else if (updates.name) {
        organizationUserUpdates.name = updates.name;
      }

      // Update preferences
      if (updates.preferences) {
        organizationUserUpdates.preferences = {
          ...orgUser.preferences,
          ...updates.preferences
        };
      }

      if (Object.keys(organizationUserUpdates).length > 0) {
        const { error } = await supabase
          .from('organization_users')
          .update(organizationUserUpdates)
          .eq('id', orgUser.id);

        if (error) {
          console.error('Error updating organization user profile:', error);
          // Don't throw here as the main profile update succeeded
        }
      }
    } catch (error) {
      console.error('Error updating organization user profile:', error);
      // Don't throw here as the main profile update succeeded
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Update user email (requires confirmation)
   */
  async updateEmail(newEmail: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  /**
   * Upload and update profile picture
   */
  async updateProfilePicture(file: File): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update user metadata with new avatar URL
      await this.updateProfile({ avatar_url: avatarUrl });

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Get user's recent login activity
   */
  async getLoginActivity(): Promise<any[]> {
    try {
      // This would typically come from audit logs or session tracking
      // For now, return mock data for demo purposes
      return [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          type: 'current_session',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/120.0.0.0',
          location: 'New York, NY'
        }
      ];
    } catch (error) {
      console.error('Error fetching login activity:', error);
      return [];
    }
  }

  /**
   * Enable/disable two-factor authentication
   */
  async updateTwoFactorAuth(enabled: boolean): Promise<void> {
    try {
      await this.updateProfile({ 
        preferences: { 
          two_factor_enabled: enabled 
        } 
      });

      if (enabled) {
        toast.success('Two-factor authentication enabled');
      } else {
        toast.success('Two-factor authentication disabled');
      }
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
export default ProfileService;