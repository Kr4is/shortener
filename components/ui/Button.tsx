import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          variant === 'primary' &&
            'bg-accent text-accent-foreground hover:brightness-105 shadow-accent-sm',
          variant === 'secondary' &&
            'bg-surface-elevated text-foreground border border-border hover:border-accent/20 hover:bg-accent/5',
          variant === 'ghost' &&
            'text-foreground hover:bg-accent/5 hover:text-foreground',
          variant === 'outline' &&
            'border border-border text-foreground hover:border-accent/30 hover:bg-accent/5',
          variant === 'destructive' &&
            'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-2.5 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
