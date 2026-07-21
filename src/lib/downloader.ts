// ============================================================
// Ultra Video Downloader — Download Engine (Single Combined Video+Audio Output)
// ============================================================

import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { sanitizeFilename } from './validator';
import type { VideoInfo, FormatOption, MediaFormat, Resolution } from '@/types';

/** Map of active download processes */
const activeProcesses = new Map<string, ChildProcess>();

/**
 * Get the path to yt-dlp executable, auto-downloading it if missing on Linux or Windows.
 */
export async function getYtDlpPath(): Promise<string> {
  const isWin = process.platform === 'win32';
  const binDir = path.join(process.cwd(), 'bin');

  if (!fs.existsSync(binDir)) {
    try {
      fs.mkdirSync(binDir, { recursive: true });
    } catch {
      // Ignore
    }
  }

  const binaryName = isWin ? 'yt-dlp.exe' : 'yt-dlp';
  const localBinPath = path.join(binDir, binaryName);

  if (fs.existsSync(localBinPath)) {
    return localBinPath;
  }

  // Check if system has yt-dlp on PATH
  const hasSystemPath = await new Promise<boolean>((resolve) => {
    const proc = spawn(binaryName, ['--version'], { shell: false });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });

  if (hasSystemPath) {
    return binaryName;
  }

  // Check /tmp directory for Linux/serverless environments
  const tmpBinPath = path.join('/tmp', binaryName);
  if (!isWin && fs.existsSync(tmpBinPath)) {
    return tmpBinPath;
  }

  // Auto-download binary from official GitHub release
  // Note: yt-dlp_linux is the self-contained PyInstaller binary (includes Python 3 runtime)
  const downloadUrl = isWin
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
    : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

  const targetPath = !isWin && !fs.existsSync(binDir) ? tmpBinPath : localBinPath;

  try {
    const res = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    fs.writeFileSync(targetPath, Buffer.from(res.data));
    if (!isWin) {
      fs.chmodSync(targetPath, 0o755);
    }
    return targetPath;
  } catch (err) {
    console.error('Failed to auto-download yt-dlp binary:', err);
    return binaryName;
  }
}

/**
 * Get the directory containing FFmpeg binaries.
 */
export function getFfmpegDir(): string {
  const localBin = path.join(process.cwd(), 'bin');
  const winFfmpeg = path.join(localBin, 'ffmpeg.exe');
  if (fs.existsSync(winFfmpeg)) return localBin;

  const linuxFfmpeg = path.join(localBin, 'ffmpeg');
  if (fs.existsSync(linuxFfmpeg)) return localBin;

  return '';
}

/**
 * Check if yt-dlp is installed.
 */
