import React from 'react';

const Finance: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Финансовый</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Содержимое финансовой страницы.</p>
        <div className="mt-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default Finance;