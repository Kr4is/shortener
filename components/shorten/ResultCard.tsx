'use client';

import Button from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, QrCode } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import QrCodeModal from './QrCodeModal';

export default function ResultCard({ url }: { url: string }) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-success/30 bg-success/5">
          <CardTitle className="flex items-center gap-2 text-success mb-3">
            <Check className="h-5 w-5" />
            Your link is ready
          </CardTitle>
          <p className="font-mono text-sm text-foreground break-all bg-background border border-border rounded-lg px-4 py-3 mb-4">
            {url}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-3 py-1.5 text-sm border border-border text-foreground hover:bg-background transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </div>
        </Card>
      </motion.div>
      <QrCodeModal url={url} open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}
