import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Correspondent from '../pages/Correspondent';
import VehiclesMaintenance from '../pages/VehiclesMaintenance';
import Finance from '../pages/Finance';
import Domestic from '../pages/Domestic';
import PlannedBudget from '../pages/PlannedBudget';
import TabsDemo from '../pages/TabsDemo';
import LoginForm from './LoginForm';

const AppRoutes: React.FC = () => {
  const currentPage = useStore((state) => state.currentPage);

  return (
    <div data-current-page={currentPage}>
      <Routes>
        <Route path="/correspondent" element={<Correspondent />} />
        <Route path="/vehicles_maintenance" element={<VehiclesMaintenance />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/planned-budget" element={<PlannedBudget />} />
        <Route path="/domestic" element={<Domestic />} />
        <Route path="/tabs-demo" element={<TabsDemo />} />
        <Route path="/login" element={<LoginForm onSuccess={() => {}} />} />
        <Route path="/" element={<Finance />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;