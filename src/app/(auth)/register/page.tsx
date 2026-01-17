'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { Button, Input, Card } from '@/components/ui';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const registerSchema = z
  .object({
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    organization: z.string().optional(),
    department: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      organization: '',
      department: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">أ</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">إنشاء حساب جديد</h1>
          <p className="text-secondary-500 mt-2">انضم إلينا لبدء قياس الأثر المجتمعي</p>
        </div>

        {/* Register Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="الاسم الكامل"
              type="text"
              placeholder="أحمد محمد"
              required
              leftIcon={<UserIcon className="h-5 w-5" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@domain.com"
              required
              leftIcon={<EnvelopeIcon className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
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

              <Input
                label="تأكيد كلمة المرور"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                leftIcon={<LockClosedIcon className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Input
              label="رقم الهاتف"
              type="tel"
              placeholder="+966501234567"
              leftIcon={<PhoneIcon className="h-5 w-5" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="المنظمة"
                type="text"
                placeholder="اسم المنظمة"
                leftIcon={<BuildingOfficeIcon className="h-5 w-5" />}
                error={errors.organization?.message}
                {...register('organization')}
              />

              <Input
                label="القسم"
                type="text"
                placeholder="اسم القسم"
                error={errors.department?.message}
                {...register('department')}
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-1 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-secondary-600">
                أوافق على{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  شروط الاستخدام
                </Link>{' '}
                و{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isRegistering}>
              إنشاء حساب
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-secondary-500">لديك حساب بالفعل؟</span>{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              تسجيل الدخول
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
