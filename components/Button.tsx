import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const baseStyles = "px-6 py-3 rounded text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-offset-1 tracking-wide";
  
  const variants = {
    // Primary: White/Dark background, Black/White text
    primary: isDark
      ? "bg-white text-black hover:bg-zinc-200 focus:ring-white disabled:bg-zinc-700 disabled:text-zinc-500"
      : "bg-black text-white hover:bg-zinc-800 focus:ring-black disabled:bg-zinc-300 disabled:text-zinc-500",
    // Secondary: Dark Gray/Light Gray background
    secondary: isDark
      ? "bg-zinc-800 hover:bg-zinc-700 text-white focus:ring-zinc-500 disabled:bg-zinc-900 disabled:text-zinc-600"
      : "bg-zinc-200 hover:bg-zinc-300 text-black focus:ring-zinc-400 disabled:bg-zinc-100 disabled:text-zinc-400",
    // Outline: Transparent, Border
    outline: isDark
      ? "border border-zinc-700 text-zinc-300 hover:border-white hover:text-white focus:ring-white bg-transparent"
      : "border border-zinc-400 text-zinc-700 hover:border-black hover:text-black focus:ring-black bg-transparent"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading || disabled ? 'cursor-not-allowed opacity-80' : ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};