import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase/authService';
import Button from './Button';

// Type the icons properly
const MenuIcon = FiMenu as React.FC<React.SVGProps<SVGSVGElement>>;
const CloseIcon = FiX as React.FC<React.SVGProps<SVGSVGElement>>;

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      // ProtectedRoute will handle redirecting to login page
    } catch (error) {
      console.error('Error signing out:', error);
      // Show error message to user
      alert('Ошибка при выходе из системы. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden -ml-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>

            <div className="flex items-center ml-0">
              <a href="/" className="flex items-center">
                <img src="/favicon.png" alt="logo" className="h-8 w-8 rounded-lg" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  Реестр 2.0
                </span>
              </a>
            </div>
          </div>

          {/* Auth section - right aligned */}
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="text-gray-600">Загрузка...</div>
            ) : user ? (
              // User is authenticated - show user info and sign out
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-sm text-gray-600">
                  <div className="font-medium text-gray-900 truncate max-w-xs">{user.email}</div>
                  <div className="text-xs text-gray-500">UID: {user.uid.substring(0, 8)}...</div>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="danger"
                  size="sm"
                >
                  Выйти
                </Button>
              </div>
            ) : (
              // User is not authenticated - show sign in
              <Button
                href="/login"
                variant="primary"
                size="sm"
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;