// ============================================================
// Ultra Video Downloader — /api/analyze Route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/downloader';
import { validateUrl, rateLimiter } from '@/lib/validator';
import type { ApiResponse, VideoInfo } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimiter.isAllowed(clientIp)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    // Parse body
    const body = await request.json().catch(() => null);
    if (!body || !body.url) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'URL is required' },
        { status: 400 },
      );
    }

    // Validate URL
    let validatedUrl: string;
    try {
      validatedUrl = validateUrl(body.url);
    } catch (err) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: err instanceof Error ? err.message : 'Invalid URL' },
        { status: 400 },
      );
    }

    // Analyze with yt-dlp
    const videoInfo = await analyzeUrl(validatedUrl);

    return NextResponse.json<ApiResponse<VideoInfo>>({
      success: true,
      data: videoInfo,
    });
  } catch (error) {
    console.error('[API /analyze] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze URL',
      },
      { status: 500 },
    );
  }
}
