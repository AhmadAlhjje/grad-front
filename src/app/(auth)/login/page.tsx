'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { Button, Input, Card } from '@/components/ui';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">أ</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">منصة قياس الأثر المجتمعي</h1>
          <p className="text-secondary-500 mt-2">مرحباً بعودتك! يرجى تسجيل الدخول للمتابعة</p>
        </div>

        {/* Login Form */}
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

            <div className="relative">
              <Input
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<LockClosedIcon className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">تذكرني</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoggingIn}>
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-secondary-500">ليس لديك حساب؟</span>{' '}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              إنشاء حساب جديد
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
