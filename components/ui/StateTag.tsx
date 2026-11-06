import { LinkState } from '@/lib/links';
import { cn } from '@/lib/utils';

const LABEL: Record<LinkState, string> = {
  active: 'Active',
  expiring: 'Expiring',
  expired: 'Expired',
};

export default function StateTag({
  state,
  className,
}: {
  state: LinkState;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px]',
        state === 'active' && 'text-ok',
        state === 'expiring' && 'text-warn',
        state === 'expired' && 'text-danger',
        className
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABEL[state]}
    </span>
  );
}
