// ============================================================
// Ultra Video Downloader — Download Queue Manager
// ============================================================

import { startDownload, cancelDownload, type DownloadCallbacks } from './downloader';
import { addHistoryItem } from './database';
import type { MediaFormat, Resolution, HistoryItem } from '@/types';
import { generateId, extractDomain } from './utils';
import fs from 'fs';

interface QueueEntry {
  id: string;
  url: string;
  format: MediaFormat;
  resolution: Resolution;
  title: string;
  thumbnail: string;
  duration: number;
  outputDir: string;
  callbacks: DownloadCallbacks;
  priority: number;
}

class DownloadQueue {
  private queue: QueueEntry[] = [];
  private activeDownloads: Set<string> = new Set();
  private maxConcurrent: number = 3;

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, Math.min(max, 10));
    this.processQueue();
  }

  /**
   * Add a download to the queue.
   */
  enqueue(entry: QueueEntry): void {
    this.queue.push(entry);
    this.queue.sort((a, b) => a.priority - b.priority);
    this.processQueue();
  }

  /**
   * Remove a download from the queue.
   */
  dequeue(id: string): boolean {
    const index = this.queue.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }

    // If it's active, cancel it
    if (this.activeDownloads.has(id)) {
      cancelDownload(id);
      this.activeDownloads.delete(id);
      this.processQueue();
      return true;
    }

    return false;
  }

  /**
   * Process the queue — start downloads up to the concurrent limit.
   */
  private processQueue(): void {
    while (this.activeDownloads.size < this.maxConcurrent && this.queue.length > 0) {
      const entry = this.queue.shift();
      if (!entry) break;

      this.activeDownloads.add(entry.id);

      const wrappedCallbacks: DownloadCallbacks = {
        onProgress: entry.callbacks.onProgress,
        onComplete: (filePath: string) => {
          this.activeDownloads.delete(entry.id);

          // Save to history
          const historyItem: HistoryItem = {
            id: entry.id,
            url: entry.url,
            title: entry.title,
            thumbnail: entry.thumbnail,
            website: extractDomain(entry.url),
            duration: entry.duration,
            format: entry.format,
            resolution: entry.resolution,
            fileSize: 0, // Will be updated if we can get actual size
            filePath,
            downloadedAt: new Date().toISOString(),
            status: 'completed',
          };

          try {
            // Try to get actual file size
            if (fs.existsSync(filePath)) {
              historyItem.fileSize = fs.statSync(filePath).size;
            }
          } catch {
            // Ignore file size errors
          }

          try {
            addHistoryItem(historyItem);
          } catch (err) {
            console.error('Failed to save to history:', err);
          }

          entry.callbacks.onComplete(filePath);
          this.processQueue();
        },
        onError: (error: string) => {
          this.activeDownloads.delete(entry.id);

          // Save failed entry to history
          try {
            addHistoryItem({
              id: entry.id,
              url: entry.url,
              title: entry.title,
              thumbnail: entry.thumbnail,
              website: extractDomain(entry.url),
              duration: entry.duration,
              format: entry.format,
              resolution: entry.resolution,
              fileSize: 0,
              filePath: '',
              downloadedAt: new Date().toISOString(),
              status: 'failed',
            });
          } catch {
            // Ignore
          }

          entry.callbacks.onError(error);
          this.processQueue();
        },
      };

      startDownload(
        entry.id,
        entry.url,
        entry.format,
        entry.resolution,
        entry.outputDir,
        entry.title,
        wrappedCallbacks,
      );
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getActiveCount(): number {
    return this.activeDownloads.size;
  }
}

// Global singleton queue
export const downloadQueue = new DownloadQueue();
