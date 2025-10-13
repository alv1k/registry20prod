import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Correspondent from '../pages/Correspondent';
import Transport from '../pages/Transport';
import Finance from '../pages/Finance';
import Domestic from '../pages/Domestic';

const AppRoutes: React.FC = () => {
  const currentPage = useStore((state) => state.currentPage);

  return (
    <div data-current-page={currentPage}>
      <Routes>
        <Route path="/correspondent" element={<Correspondent />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/domestic" element={<Domestic />} />
        <Route path="/" element={
          <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mx-auto">
            <div className="p-8">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="mt-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default AppRoutes;