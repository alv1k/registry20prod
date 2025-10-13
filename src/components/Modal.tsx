import React, { useEffect, useState, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  
  const [hasFocusedElement, setHasFocusedElement] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const handleFocusIn = () => setHasFocusedElement(true);
      const handleFocusOut = () => {
        // Устанавливаем небольшую задержку, чтобы дать браузеру обработать фокус 
        // на другом элементе перед проверкой
        setTimeout(() => {
          if (modalRef.current) {
            // Проверяем, есть ли фокус на каком-либо элементе внутри модального окна
            const activeElement = document.activeElement;
            if (!activeElement || !modalRef.current.contains(activeElement)) {
              setHasFocusedElement(false);
            }
          }
        }, 0);
      };

      // Находим все интерактивные элементы внутри модального окна
      const inputs = modalRef.current.querySelectorAll('input, textarea, button, select, [tabindex]:not([tabindex="-1"])');
      
      inputs.forEach(input => {
        (input as HTMLElement).addEventListener('focus', handleFocusIn);
        (input as HTMLElement).addEventListener('blur', handleFocusOut);
      });

      return () => {
        inputs.forEach(input => {
          (input as HTMLElement).removeEventListener('focus', handleFocusIn);
          (input as HTMLElement).removeEventListener('blur', handleFocusOut);
        });
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Закрывать модальное окно только если клик был на оверлее (а не внутри модального окна)
    if (e.target === e.currentTarget) {
      // Закрываем только если внутри модального окна нет элемента с фокусом
      if (!hasFocusedElement) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" 
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;