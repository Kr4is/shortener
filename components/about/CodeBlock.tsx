'use client';

import { copyText } from '@/lib/links';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function CodeBlock({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <figure className="panel overflow-hidden">
      <figcaption className="flex items-center justify-between border-b border-rule px-4 py-2 text-[13px]">
        <span className="font-medium">{title}</span>
        <button
          type="button"
          onClick={async () => {
            if (await copyText(code)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
          className="inline-flex items-center gap-1.5 text-muted hover:text-foreground"
          aria-label={`Copy: ${title}`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto bg-foreground/[0.025] p-4 font-mono text-[13px] leading-relaxed">
        <code className="!bg-transparent !p-0">{code}</code>
      </pre>
    </figure>
  );
}
