// ============================================================
// Ultra Video Downloader — /api/delete Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { deleteHistoryItem, clearHistory } from '@/lib/database';
import type { ApiResponse } from '@/types';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Clear all history
    if (searchParams.get('all') === 'true') {
      clearHistory();
      return NextResponse.json<ApiResponse<null>>({
        success: true,
        message: 'All history cleared',
      });
    }

    // Delete single item
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Item ID is required' },
        { status: 400 },
      );
    }

    const deleted = deleteHistoryItem(id);
    if (!deleted) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Item not found' },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Item deleted',
    });
  } catch (error) {
    console.error('[API /delete] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete',
      },
      { status: 500 },
    );
  }
}
