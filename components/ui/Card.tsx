import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({
  className,
  children,
  elevated = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-6',
        elevated ? 'shadow-warm-lg' : 'shadow-warm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      className={cn(
        'text-sm font-medium text-muted uppercase tracking-wide',
        className
      )}
    >
      {children}
    </h3>
  );
}
