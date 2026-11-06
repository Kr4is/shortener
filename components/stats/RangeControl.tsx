'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';
import { isoDay } from '@/lib/utils';
import { useState } from 'react';

export type Range =
  | { kind: 'preset'; days: 7 | 30 | 90 }
  | { kind: 'custom'; from: string; to: string };

export function rangeBounds(range: Range): { from: string; to: string } {
  if (range.kind === 'custom') return { from: range.from, to: range.to };
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (range.days - 1));
  return { from: isoDay(from), to: isoDay(to) };
}

export function rangeLabel(range: Range): string {
  if (range.kind === 'preset') return `last ${range.days} days`;
  return `${range.from} → ${range.to}`;
}

type Choice = '7' | '30' | '90' | 'custom';

export default function RangeControl({
  value,
  onChange,
}: {
  value: Range;
  onChange: (range: Range) => void;
}) {
  const [choice, setChoice] = useState<Choice>(
    value.kind === 'preset' ? (String(value.days) as Choice) : 'custom'
  );
  const initial = rangeBounds(value);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const invalid = !from || !to || from > to;

  const pick = (next: Choice) => {
    setChoice(next);
    if (next !== 'custom')
      onChange({ kind: 'preset', days: Number(next) as 7 | 30 | 90 });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Segmented<Choice>
        label="Period"
        hideLabel
        value={choice}
        onChange={pick}
        options={[
          { label: '7d', value: '7' },
          { label: '30d', value: '30' },
          { label: '90d', value: '90' },
          { label: 'Custom', value: 'custom' },
        ]}
      />
      {choice === 'custom' && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!invalid) onChange({ kind: 'custom', from, to });
          }}
        >
          <label className="text-[13px] text-muted">
            <span className="sr-only">From</span>
            <Input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[10.5rem]"
            />
          </label>
          <span className="pb-2.5 text-muted">→</span>
          <label className="text-[13px] text-muted">
            <span className="sr-only">To</span>
            <Input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="w-[10.5rem]"
            />
          </label>
          <Button type="submit" disabled={invalid}>
            Apply
          </Button>
        </form>
      )}
    </div>
  );
}
