import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface SidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen = false, setSidebarOpen }) => {
  const navItems = [
    // { name: 'Корреспондентский', icon: '✉️', path: '/correspondent' },
    { name: 'ТО авто', icon: '🚗', path: '/vehicles_maintenance' },
    { name: 'Финансы', icon: '💰', path: '/finance' },
    { name: 'Быт', icon: '🏠', path: '/domestic' },
    { name: 'Каталог', icon: '📅', path: '/period' },
  ];

  const location = useLocation();
  const setCurrentPage = useStore((state) => state.setCurrentPage);

  const handleClick = (path: string) => {
    setCurrentPage(path);
    if (setSidebarOpen) {
      // Only close on mobile, keep open on desktop when collapsing
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        // On desktop, just navigate but don't close the sidebar
      }
    }
  };

  return (
    <div 
      className={`${
        sidebarOpen ? 'w-64' : 'w-20' // Full width when open, narrow when collapsed
      } bg-white shadow-md h-full flex flex-col md:static md:translate-x-0 z-30 fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-4 flex justify-end md:hidden">
        <button 
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 p-2 mt-2">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path} 
                onClick={() => handleClick(item.path)}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-600'
                } 
                ${
                  sidebarOpen ? '' : 'justify-center'
                }`}                
              >
                <span className="text-lg">{item.icon}</span>
                <span 
                  className={`${
                    sidebarOpen ? 'ml-3 font-medium' : 'hidden' // Hide text when collapsed
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;