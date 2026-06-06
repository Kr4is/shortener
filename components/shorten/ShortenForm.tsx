'use client';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { createShortUrl } from '@/lib/api';
import { motion } from 'framer-motion';
import { AlertCircle, Link2, Loader2, Tag } from 'lucide-react';
import { useState } from 'react';
import ResultCard from './ResultCard';

const URL_PATTERN = /^https?:\/\/.+/i;
const ALIAS_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$/;

export default function ShortenForm() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isUrlValid = URL_PATTERN.test(url.trim());
  const isAliasValid = !alias.trim() || ALIAS_PATTERN.test(alias.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setShortenedUrl('');

    try {
      const slug = await createShortUrl(url.trim(), alias.trim() || undefined);
      setShortenedUrl(`${window.location.origin}/s/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">
                Long URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="url"
                  placeholder="https://your-long-url.com/page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">
                Custom alias <span className="font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="text"
                  placeholder="my-custom-link"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                Your link will be /s/{alias.trim() || 'auto-generated-key'}
              </p>
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
          className="max-w-2xl mx-auto rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive"
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
