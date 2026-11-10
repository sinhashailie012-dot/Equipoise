import React from 'react';
import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  selected = false,
  disabled = false,
  className,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded cursor-pointer disabled:cursor-not-allowed select-none text-sm outline-none";

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  let variantStyles = "";

  if (variant === 'primary') {
    if (selected) {
      variantStyles = "bg-[#1B342A] text-white";
    } else if (disabled) {
      variantStyles = "bg-[#E8E2D5] text-[#9C9689] border border-transparent shadow-none";
    } else {
      variantStyles = "bg-brand-800 text-white hover:bg-brand-700 active:bg-brand-900 focus-visible:focus-ochre shadow-subtle";
    }
  } else if (variant === 'secondary') {
    if (selected) {
      variantStyles = "bg-brand-800 text-white border border-brand-800";
    } else if (disabled) {
      variantStyles = "bg-[#F7F3EB] text-[#A3ACA7] border border-[#E3DCCE]";
    } else {
      variantStyles = "bg-[#FBF8F2] text-ink-primary border border-[#DFD8CB] hover:bg-[#F5EEE2] active:bg-[#ECE5D8] focus-visible:focus-ochre shadow-subtle";
    }
  } else if (variant === 'subtle') {
    variantStyles = "bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-[#EAE4D8]/50 focus-visible:focus-ochre";
  } else if (variant === 'danger') {
    variantStyles = "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:focus-ochre";
  }

  return (
    <button
      disabled={disabled}
      className={cn(baseStyles, sizeStyles[size], variantStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
}