export async function checkYtDlp(): Promise<boolean> {
  const ytDlpPath = await getYtDlpPath();
  return new Promise((resolve) => {
    const proc = spawn(ytDlpPath, ['--version'], { shell: false });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}

/**
 * Check if FFmpeg is installed.
 */
export async function checkFfmpeg(): Promise<boolean> {
  const ffmpegDir = getFfmpegDir();
  const isWin = process.platform === 'win32';
  const ffmpegCmd = ffmpegDir
    ? path.join(ffmpegDir, isWin ? 'ffmpeg.exe' : 'ffmpeg')
    : 'ffmpeg';

  return new Promise((resolve) => {
    const proc = spawn(ffmpegCmd, ['-version'], { shell: false });
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}
/**
 * Detect or create a valid cookies.txt file for yt-dlp authentication.
 */
export function getCookiesPath(): string | null {
  // 1. Explicit path from environment variable
  if (process.env.COOKIES_PATH && fs.existsSync(process.env.COOKIES_PATH)) {
    return process.env.COOKIES_PATH;
  }

  // 2. Local root or data folder cookies.txt
  const rootCookies = path.join(process.cwd(), 'cookies.txt');
  if (fs.existsSync(rootCookies)) return rootCookies;

  const dataCookies = path.join(process.cwd(), 'data', 'cookies.txt');
  if (fs.existsSync(dataCookies)) return dataCookies;

  // 3. YOUTUBE_COOKIES environment variable (raw cookies string or base64)
  if (process.env.YOUTUBE_COOKIES) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const tmpCookiesPath = path.join(dataDir, 'yt_cookies.txt');
      let content = process.env.YOUTUBE_COOKIES.trim();
      if (content.startsWith('base64:')) {
        content = Buffer.from(content.slice(7), 'base64').toString('utf-8');
      }
      fs.writeFileSync(tmpCookiesPath, content);
      return tmpCookiesPath;
    } catch {
      // Ignore write error
    }
  }

  return null;
}

/**
 * Common yt-dlp CLI arguments to prevent YouTube bot detection & sign-in blocks.
 */
export function getYtDlpCommonArgs(): string[] {
  const args: string[] = [
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--js-runtimes',
    'node',
    '--user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  ];

  // Configure YouTube extractor client options to bypass 'Sign in to confirm you are not a bot'
  const poToken = process.env.PO_TOKEN || process.env.YOUTUBE_PO_TOKEN;
  if (poToken) {
    args.push('--extractor-args', `youtube:player_client=ios,web,mweb;po_token=web+${poToken}`);
  } else {
    args.push('--extractor-args', 'youtube:player_client=ios,web,mweb');
  }

  // Pass cookies if available
  const cookiesPath = getCookiesPath();
  if (cookiesPath) {
    args.push('--cookies', cookiesPath);
  }

  // Proxy support
  const proxyUrl = process.env.YT_DLP_PROXY || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (proxyUrl) {
    args.push('--proxy', proxyUrl);
  }

  return args;
}

/**
 * Analyze a URL using yt-dlp --dump-json.
 */
export async function analyzeUrl(url: string): Promise<VideoInfo> {
  const ytDlpPath = await getYtDlpPath();

  try {
    return await new Promise<VideoInfo>((resolve, reject) => {
      const args = [
        '--dump-json',
        ...getYtDlpCommonArgs(),
        url,
      ];

      const proc = spawn(ytDlpPath, args, {
        shell: false,
        timeout: 120000,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0 || !stdout.trim()) {
          fallbackOembed(url)
            .then(resolve)
            .catch(() =>
              reject(
                new Error(
                  stderr || 'Failed to analyze URL. Please verify the URL and try again.',
                ),
              ),
            );
          return;
        }

        try {
          const info = JSON.parse(stdout);
          const videoInfo = parseVideoInfo(info, url);
          resolve(videoInfo);
        } catch {
          fallbackOembed(url)
            .then(resolve)
            .catch(() => reject(new Error('Failed to parse video metadata.')));
        }
      });

      proc.on('error', (err) => {
        fallbackOembed(url)
          .then(resolve)
          .catch(() => reject(new Error(`Analysis failed: ${err.message}`)));
      });
    });
  } catch {
    return fallbackOembed(url);
  }
}

/**
 * Fallback oEmbed analyzer for YouTube and public media URLs.
 */
async function fallbackOembed(url: string): Promise<VideoInfo> {
  let title = 'Media Video';
  let author = 'Public Creator';
  let thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    try {
      const oembedRes = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
        timeout: 5000,
      });
      if (oembedRes.data) {
        title = oembedRes.data.title || title;
        author = oembedRes.data.author_name || author;
        thumbnail = oembedRes.data.thumbnail_url || thumbnail;
      }
    } catch {
      // Ignore network error
    }
  }

  const defaultFormats: FormatOption[] = [
    { formatId: 'best', format: 'mp4', resolution: '1080p', filesize: 45000000, fps: 60, vcodec: 'h264', acodec: 'aac', quality: '1080p Full HD (Video + Sound)' },
    { formatId: '720p', format: 'mp4', resolution: '720p', filesize: 25000000, fps: 30, vcodec: 'h264', acodec: 'aac', quality: '720p HD (Video + Sound)' },
    { formatId: '480p', format: 'mp4', resolution: '480p', filesize: 15000000, fps: 30, vcodec: 'h264', acodec: 'aac', quality: '480p SD (Video + Sound)' },
    { formatId: 'audio-mp3', format: 'mp3', resolution: 'audio', filesize: 5000000, fps: null, vcodec: 'none', acodec: 'mp3', quality: '320kbps MP3 Audio' },
  ];

  return {
    id: String(Date.now()),
    url,
    title,
    thumbnail,
    duration: 0,
    channel: author,
    uploadDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
    description: 'Downloaded via Ultra Video Downloader',
    website: url.includes('youtube') ? 'YouTube' : 'Web Video',
    formats: defaultFormats,
    bestFormat: defaultFormats[0],
  };
}

/**
 * Parse raw yt-dlp JSON output into VideoInfo.
 */
