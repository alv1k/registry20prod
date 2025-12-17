import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to check if the current user has admin privileges
 * @returns boolean indicating if the user is an admin
 */
export const useAdminAccess = (): boolean => {
  const { isAdmin } = useAuth();
  return isAdmin;
};