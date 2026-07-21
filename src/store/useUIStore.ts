// ============================================================
// Ultra Video Downloader — UI Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { AppNotification } from '@/types';

interface UIStore {
  // Sidebar / Navigation
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // View preferences
  historyView: 'grid' | 'list';
  setHistoryView: (view: 'grid' | 'list') => void;

  // Search
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Modals
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `notif_${Date.now()}`,
          timestamp: Date.now(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, 50), // Keep last 50
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),

  // View
  historyView: 'grid',
  setHistoryView: (view) => set({ historyView: view }),

  // Search
  globalSearch: '',
  setGlobalSearch: (search) => set({ globalSearch: search }),
}));
