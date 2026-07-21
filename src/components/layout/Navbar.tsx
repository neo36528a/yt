// ============================================================
// Ultra Video Downloader — Navbar Component (Sticky Top Header)
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  History,
  Settings,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDownloadStore } from '@/store/useDownloadStore';

const navLinks = [
  { href: '/', label: 'Home', icon: Download },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const downloads = useDownloadStore((s) => s.downloads);
  const queue = useDownloadStore((s) => s.queue);
  const activeCount = downloads.filter((d) => d.status === 'downloading' || d.status === 'converting').length;
  const queuedCount = queue.length;
  const totalActive = activeCount + queuedCount;

  return (
    <>
      <header className="sticky top-0 z-50 h-20 w-full bg-[#09090e]/95 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-center shadow-2xl">
        <div className="w-full max-w-6xl h-full flex items-center justify-between gap-4">
          {/* Brand Logo (Left) */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-all">
                <Zap className="w-5 h-5 text-white" />
              </div>
              {totalActive > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#09090e]"
                >
                  <span className="text-[9px] font-extrabold text-white">{totalActive}</span>
                </motion.div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
                Ultra Video
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-purple-400 mt-1">
                Downloader
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs (Center) */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg shadow-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Status / Indicator */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {totalActive > 0 ? (
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-emerald-400">
                  {activeCount} active
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready</span>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 right-0 z-40 bg-[#09090e]/95 backdrop-blur-2xl p-4 md:hidden border-b border-white/10 shadow-2xl"
          >
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-white border border-purple-500/30'
                        : 'text-slate-300 hover:bg-white/5',
                    )}
                  >
                    <Icon className="w-5 h-5 text-purple-400" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
