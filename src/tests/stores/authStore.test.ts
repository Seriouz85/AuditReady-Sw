import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/stores/authStore';
import { testUsers } from '../fixtures/testData';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
    useAuthStore.getState().setLoading(false);
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets user correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser(testUsers.regularUser);
    });

    expect(result.current.user).toEqual(testUsers.regularUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logs in user with profile', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockProfile = {
      id: 'profile-1',
      user_id: testUsers.regularUser.id,
      first_name: 'Test',
      last_name: 'User',
      email: testUsers.regularUser.email,
    };
    
    act(() => {
      result.current.login(testUsers.regularUser, mockProfile as any);
    });

    expect(result.current.user).toEqual(testUsers.regularUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('logs out user correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // First log in
    act(() => {
      result.current.setUser(testUsers.regularUser);
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then log out
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('handles null user correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // Set user first
    act(() => {
      result.current.setUser(testUsers.regularUser);
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Set user to null
    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});