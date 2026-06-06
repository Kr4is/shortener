'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onApply,
  onClear,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div>
        <label className="text-xs text-muted mb-1 block">From</label>
        <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted mb-1 block">To</label>
        <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
      </div>
      <Button variant="secondary" size="sm" onClick={onApply}>
        Apply
      </Button>
      {(from || to) && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}
