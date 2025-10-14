// src/utils/authUtils.ts
import { User } from 'firebase/auth';

/**
 * Checks if the user's ID token is expired or will expire soon
 * @param user - The Firebase User object
 * @param minutesBeforeExpire - How many minutes before expiration to consider "expired" (default: 5)
 * @returns Promise<boolean> - True if token is expired or will expire soon
 */
export const isTokenExpiringSoon = async (user: User | null, minutesBeforeExpire: number = 5): Promise<boolean> => {
  if (!user) {
    return true; // No user, so effectively "expired"
  }

  try {
    // Get the ID token result which contains expiration info
    const tokenResult = await user.getIdTokenResult();
    
    // Get expiration time in milliseconds
    const expirationTimeMs = new Date(tokenResult.expirationTime).getTime();
    const now = Date.now();
    const timeUntilExpirationMs = expirationTimeMs - now;
    const timeUntilExpirationMinutes = timeUntilExpirationMs / (1000 * 60);
    
    return timeUntilExpirationMinutes <= minutesBeforeExpire;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't verify, assume it's problematic
  }
};

/**
 * Refreshes the user's ID token
 * @param user - The Firebase User object
 * @returns Promise<string | null> - The refreshed token or null if no user
 */
export const refreshToken = async (user: User | null): Promise<string | null> => {
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken(true); // Force refresh
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

/**
 * Gets the current user's ID token with verification
 * @param user - The Firebase User object
 * @param forceRefresh - Whether to force a token refresh
 * @returns Promise<string | null> - The valid token or null
 */
export const getValidToken = async (user: User | null, forceRefresh: boolean = false): Promise<string | null> => {
  if (!user) {
    return null;
  }

  try {
    // Check if token is expiring soon
    if (forceRefresh || await isTokenExpiringSoon(user)) {
      // Refresh the token
      return await user.getIdToken(true);
    }
    
    // Return current token
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting valid token:', error);
    return null;
  }
};