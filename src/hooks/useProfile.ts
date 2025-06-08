import { useState, useEffect } from 'react';
import { profileService, UserProfile, ProfileUpdateData } from '@/services/profile/ProfileService';
import { toast } from '@/utils/toast';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdateData): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedProfile = await profileService.updateProfile(updates);
      setProfile(updatedProfile);
      
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setUpdating(true);
      await profileService.updatePassword(newPassword);
      toast.success('Password updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password';
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateEmail = async (newEmail: string): Promise<boolean> => {
    try {
      setUpdating(true);
      await profileService.updateEmail(newEmail);
      toast.success('Email update initiated. Please check your new email for confirmation.');
      return true;
    } catch (err) {
      console.error('Error updating email:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update email';
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateProfilePicture = async (file: File): Promise<boolean> => {
    try {
      setUpdating(true);
      const avatarUrl = await profileService.updateProfilePicture(file);
      
      // Update local profile state
      if (profile) {
        setProfile({ ...profile, avatar_url: avatarUrl });
      }
      
      toast.success('Profile picture updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating profile picture:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile picture';
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateTwoFactorAuth = async (enabled: boolean): Promise<boolean> => {
    try {
      setUpdating(true);
      await profileService.updateTwoFactorAuth(enabled);
      
      // Update local profile state
      if (profile) {
        setProfile({ 
          ...profile, 
          two_factor_enabled: enabled,
          preferences: { 
            ...profile.preferences, 
            two_factor_enabled: enabled 
          }
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error updating 2FA:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update two-factor authentication';
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  return {
    profile,
    loading,
    updating,
    error,
    updateProfile,
    updatePassword,
    updateEmail,
    updateProfilePicture,
    updateTwoFactorAuth,
    refreshProfile
  };
};