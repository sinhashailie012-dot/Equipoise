import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatHours(hours) {
  return `${hours} hrs`;
}

export function getStatusBand(percentage) {
  if (percentage < 80) return 'spare';
  if (percentage <= 100) return 'balanced';
  if (percentage <= 110) return 'stretched';
  if (percentage <= 125) return 'overloaded';
  return 'critical';
}

export function getStatusLabel(status) {
  switch (status) {
    case 'spare':
      return 'Spare capacity';
    case 'balanced':
      return 'Balanced';
    case 'stretched':
      return 'Stretched';
    case 'overloaded':
      return 'Overloaded';
    case 'critical':
      return 'Critical';
    default:
      return status;
  }
}

