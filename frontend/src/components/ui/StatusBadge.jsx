import React from 'react';
import { cn, getStatusLabel } from '../../lib/utils';

export function StatusBadge({ status, label, className, size = 'md' }) {
  const normalized = status ? status.toLowerCase() : 'balanced';
  const displayLabel = label || getStatusLabel(normalized);

  const styleMap = {
    spare: {
      bg: 'bg-status-spare-bg',
      text: 'text-status-spare-text',
      dot: 'bg-status-spare-dot',
    },
    balanced: {
      bg: 'bg-status-balanced-bg',
      text: 'text-status-balanced-text',
      dot: 'bg-status-balanced-dot',
    },
    stretched: {
      bg: 'bg-status-stretched-bg',
      text: 'text-status-stretched-text',
      dot: 'bg-status-stretched-dot',
    },
    overloaded: {
      bg: 'bg-status-overloaded-bg',
      text: 'text-status-overloaded-text',
      dot: 'bg-status-overloaded-dot',
    },
    critical: {
      bg: 'bg-status-critical-bg',
      text: 'text-status-critical-text',
      dot: 'bg-status-critical-dot',
    },
  };

  const current = styleMap[normalized] || styleMap.balanced;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        current.bg,
        current.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", current.dot)} />
      <span>{displayLabel}</span>
    </span>
  );
}

