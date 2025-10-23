import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'secondary', 
  size = 'md', 
  fullWidth = false,
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'rounded transition-colors font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button 
      className={buttonClasses} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;