import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-base px-4 py-2.5 gap-2.5 h-11',
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-950 active:bg-indigo-700 border border-indigo-500/30',
    secondary:
      'bg-[#191C28] hover:bg-[#222538] text-gray-200 border border-[#2B2F44] active:bg-[#151722]',
    outline:
      'bg-transparent hover:bg-white/5 text-gray-300 border border-[#2B2F44] active:bg-white/10',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/30 shadow-sm active:bg-rose-700',
    ghost:
      'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}
