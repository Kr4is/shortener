'use client';

import Button from '@/components/ui/Button';
import { fieldClass } from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';
import { createShortUrl, fetchUrlPreview } from '@/lib/api';
import { useHotkeys } from '@/lib/hotkeys';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const URL_PATTERN = /^https?:\/\/[^\s/$.?#][^\s]*$/i;
const ALIAS_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/;

const EXPIRY_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export interface CreatedLink {
  slug: string;
  url: string;
  /** Set when the URL already existed and the requested alias was not applied. */
  aliasIgnored?: string;
}

export interface Draft {
  url: string;
  urlValid: boolean;
  alias: string;
  aliasValid: boolean;
  expiresInDays: number;
  title: string | null;
  titleLoading: boolean;
}

type Preview =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; title: string | null };

export default function ShortenForm({
  onCreated,
  onDraft,
}: {
  onCreated: (link: CreatedLink) => void;
  onDraft?: (draft: Draft) => void;
}) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [preview, setPreview] = useState<Preview>({ status: 'idle' });
  const urlRef = useRef<HTMLInputElement>(null);

  const trimmedUrl = url.trim();
  const trimmedAlias = alias.trim();
  const urlValid = URL_PATTERN.test(trimmedUrl);
  const aliasValid = !trimmedAlias || ALIAS_PATTERN.test(trimmedAlias);
  const showUrlError = touched && trimmedUrl.length > 0 && !urlValid;
  const showAliasError = trimmedAlias.length > 0 && !aliasValid;

  useEffect(() => {
    urlRef.current?.focus();
  }, []);

  useEffect(() => {
    onDraft?.({
      url: trimmedUrl,
      urlValid,
      alias: trimmedAlias,
      aliasValid,
      expiresInDays,
      title: preview.status === 'done' ? preview.title : null,
      titleLoading: preview.status === 'loading',
    });
  }, [
    onDraft,
    trimmedUrl,
    urlValid,
    trimmedAlias,
    aliasValid,
    expiresInDays,
    preview,
  ]);

  useHotkeys({
    '/': (e) => {
      e.preventDefault();
      urlRef.current?.focus();
    },
  });

  // Paste anywhere on the page fills the URL field.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      const text = e.clipboardData?.getData('text')?.trim();
      if (!text) return;
      e.preventDefault();
      setUrl(text);
      setTouched(true);
      urlRef.current?.focus();
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  useEffect(() => {
    if (!urlValid) {
      setPreview({ status: 'idle' });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreview({ status: 'loading' });
      try {
        const result = await fetchUrlPreview(trimmedUrl);
        if (!cancelled) setPreview({ status: 'done', title: result.title });
      } catch {
        if (!cancelled) setPreview({ status: 'done', title: null });
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedUrl, urlValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!urlValid || !aliasValid || submitting) {
      urlRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const slug = await createShortUrl(
        trimmedUrl,
        trimmedAlias || undefined,
        expiresInDays || undefined
      );
      onCreated({
        slug,
        url: trimmedUrl,
        aliasIgnored:
          trimmedAlias && slug !== trimmedAlias ? trimmedAlias : undefined,
      });
      setUrl('');
      setAlias('');
      setTouched(false);
      setPreview({ status: 'idle' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not shorten this URL'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="long-url" className="mb-1.5 block text-sm font-medium">
          Long URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={urlRef}
            id="long-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            onBlur={() => setTouched(true)}
            disabled={submitting}
            aria-invalid={showUrlError}
            aria-describedby="long-url-hint"
            className={cn(fieldClass, 'h-11 px-3.5 text-[15px] sm:flex-1')}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="sm:w-36"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Shortening
              </>
            ) : (
              <>Shorten</>
            )}
          </Button>
        </div>
        <p
          id="long-url-hint"
          aria-live="polite"
          className={cn(
            'mt-2 min-h-[1.5rem] truncate text-[13px]',
            showUrlError ? 'text-danger' : 'text-muted'
          )}
        >
          {showUrlError
            ? 'That doesn’t look like a web address. Start it with http:// or https://'
            : preview.status === 'loading'
              ? 'Reading page title…'
              : preview.status === 'done' && preview.title
                ? `Page title: ${preview.title}`
                : preview.status === 'done'
                  ? 'No page title found. The link will still work.'
                  : 'Tip: paste anywhere on this page to fill this field.'}
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor="alias" className="mb-1.5 block text-sm font-medium">
            Custom alias{' '}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <div
            className={cn(
              'flex h-10 overflow-hidden rounded border border-rule-strong bg-panel transition-colors hover:border-foreground/30',
              'focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20',
              showAliasError && 'border-danger'
            )}
          >
            <span className="flex items-center border-r border-rule bg-foreground/[0.03] px-3 font-mono text-[13px] text-muted">
              /s/
            </span>
            <input
              id="alias"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="spring-meetup"
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value);
                setError('');
              }}
              disabled={submitting}
              maxLength={32}
              aria-invalid={showAliasError}
              aria-describedby="alias-hint"
              className="min-w-0 flex-1 bg-transparent px-3 font-mono text-[13px] text-foreground placeholder:text-muted/70 focus:outline-none focus-visible:outline-none"
            />
          </div>
          <p
            id="alias-hint"
            className={cn(
              'mt-1.5 text-[13px]',
              showAliasError ? 'text-danger' : 'text-muted'
            )}
          >
            {showAliasError
              ? '3–32 characters: letters, digits and hyphens, not starting with a hyphen.'
              : 'Leave empty for a random key.'}
          </p>
        </div>

        <Segmented
          label="Expires after"
          options={EXPIRY_OPTIONS}
          value={expiresInDays}
          onChange={setExpiresInDays}
          disabled={submitting}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </form>
  );
}
