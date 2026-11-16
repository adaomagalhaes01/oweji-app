import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#E98A9A] hover:bg-[#C95F72] text-white shadow-sm hover:shadow active:scale-[0.98]',
    secondary:
      'bg-[#FCE7EC] hover:bg-[#fad4dc] text-[#C95F72] active:scale-[0.98]',
    outline:
      'bg-white border border-[#F0E5E8] hover:border-[#E98A9A] text-[#252225] hover:text-[#C95F72] active:scale-[0.98]',
    danger:
      'bg-[#D95C68] hover:bg-[#c04b57] text-white shadow-sm active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[#FCE7EC]/50 text-[#777277] hover:text-[#252225]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
