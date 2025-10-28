import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ModalConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

interface ModalContextType {
  modals: ModalConfig[];
  openModal: (config: ModalConfig) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = (config: ModalConfig) => {
    setModals(prev => [...prev, config]);
  };

  const closeModal = (id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  const closeAllModals = () => {
    setModals([]);
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
      {/* Render all open modals */}
      {modals.map(modal => {
        const ModalComponent = modal.component;
        return <ModalComponent key={modal.id} isOpen={true} {...modal.props} />;
      })}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};