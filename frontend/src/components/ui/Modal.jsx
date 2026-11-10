import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#132620]/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full bg-card rounded-xl border border-border-subtle shadow-modal z-10 overflow-hidden my-auto",
          maxWidth,
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-border-subtle/60">
            <div>
              {title && (
                <h3 className="text-xl font-serif text-ink-primary font-normal tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-ink-secondary mt-1">{subtitle}</p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-ink-muted hover:text-ink-primary p-1 rounded hover:bg-[#EAE4D8]/60 transition-colors focus-visible:focus-ochre"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

