// ============================================================
// Ultra Video Downloader — VideoAnalysis Component (Dead Centered & Clean Badges)
// ============================================================

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Clock,
  HardDrive,
  Globe,
  Download,
  Film,
  Music,
  Check,
  Volume2,
} from 'lucide-react';
import type { VideoInfo, MediaFormat, Resolution } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { formatDuration, formatFileSize, extractDomain, cn } from '@/lib/utils';
import { RESOLUTIONS } from '@/lib/constants';

interface VideoAnalysisProps {
  videoInfo: VideoInfo;
  onDownload: (format: MediaFormat, resolution: Resolution) => void;
  isDownloading: boolean;
}

const formatCategories: {
  category: string;
  formats: { value: MediaFormat; label: string; subLabel: string; type: 'video' | 'audio' }[];
}[] = [
  {
    category: 'Video (Video + Sound)',
    formats: [
      { value: 'mp4', label: 'MP4', subLabel: 'Video + Sound', type: 'video' },
      { value: 'webm', label: 'WEBM', subLabel: 'Video + Sound', type: 'video' },
    ],
  },
  {
    category: 'Audio (Sound Only)',
    formats: [
      { value: 'mp3', label: 'MP3', subLabel: 'Audio Only', type: 'audio' },
      { value: 'm4a', label: 'M4A', subLabel: 'Audio Only', type: 'audio' },
    ],
  },
];

export function VideoAnalysis({ videoInfo, onDownload, isDownloading }: VideoAnalysisProps) {
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat>('mp4');
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('1080p');

  const isAudioFormat = selectedFormat === 'mp3' || selectedFormat === 'm4a';

  const availableResolutions = useMemo(() => {
    if (isAudioFormat) return [];

    const formatResolutions = new Set(
      videoInfo.formats
        .filter((f) => f.format === selectedFormat || f.format === 'mp4')
        .map((f) => f.resolution),
    );

    if (formatResolutions.size === 0) {
      return RESOLUTIONS;
    }

    return RESOLUTIONS.filter((r) => formatResolutions.has(r.value));
  }, [videoInfo.formats, selectedFormat, isAudioFormat]);

  const estimatedSize = useMemo(() => {
    const match = videoInfo.formats.find(
      (f) =>
        (f.format === selectedFormat || (isAudioFormat && (f.format === 'mp3' || f.format === 'm4a'))) &&
        (isAudioFormat || f.resolution === selectedResolution),
    );
    return match?.filesize ? formatFileSize(match.filesize) : 'Estimated';
  }, [videoInfo.formats, selectedFormat, selectedResolution, isAudioFormat]);

  const handleDownload = () => {
    onDownload(selectedFormat, isAudioFormat ? 'audio' : selectedResolution);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-3xl mx-auto flex justify-center my-6"
    >
      <GlassCard variant="strong" padding="lg" className="w-full border border-white/10 bg-[#12121c]/90 shadow-2xl p-6 sm:p-7">
        {/* Video Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-72 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-white/10 shadow-md">
            {videoInfo.thumbnail ? (
              <Image
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-10 h-10 text-purple-400" />
              </div>
            )}
            {videoInfo.duration > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/80 backdrop-blur-sm text-xs text-white font-bold">
                {formatDuration(videoInfo.duration)}
              </div>
            )}
          </div>

          {/* Title & Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-tight">
              {videoInfo.title}
            </h3>

            {videoInfo.channel && (
              <p className="text-xs sm:text-sm text-purple-400 font-semibold mt-1">{videoInfo.channel}</p>
            )}

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              {videoInfo.duration > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {formatDuration(videoInfo.duration)}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                {extractDomain(videoInfo.url)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                {estimatedSize}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-6" />

        {/* Format Selection Categorized */}
        <div className="space-y-6">
          {formatCategories.map((cat) => (
            <div key={cat.category}>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block flex items-center justify-center sm:justify-start gap-1.5">
                {cat.category.includes('Video') ? (
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                )}
                {cat.category}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {cat.formats.map((fmt) => {
                  const isSelected = selectedFormat === fmt.value;
                  return (
                    <button
                      key={fmt.value}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.value)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer',
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {fmt.type === 'video' ? (
                          <Film className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Music className="w-4 h-4 text-pink-400" />
                        )}
                        <div className="text-left">
                          <span className="block font-bold">{fmt.label}</span>
                          <span className="block text-[10px] text-slate-400 font-medium">{fmt.subLabel}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Resolution Selection */}
          {!isAudioFormat && (
            <div className="pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block flex items-center justify-center sm:justify-start gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Video Resolution (Video + Sound Included)
              </label>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {(availableResolutions.length > 0 ? availableResolutions : RESOLUTIONS).map((res) => {
                  const isSelected = selectedResolution === res.value;
                  return (
                    <button
                      key={res.value}
                      type="button"
                      onClick={() => setSelectedResolution(res.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer',
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10',
                      )}
                    >
                      <span>{res.label}</span>
                      {res.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase',
                            isSelected
                              ? 'bg-cyan-500/30 text-cyan-200'
                              : 'bg-white/10 text-slate-400',
                          )}
                        >
                          {res.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Big Centered Download Button */}
        <div className="mt-8 flex justify-center">
          <MagneticButton
            variant="primary"
            size="lg"
            icon={<Download className="w-5 h-5" />}
            onClick={handleDownload}
            loading={isDownloading}
            disabled={isDownloading}
            className="w-full justify-center text-sm sm:text-base font-extrabold shadow-xl shadow-purple-500/25 py-3.5"
          >
            Download {selectedFormat.toUpperCase()} {!isAudioFormat ? `• ${selectedResolution} (Video + Sound)` : '• Sound Only'}
          </MagneticButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
