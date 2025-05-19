import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'interactive';
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}: CardProps) {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-lg transition-all duration-200';
  
  const variants = {
    default: 'shadow-sm border border-gray-200 dark:border-gray-700',
    hover: 'shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
    interactive: 'shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transform hover:-translate-y-0.5'
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 