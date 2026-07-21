// ============================================================
// Ultra Video Downloader — /api/download Route
// ============================================================

import { NextRequest } from 'next/server';
import path from 'path';
import { validateUrl, rateLimiter } from '@/lib/validator';
import { downloadQueue } from '@/lib/queue';
import { getSettings } from '@/lib/database';
import { generateId } from '@/lib/utils';
import type { MediaFormat, Resolution } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!rateLimiter.isAllowed(clientIp)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse body
    const body = await request.json().catch(() => null);
    if (!body || !body.url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Validate URL
    let validatedUrl: string;
    try {
      validatedUrl = validateUrl(body.url);
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Invalid URL' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const downloadId = body.downloadId || generateId();
    const format: MediaFormat = body.format || 'mp4';
    const resolution: Resolution = body.resolution || '1080p';
    const title: string = body.title || 'download';
    const thumbnail: string = body.thumbnail || '';
    const duration: number = body.duration || 0;

    // Get download folder from settings
    const settings = getSettings();
    const outputDir = path.resolve(process.cwd(), settings.downloadFolder);

    // Create SSE response stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Enqueue download
        downloadQueue.enqueue({
          id: downloadId,
          url: validatedUrl,
          format,
          resolution,
          title,
          thumbnail,
          duration,
          outputDir,
          priority: 0,
          callbacks: {
            onProgress: (data) => {
              const event = `data: ${JSON.stringify({ type: 'progress', downloadId, data })}\n\n`;
              try {
                controller.enqueue(encoder.encode(event));
              } catch {
                // Stream closed
              }
            },
            onComplete: (filePath) => {
              const event = `data: ${JSON.stringify({ type: 'complete', downloadId, data: { filePath } })}\n\n`;
              try {
                controller.enqueue(encoder.encode(event));
                controller.close();
              } catch {
                // Stream already closed
              }
            },
            onError: (error) => {
              const event = `data: ${JSON.stringify({ type: 'error', downloadId, data: { error } })}\n\n`;
              try {
                controller.enqueue(encoder.encode(event));
                controller.close();
              } catch {
                // Stream already closed
              }
            },
          },
        });

        // Send initial event
        const initEvent = `data: ${JSON.stringify({ type: 'info', downloadId, data: { status: 'queued', message: 'Download queued' } })}\n\n`;
        controller.enqueue(encoder.encode(initEvent));
      },

      cancel() {
        // Stream closed by client — active background process continues completing the file
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Download-Id': downloadId,
      },
    });
  } catch (error) {
    console.error('[API /download] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
