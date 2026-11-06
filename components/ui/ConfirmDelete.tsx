'use client';

import Button from './Button';
import Dialog from './Dialog';

interface ConfirmDeleteProps {
  slug: string | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDelete({
  slug,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDeleteProps) {
  return (
    <Dialog open={!!slug} onClose={onCancel} title="Delete link">
      <p className="text-sm text-muted">
        <span className="font-mono text-[13px] text-foreground">/s/{slug}</span>{' '}
        will stop redirecting and its click history will be removed. This cannot
        be undone.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={onCancel} disabled={loading} autoFocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete link'}
        </Button>
      </div>
    </Dialog>
  );
}
