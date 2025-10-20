import React from 'react';
import { 
  MdMenu as MdMenuBase, 
  MdOutlineMenu as MdOutlineMenuBase
} from 'react-icons/md'; // Material Design icons
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase/authService';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const MdMenu = MdMenuBase as any;
  const MdOutlineMenu = MdOutlineMenuBase as any;
  
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
    <header className="bg-[#033835] shadow-md">
      <div className="mx-auto px-6">
        <div className="flex h-16">
          
          <div className="flex items-center md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
          <div className="hidden md:flex items-center">
            <MdMenu 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              size={24} 
              className="text-gray-700 hover:text-indigo-600 cursor-pointer w-6 h-6" 
            />
            <div className="ms-12" onClick={ ()=> console.log('click logo') }>
              <a href="/">
                <img src="/favicon.png" alt="logo" className="h-10 w-10" />
              </a>
            </div>
          </div>
          
          {/* Auth section - right aligned */}
          <div className="ml-auto flex items-center space-x-4">
            {loading ? (
              <div className="text-white">Загрузка...</div>
            ) : user ? (
              // User is authenticated - show user info and sign out
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-sm text-white">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs opacity-80">UID: {user.uid.substring(0, 8)}...</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Выйти
                </button>
              </div>
            ) : (
              // User is not authenticated - show sign in
              <a 
                href="/login" 
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Войти
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;