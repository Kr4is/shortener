import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-foreground placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40',
        'disabled:opacity-50 transition-colors',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
