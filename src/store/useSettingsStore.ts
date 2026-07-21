// ============================================================
// Ultra Video Downloader — Settings Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },

      toggleTheme: () => {
        const current = get().settings.theme;
        const next = current === 'dark' ? 'light' : 'dark';
        set((state) => ({
          settings: { ...state.settings, theme: next },
        }));
      },
    }),
    {
      name: 'ultra-downloader-settings',
    },
  ),
);

/**
 * Hydration-safe settings hook for React 19 / Next.js App Router
 */
export function useSettings() {
  const storeSettings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(storeSettings);
  }, [storeSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleTheme,
  };
}
