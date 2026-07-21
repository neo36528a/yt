// ============================================================
// Ultra Video Downloader — GlassCard Component
// ============================================================

'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
  xl: 'p-6 md:p-8',
};

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover = false,
  glow = false,
  gradient = false,
  padding = 'md',
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl transition-all duration-300',
        paddingMap[padding],
        variant === 'default' && 'glass',
        variant === 'strong' && 'glass-strong',
        variant === 'subtle' && 'bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-2xl',
        hover && 'glass-hover cursor-pointer',
        glow && 'glow-pulse',
        gradient && 'gradient-border',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
