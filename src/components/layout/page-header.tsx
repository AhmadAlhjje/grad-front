'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  backLink,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-3" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 space-x-reverse text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && <span className="mx-2 text-secondary-400">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-secondary-500 hover:text-primary-600 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-secondary-700">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {backLink && (
            <button
              onClick={() => router.push(backLink)}
              className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-secondary-500">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
