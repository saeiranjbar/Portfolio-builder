'use client';

import { useEffect, useState } from 'react';
import { Globe, Loader2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { requestPublication, type Publication } from '@/lib/cloud-publish';
import type { CloudPortfolioReference } from '@/lib/cloud-save';
import toast from 'react-hot-toast';

export function PublishWebsite({ reference, ownerEmail, busy, onPublish }: {
  reference: CloudPortfolioReference | null; ownerEmail?: string | null; busy: boolean;
  onPublish: () => Promise<Publication | undefined>;
}) {
  const [open, setOpen] = useState(false);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');
  const id = reference?.ownerEmail === ownerEmail ? reference?.id : undefined;

  useEffect(() => {
    if (!open || working) return;
    setOrigin(window.location.origin);
    setPublication(null);
    setError('');
    if (!id) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    requestPublication(id, 'status', controller.signal).then(result => {
      if (!controller.signal.aborted) setPublication(result);
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Unable to check publication.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, id, working]);

  async function publish() {
    setWorking(true);
    setError('');
    try { const result = await onPublish(); if (result) setPublication(result); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to publish.'); }
    finally { setWorking(false); }
  }
  async function unpublish() {
    if (!id) return;
    setWorking(true);
    setError('');
    try { setPublication(await requestPublication(id, 'unpublish')); toast.success('Website unpublished'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to unpublish.'); }
    finally { setWorking(false); }
  }
  const url = publication?.path ? `${origin}${publication.path}` : '';
  return <>
    <Button variant="outline" disabled={busy || working} onClick={() => setOpen(true)} className="flex items-center gap-2">
      <Globe className="w-4 h-4" />Publish
    </Button>
    <Dialog open={open} onOpenChange={next => { if (!busy && !working) setOpen(next); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Publish your website</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600">Anyone with your public link can view the published website without signing in. Saving a draft keeps your live website unchanged until you publish again.</p>
        {loading && <p role="status" className="flex gap-2"><Loader2 className="w-4 h-4 animate-spin" />Checking publication…</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {publication?.published && <div className="space-y-3">
          <p className="font-medium text-green-700">Your website is live</p>
          <input aria-label="Public website URL" readOnly value={url} className="w-full rounded border p-2 text-sm" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(url).then(() => toast.success('Link copied')).catch(() => toast.error('Select and copy the link above.')); }}><Copy className="mr-2 w-4 h-4" />Copy link</Button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-700"><ExternalLink className="w-4 h-4" />Open website</a>
          </div>
        </div>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={busy || working || loading} onClick={() => void publish()}>
            {(busy || working) && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            {publication?.published ? 'Save and update live website' : 'Save and publish'}
          </Button>
          {publication?.published && <Button variant="outline" disabled={busy || working || loading} onClick={() => void unpublish()}>Unpublish</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
