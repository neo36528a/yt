// ============================================================
// Ultra Video Downloader — useAnalyze Hook
// ============================================================

'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { VideoInfo, ApiResponse } from '@/types';
import { API } from '@/lib/constants';

async function analyzeUrl(url: string): Promise<VideoInfo> {
  const { data } = await axios.post<ApiResponse<VideoInfo>>(API.ANALYZE, { url });
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to analyze URL');
  }
  return data.data;
}

export function useAnalyze() {
  return useMutation({
    mutationFn: analyzeUrl,
    retry: 1,
  });
}
