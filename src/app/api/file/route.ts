// ============================================================
// Ultra Video Downloader — /api/file Route (Reliable File Stream)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSettings } from '@/lib/database';
import { sanitizeFilename } from '@/lib/validator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadId = searchParams.get('downloadId');
    const customPath = searchParams.get('path');
    const customName = searchParams.get('name') || 'video';

    const settings = getSettings();
    const downloadsDir = path.resolve(process.cwd(), settings.downloadFolder || './downloads');

    let targetFilePath: string | null = null;

    // 1. Check direct path parameter if valid
    if (customPath && fs.existsSync(path.resolve(customPath))) {
      targetFilePath = path.resolve(customPath);
    }

    // 2. Look up by downloadId in downloads directory
    if (!targetFilePath && downloadId && fs.existsSync(downloadsDir)) {
      const files = fs.readdirSync(downloadsDir);
      const matchedFile = files.find((f) => f.startsWith(downloadId));
      if (matchedFile) {
        targetFilePath = path.join(downloadsDir, matchedFile);
      }
    }

    // 3. Fall back: find newest file in downloads directory
    if (!targetFilePath && fs.existsSync(downloadsDir)) {
      const files = fs.readdirSync(downloadsDir)
        .map((f) => ({ name: f, time: fs.statSync(path.join(downloadsDir, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);
      if (files.length > 0) {
        targetFilePath = path.join(downloadsDir, files[0].name);
      }
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return NextResponse.json(
        { error: 'File not ready or not found on device' },
        { status: 404 },
      );
    }

    const stat = fs.statSync(targetFilePath);
    const ext = path.extname(targetFilePath).toLowerCase() || '.mp4';

    let contentType = 'video/mp4';
    if (ext === '.webm') contentType = 'video/webm';
    if (ext === '.mp3') contentType = 'audio/mpeg';
    if (ext === '.m4a') contentType = 'audio/mp4';

    const safeTitle = sanitizeFilename(customName);
    const finalFilename = `${safeTitle}${ext}`;

    const fileStream = fs.createReadStream(targetFilePath);

    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(finalFilename)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API /file] Error:', error);
    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 });
  }
}
