import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue while loading this data.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[#FDF7F7] border border-[#ECCBC1] rounded-[4px] ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[#F5EAEB] flex items-center justify-center mb-3 text-[#7A2E3A]">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-base font-medium text-[#7A2E3A] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#6B6A60] max-w-md mb-4">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={RefreshCw}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;

