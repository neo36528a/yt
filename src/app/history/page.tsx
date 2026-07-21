// ============================================================
// Ultra Video Downloader — History Page (Centered & Spacious)
// ============================================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Download } from 'lucide-react';
import { HistoryCard } from '@/components/history/HistoryCard';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { HistoryCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useHistory, useDeleteHistory, useClearHistory } from '@/hooks/useHistory';
import { useUIStore } from '@/store/useUIStore';
import type { HistoryFilters as HistoryFiltersType } from '@/types';
import Link from 'next/link';

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFiltersType>({
    search: '',
    website: 'all',
    resolution: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isError } = useHistory(filters);
  const deleteMutation = useDeleteHistory();
  const clearMutation = useClearHistory();
  const { historyView } = useUIStore();

  const handleFiltersChange = (partial: Partial<HistoryFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all download history?')) {
      clearMutation.mutate();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto page-enter pt-2 pb-24">
      {/* Filters */}
      <HistoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearAll={handleClearAll}
        totalItems={data?.total || 0}
      />

      {/* Loading */}
      {isLoading && (
        <div className={`mt-6 ${historyView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <GlassCard variant="default" padding="lg" className="mt-8 text-center border border-red-500/20 bg-[#12121c]/90 p-8 shadow-2xl">
          <p className="text-red-400 mb-2 font-semibold">Failed to load download history</p>
          <p className="text-sm text-slate-400">
            Make sure the server is running and try again.
          </p>
        </GlassCard>
      )}

      {/* History Items */}
      {data && data.items.length > 0 && (
        <div
          className={`mt-6 ${
            historyView === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-4'
          }`}
        >
          <AnimatePresence mode="popLayout">
            {data.items.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                view={historyView}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State Centered */}
      {data && data.items.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center mt-12 mb-16"
        >
          <GlassCard variant="strong" padding="xl" className="w-full max-w-md mx-auto text-center border border-white/10 bg-[#12121c]/90 p-8 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center mb-5 shadow-lg">
              <HistoryIcon className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {filters.search ? 'No results found' : 'No downloads yet'}
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              {filters.search
                ? 'Try adjusting your search query or filter settings'
                : 'Your download history will appear here. Start by downloading a video!'}
            </p>
            {!filters.search && (
              <Link href="/" className="inline-block">
                <MagneticButton
                  variant="primary"
                  size="md"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download a Video
                </MagneticButton>
              </Link>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <MagneticButton
            variant="secondary"
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page <= 1}
            magnetic={false}
          >
            Previous
          </MagneticButton>
          <span className="text-sm text-slate-400 font-medium px-3">
            Page {filters.page} of {data.totalPages}
          </span>
          <MagneticButton
            variant="secondary"
            size="sm"
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page >= data.totalPages}
            magnetic={false}
          >
            Next
          </MagneticButton>
        </div>
      )}
    </div>
  );
}
