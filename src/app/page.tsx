// ============================================================
// Ultra Video Downloader — Home Page (Dead Centered Layout)
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Download } from 'lucide-react';
import { ParticleBackground } from '@/components/home/ParticleBackground';
import { URLInput } from '@/components/home/URLInput';
import { VideoAnalysis } from '@/components/home/VideoAnalysis';
import { DownloadProgressPanel } from '@/components/home/DownloadProgress';
import { VideoAnalysisSkeleton } from '@/components/ui/LoadingSkeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useAnalyze } from '@/hooks/useAnalyze';
import { useDownload } from '@/hooks/useDownload';
import { useDownloadStore } from '@/store/useDownloadStore';
import type { VideoInfo, MediaFormat, Resolution } from '@/types';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Multi-threaded downloads for maximum speed',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'No tracking, no ads, fully secure',
    gradient: 'from-emerald-500 to-cyan-500',
  },
  {
    icon: Download,
    title: 'Multiple Formats',
    description: 'MP4, WEBM, MP3, M4A and more',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: Sparkles,
    title: '4K Support',
    description: 'Download in up to 2160p quality',
    gradient: 'from-pink-500 to-rose-500',
  },
];

export default function HomePage() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const analyzeMutation = useAnalyze();
  const { initiateDownload, pauseDownload, resumeDownload, cancelDownload } = useDownload();
  const downloads = useDownloadStore((s) => s.downloads);

  const handleAnalyze = useCallback(
    (url: string) => {
      setVideoInfo(null);
      analyzeMutation.mutate(url, {
        onSuccess: (data) => {
          setVideoInfo(data);
        },
      });
    },
    [analyzeMutation],
  );

  const handleDownload = useCallback(
    async (format: MediaFormat, resolution: Resolution) => {
      if (!videoInfo) return;
      setIsDownloading(true);
      try {
        await initiateDownload(videoInfo, format, resolution);
      } finally {
        setIsDownloading(false);
      }
    },
    [videoInfo, initiateDownload],
  );

  return (
    <>
      <ParticleBackground />

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center gap-12 sm:gap-16 pt-2">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full flex flex-col items-center justify-center text-center mb-8"
          >
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-6 shadow-lg shadow-purple-500/10 backdrop-blur-md hover:scale-105 transition-transform cursor-default"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Premium Video Downloader</span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none mb-6">
              <span className="gradient-text pb-2">Ultra Video</span>
              <span className="block text-white mt-2">Downloader</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
              Download videos from supported websites quickly and securely.
              <span className="block text-slate-400 text-xs sm:text-sm mt-2 font-medium">
                Fast, free, and privacy-focused.
              </span>
            </p>
          </motion.div>

          {/* Hero URL Input */}
          <div className="w-full flex justify-center">
            <URLInput
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzeMutation.isPending}
              error={analyzeMutation.error?.message ?? null}
            />
          </div>
        </section>

        {/* Video Analysis Result */}
        {(analyzeMutation.isPending || videoInfo) && (
          <section className="w-full flex justify-center">
            {analyzeMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
              >
                <VideoAnalysisSkeleton />
              </motion.div>
            )}

            {videoInfo && !analyzeMutation.isPending && (
              <div className="w-full flex justify-center">
                <VideoAnalysis
                  videoInfo={videoInfo}
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
              </div>
            )}
          </section>
        )}

        {/* Active Downloads */}
        {downloads.length > 0 && (
          <section className="w-full flex justify-center">
            <DownloadProgressPanel
              downloads={downloads}
              onPause={pauseDownload}
              onResume={resumeDownload}
              onCancel={cancelDownload}
            />
          </section>
        )}

        {/* Features Grid & Stats Banner */}
        <section className="w-full flex flex-col items-center justify-center text-center gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center text-center gap-8"
          >
            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
                    className="w-full"
                  >
                    <GlassCard
                      hover
                      padding="md"
                      className="text-center group border border-white/10 bg-[#12121c]/90 h-full flex flex-col items-center justify-center p-6 shadow-xl hover:border-purple-500/30 transition-all duration-300"
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats Banner matching max-w-3xl width */}
            <div className="w-full">
              <GlassCard variant="strong" padding="lg" className="border border-white/10 bg-[#12121c]/90 shadow-2xl p-6 sm:p-8">
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10 py-2">
                  <div className="px-2">
                    <AnimatedCounter
                      value={50}
                      suffix="+"
                      className="text-2xl sm:text-4xl font-extrabold gradient-text"
                    />
                    <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-2">Supported Sites</p>
                  </div>
                  <div className="px-2">
                    <AnimatedCounter
                      value={8}
                      className="text-2xl sm:text-4xl font-extrabold gradient-text"
                    />
                    <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-2">Video Formats</p>
                  </div>
                  <div className="px-2">
                    <AnimatedCounter
                      value={4}
                      suffix="K"
                      className="text-2xl sm:text-4xl font-extrabold gradient-text"
                    />
                    <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-2">Max Resolution</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
