'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Notifications } from './notifications';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, sidebarCollapsed, locale } = useUIStore();

  // Set initial direction based on locale
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <Sidebar />

      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarOpen
            ? sidebarCollapsed
              ? 'ms-20'
              : 'ms-64'
            : 'ms-0'
        )}
      >
        <div className="p-6">{children}</div>
      </main>

      <Notifications />
    </div>
  );
}
