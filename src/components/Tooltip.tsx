import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = '' 
}) => {
  const [visible, setVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'top-1/2 right-full transform -translate-y-1/2 mr-2';
      case 'right':
        return 'top-1/2 left-full transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded py-1 px-2 whitespace-nowrap max-w-xs break-words ${getPositionClasses()} ${className}`}
          style={{
            // Ensure tooltip doesn't extend beyond viewport
            maxWidth: '200px',
            zIndex: 9999, // Very high z-index to ensure it always appears on top
          }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'top-1/2 left-[-4px] -translate-y-1/2'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;