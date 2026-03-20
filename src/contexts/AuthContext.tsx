// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { onAuthStateChangedListener, getCurrentUser } from '../firebase/authService';
import { User } from 'firebase/auth';
import { isTokenExpiringSoon, refreshToken } from '../utils/authUtils';

// Centralized admin UID — single source of truth
export const ADMIN_UID = 'Rz9j7obzy7SBydiuF3VdRSuE1Ge2';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setUser(user);
      setLoading(false);
    });

    // Also check for existing user immediately
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    return unsubscribe;
  }, []);

  // Check if user has admin privileges
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(idTokenResult.claims.admin === true || user.uid === ADMIN_UID);
        } catch (error) {
          console.error('Error checking admin status:', error);
          // As a fallback, check if it's the specific UID
          setIsAdmin(user.uid === ADMIN_UID);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Monitor token expiration and refresh if needed
  useEffect(() => {
    // Clear any previous interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    if (user) {
      // Set up interval to check token expiration every 5 minutes
      const interval = setInterval(async () => {
        try {
          if (await isTokenExpiringSoon(user, 10)) { // Check if token expires in 10 minutes or less
            console.log('Refreshing user token...');
            await refreshToken(user);
          }
        } catch (error) {
          console.error('Error checking/refreshing token:', error);
        }
      }, 5 * 60 * 1000); // Every 5 minutes

      tokenCheckIntervalRef.current = interval;

      return () => {
        clearInterval(interval);
        tokenCheckIntervalRef.current = null;
      };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};