'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { useUIStore, useAuthStore } from '@/store';
import { useAuth } from '@/hooks';
import { cn, getInitials } from '@/lib/utils';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { Locale } from '@/i18n/config';

export function Header() {
  const { toggleSidebar, locale, setLocale } = useUIStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const toggleLocale = () => {
    const newLocale: Locale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    // Update document direction
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-white border-b border-secondary-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">أ</span>
              </div>
              <span className="text-lg font-bold text-secondary-900 hidden sm:block">
                منصة قياس الأثر
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
              title={locale === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <GlobeAltIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-danger-500 rounded-full" />
            </button>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user ? getInitials(user.name) : 'م'}
                  </span>
                </div>
                <div className="hidden sm:block text-start">
                  <p className="text-sm font-medium text-secondary-900">{user?.name || 'المستخدم'}</p>
                  <p className="text-xs text-secondary-500">{user?.role === 'admin' ? 'مدير' : user?.role === 'manager' ? 'مشرف' : 'مشاهد'}</p>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute end-0 mt-2 w-56 origin-top-end rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/profile"
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                            active ? 'bg-secondary-100' : ''
                          )}
                        >
                          <UserCircleIcon className="h-5 w-5 text-secondary-500" />
                          <span>الملف الشخصي</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings"
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                            active ? 'bg-secondary-100' : ''
                          )}
                        >
                          <Cog6ToothIcon className="h-5 w-5 text-secondary-500" />
                          <span>الإعدادات</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="border-t border-secondary-200 my-1" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={cn(
                            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-danger-600',
                            active ? 'bg-danger-50' : ''
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          <span>تسجيل الخروج</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
