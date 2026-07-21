// ============================================================
// Ultra Video Downloader — /api/settings Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/database';
import type { ApiResponse, AppSettings } from '@/types';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json<ApiResponse<AppSettings>>({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[API /settings GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get settings',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Request body is required' },
        { status: 400 },
      );
    }

    // Only allow valid setting keys
    const allowedKeys: (keyof AppSettings)[] = [
      'downloadFolder',
      'maxConcurrentDownloads',
      'maxDownloadSpeed',
      'theme',
      'language',
      'autoUpdate',
      'showNotifications',
      'autoRetry',
      'maxRetries',
      'cookiesText',
      'browserCookies',
    ];

    const filteredUpdates: Partial<AppSettings> = {};
    for (const key of allowedKeys) {
      if (key in body) {
        (filteredUpdates as Record<string, unknown>)[key] = body[key];
      }
    }

    updateSettings(filteredUpdates);

    const updated = getSettings();
    return NextResponse.json<ApiResponse<AppSettings>>({
      success: true,
      data: updated,
      message: 'Settings updated',
    });
  } catch (error) {
    console.error('[API /settings PUT] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      },
      { status: 500 },
    );
  }
}
