// ============================================================
// Ultra Video Downloader — useHistory Hook
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { HistoryItem, HistoryFilters, PaginatedResponse, ApiResponse } from '@/types';
import { API } from '@/lib/constants';

async function fetchHistory(filters: HistoryFilters): Promise<PaginatedResponse<HistoryItem>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.website && filters.website !== 'all') params.set('website', filters.website);
  if (filters.resolution && filters.resolution !== 'all') params.set('resolution', filters.resolution);
  params.set('sortBy', filters.sortBy);
  params.set('sortOrder', filters.sortOrder);
  params.set('page', filters.page.toString());
  params.set('limit', filters.limit.toString());

  const { data } = await axios.get<ApiResponse<PaginatedResponse<HistoryItem>>>(
    `${API.HISTORY}?${params.toString()}`,
  );

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch history');
  }
  return data.data;
}

async function deleteHistoryItem(id: string): Promise<void> {
  const { data } = await axios.delete<ApiResponse<null>>(`${API.DELETE}?id=${id}`);
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete item');
  }
}

async function clearAllHistory(): Promise<void> {
  const { data } = await axios.delete<ApiResponse<null>>(`${API.DELETE}?all=true`);
  if (!data.success) {
    throw new Error(data.error || 'Failed to clear history');
  }
}

export function useHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ['history', filters],
    queryFn: () => fetchHistory(filters),
    staleTime: 30000,
  });
}

export function useDeleteHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearAllHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
