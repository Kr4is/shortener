'use client';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { createShortUrl, fetchUrlPreview } from '@/lib/api';
import { motion } from 'framer-motion';
import { AlertCircle, Link2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ResultCard from './ResultCard';

const URL_PATTERN = /^https?:\/\/.+/i;
const ALIAS_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/;

const EXPIRY_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function ShortenForm() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(0);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isUrlValid = URL_PATTERN.test(url.trim());
  const isAliasValid = !alias.trim() || ALIAS_PATTERN.test(alias.trim());

  useEffect(() => {
    if (!isUrlValid) {
      setPreviewTitle(null);
      return;
    }

    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const preview = await fetchUrlPreview(url.trim());
        setPreviewTitle(preview.title);
      } catch {
        setPreviewTitle(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url, isUrlValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setShortenedUrl('');

    try {
      const slug = await createShortUrl(
        url.trim(),
        alias.trim() || undefined,
        expiresInDays || undefined
      );
      const shortUrl = `${window.location.origin}/s/${slug}`;
      setShortenedUrl(shortUrl);
      toast.success('Link shortened successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card elevated className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Long URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="url"
                  placeholder="https://your-long-url.com/page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
              {previewLoading && (
                <p className="mt-2 text-xs text-muted">Loading preview...</p>
              )}
              {previewTitle && !previewLoading && (
                <div className="mt-2 inline-flex max-w-full items-center rounded-full bg-accent-muted/70 border border-accent/20 px-3 py-1">
                  <span
                    className="text-xs text-foreground truncate"
                    title={previewTitle}
                  >
                    {previewTitle}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Custom alias{' '}
                <span className="font-normal text-muted">(optional)</span>
              </label>
              <div className="flex rounded-xl border border-border bg-surface-elevated overflow-hidden focus-within:ring-2 focus-within:ring-accent/25 focus-within:border-accent/40 transition-all">
                <span className="inline-flex items-center px-3.5 font-mono text-sm text-muted border-r border-border bg-accent/5">
                  /s/
                </span>
                <input
                  type="text"
                  placeholder="my-custom-link"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-3 py-2.5 text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Expires in
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setExpiresInDays(opt.value)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-medium transition-all border',
                      expiresInDays === opt.value
                        ? 'bg-accent text-accent-foreground border-accent shadow-accent-sm'
                        : 'bg-surface-elevated text-muted border-border hover:border-accent/30 hover:text-foreground'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {url && !isUrlValid && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Enter a valid URL starting with http:// or https://
              </p>
            )}

            {alias && !isAliasValid && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Alias must be 3-32 chars: letters, digits, hyphens
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={
                isLoading || !url.trim() || !isUrlValid || !isAliasValid
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Shortening...
                </>
              ) : (
                'Shorten URL'
              )}
            </Button>
          </form>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive"
        >
          <p className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        </motion.div>
      )}

      {shortenedUrl && <ResultCard url={shortenedUrl} />}
    </div>
  );
}
