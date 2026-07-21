// ============================================================
// Ultra Video Downloader — HistoryFilters Component (Polished)
// ============================================================

'use client';

import { motion } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Trash2,
} from 'lucide-react';
import type { HistoryFilters as HistoryFiltersType, Resolution } from '@/types';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

interface HistoryFiltersProps {
  filters: HistoryFiltersType;
  onFiltersChange: (filters: Partial<HistoryFiltersType>) => void;
  onClearAll: () => void;
  totalItems: number;
}

const resolutionOptions: { value: Resolution | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '2160p', label: '4K' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
];

const sortOptions: { value: HistoryFiltersType['sortBy']; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];

export function HistoryFilters({
  filters,
  onFiltersChange,
  onClearAll,
  totalItems,
}: HistoryFiltersProps) {
  const { historyView, setHistoryView } = useUIStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 mb-8"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Download History</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{totalItems} total downloads</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setHistoryView('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                historyView === 'grid'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white',
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setHistoryView('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                historyView === 'list'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white',
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Clear all */}
          {totalItems > 0 && (
            <MagneticButton
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={onClearAll}
              magnetic={false}
            >
              Clear All
            </MagneticButton>
          )}
        </div>
      </div>

      {/* Filter Controls Box: Search + Resolution Pills + Sort Options */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#12121c]/90 border border-white/10 p-4 rounded-2xl shadow-xl backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none z-10" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search downloads..."
            className="w-full bg-[#181826] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 py-2.5 transition-all"
            style={{ paddingLeft: '2.6rem', paddingRight: '1rem' }}
          />
        </div>

        {/* Resolution Pills & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Resolution Pills */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner">
            {resolutionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFiltersChange({ resolution: opt.value })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  filters.resolution === opt.value
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  if (filters.sortBy === opt.value) {
                    onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
                  } else {
                    onFiltersChange({ sortBy: opt.value, sortOrder: 'desc' });
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  filters.sortBy === opt.value
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                <span>{opt.label}</span>
                {filters.sortBy === opt.value && (
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
