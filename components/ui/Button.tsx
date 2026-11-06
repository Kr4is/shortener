import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const buttonClass = (
  variant: ButtonProps['variant'] = 'secondary',
  size: ButtonProps['size'] = 'md'
) =>
  cn(
    'inline-flex shrink-0 select-none items-center justify-center gap-2 rounded font-medium',
    'transition-[background-color,border-color,color] duration-100',
    'disabled:cursor-not-allowed disabled:opacity-40',
    variant === 'primary' &&
      'bg-accent text-accent-foreground shadow-card hover:bg-accent/90 active:bg-accent/80',
    variant === 'secondary' &&
      'border border-rule-strong bg-panel text-foreground shadow-card hover:bg-foreground/[0.03] hover:border-foreground/30',
    variant === 'ghost' &&
      'text-muted hover:bg-foreground/[0.06] hover:text-foreground',
    variant === 'danger' &&
      'border border-rule-strong bg-panel text-danger shadow-card hover:border-danger/50 hover:bg-danger/[0.06]',
    size === 'sm' && 'h-8 px-3 text-[13px]',
    size === 'md' && 'h-10 px-4 text-sm',
    size === 'lg' && 'h-11 px-5 text-[15px]',
    size === 'icon' && 'h-8 w-8 text-[13px]'
  );

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClass(variant, size), className)}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export default Button;
