'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-100 flex items-center justify-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
        </div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-secondary-600 mb-4">
          {error.message || 'عذراً، حدث خطأ أثناء تحميل الصفحة'}
        </p>
        {error.digest && (
          <p className="text-xs text-secondary-400 mb-4 font-mono">
            رمز الخطأ: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            <ArrowPathIcon className="h-5 w-5 me-2" />
            إعادة المحاولة
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            العودة للرئيسية
          </Button>
        </div>

        {/* Show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-start">
            <summary className="cursor-pointer text-sm text-secondary-500 hover:text-secondary-700">
              تفاصيل الخطأ (للمطورين)
            </summary>
            <pre className="mt-2 p-4 bg-secondary-100 rounded-lg text-xs overflow-auto max-h-48 text-danger-600">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
}
