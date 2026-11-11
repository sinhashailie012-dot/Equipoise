import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'success', duration = 3500 }) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast({ message: msg, type: 'success' }),
    error: (msg) => addToast({ message: msg, type: 'error' }),
    warning: (msg) => addToast({ message: msg, type: 'warning' }),
    info: (msg) => addToast({ message: msg, type: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] shadow-modal text-[#1E2A26] animate-slide-up"
            role="status"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#7E9C7A] shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#D4A537] shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#7A2E3A] shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#4F7A7F] shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs md:text-sm font-medium leading-relaxed">
              {t.message}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-[#6B6A60] hover:text-[#1E2A26] p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return dummy toast functions if used outside provider
    return {
      success: (msg) => console.info(msg),
      error: (msg) => console.error(msg),
      warning: (msg) => console.warn(msg),
      info: (msg) => console.info(msg),
    };
  }
  return context;
}

export default ToastProvider;

