import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-[#FBF8F2] border border-[#DDD4C4] rounded-[4px] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#EAE4D8] flex items-center justify-center mb-4 text-[#6B6A60]">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="font-heading text-lg font-medium text-[#1E2A26] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#6B6A60] max-w-md mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

