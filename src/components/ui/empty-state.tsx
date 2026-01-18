'use client';

import { cn } from '@/lib/utils';
import { FolderOpenIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'folder' | 'document' | 'warning' | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: FolderOpenIcon,
  document: DocumentIcon,
  warning: ExclamationTriangleIcon,
};

export function EmptyState({
  title,
  description,
  icon = 'folder',
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] || null : null;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
        {IconComponent ? (
          <IconComponent className="h-8 w-8 text-secondary-400" />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-lg font-medium text-secondary-900 text-center">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-secondary-500 text-center max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Error State
interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'حدث خطأ',
  message,
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  // Extract error message from error object if not provided
  const getErrorMessage = (): string => {
    if (message) return message;
    if (!error) return 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';

    if (error instanceof Error) {
      return error.message;
    }

    // Handle axios error shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosError = error as any;
    if (axiosError?.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError?.message) {
      return axiosError.message;
    }

    return 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
  };

  const errorMessage = getErrorMessage();

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mb-4">
        <ExclamationTriangleIcon className="h-8 w-8 text-danger-500" />
      </div>
      <h3 className="text-lg font-medium text-secondary-900 text-center">{title}</h3>
      <p className="mt-2 text-sm text-secondary-500 text-center max-w-sm">{errorMessage}</p>

      {/* Show detailed error in development */}
      {process.env.NODE_ENV === 'development' && error ? (
        <details className="mt-4 w-full max-w-md">
          <summary className="cursor-pointer text-xs text-secondary-400 hover:text-secondary-600">
            تفاصيل الخطأ (للمطورين)
          </summary>
          <pre className="mt-2 p-3 bg-secondary-100 rounded-lg text-xs overflow-auto max-h-32 text-danger-600 text-start" dir="ltr">
            {error instanceof Error ? error.stack || error.message : JSON.stringify(error, null, 2)}
          </pre>
        </details>
      ) : null}

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
