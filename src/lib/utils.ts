import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Arabic locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format date to relative time (e.g., "منذ 5 دقائق")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  return formatDate(date);
}

/**
 * Format number with Arabic locale
 */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return num.toLocaleString('ar-SA', options);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-success-50 text-success-700',
    completed: 'bg-primary-50 text-primary-700',
    draft: 'bg-secondary-100 text-secondary-700',
    suspended: 'bg-warning-50 text-warning-700',
    closed: 'bg-danger-50 text-danger-700',
    archived: 'bg-secondary-200 text-secondary-600',
  };
  return colors[status] || 'bg-secondary-100 text-secondary-700';
}

/**
 * Get survey type label in Arabic
 */
export function getSurveyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    pre_evaluation: 'تقييم قبلي',
    post_evaluation: 'تقييم بعدي',
    needs_assessment: 'دراسة احتياج',
    satisfaction: 'رضا المستفيدين',
    feedback: 'تغذية راجعة',
  };
  return labels[type] || type;
}

/**
 * Get project type label in Arabic
 */
export function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    intervention: 'تدخل',
    needs_assessment: 'دراسة احتياج',
    evaluation: 'تقييم',
    mixed: 'مختلط',
  };
  return labels[type] || type;
}

/**
 * Get project status label in Arabic
 */
export function getProjectStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    active: 'نشط',
    completed: 'مكتمل',
    archived: 'مؤرشف',
  };
  return labels[status] || status;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
