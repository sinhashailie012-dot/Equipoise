import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-xl',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E2A26]/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          role="dialog"
          aria-modal="true"
          className={`relative transform overflow-hidden rounded-[4px] bg-[#FBF8F2] border border-[#DDD4C4] text-left shadow-modal transition-all my-8 w-full ${maxWidth}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || subtitle) && (
            <div className="px-6 pt-6 pb-4 border-b border-[#DDD4C4]">
              <div className="flex items-start justify-between">
                <div>
                  {title && (
                    <h3 className="font-heading text-2xl font-normal text-[#1E2A26] leading-snug">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-[#6B6A60]">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[4px] p-1 text-[#6B6A60] hover:text-[#1E2A26] hover:bg-[#EAE4D8] focus:outline-none focus:ring-2 focus:ring-[#B8862F] transition-colors -mr-1"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="px-6 py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-[#F7F3EB] border-t border-[#DDD4C4] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
