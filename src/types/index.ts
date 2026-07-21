// ============================================================
// Ultra Video Downloader — Type Definitions
// ============================================================

/** Supported video/audio formats */
export type MediaFormat = 'mp4' | 'webm' | 'mp3' | 'm4a';

/** Available video resolutions */
export type Resolution =
  | '144p'
  | '240p'
  | '360p'
  | '480p'
  | '720p'
  | '1080p'
  | '1440p'
  | '2160p'
  | 'audio';

/** A single available format from yt-dlp analysis */
export interface FormatOption {
  formatId: string;
  format: MediaFormat;
  resolution: Resolution;
  filesize: number | null;
  fps: number | null;
  vcodec: string;
  acodec: string;
  quality: string;
}

/** Video metadata returned from /api/analyze */
export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number; // seconds
  channel: string;
  uploadDate: string;
  description: string;
  website: string;
  formats: FormatOption[];
  bestFormat: FormatOption | null;
}

/** Download status states */
export type DownloadStatus =
  | 'queued'
  | 'analyzing'
  | 'downloading'
  | 'paused'
  | 'converting'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Active download progress data */
export interface DownloadProgress {
  id: string;
  videoInfo: VideoInfo;
  status: DownloadStatus;
  progress: number; // 0-100
  speed: string; // e.g. "2.5 MB/s"
  eta: string; // e.g. "00:01:23"
  downloadedSize: string; // e.g. "45.2 MB"
  totalSize: string; // e.g. "120 MB"
  selectedFormat: MediaFormat;
  selectedResolution: Resolution;
  filePath: string;
  error?: string;
  startedAt: number;
}

/** Download history item stored in database */
export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  website: string;
  duration: number;
  format: MediaFormat;
  resolution: Resolution;
  fileSize: number;
  filePath: string;
  downloadedAt: string; // ISO date
  status: 'completed' | 'failed';
}

/** Application settings */
export interface AppSettings {
  downloadFolder: string;
  maxConcurrentDownloads: number;
  maxDownloadSpeed: number; // KB/s, 0 = unlimited
  theme: 'dark' | 'light' | 'system';
  language: string;
  autoUpdate: boolean;
  showNotifications: boolean;
  autoRetry: boolean;
  maxRetries: number;
  cookiesText?: string;
  browserCookies?: 'none' | 'chrome' | 'edge' | 'firefox' | 'brave' | 'opera' | 'safari';
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** History query filters */
export interface HistoryFilters {
  search: string;
  website: string;
  resolution: Resolution | 'all';
  sortBy: 'date' | 'name' | 'size';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

/** Download queue item */
export interface QueueItem {
  id: string;
  url: string;
  format: MediaFormat;
  resolution: Resolution;
  priority: number;
  addedAt: number;
}

/** SSE download event */
export interface DownloadEvent {
  type: 'progress' | 'complete' | 'error' | 'info';
  downloadId: string;
  data: Partial<DownloadProgress>;
}

/** Notification */
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
