import { cn } from '@/lib/utils';

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-background border border-border px-2.5 py-0.5 text-xs font-medium text-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
