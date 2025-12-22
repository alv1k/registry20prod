import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiHome, FiDollarSign, FiTruck, FiHome as FiHouse, FiBook, FiChevronRight, FiCoffee } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import { useAdminAccess } from '../hooks/useAdminAccess';
import Tooltip from './Tooltip';

// Type the icons properly
const CloseIcon = FiX as React.FC<React.SVGProps<SVGSVGElement>>;
const HomeIcon = FiHome as React.FC<React.SVGProps<SVGSVGElement>>;
const DollarSignIcon = FiDollarSign as React.FC<React.SVGProps<SVGSVGElement>>;
const TruckIcon = FiTruck as React.FC<React.SVGProps<SVGSVGElement>>;
const HouseIcon = FiHouse as React.FC<React.SVGProps<SVGSVGElement>>;
const BookIcon = FiBook as React.FC<React.SVGProps<SVGSVGElement>>;
const CoffeeIcon = FiCoffee as React.FC<React.SVGProps<SVGSVGElement>>;

interface SidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen = false, setSidebarOpen }) => {
  const isAdmin = useAdminAccess();

  const navItems = [
    { name: 'ТО авто', icon: TruckIcon, path: '/vehicles_maintenance' },
    { name: 'Финансы', icon: DollarSignIcon, path: '/finance' },
    ...(isAdmin ? [{ name: 'Каталог', icon: BookIcon, path: '/period' }] : []),
    { name: 'Рецепты', icon: CoffeeIcon, path: '/recipes' },
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
    <>
      {/* Backdrop overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar with animation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="w-64 bg-white shadow-lg h-screen flex flex-col z-30 fixed inset-y-0 left-0 md:hidden"
          >
            {/* Mobile header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <div className="text-base font-bold text-gray-800 ml-2">Меню</div>
              <button
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Close sidebar"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-2 mt-4 overflow-y-auto">
              <ul className="space-y-1">
                <li  className="w-fit">
                  <Tooltip content="Главная" position={sidebarOpen ? 'right' : 'bottom'}>
                    <Link
                      to="/"
                      onClick={() => handleClick('/')}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                        location.pathname === '/'
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${
                        sidebarOpen ? '' : 'justify-center'
                      }`}
                    >
                      <HomeIcon className="h-5 w-5" />
                      <span
                        className={`${
                          sidebarOpen ? 'ml-3 font-medium text-sm' : 'hidden' // Hide text when collapsed
                        }`}
                      >
                        Главная
                      </span>
                    </Link>
                  </Tooltip>
                </li>

                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={`${item.name}-${index}`}>
                      <Tooltip content={item.name} position={sidebarOpen ? 'right' : 'bottom'}>
                        <Link
                          to={item.path}
                          onClick={() => handleClick(item.path)}
                          className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                            location.pathname === item.path
                              ? 'bg-blue-50 text-blue-600 shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }
                          ${
                            sidebarOpen ? '' : 'justify-center'
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span
                            className={`${
                              sidebarOpen ? 'ml-3 font-medium text-sm' : 'hidden' // Hide text when collapsed
                            }`}
                          >
                            {item.name}
                          </span>
                        </Link>
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="text-xs sm:text-[0.6rem] text-gray-500 font-medium uppercase tracking-wider">
                Версия: Реестр 2.0
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar without animation - always visible */}
      <div className={`${
        sidebarOpen ? 'w-64' : 'w-fit' // Full width when open, narrow when collapsed
      } bg-white shadow-lg h-screen flex flex-col z-30 md:static fixed inset-y-0 left-0 hidden md:flex md:translate-x-0`}>
        <nav className="flex-1 p-2 mt-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Tooltip content="Главная" position={sidebarOpen ? 'right' : 'bottom'}>
                <Link
                  to="/"
                  onClick={() => handleClick('/')}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    location.pathname === '/'
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${
                    sidebarOpen ? '' : 'justify-center'
                  }`}
                >
                  <HomeIcon className="h-5 w-5" />
                  <span
                    className={`${
                      sidebarOpen ? 'ml-3 font-medium text-sm' : 'hidden' // Hide text when collapsed
                    }`}
                  >
                    Главная
                  </span>
                </Link>
              </Tooltip>
            </li>

            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={`${item.name}-${index}`}>
                  <Tooltip content={item.name} position={sidebarOpen ? 'right' : 'bottom'}>
                    <Link
                      to={item.path}
                      onClick={() => handleClick(item.path)}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${
                        sidebarOpen ? '' : 'justify-center'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span
                        className={`${
                          sidebarOpen ? 'ml-3 font-medium text-sm' : 'hidden' // Hide text when collapsed
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`p-4 border-t border-gray-200 ${sidebarOpen ? '' : 'hidden'} flex-shrink-0`}>
          <div className="text-xs sm:text-[0.6rem] text-gray-500 font-medium uppercase tracking-wider">
            Версия: Реестр 2.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;