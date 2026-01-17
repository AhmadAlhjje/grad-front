'use client';

import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function ThankYouPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md text-center py-12 px-8">
        <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-12 w-12 text-success-500" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-3">
          شكراً لك!
        </h1>
        <p className="text-secondary-600 mb-8">
          تم استلام ردك بنجاح. نقدر وقتك ومشاركتك في هذا الاستبيان.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full">العودة للرئيسية</Button>
          </Link>
          <Link href="/surveys">
            <Button variant="outline" className="w-full">
              عرض الاستبيانات الأخرى
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
