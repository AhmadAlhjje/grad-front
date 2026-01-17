import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/i18n/config';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Locale
  locale: Locale;

  // Notifications
  notifications: Notification[];

  // Modal state
  activeModal: string | null;
  modalData: Record<string, unknown>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: Locale) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'light',
      locale: 'ar',
      notifications: [],
      activeModal: null,
      modalData: {},

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
            document.documentElement.classList.add(systemTheme);
          } else {
            document.documentElement.classList.add(theme);
          }
        }
      },

      setLocale: (locale) => {
        set({ locale });
        // Update document direction
        if (typeof document !== 'undefined') {
          document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = locale;
        }
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification = { ...notification, id };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto remove after duration
        const duration = notification.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      openModal: (modalId, data = {}) =>
        set({
          activeModal: modalId,
          modalData: data,
        }),

      closeModal: () =>
        set({
          activeModal: null,
          modalData: {},
        }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Notification helper functions
export const notify = {
  success: (title: string, message?: string) =>
    useUIStore.getState().addNotification({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useUIStore.getState().addNotification({ type: 'error', title, message }),
  warning: (title: string, message?: string) =>
    useUIStore.getState().addNotification({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useUIStore.getState().addNotification({ type: 'info', title, message }),
};
