// ============================================================
// Ultra Video Downloader — HistoryCard Component
// ============================================================

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Trash2,
  FolderOpen,
  RotateCw,
  MoreVertical,
  Film,
  Globe,
  Calendar,
  HardDrive,
} from 'lucide-react';
import type { HistoryItem } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatFileSize, formatRelativeTime, extractDomain, cn } from '@/lib/utils';

interface HistoryCardProps {
  item: HistoryItem;
  view: 'grid' | 'list';
  onDelete: (id: string) => void;
}

export function HistoryCard({ item, view, onDelete }: HistoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const domain = extractDomain(item.url);

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <GlassCard hover padding="sm" className="group">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-tertiary)]">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-6 h-6 text-[var(--text-muted)]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                {item.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {domain}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-400 font-medium">
                  {item.resolution}
                </span>
                <span className="uppercase px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-medium">
                  {item.format}
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(item.fileSize)}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-[var(--text-muted)] flex-shrink-0 hidden sm:block">
              {formatRelativeTime(item.downloadedAt)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <GlassCard
        hover
        padding="sm"
        className="group relative overflow-hidden"
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[var(--bg-tertiary)]">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button
              onClick={() => onDelete(item.id)}
              className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors backdrop-blur-sm"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Format badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white font-bold uppercase">
            {item.format}
          </div>

          {/* Resolution badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-violet-500/80 backdrop-blur-sm text-[10px] text-white font-bold">
            {item.resolution}
          </div>
        </div>

        {/* Info */}
        <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 mb-2 leading-tight">
          {item.title}
        </h4>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {domain}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatRelativeTime(item.downloadedAt)}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
