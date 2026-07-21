// ============================================================
// Ultra Video Downloader — Constants
// ============================================================

import { type MediaFormat, type Resolution, type AppSettings } from '@/types';

/** Supported media formats with metadata */
export const FORMATS: { value: MediaFormat; label: string; icon: string; type: 'video' | 'audio' }[] = [
  { value: 'mp4', label: 'MP4', icon: '🎬', type: 'video' },
  { value: 'webm', label: 'WEBM', icon: '🌐', type: 'video' },
  { value: 'mp3', label: 'MP3', icon: '🎵', type: 'audio' },
  { value: 'm4a', label: 'M4A', icon: '🎶', type: 'audio' },
];

/** Available video resolutions */
export const RESOLUTIONS: { value: Resolution; label: string; badge?: string }[] = [
  { value: '2160p', label: '2160p', badge: '4K' },
  { value: '1440p', label: '1440p', badge: '2K' },
  { value: '1080p', label: '1080p', badge: 'FHD' },
  { value: '720p', label: '720p', badge: 'HD' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' },
  { value: '240p', label: '240p' },
  { value: '144p', label: '144p' },
];

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  downloadFolder: './downloads',
  maxConcurrentDownloads: 3,
  maxDownloadSpeed: 0, // unlimited
  theme: 'dark',
  language: 'en',
  autoUpdate: true,
  showNotifications: true,
  autoRetry: true,
  maxRetries: 3,
};

/** API endpoints */
export const API = {
  ANALYZE: '/api/analyze',
  DOWNLOAD: '/api/download',
  HISTORY: '/api/history',
  DELETE: '/api/delete',
  SETTINGS: '/api/settings',
} as const;

/** Keyboard shortcuts */
export const SHORTCUTS = {
  PASTE: { key: 'v', ctrl: true, label: 'Ctrl+V', description: 'Paste URL' },
  DOWNLOAD: { key: 'd', ctrl: true, label: 'Ctrl+D', description: 'Start Download' },
  CANCEL: { key: 'Escape', ctrl: false, label: 'Esc', description: 'Cancel' },
  SEARCH: { key: 'k', ctrl: true, label: 'Ctrl+K', description: 'Search' },
  SETTINGS: { key: ',', ctrl: true, label: 'Ctrl+,', description: 'Settings' },
} as const;

/** Supported websites information */
export const SUPPORTED_SITES = [
  { name: 'Direct URLs', description: 'Direct MP4/WebM/media file URLs', icon: '🔗' },
  { name: 'Public Videos', description: 'Publicly available videos from permitted sites', icon: '🌍' },
  { name: 'User Content', description: 'Your own uploaded content', icon: '👤' },
];

/** Rate limit configuration */
export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60 * 1000, // 1 minute
} as const;

/** App metadata */
export const APP_META = {
  name: 'Ultra Video Downloader',
  version: '1.0.0',
  description: 'Download videos from supported websites quickly and securely.',
  author: 'Ultra Video Downloader Team',
} as const;

/** Animation variants for Framer Motion */
export const MOTION = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 },
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.08 } },
  },
} as const;
