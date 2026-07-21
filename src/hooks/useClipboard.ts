// ============================================================
// Ultra Video Downloader — useClipboard Hook
// ============================================================

'use client';

import { useEffect, useCallback } from 'react';
import { isValidUrl } from '@/lib/utils';

interface UseClipboardOptions {
  onPasteUrl: (url: string) => void;
  enabled?: boolean;
}

export function useClipboard({ onPasteUrl, enabled = true }: UseClipboardOptions) {
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!enabled) return;

      // Don't intercept paste in input fields that aren't our URL input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' &&
        !target.hasAttribute('data-url-input')
      ) {
        return;
      }

      const text = event.clipboardData?.getData('text')?.trim();
      if (text && isValidUrl(text)) {
        event.preventDefault();
        onPasteUrl(text);
      }
    },
    [onPasteUrl, enabled],
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const readClipboard = useCallback(async (): Promise<string | null> => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && isValidUrl(text.trim())) {
        return text.trim();
      }
    } catch {
      // Clipboard API not available or permission denied
    }
    return null;
  }, []);

  return { readClipboard };
}