function parseVideoInfo(raw: Record<string, unknown>, url: string): VideoInfo {
  const formats: FormatOption[] = [];

  if (Array.isArray(raw.formats)) {
    for (const f of raw.formats) {
      const fmt = f as Record<string, unknown>;
      const height = fmt.height as number | undefined;
      const resolution = height ? mapResolution(height) : null;
      const ext = (fmt.ext as string) || '';

      if (!resolution && ext !== 'mp3' && ext !== 'm4a') continue;

      formats.push({
        formatId: String(fmt.format_id || ''),
        format: mapFormat(ext),
        resolution: resolution || 'audio',
        filesize: (fmt.filesize as number) || (fmt.filesize_approx as number) || null,
        fps: (fmt.fps as number) || null,
        vcodec: String(fmt.vcodec || 'none'),
        acodec: String(fmt.acodec || 'none'),
        quality: String(fmt.format_note || fmt.quality || ''),
      });
    }
  }

  const deduped = new Map<string, FormatOption>();
  for (const f of formats) {
    const key = `${f.format}-${f.resolution}`;
    const existing = deduped.get(key);
    if (!existing || (f.filesize && (!existing.filesize || f.filesize > existing.filesize))) {
      deduped.set(key, f);
    }
  }

  let finalFormats = Array.from(deduped.values());

  if (finalFormats.length === 0) {
    finalFormats = [
      { formatId: 'best', format: 'mp4', resolution: '1080p', filesize: 45000000, fps: 60, vcodec: 'h264', acodec: 'aac', quality: '1080p Full HD (Video + Sound)' },
      { formatId: '720p', format: 'mp4', resolution: '720p', filesize: 25000000, fps: 30, vcodec: 'h264', acodec: 'aac', quality: '720p HD (Video + Sound)' },
      { formatId: 'audio-mp3', format: 'mp3', resolution: 'audio', filesize: 5000000, fps: null, vcodec: 'none', acodec: 'mp3', quality: '320kbps MP3 Audio' },
    ];
  }

  return {
    id: String(raw.id || Date.now()),
    url,
    title: String(raw.title || 'Untitled Video'),
    thumbnail: String(raw.thumbnail || ''),
    duration: Number(raw.duration || 0),
    channel: String(raw.uploader || raw.channel || 'Media Channel'),
    uploadDate: String(raw.upload_date || ''),
    description: String(raw.description || '').substring(0, 500),
    website: String(raw.extractor || raw.extractor_key || 'Web Video'),
    formats: finalFormats,
    bestFormat: finalFormats.find((f) => f.resolution === '1080p' && f.format === 'mp4') || finalFormats[0],
  };
}

/**
 * Map pixel height to resolution label.
 */
function mapResolution(height: number): Resolution | null {
  if (height >= 2160) return '2160p';
  if (height >= 1440) return '1440p';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  if (height >= 240) return '240p';
  if (height >= 144) return '144p';
  return null;
}

/**
 * Map file extension to format type.
 */
function mapFormat(ext: string): MediaFormat {
  switch (ext.toLowerCase()) {
    case 'webm':
      return 'webm';
    case 'mp3':
      return 'mp3';
    case 'm4a':
      return 'm4a';
    default:
      return 'mp4';
  }
}

/**
 * Download progress callback type.
 */
export interface DownloadCallbacks {
  onProgress: (data: {
    progress: number;
    speed: string;
    eta: string;
    downloadedSize: string;
    totalSize: string;
  }) => void;
  onComplete: (filePath: string) => void;
  onError: (error: string) => void;
}

/**
 * Start a download using yt-dlp + FFmpeg to combine video and audio into ONE single file.
 */
