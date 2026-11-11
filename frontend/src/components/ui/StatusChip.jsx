import React from 'react';

const STATUS_VARIANTS = {
  spare: {
    label: 'Spare capacity',
    dot: 'bg-[#4F7A7F]',
    bg: 'bg-[#E7EFF0]',
    text: 'text-[#2D5155]',
    border: 'border-[#CADBDC]',
  },
  balanced: {
    label: 'Balanced',
    dot: 'bg-[#7E9C7A]',
    bg: 'bg-[#EAF0E9]',
    text: 'text-[#375734]',
    border: 'border-[#CCE0CB]',
  },
  stretched: {
    label: 'Stretched',
    dot: 'bg-[#D4A537]',
    bg: 'bg-[#FAF3E1]',
    text: 'text-[#7B5E1A]',
    border: 'border-[#EBDCBA]',
  },
  overloaded: {
    label: 'Overloaded',
    dot: 'bg-[#C4613F]',
    bg: 'bg-[#F8ECE7]',
    text: 'text-[#873B21]',
    border: 'border-[#ECCBC1]',
  },
  critical: {
    label: 'Critical',
    dot: 'bg-[#7A2E3A]',
    bg: 'bg-[#F5EAEB]',
    text: 'text-[#611C28]',
    border: 'border-[#E7C6C9]',
  },
};

export function StatusChip({
  status = 'balanced',
  label,
  showDot = true,
  className = '',
  size = 'md',
}) {
  const normalizedKey = (status || '').toLowerCase().replace(/[^a-z]/g, '');
  
  let variantKey = 'balanced';
  if (normalizedKey.includes('spare')) variantKey = 'spare';
  else if (normalizedKey.includes('stretch')) variantKey = 'stretched';
  else if (normalizedKey.includes('overload')) variantKey = 'overloaded';
  else if (normalizedKey.includes('critical')) variantKey = 'critical';
  else if (normalizedKey.includes('balance') || normalizedKey.includes('ontrack')) variantKey = 'balanced';

  const variant = STATUS_VARIANTS[variantKey] || STATUS_VARIANTS.balanced;
  const displayText = label || variant.label;

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-[4px] border ${variant.bg} ${variant.text} ${variant.border} ${sizeStyles[size]} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${variant.dot}`} aria-hidden="true" />
      )}
      <span>{displayText}</span>
    </span>
  );
}

export default StatusChip;

