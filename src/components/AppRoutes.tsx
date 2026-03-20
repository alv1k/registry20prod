import React from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import VehiclesMaintenance from '../pages/VehiclesMaintenance/index';
import Finance from '../pages/Finance/index';
import Period from '../pages/Period/index';
import Recipes from '../pages/Recipes/index';
import Home from '../pages/Home';
import LoginForm from './LoginForm';
import AdminProtectedRoute from './AdminProtectedRoute';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const currentPage = useStore((state) => state.currentPage);

  return (
    <div data-current-page={currentPage}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/vehicles_maintenance" element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VehiclesMaintenance />
            </motion.div>
          } />
          <Route path="/finance" element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Finance />
            </motion.div>
          } />
          <Route path="/domestic" element={<Navigate to="/" replace />} />
          <Route path="/period" element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminProtectedRoute>
                <Period />
              </AdminProtectedRoute>
            </motion.div>
          } />
          <Route path="/recipes" element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Recipes />
            </motion.div>
          } />
          <Route path="/login" element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm onSuccess={() => {}} />
            </motion.div>
          } />
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Home />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default AppRoutes;