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
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' &&
            'bg-accent text-accent-foreground hover:opacity-90 shadow-sm',
          variant === 'secondary' &&
            'bg-background text-foreground border border-border hover:bg-card',
          variant === 'ghost' && 'text-foreground hover:bg-background',
          variant === 'outline' &&
            'border border-border text-foreground hover:bg-background',
          variant === 'destructive' &&
            'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
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
