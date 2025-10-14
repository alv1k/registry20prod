import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Correspondent from '../pages/Correspondent';
import Transport from '../pages/Transport';
import Finance from '../pages/Finance';
import Domestic from '../pages/Domestic';
import LoginForm from './LoginForm';

const AppRoutes: React.FC = () => {
  const currentPage = useStore((state) => state.currentPage);

  return (
    <div data-current-page={currentPage}>
      <Routes>
        <Route path="/correspondent" element={<Correspondent />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/domestic" element={<Domestic />} />
        <Route path="/login" element={<LoginForm onSuccess={() => {}} />} />
        <Route path="/" element={<Finance />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;