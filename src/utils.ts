
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names and handles Tailwind CSS class conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique ID for evidences.
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

/**
 * Formats a date string to a readable format in Spanish.
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
