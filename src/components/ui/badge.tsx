'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary-100 text-secondary-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-blue-50 text-blue-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-secondary-500',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-blue-500',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

// Status Badge with predefined variants
interface StatusBadgeProps {
  status: 'active' | 'draft' | 'completed' | 'suspended' | 'closed' | 'archived';
  size?: BadgeSize;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'نشط' },
  draft: { variant: 'default', label: 'مسودة' },
  completed: { variant: 'primary', label: 'مكتمل' },
  suspended: { variant: 'warning', label: 'معلق' },
  closed: { variant: 'danger', label: 'مغلق' },
  archived: { variant: 'default', label: 'مؤرشف' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
}
