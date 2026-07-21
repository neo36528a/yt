// ============================================================
// Ultra Video Downloader — Settings Page (Flex Gap Fix)
// ============================================================

'use client';

import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  FolderOpen,
  Download,
  Palette,
  Bell,
  RotateCw,
  RefreshCw,
  Info,
  Moon,
  Sun,
  Zap,
  Shield,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useSettings } from '@/store/useSettingsStore';
import { useUIStore } from '@/store/useUIStore';
import { APP_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { addNotification } = useUIStore();

  const handleSave = () => {
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully.',
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
      addNotification({
        type: 'info',
        title: 'Settings Reset',
        message: 'All settings have been reset to defaults.',
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto page-enter pt-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center sm:text-left"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-3">
          <SettingsIcon className="w-7 h-7 text-purple-400" />
          Settings
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2 font-normal">
          Customize your download experience and preferences
        </p>
      </motion.div>

      {/* Main Flex Column Container with Explicit 36px Gap */}
      <div className="flex flex-col gap-8 sm:gap-10">
        {/* Download Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <GlassCard variant="strong" padding="lg" className="border border-white/10 bg-[#12121c]/90 shadow-2xl p-7 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-white mb-8 flex items-center gap-2.5">
              <Download className="w-5 h-5 text-cyan-400" />
              Download Settings
            </h3>

            <div className="flex flex-col gap-8">
              {/* Download Folder */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <label className="text-sm sm:text-base text-white font-semibold block mb-1">
                    Default Download Folder
                  </label>
                  <p className="text-xs sm:text-sm text-slate-400 font-mono">
                    {settings.downloadFolder}
                  </p>
                </div>
                <MagneticButton
                  variant="secondary"
                  size="sm"
                  icon={<FolderOpen className="w-4 h-4 text-purple-400" />}
                  magnetic={false}
                >
                  Browse
                </MagneticButton>
              </div>

              {/* Max Concurrent Downloads */}
              <div className="pb-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm sm:text-base text-white font-semibold">
                    Max Concurrent Downloads
                  </label>
                  <span className="text-xs sm:text-sm text-purple-400 font-mono font-extrabold px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                    {settings.maxConcurrentDownloads}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={settings.maxConcurrentDownloads}
                  onChange={(e) =>
                    updateSettings({ maxConcurrentDownloads: parseInt(e.target.value) })
                  }
                  className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-2">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Max Download Speed */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm sm:text-base text-white font-semibold">
                    Max Download Speed
                  </label>
                  <span className="text-xs sm:text-sm text-cyan-400 font-mono font-extrabold px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                    {settings.maxDownloadSpeed === 0 ? 'Unlimited' : `${settings.maxDownloadSpeed} KB/s`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={settings.maxDownloadSpeed}
                  onChange={(e) =>
                    updateSettings({ maxDownloadSpeed: parseInt(e.target.value) })
                  }
                  className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium mt-2">
                  <span>Unlimited</span>
                  <span>10 MB/s</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <GlassCard variant="strong" padding="lg" className="border border-white/10 bg-[#12121c]/90 shadow-2xl p-7 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-white mb-8 flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-pink-400" />
              Appearance
            </h3>

            <div className="flex flex-col gap-8">
              {/* Theme */}
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <label className="text-sm sm:text-base text-white font-semibold block mb-1">Theme</label>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all',
                      settings.theme === 'dark'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white',
                    )}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all',
                      settings.theme === 'light'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white',
                    )}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-sm sm:text-base text-white font-semibold block mb-1">Language</label>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Select your preferred language
                  </p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  className="bg-[#181826] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-white outline-none cursor-pointer shadow-md"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <GlassCard variant="strong" padding="lg" className="border border-white/10 bg-[#12121c]/90 shadow-2xl p-7 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-white mb-8 flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              Behavior
            </h3>

            <div className="flex flex-col gap-6">
              {[
                {
                  key: 'showNotifications' as const,
                  icon: Bell,
                  label: 'Show Notifications',
                  description: 'Get notified when downloads complete or fail',
                },
                {
                  key: 'autoRetry' as const,
                  icon: RotateCw,
                  label: 'Auto Retry Failed Downloads',
                  description: 'Automatically retry downloads that fail',
                },
                {
                  key: 'autoUpdate' as const,
                  icon: RefreshCw,
                  label: 'Auto Update',
                  description: 'Check for updates automatically',
                },
              ].map(({ key, icon: Icon, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-1">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="text-sm sm:text-base text-white font-semibold block mb-0.5">
                        {label}
                      </label>
                      <p className="text-xs sm:text-sm text-slate-400">{description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => updateSettings({ [key]: !settings[key] })}
                    className={cn(
                      'relative w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer flex-shrink-0',
                      settings[key]
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500'
                        : 'bg-slate-700/80',
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200',
                        settings[key] ? 'translate-x-6' : 'translate-x-0',
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <GlassCard variant="strong" padding="lg" className="border border-white/10 bg-[#12121c]/90 shadow-2xl p-7 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-white mb-6 flex items-center gap-2.5">
              <Info className="w-5 h-5 text-blue-400" />
              About
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-sm sm:text-base text-slate-400 font-medium">Application</span>
                <span className="text-sm sm:text-base text-white font-bold">{APP_META.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-sm sm:text-base text-slate-400 font-medium">Version</span>
                <span className="text-xs sm:text-sm text-purple-400 font-mono font-bold px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  v{APP_META.version}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm sm:text-base text-slate-400 font-medium">Security</span>
                <span className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-bold px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="w-4 h-4" />
                  Secure & Verified
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between gap-4 pt-4"
        >
          <MagneticButton variant="ghost" size="md" onClick={handleReset} magnetic={false}>
            Reset to Defaults
          </MagneticButton>
          <MagneticButton
            variant="primary"
            size="md"
            icon={<SettingsIcon className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Settings
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
}
