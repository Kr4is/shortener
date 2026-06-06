'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -1 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border-l-[3px] border-l-accent transition-shadow hover:shadow-warm-md',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-card-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted truncate max-w-[180px]">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