export async function startDownload(
  downloadId: string,
  url: string,
  format: MediaFormat,
  resolution: Resolution,
  outputDir: string,
  title: string,
  callbacks: DownloadCallbacks,
): Promise<void> {
  const ytDlpPath = await getYtDlpPath();
  const ffmpegDir = getFfmpegDir();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileStem = downloadId;
  const outputTemplate = path.join(outputDir, `${fileStem}.%(ext)s`);

  const args: string[] = [
    ...getYtDlpCommonArgs(),
    '--newline',
    '--no-mtime',
    '--concurrent-fragments', '5',
    '--progress',
    '--progress-template', '%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress._downloaded_bytes_str)s|%(progress._total_bytes_str)s',
    '-o', outputTemplate,
  ];

  // Pass FFmpeg location so yt-dlp automatically merges video and audio into ONE file
  if (ffmpegDir) {
    args.push('--ffmpeg-location', ffmpegDir);
  }

  const isAudio = format === 'mp3' || format === 'm4a';

  if (isAudio) {
    args.push('-x', '--audio-format', format, '--audio-quality', '0');
  } else {
    const heightMap: Record<string, string> = {
      '2160p': '2160',
      '1440p': '1440',
      '1080p': '1080',
      '720p': '720',
      '480p': '480',
      '360p': '360',
      '240p': '240',
      '144p': '144',
    };

    const height = heightMap[resolution] || '1080';

    if (format === 'mp4') {
      args.push(
        '-f',
        `bv*[ext=mp4][height<=${height}]+ba[ext=m4a]/bv*[height<=${height}]+ba/b[height<=${height}]/b`,
        '--merge-output-format',
        'mp4',
      );
    } else if (format === 'webm') {
      args.push(
        '-f',
        `bv*[ext=webm][height<=${height}]+ba[ext=webm]/bv*[height<=${height}]+ba/b[height<=${height}]/b`,
        '--merge-output-format',
        'webm',
      );
    } else {
      args.push(
        '-f',
        `bv*[height<=${height}]+ba/b[height<=${height}]/b`,
        '--merge-output-format',
        format,
      );
    }
  }

  args.push(url);

  const proc = spawn(ytDlpPath, args, {
    shell: false,
    timeout: 0, // 0 = Unlimited timeout to support long videos (2+ hours)
  });

  activeProcesses.set(downloadId, proc);

  let stdoutBuf = '';
  let stderrBuf = '';

  proc.stdout.on('data', (data: Buffer) => {
    stdoutBuf += data.toString();
    const lines = stdoutBuf.split(/\r?\n/);
    stdoutBuf = lines.pop() || ''; // Keep incomplete trailing chunk

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        const progress = parseProgress(trimmed);
        if (progress) {
          callbacks.onProgress(progress);
        }
      }
    }
  });

  proc.stderr.on('data', (data: Buffer) => {
    const msg = data.toString();
    stderrBuf += msg;
    if (msg.trim() && !msg.includes('WARNING')) {
      console.error(`[Download ${downloadId}] stderr:`, msg.trim());
    }
  });

  proc.on('close', (code) => {
    activeProcesses.delete(downloadId);

    if (code !== 0) {
      const cleanErr =
        stderrBuf
          .split(/\r?\n/)
          .filter(
            (l) =>
              l.includes('ERROR:') ||
              l.includes('Error') ||
              l.includes('Unable') ||
              l.includes('failed'),
          )
          .join(' ')
          .trim() ||
        stderrBuf.trim() ||
        `Download process failed with exit code ${code}`;

      callbacks.onError(cleanErr);
      return;
    }

    // Determine the exact single merged output file on disk
    const expectedFile = path.join(outputDir, `${fileStem}.${format}`);
    const actualFile = findOutputFile(outputDir, fileStem) || expectedFile;

    if (fs.existsSync(actualFile)) {
      callbacks.onComplete(actualFile);
    } else {
      callbacks.onError('Download completed but file could not be found on disk.');
    }
  });

  proc.on('error', (err) => {
    activeProcesses.delete(downloadId);
    callbacks.onError(err.message);
  });
}

/**
 * Cancel an active download.
 */
export function cancelDownload(downloadId: string): boolean {
  const proc = activeProcesses.get(downloadId);
  if (proc) {
    proc.kill('SIGTERM');
    activeProcesses.delete(downloadId);
    return true;
  }
  return false;
}

/**
 * Parse yt-dlp progress output.
 */
function parseProgress(line: string): {
  progress: number;
  speed: string;
  eta: string;
  downloadedSize: string;
  totalSize: string;
} | null {
  const parts = line.split('|');
  if (parts.length >= 5) {
    const percentStr = parts[0].replace('%', '').trim();
    const percent = parseFloat(percentStr);
    if (!isNaN(percent)) {
      return {
        progress: Math.min(Math.max(percent, 0), 100),
        speed: parts[1]?.trim() || '0 B/s',
        eta: parts[2]?.trim() || '--:--',
        downloadedSize: parts[3]?.trim() || '0 B',
        totalSize: parts[4]?.trim() || 'Unknown',
      };
    }
  }

  const percentMatch = line.match(/(\d+\.?\d*)%/);
  if (percentMatch) {
    const speedMatch = line.match(/at\s+([\d.]+\s*\w+\/s)/);
    const etaMatch = line.match(/ETA\s+([\d:]+)/);
    const percent = parseFloat(percentMatch[1]);

    if (!isNaN(percent)) {
      return {
        progress: Math.min(Math.max(percent, 0), 100),
        speed: speedMatch?.[1] || '...',
        eta: etaMatch?.[1] || '--:--',
        downloadedSize: '...',
        totalSize: '...',
      };
    }
  }

  return null;
}

/**
 * Find the final single merged output file.
 */
function findOutputFile(dir: string, fileStem: string): string | null {
  try {
    const files = fs.readdirSync(dir);
    // Find the merged file (ignore intermediate .fXXX temporary files)
    const match = files.find((f) => f.startsWith(fileStem) && !f.includes('.f') && !f.endsWith('.part'));
    if (match) return path.join(dir, match);

    // Fallback: match any file starting with fileStem
    const fallbackMatch = files.find((f) => f.startsWith(fileStem) && !f.endsWith('.part'));
    return fallbackMatch ? path.join(dir, fallbackMatch) : null;
  } catch {
    return null;
  }
}
