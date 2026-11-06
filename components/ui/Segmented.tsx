'use client';

import { cn } from '@/lib/utils';
import { useId } from 'react';

interface Option<T> {
  label: string;
  value: T;
}

interface SegmentedProps<T> {
  label: string;
  hideLabel?: boolean;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

/** A radio group drawn as joined segments; the chosen one is reverse video. */
export default function Segmented<T extends string | number>({
  label,
  hideLabel,
  options,
  value,
  onChange,
  disabled,
  className,
}: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className={cn('min-w-0', className)} disabled={disabled}>
      <legend
        className={cn('mb-1.5 text-sm font-medium', hideLabel && 'sr-only')}
      >
        {label}
      </legend>
      <div className="flex h-10 rounded border border-rule-strong bg-foreground/[0.03] p-[3px] sm:inline-flex">
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <label
              key={String(opt.value)}
              className={cn(
                'relative flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm transition-colors sm:flex-none',
                checked
                  ? 'bg-panel font-medium text-foreground shadow-card ring-1 ring-rule-strong/70'
                  : 'text-muted hover:text-foreground',
                '[&:has(:focus-visible)]:outline [&:has(:focus-visible)]:outline-2 [&:has(:focus-visible)]:outline-offset-2 [&:has(:focus-visible)]:outline-accent',
                disabled && 'cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(opt.value)}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
