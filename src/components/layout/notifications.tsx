'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const colorMap = {
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-500',
    border: 'border-success-200',
  },
  error: {
    bg: 'bg-danger-50',
    icon: 'text-danger-500',
    border: 'border-danger-200',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-500',
    border: 'border-warning-200',
  },
  info: {
    bg: 'bg-primary-50',
    icon: 'text-primary-500',
    border: 'border-primary-200',
  },
};

export function Notifications() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end px-4 py-6 sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type];
          const colors = colorMap[notification.type];

          return (
            <Transition
              key={notification.id}
              show={true}
              as={Fragment}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:-translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                className={cn(
                  'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
                  colors.bg,
                  colors.border,
                  'border'
                )}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Icon className={cn('h-6 w-6', colors.icon)} aria-hidden="true" />
                    </div>
                    <div className="ms-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-secondary-900">{notification.title}</p>
                      {notification.message && (
                        <p className="mt-1 text-sm text-secondary-600">{notification.message}</p>
                      )}
                    </div>
                    <div className="ms-4 flex flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <span className="sr-only">إغلاق</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          );
        })}
      </div>
    </div>
  );
}
