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
        'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
        'disabled:opacity-50 transition-colors',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
