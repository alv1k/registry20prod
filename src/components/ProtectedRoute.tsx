// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Whether authentication is required to view content
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading state while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Show login form if authentication is required and user is not authenticated
    return <LoginForm onSuccess={() => {}} />;
  }

  // Show children - either authenticated user or allow public viewing
  return <>{children}</>;
};

export default ProtectedRoute;