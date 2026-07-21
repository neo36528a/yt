// ============================================================
// Ultra Video Downloader — Footer Component
// ============================================================

'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Shield } from 'lucide-react';
import { APP_META } from '@/lib/constants';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="relative z-10 border-t border-[var(--border-glass)] mt-auto"
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>{APP_META.name}</span>
            <span className="text-[var(--border-glass)]">•</span>
            <span>v{APP_META.version}</span>
          </div>

          {/* Center */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            <span>for legal video downloading</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure & Privacy Focused</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
