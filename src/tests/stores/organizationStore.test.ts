import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrganizationStore } from '@/stores/organizationStore';
import { mockOrganization, mockUser } from '../fixtures/testData';
import { apiClient } from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client');

describe('organizationStore', () => {
  const mockApiClient = apiClient as any;

  beforeEach(() => {
    // Reset store state
    useOrganizationStore.setState({
      currentOrganization: null,
      organizations: [],
      isLoading: false,
      error: null
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useOrganizationStore());
      
      expect(result.current.currentOrganization).toBeNull();
      expect(result.current.organizations).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchOrganizations', () => {
    it('successfully fetches organizations', async () => {
      const organizations = [mockOrganization];
      mockApiClient.get.mockResolvedValue({ data: organizations });

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.fetchOrganizations();
      });

      expect(result.current.organizations).toEqual(organizations);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations');
    });

    it('handles fetch error', async () => {
      const errorMessage = 'Failed to fetch organizations';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.fetchOrganizations();
      });

      expect(result.current.organizations).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockApiClient.get.mockReturnValue(promise);

      const { result } = renderHook(() => useOrganizationStore());

      act(() => {
        result.current.fetchOrganizations();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise({ data: [mockOrganization] });
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('fetchCurrentOrganization', () => {
    it('successfully fetches current organization', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockOrganization });

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.fetchCurrentOrganization(mockOrganization.id);
      });

      expect(result.current.currentOrganization).toEqual(mockOrganization);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockApiClient.get).toHaveBeenCalledWith(`/organizations/${mockOrganization.id}`);
    });

    it('handles fetch current organization error', async () => {
      const errorMessage = 'Organization not found';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.fetchCurrentOrganization('invalid-id');
      });

      expect(result.current.currentOrganization).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('createOrganization', () => {
    it('successfully creates organization', async () => {
      const newOrgData = {
        name: 'New Organization',
        industry: 'Technology',
        size: 'medium' as const
      };
      
      const createdOrg = { ...mockOrganization, ...newOrgData };
      mockApiClient.post.mockResolvedValue({ data: createdOrg });

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.createOrganization(newOrgData);
      });

      expect(result.current.currentOrganization).toEqual(createdOrg);
      expect(result.current.error).toBeNull();
      expect(mockApiClient.post).toHaveBeenCalledWith('/organizations', newOrgData);
    });

    it('handles create organization error', async () => {
      const errorMessage = 'Failed to create organization';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        try {
          await result.current.createOrganization({
            name: 'Test Org',
            industry: 'Technology',
            size: 'small'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.currentOrganization).toBeNull();
    });
  });

  describe('updateOrganization', () => {
    it('successfully updates organization', async () => {
      const updates = { name: 'Updated Organization Name' };
      const updatedOrg = { ...mockOrganization, ...updates };
      
      mockApiClient.put.mockResolvedValue({ data: updatedOrg });

      const { result } = renderHook(() => useOrganizationStore());
      
      // Set initial organization
      act(() => {
        result.current.setCurrentOrganization(mockOrganization);
      });

      await act(async () => {
        await result.current.updateOrganization(mockOrganization.id, updates);
      });

      expect(result.current.currentOrganization).toEqual(updatedOrg);
      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/organizations/${mockOrganization.id}`,
        updates
      );
    });

    it('handles update organization error', async () => {
      const errorMessage = 'Failed to update organization';
      mockApiClient.put.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        try {
          await result.current.updateOrganization(mockOrganization.id, {
            name: 'Updated Name'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('inviteUser', () => {
    it('successfully invites user', async () => {
      const invitation = {
        email: 'newuser@example.com',
        role: 'member' as const
      };
      
      mockApiClient.post.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.inviteUser(mockOrganization.id, invitation);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/organizations/${mockOrganization.id}/invitations`,
        invitation
      );
    });

    it('handles invite user error', async () => {
      const errorMessage = 'Failed to send invitation';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        try {
          await result.current.inviteUser(mockOrganization.id, {
            email: 'test@example.com',
            role: 'member'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('removeUser', () => {
    it('successfully removes user', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.removeUser(mockOrganization.id, mockUser.id);
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/organizations/${mockOrganization.id}/users/${mockUser.id}`
      );
    });
  });

  describe('updateUserRole', () => {
    it('successfully updates user role', async () => {
      const newRole = 'admin';
      mockApiClient.put.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useOrganizationStore());

      await act(async () => {
        await result.current.updateUserRole(
          mockOrganization.id,
          mockUser.id,
          newRole
        );
      });

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/organizations/${mockOrganization.id}/users/${mockUser.id}/role`,
        { role: newRole }
      );
    });
  });

  describe('state setters', () => {
    it('setCurrentOrganization updates current organization', () => {
      const { result } = renderHook(() => useOrganizationStore());

      act(() => {
        result.current.setCurrentOrganization(mockOrganization);
      });

      expect(result.current.currentOrganization).toEqual(mockOrganization);
    });

    it('clearError clears error state', () => {
      const { result } = renderHook(() => useOrganizationStore());

      // Set error
      act(() => {
        useOrganizationStore.setState({ error: 'Some error' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('reset clears all state', () => {
      const { result } = renderHook(() => useOrganizationStore());

      // Set some state
      act(() => {
        useOrganizationStore.setState({
          currentOrganization: mockOrganization,
          organizations: [mockOrganization],
          error: 'Some error'
        });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentOrganization).toBeNull();
      expect(result.current.organizations).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('computed values', () => {
    it('isOwner returns true for organization owner', () => {
      const { result } = renderHook(() => useOrganizationStore());

      act(() => {
        result.current.setCurrentOrganization({
          ...mockOrganization,
          owner_id: mockUser.id
        });
      });

      expect(result.current.isOwner(mockUser.id)).toBe(true);
      expect(result.current.isOwner('other-user-id')).toBe(false);
    });

    it('canInviteUsers returns correct permissions', () => {
      const { result } = renderHook(() => useOrganizationStore());

      act(() => {
        result.current.setCurrentOrganization(mockOrganization);
      });

      // Owner can invite users
      expect(result.current.canInviteUsers(mockOrganization.owner_id)).toBe(true);
      
      // Non-owner cannot invite users (assuming role-based logic)
      expect(result.current.canInviteUsers('other-user-id')).toBe(false);
    });
  });

  describe('persistence', () => {
    it('persists current organization to localStorage', () => {
      const { result } = renderHook(() => useOrganizationStore());

      act(() => {
        result.current.setCurrentOrganization(mockOrganization);
      });

      const stored = localStorage.getItem('organization-storage');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.currentOrganization).toEqual(mockOrganization);
    });

    it('loads persisted organization from localStorage', () => {
      // Pre-populate localStorage
      localStorage.setItem(
        'organization-storage',
        JSON.stringify({
          state: { currentOrganization: mockOrganization },
          version: 0
        })
      );

      const { result } = renderHook(() => useOrganizationStore());

      expect(result.current.currentOrganization).toEqual(mockOrganization);
    });
  });
});