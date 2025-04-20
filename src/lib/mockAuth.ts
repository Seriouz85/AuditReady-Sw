import { DEMO_EMAIL, DEMO_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD } from './firebase';

// Mock user type
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  isAnonymous: boolean;
  isAdmin: boolean;
}

// Mock authentication state
let currentUser: MockUser | null = null;

/**
 * Mock sign in function that simulates Firebase authentication
 */
export const mockSignIn = async (email: string, password: string): Promise<MockUser> => {
  // Wait for a realistic authentication delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if credentials match our demo or admin accounts
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    currentUser = {
      uid: 'demo-user-123',
      email: DEMO_EMAIL,
      displayName: 'Demo User',
      isAnonymous: false,
      isAdmin: false
    };
    return currentUser;
  } else if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    currentUser = {
      uid: 'admin-user-456',
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      isAnonymous: false,
      isAdmin: true
    };
    return currentUser;
  }
  
  // Reject with auth error for invalid credentials
  throw new Error('Invalid email or password');
};

/**
 * Mock anonymous sign in
 */
export const mockSignInAnonymously = async (): Promise<MockUser> => {
  // Wait for a realistic authentication delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  currentUser = {
    uid: `anonymous-${Date.now()}`,
    email: '',
    displayName: 'Guest User',
    isAnonymous: true,
    isAdmin: false
  };
  
  return currentUser;
};

/**
 * Get the current mock user
 */
export const getMockCurrentUser = (): MockUser | null => {
  return currentUser;
};

/**
 * Mock sign out function
 */
export const mockSignOut = async (): Promise<void> => {
  // Wait for a realistic delay
  await new Promise(resolve => setTimeout(resolve, 200));
  currentUser = null;
};

/**
 * Add user to local storage (for persisting mock auth between page refreshes)
 */
export const persistMockUser = (user: MockUser): void => {
  if (user) {
    localStorage.setItem('mockUser', JSON.stringify(user));
  }
};

/**
 * Load user from local storage
 */
export const loadPersistedMockUser = (): MockUser | null => {
  const savedUser = localStorage.getItem('mockUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      return currentUser;
    } catch (e) {
      localStorage.removeItem('mockUser');
    }
  }
  return null;
}; 