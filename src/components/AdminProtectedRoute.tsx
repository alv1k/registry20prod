import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const isAdmin = useAdminAccess();

  if (loading) {
    // Show a loading state while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // If logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // Show children only if user is admin
  return <>{children}</>;
};

export default AdminProtectedRoute;