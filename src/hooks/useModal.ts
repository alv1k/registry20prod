import { useState } from 'react';

interface ModalState<T = any> {
  isOpen: boolean;
  data: T | null;
}

interface UseModalReturn<T> {
  modal: ModalState<T>;
  openModal: (data?: T) => void;
  closeModal: () => void;
  setData: (data: T | null) => void;
}

/**
 * Custom hook for managing modal state
 * @param initialState - Initial state for the modal (optional)
 * @returns Object containing modal state and functions to control it
 */
const useModal = <T = any>(initialState?: T): UseModalReturn<T> => {
  const [modal, setModal] = useState<ModalState<T>>({
    isOpen: false,
    data: initialState || null,
  });

  const openModal = (data?: T) => {
    try {
      setModal({
        isOpen: true,
        data: data !== undefined ? data : modal.data,
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  };

  const closeModal = () => {
    try {
      setModal({
        isOpen: false,
        data: modal.data, // Keep the data but close the modal
      });
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  };

  const setData = (data: T | null) => {
    try {
      setModal(prev => ({
        ...prev,
        data,
      }));
    } catch (error) {
      console.error('Error setting modal data:', error);
    }
  };

  return {
    modal,
    openModal,
    closeModal,
    setData,
  };
};

export default useModal;