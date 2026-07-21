// ============================================================
// Ultra Video Downloader — Download Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { DownloadProgress, DownloadStatus, MediaFormat, Resolution, VideoInfo, QueueItem } from '@/types';
import { generateId } from '@/lib/utils';

interface DownloadStore {
  // Active downloads array (stable reference)
  downloads: DownloadProgress[];
  queue: QueueItem[];

  // Actions
  addToQueue: (url: string, format: MediaFormat, resolution: Resolution) => string;
  removeFromQueue: (id: string) => void;
  startDownload: (id: string, videoInfo: VideoInfo) => void;
  updateProgress: (id: string, data: Partial<DownloadProgress>) => void;
  setStatus: (id: string, status: DownloadStatus) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],
  queue: [],

  addToQueue: (url, format, resolution) => {
    const id = generateId();
    set((state) => ({
      queue: [
        ...state.queue,
        { id, url, format, resolution, priority: state.queue.length, addedAt: Date.now() },
      ],
    }));
    return id;
  },

  removeFromQueue: (id) => {
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    }));
  },

  startDownload: (id, videoInfo) => {
    set((state) => {
      const queueItem = state.queue.find((q) => q.id === id);
      const newDownload: DownloadProgress = {
        id,
        videoInfo,
        status: 'downloading',
        progress: 0,
        speed: '0 B/s',
        eta: '--:--',
        downloadedSize: '0 B',
        totalSize: 'Unknown',
        selectedFormat: queueItem?.format || 'mp4',
        selectedResolution: queueItem?.resolution || '1080p',
        filePath: '',
        startedAt: Date.now(),
      };
      return {
        downloads: [...state.downloads.filter((d) => d.id !== id), newDownload],
        queue: state.queue.filter((q) => q.id !== id),
      };
    });
  },

  updateProgress: (id, data) => {
    set((state) => ({
      downloads: state.downloads.map((item) =>
        item.id === id ? { ...item, ...data } : item,
      ),
    }));
  },

  setStatus: (id, status) => {
    set((state) => ({
      downloads: state.downloads.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  },

  removeDownload: (id) => {
    set((state) => ({
      downloads: state.downloads.filter((item) => item.id !== id),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      downloads: state.downloads.filter(
        (d) => d.status !== 'completed' && d.status !== 'cancelled',
      ),
    }));
  },
}));
