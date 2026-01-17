'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { Button, Input, Card } from '@/components/ui';
import { EnvelopeIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isSendingResetEmail } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data.email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-xl font-bold text-secondary-900 mb-2">تم إرسال الرابط</h2>
            <p className="text-secondary-500 mb-6">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى
              <br />
              <span className="font-medium text-secondary-700">{getValues('email')}</span>
            </p>
            <p className="text-sm text-secondary-400 mb-6">
              يرجى التحقق من بريدك الإلكتروني واتباع التعليمات
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">أ</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">استعادة كلمة المرور</h1>
          <p className="text-secondary-500 mt-2">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@domain.com"
              leftIcon={<EnvelopeIcon className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isSendingResetEmail}>
              إرسال رابط الاستعادة
            </Button>
          </form>

          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowRightIcon className="h-4 w-4" />
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-secondary-400 mt-8">
          جميع الحقوق محفوظة © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
