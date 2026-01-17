'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/store';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('admin' | 'manager' | 'viewer')[];
}

const navigation: NavItem[] = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: HomeIcon },
  { name: 'المشاريع', href: '/projects', icon: FolderIcon },
  { name: 'الاستبيانات', href: '/surveys', icon: ClipboardDocumentListIcon },
  { name: 'الردود', href: '/responses', icon: DocumentChartBarIcon },
  { name: 'التحليل', href: '/analysis', icon: LightBulbIcon },
  { name: 'المؤشرات', href: '/indicators', icon: ChartBarIcon },
  { name: 'المستفيدون', href: '/beneficiaries', icon: UserGroupIcon },
  { name: 'الأنشطة', href: '/activities', icon: CalendarDaysIcon },
  { name: 'المستخدمون', href: '/users', icon: UsersIcon, roles: ['admin'] },
  { name: 'الإعدادات', href: '/settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  if (!sidebarOpen) return null;

  return (
    <aside
      className={cn(
        'fixed top-0 start-0 z-40 h-screen pt-16 transition-all duration-300',
        'bg-white border-e border-secondary-200',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-600')} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'flex items-center justify-center gap-2 w-full px-3 py-2.5 mt-4',
            'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronDoubleRightIcon className="h-5 w-5" />
              <span className="text-sm">تصغير القائمة</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
