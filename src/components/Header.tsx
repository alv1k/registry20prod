import React from 'react';
import { FiMenu, FiX, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase/authService';
import Button from './Button';
import { useTheme } from '../contexts/ThemeContext';

// Type the icons properly
const MenuIcon = FiMenu as React.FC<React.SVGProps<SVGSVGElement>>;
const CloseIcon = FiX as React.FC<React.SVGProps<SVGSVGElement>>;
const SunIcon = FiSun as React.FC<React.SVGProps<SVGSVGElement>>;
const MoonIcon = FiMoon as React.FC<React.SVGProps<SVGSVGElement>>;
const MonitorIcon = FiMonitor as React.FC<React.SVGProps<SVGSVGElement>>;

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();

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

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Get icon based on current theme
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'system':
        return <MonitorIcon className="h-5 w-5" />;
      default:
        return <SunIcon className="h-5 w-5" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden -ml-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                  Реестр 2.0
                </span>
              </a>
            </div>
          </div>

          {/* Auth section - right aligned */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle button */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
              title={`Current theme: ${theme}`}
            >
              {getThemeIcon()}
            </button>

            {loading ? (
              <div className="text-gray-600 dark:text-gray-300">Загрузка...</div>
            ) : user ? (
              // User is authenticated - show user info and sign out
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{user.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">UID: {user.uid.substring(0, 8)}...</div>
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