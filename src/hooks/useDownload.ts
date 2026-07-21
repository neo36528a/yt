// ============================================================
// Ultra Video Downloader — useDownload Hook (Auto Save to Laptop)
// ============================================================

'use client';

import { useCallback, useRef } from 'react';
import axios from 'axios';
import { useDownloadStore } from '@/store/useDownloadStore';
import { useUIStore } from '@/store/useUIStore';
import type { MediaFormat, Resolution, VideoInfo, ApiResponse } from '@/types';
import { API } from '@/lib/constants';

export function useDownload() {
  const abortControllerRef = useRef<Map<string, AbortController>>(new Map());

  const {
    addToQueue,
    startDownload,
    updateProgress,
    setStatus,
    downloads,
  } = useDownloadStore();

  const { addNotification } = useUIStore();

  const initiateDownload = useCallback(
    async (videoInfo: VideoInfo, format: MediaFormat, resolution: Resolution) => {
      const id = addToQueue(videoInfo.url, format, resolution);
      startDownload(id, videoInfo);

      const controller = new AbortController();
      abortControllerRef.current.set(id, controller);

      try {
        const response = await fetch(API.DOWNLOAD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            downloadId: id,
            url: videoInfo.url,
            format,
            resolution,
            title: videoInfo.title,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || `Download request failed (${response.status})`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.slice(6));
                  if (eventData.type === 'progress') {
                    updateProgress(id, eventData.data);
                  } else if (eventData.type === 'complete') {
                    setStatus(id, 'completed');
                    updateProgress(id, { progress: 100, filePath: eventData.data?.filePath });
                    addNotification({
                      type: 'success',
                      title: 'Download Complete',
                      message: `${videoInfo.title} has been downloaded and saved to your laptop.`,
                    });

                    // Trigger automatic file save in browser to Laptop Downloads folder
                    try {
                      const downloadUrl = `/api/file?downloadId=${id}&name=${encodeURIComponent(videoInfo.title)}`;
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = `${videoInfo.title}.${format}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } catch {
                      // Browser popup blocked guard
                    }
                  } else if (eventData.type === 'error') {
                    setStatus(id, 'failed');
                    updateProgress(id, { error: eventData.data?.error });
                    addNotification({
                      type: 'error',
                      title: 'Download Failed',
                      message: eventData.data?.error || 'An error occurred during download.',
                    });
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setStatus(id, 'cancelled');
        } else {
          setStatus(id, 'failed');
          updateProgress(id, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          addNotification({
            type: 'error',
            title: 'Download Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred.',
          });
        }
      } finally {
        abortControllerRef.current.delete(id);
      }

      return id;
    },
    [addToQueue, startDownload, updateProgress, setStatus, addNotification],
  );

  const pauseDownload = useCallback(
    async (id: string) => {
      const controller = abortControllerRef.current.get(id);
      if (controller) {
        controller.abort();
        setStatus(id, 'paused');
      }
    },
    [setStatus],
  );

  const resumeDownload = useCallback(
    async (id: string) => {
      const download = downloads.find((d) => d.id === id);
      if (download) {
        setStatus(id, 'downloading');
        try {
          await axios.post<ApiResponse<null>>(`${API.DOWNLOAD}/resume`, { downloadId: id });
        } catch {
          setStatus(id, 'failed');
        }
      }
    },
    [downloads, setStatus],
  );

  const cancelDownload = useCallback(
    (id: string) => {
      const controller = abortControllerRef.current.get(id);
      if (controller) {
        controller.abort();
        abortControllerRef.current.delete(id);
      }
      setStatus(id, 'cancelled');
    },
    [setStatus],
  );

  return {
    initiateDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
  };
}
