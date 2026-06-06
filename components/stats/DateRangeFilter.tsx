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
      <div className="flex-1 sm:max-w-[180px]">
        <label className="text-xs font-medium text-muted mb-1.5 block">
          From
        </label>
        <Input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </div>
      <div className="flex-1 sm:max-w-[180px]">
        <label className="text-xs font-medium text-muted mb-1.5 block">
          To
        </label>
        <Input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
        />
      </div>
      <Button variant="primary" size="sm" onClick={onApply}>
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
