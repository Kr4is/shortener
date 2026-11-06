import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export const fieldClass =
  'h-10 w-full rounded border border-rule-strong bg-panel px-3 text-sm text-foreground placeholder:text-muted/80 transition-colors hover:border-foreground/30 focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-[3px] focus:ring-accent/20 disabled:opacity-50 aria-[invalid=true]:border-danger';

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, className)} {...props} />
));

Input.displayName = 'Input';

export default Input;
