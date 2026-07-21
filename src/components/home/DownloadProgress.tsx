// ============================================================
// Ultra Video Downloader — DownloadProgress Component (Centered)
// ============================================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Pause,
  Play,
  X,
  Gauge,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderDown,
  Settings,
} from 'lucide-react';
import type { DownloadProgress as DownloadProgressType } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { cn, truncate } from '@/lib/utils';

interface DownloadProgressProps {
  downloads: DownloadProgressType[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
}

export function DownloadProgressPanel({
  downloads,
  onPause,
  onResume,
  onCancel,
}: DownloadProgressProps) {
  if (downloads.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center space-y-3 my-6"
    >
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
        Active Downloads ({downloads.length})
      </h3>

      <div className="w-full space-y-3">
        <AnimatePresence mode="popLayout">
          {downloads.map((download) => (
            <DownloadItem
              key={download.id}
              download={download}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface DownloadItemProps {
  download: DownloadProgressType;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
}

function DownloadItem({ download, onPause, onResume, onCancel }: DownloadItemProps) {
  const isActive = download.status === 'downloading' || download.status === 'converting';
  const isPaused = download.status === 'paused';
  const isCompleted = download.status === 'completed';
  const isFailed = download.status === 'failed';

  const statusColor = isCompleted
    ? 'text-emerald-400'
    : isFailed
      ? 'text-red-400'
      : isPaused
        ? 'text-amber-400'
        : 'text-purple-400';

  const progressColor = isCompleted
    ? 'from-emerald-500 to-cyan-500'
    : isFailed
      ? 'from-red-500 to-red-600'
      : isPaused
        ? 'from-amber-500 to-orange-500'
        : 'from-purple-600 to-cyan-500';

  const fileUrl = download.filePath
    ? `/api/file?downloadId=${download.id}&name=${encodeURIComponent(download.videoInfo.title)}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: 50 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-full"
    >
      <GlassCard variant="default" padding="md" className="w-full border border-white/10 bg-[#12121c]/90 shadow-2xl p-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-sm font-bold text-white truncate">
                {truncate(download.videoInfo.title, 60)}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs font-extrabold uppercase', statusColor)}>
                  {download.status === 'converting' ? 'Converting...' : download.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {download.selectedFormat.toUpperCase()} {download.selectedResolution}
                </span>
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex-shrink-0">
              {isActive && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
              {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {isFailed && <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r',
                progressColor,
              )}
              initial={{ width: 0 }}
              animate={{ width: `${download.progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Error Details */}
          {isFailed && download.error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="break-words font-medium">
                  {download.error.includes('YOUTUBE_BOT_BLOCK')
                    ? download.error.replace('YOUTUBE_BOT_BLOCK: ', '')
                    : download.error.includes("Sign in to confirm you're not a bot") || download.error.includes('cookies')
                      ? "YouTube requires authentication for this video. Please upload or paste your cookies.txt in Settings to enable download."
                      : download.error}
                </span>
              </div>
              {(download.error.includes('YOUTUBE_BOT_BLOCK') ||
                download.error.includes("Sign in to confirm you're not a bot") ||
                download.error.includes('cookies')) && (
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold shrink-0 text-xs transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Open Settings
                </Link>
              )}
            </div>
          )}

          {/* Stats & Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              {isActive && (
                <>
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-purple-400" />
                    {download.speed}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {download.eta}
                  </span>
                </>
              )}
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                {download.downloadedSize}
                {download.totalSize !== 'Unknown' && ` / ${download.totalSize}`}
              </span>
              <span className="font-bold text-white">
                {download.progress.toFixed(1)}%
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {isCompleted && fileUrl && (
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-500 text-white text-xs font-bold shadow-md hover:from-emerald-500 hover:to-cyan-400 transition-all active:scale-95"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  Save File
                </a>
              )}

              {isActive && (
                <MagneticButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onPause(download.id)}
                  magnetic={false}
                  title="Pause"
                >
                  <Pause className="w-3.5 h-3.5" />
                </MagneticButton>
              )}
              {isPaused && (
                <MagneticButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onResume(download.id)}
                  magnetic={false}
                  title="Resume"
                >
                  <Play className="w-3.5 h-3.5" />
                </MagneticButton>
              )}
              {(isActive || isPaused || isFailed || isCompleted) && (
                <MagneticButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(download.id)}
                  magnetic={false}
                  className="text-slate-400 hover:text-white"
                  title={isFailed || isCompleted ? "Remove" : "Cancel"}
                >
                  <X className="w-3.5 h-3.5" />
                </MagneticButton>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
