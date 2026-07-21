// ============================================================
// Ultra Video Downloader — NotificationToast Component
// ============================================================

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/5',
  error: 'border-red-500/30 bg-red-500/5',
  info: 'border-cyan-500/30 bg-cyan-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-cyan-400',
  warning: 'text-amber-400',
};

export function NotificationContainer() {
  const { notifications, dismissNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 5).map((notification) => (
          <NotificationToast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onDismiss={dismissNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface NotificationToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onDismiss: (id: string) => void;
  duration?: number;
}

function NotificationToast({
  id,
  type,
  title,
  message,
  onDismiss,
  duration = 5000,
}: NotificationToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, onDismiss, duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto glass-strong rounded-xl p-4 border shadow-lg',
        colors[type],
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[type])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{message}</p>
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
