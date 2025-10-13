import React from 'react';
import { 
  MdMenu as MdMenuBase, 
  MdOutlineMenu as MdOutlineMenuBase
} from 'react-icons/md'; // Material Design icons

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const MdMenu = MdMenuBase as any;
  const MdOutlineMenu = MdOutlineMenuBase as any;

  return (
    <header className="bg-[#033835] shadow-md">
      <div className="mx-auto px-6">
        <div className="flex  h-16">
          
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
              <a href="#">
                <img src="C:\Users\pc1\Documents\workingdir\sample-table\src\assets\images\logo.png" alt="logo" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;