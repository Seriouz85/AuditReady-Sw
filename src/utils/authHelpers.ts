/**
 * Authentication helper utilities
 */

/**
 * Gets the appropriate redirect path after login
 * @param email - User email (unused, kept for API compatibility)
 * @param fromPath - Optional path user was trying to access
 * @returns Redirect path
 */
export function getLoginRedirectPath(email: string, fromPath?: string): string {
  // All users go to app or their intended path
  return fromPath || '/app';
}

/**
 * Checks if rate limiting should be bypassed for this user
 * Rate limiting applies to all users equally for security
 * @param email - User email (unused)
 * @returns Always false - no bypasses
 */
export function shouldBypassRateLimit(email: string): boolean {
  return false;
}
