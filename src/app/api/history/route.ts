// ============================================================
// Ultra Video Downloader — /api/history Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/database';
import type { ApiResponse, HistoryFilters, PaginatedResponse, HistoryItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: HistoryFilters = {
      search: searchParams.get('search') || '',
      website: searchParams.get('website') || 'all',
      resolution: (searchParams.get('resolution') as HistoryFilters['resolution']) || 'all',
      sortBy: (searchParams.get('sortBy') as HistoryFilters['sortBy']) || 'date',
      sortOrder: (searchParams.get('sortOrder') as HistoryFilters['sortOrder']) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    };

    const result = getHistory(filters);

    return NextResponse.json<ApiResponse<PaginatedResponse<HistoryItem>>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API /history] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history',
      },
      { status: 500 },
    );
  }
}
