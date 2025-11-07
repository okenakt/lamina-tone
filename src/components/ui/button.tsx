import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-blue-400 hover:bg-blue-500 text-white border-blue-400 hover:border-blue-500',
  secondary: 'bg-gray-400 hover:bg-gray-500 text-white border-gray-400 hover:border-gray-500',
  success: 'bg-green-400 hover:bg-green-500 text-white border-green-400 hover:border-green-500',
  danger: 'bg-red-400 hover:bg-red-500 text-white border-red-400 hover:border-red-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation';
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  
  const disabledStyles = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';

  const focusStyles = variant === 'primary' 
    ? 'focus:ring-blue-400' 
    : variant === 'success' 
    ? 'focus:ring-green-400' 
    : variant === 'danger' 
    ? 'focus:ring-red-400' 
    : 'focus:ring-gray-400';

  return (
    <button
      className={`${baseStyles} ${variantClass} ${sizeClass} ${disabledStyles} ${focusStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const PlusIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

export const MinusIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
);