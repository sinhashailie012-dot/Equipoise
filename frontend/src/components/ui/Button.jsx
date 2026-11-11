import React from 'react';

/**
 * Reusable Button component adhering to Equipoise Design System:
 * - 4px border radius
 * - 1px lines
 * - 2px ochre focus outline
 * - No gradients
 */
export function Button({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md',          // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors select-none rounded-[4px] border text-sm focus:outline-none focus:ring-2 focus:ring-[#B8862F] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 h-7',
    md: 'px-3.5 py-1.5 text-sm gap-2 h-9',
    lg: 'px-4 py-2 text-base gap-2.5 h-10',
  };

  const variantClasses = {
    primary:
      'bg-[#234236] text-white border-[#234236] hover:bg-[#1B352B] active:bg-[#162B23] shadow-subtle',
    secondary:
      'bg-[#FBF8F2] text-[#1E2A26] border-[#DDD4C4] hover:bg-[#F2ECE0] active:bg-[#EAE2D2] shadow-subtle',
    ghost:
      'bg-transparent text-[#1E2A26] border-transparent hover:bg-[#EAE4D8]/60 active:bg-[#EAE4D8]',
    danger:
      'bg-[#7A2E3A] text-white border-[#7A2E3A] hover:bg-[#611C28] active:bg-[#4E141E] shadow-subtle',
    darkSecondary:
      'bg-[#2E5043] text-white border-[#2E5043] hover:bg-[#396253]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.secondary} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}

export default Button;
