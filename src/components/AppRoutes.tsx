import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from '../store/useStore';
import VehiclesMaintenance from '../pages/VehiclesMaintenance/index';
import Finance from '../pages/Finance/index';
import Domestic from '../pages/Domestic/index';
import Period from '../pages/Period/index';
import Recipes from '../pages/Recipes/index';
import Home from '../pages/Home';
import LoginForm from './LoginForm';

const AppRoutes: React.FC = () => {
  const currentPage = useStore((state) => state.currentPage);

  return (
    <div data-current-page={currentPage}>
      <Routes>
        <Route path="/vehicles_maintenance" element={<VehiclesMaintenance />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/domestic" element={<Domestic />} />
        <Route path="/period" element={<Period />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/login" element={<LoginForm onSuccess={() => {}} />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;