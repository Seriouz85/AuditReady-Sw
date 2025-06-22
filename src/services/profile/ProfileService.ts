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
  job_title?: string;
  department?: string;
  manager_id?: string;
  location?: string;
  timezone?: string;
  language?: string;
  
  // Social/Contact info
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  
  // Preferences
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
  
  // Security
  two_factor_enabled?: boolean;
  last_password_change?: string;
  failed_login_attempts?: number;
  account_locked_until?: string;
  
  // Activity
  last_active?: string;
  last_login?: string;
  login_count?: number;
  
  // Metadata
  onboarding_completed?: boolean;
  terms_accepted_at?: string;
  privacy_policy_accepted_at?: string;
  
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  
  // Related data
  manager?: UserProfile;
  direct_reports?: UserProfile[];
  organization?: {
    id: string;
    name: string;
  };
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  manager_id?: string;
  location?: string;
  timezone?: string;
  language?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
  preferences?: Record<string, any>;
}

export interface AvatarUploadResult {
  success: boolean;
  avatar_url?: string;
  error?: string;
}

export interface UserActivity {
  id: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
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

  /**
   * Upload avatar with enhanced validation and storage
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please upload an image file' };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { success: false, error: 'File size must be less than 5MB' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await this.updateProfile({ avatar_url: publicUrl });

      return { success: true, avatar_url: publicUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, error: 'Failed to upload avatar' };
    }
  }

  /**
   * Remove avatar
   */
  async removeAvatar(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.updateProfile({ avatar_url: undefined });
      return { success: true };
    } catch (error) {
      console.error('Error removing avatar:', error);
      return { success: false, error: 'Failed to remove avatar' };
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    sms_notifications?: boolean;
    marketing_emails?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      await this.updateProfile(preferences);
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: 'Failed to update notification preferences' };
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(limit = 50): Promise<UserActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // This would query actual activity logs in production
      // For demo, return mock data
      return [
        {
          id: '1',
          action: 'profile_updated',
          details: { fields_changed: ['first_name', 'last_name'] },
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          action: 'avatar_uploaded',
          details: { file_size: '2.1MB', file_type: 'image/jpeg' },
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          action: 'password_changed',
          details: {},
          ip_address: '192.168.1.100',
          user_agent: navigator.userAgent,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  /**
   * Get organization members (for manager selection, etc.)
   */
  async getOrganizationMembers(): Promise<Array<{
    id: string;
    name: string;
    job_title?: string;
    department?: string;
    avatar_url?: string;
  }>> {
    try {
      // This would query actual organization members in production
      // For demo, return mock data
      return [
        {
          id: 'demo-user-1',
          name: 'Demo Admin',
          job_title: 'Chief Technology Officer',
          department: 'Technology',
          avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Admin'
        },
        {
          id: 'demo-user-2',
          name: 'Demo CISO',
          job_title: 'Chief Information Security Officer',
          department: 'Security',
          avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo CISO'
        },
        {
          id: 'demo-user-3',
          name: 'Demo Manager',
          job_title: 'Security Manager',
          department: 'Security',
          avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo Manager'
        }
      ];
    } catch (error) {
      console.error('Error fetching organization members:', error);
      return [];
    }
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompleteness(profile: UserProfile): number {
    const fields = [
      'first_name',
      'last_name',
      'phone',
      'bio',
      'job_title',
      'department',
      'location',
      'avatar_url'
    ];

    const completed = fields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value && value.toString().trim() !== '';
    }).length;

    return Math.round((completed / fields.length) * 100);
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(): Promise<void> {
    try {
      await this.updateProfile({
        preferences: {
          last_active: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating last active:', error);
      // Don't throw as this is a background operation
    }
  }

  /**
   * Accept terms and privacy policy
   */
  async acceptTermsAndPrivacy(): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      await this.updateProfile({
        preferences: {
          terms_accepted_at: now,
          privacy_policy_accepted_at: now
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error accepting terms and privacy:', error);
      return { success: false, error: 'Failed to accept terms and privacy policy' };
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.updateProfile({
        preferences: {
          onboarding_completed: true
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { success: false, error: 'Failed to complete onboarding' };
    }
  }
}

export const profileService = new ProfileService();
export default ProfileService;