'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Native <dialog>: focus trap, Escape and inert background come for free. */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        'w-[min(92vw,26rem)] rounded-lg border border-rule bg-panel p-0 text-foreground shadow-dialog',
        className
      )}
    >
      {open && (
        <div>
          <div className="flex h-12 items-center justify-between border-b border-rule pl-5 pr-2">
            <h2 id="dialog-title" className="text-[15px] font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-foreground/[0.06] hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
