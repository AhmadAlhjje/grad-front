'use client';

import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  iconBgColor = 'bg-primary-100',
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-secondary-200 p-6 shadow-card',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-sm font-medium',
                  trend.isPositive ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-secondary-400">من الشهر الماضي</span>
            </div>
          )}

          {description && (
            <p className="mt-2 text-sm text-secondary-500">{description}</p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl',
              iconBgColor
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Mini Stats Card for compact layouts
interface MiniStatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function MiniStatsCard({ title, value, icon, className }: MiniStatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-secondary-200 p-4 flex items-center gap-4',
        className
      )}
    >
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-secondary-500">{title}</p>
        <p className="text-xl font-semibold text-secondary-900">{value}</p>
      </div>
    </div>
  );
}
