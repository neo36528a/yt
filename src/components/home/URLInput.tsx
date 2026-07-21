// ============================================================
// Ultra Video Downloader — URLInput Component (Clean Separation)
// ============================================================

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Link as LinkIcon,
  Clipboard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { isValidUrl } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  error?: string | null;
}

export function URLInput({ onAnalyze, isAnalyzing, error }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = url.trim().length > 0 && isValidUrl(url);

  useClipboard({
    onPasteUrl: (pastedUrl) => {
      setUrl(pastedUrl);
      inputRef.current?.focus();
    },
  });

  const handleSubmit = useCallback(() => {
    if (isValid && !isAnalyzing) {
      onAnalyze(url.trim());
    }
  }, [url, isValid, isAnalyzing, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        inputRef.current?.focus();
      }
    } catch {
      // Clipboard access denied
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text && isValidUrl(text.trim())) {
      setUrl(text.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full max-w-3xl mx-auto my-6 sm:my-8"
    >
      {/* Big Heroic Input Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative group rounded-2xl p-[2px] bg-gradient-to-r from-purple-600 via-violet-500 to-cyan-400 hover:from-purple-500 hover:to-cyan-300 transition-all duration-500 shadow-2xl shadow-purple-500/25"
      >
        <div className="relative rounded-[14px] bg-[#0d0d16] px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
          {/* Link Icon */}
          <div className="flex items-center justify-center text-purple-400 flex-shrink-0">
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            ) : (
              <LinkIcon className="w-6 h-6 text-purple-400" />
            )}
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="url"
            data-url-input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste supported video URL here..."
            disabled={isAnalyzing}
            className="flex-1 bg-transparent text-white text-base sm:text-xl placeholder:text-slate-500 outline-none min-w-0 font-medium tracking-wide"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Action buttons (Paste/Clear + Analyze) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Quick Paste */}
            {!url && (
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4" />
                <span>Paste</span>
              </button>
            )}

            {/* Clear Button */}
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10 cursor-pointer"
                title="Clear URL"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Clean Analyze Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isAnalyzing}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-white flex-shrink-0" />
              )}
              <span className="leading-none">Analyze</span>
            </button>
          </div>

          {/* Drag Overlay */}
          <AnimatePresence>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-[14px] bg-purple-600/40 backdrop-blur-md border-2 border-dashed border-purple-400 flex items-center justify-center z-20"
              >
                <span className="text-base text-white font-extrabold tracking-wide">Drop URL to Analyze</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="mt-4 flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitle / Hint with Generous Top Margin */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs sm:text-sm text-slate-400 mt-8 mb-4 font-medium tracking-wide"
      >
        Supports direct media URLs and public video pages • Auto-detects paste
      </motion.p>
    </motion.div>
  );
}
