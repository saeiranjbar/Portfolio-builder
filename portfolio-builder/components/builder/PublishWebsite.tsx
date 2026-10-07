'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Loader2, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { checkSubdomain, requestPublication, type Publication } from '@/lib/cloud-publish';
import { chosenSubdomain } from '@/lib/tenant-domains';
import type { CloudPortfolioReference } from '@/lib/cloud-save';
import toast from 'react-hot-toast';

export function PublishWebsite({ reference, ownerEmail, busy, onPublish }: {
  reference: CloudPortfolioReference | null; ownerEmail?: string | null; busy: boolean;
  onPublish: (subdomain?: string) => Promise<Publication | undefined>;
}) {
  const [open, setOpen] = useState(false);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const workingRef = useRef(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [addressState, setAddressState] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [addressMessage, setAddressMessage] = useState('');
  const [baseDomain, setBaseDomain] = useState('');
  const id = reference?.ownerEmail === ownerEmail ? reference?.id : undefined;

  useEffect(() => {
    if (!open || workingRef.current) return;
    setOrigin(window.location.origin);
    setPublication(null);
    setError('');
    setSubdomain('');
    setBaseDomain('');
    const controller = new AbortController();
    setLoading(true);
    const status = requestPublication(id ?? '', 'status', controller.signal);
    status.then(result => {
      if (!controller.signal.aborted) {
        setPublication(result);
        setBaseDomain(result.baseDomain || '');
        setSubdomain(result.domain?.split('.')[0] || '');
      }
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Unable to check publication.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [open, id]);

  useEffect(() => {
    if (!open || !baseDomain) return;
    setAddressMessage('');
    if (!subdomain) { setAddressState('idle'); return; }
    if (!chosenSubdomain(subdomain)) {
      setAddressState('invalid'); setAddressMessage('Use letters, numbers and hyphens. This name may be reserved.'); return;
    }
    setAddressState('checking');
    const controller = new AbortController();
    const timer = setTimeout(() => {
      checkSubdomain(subdomain, id, controller.signal).then(result => {
        if (controller.signal.aborted) return;
        setAddressState(result.available ? 'available' : 'taken');
        setAddressMessage(result.available ? 'This address is available.' : 'That address is taken. Choose another name.');
      }).catch(failure => {
        if (controller.signal.aborted) return;
        setAddressState('invalid'); setAddressMessage(failure instanceof Error ? failure.message : 'Unable to check availability.');
      });
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, baseDomain, subdomain, id]);

  async function publish() {
    workingRef.current = true;
    setWorking(true);
    setError('');
    try { const result = await onPublish(baseDomain ? subdomain : undefined); if (result) setPublication(result); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to publish.'); }
    finally { workingRef.current = false; setWorking(false); }
  }
  async function unpublish() {
    if (!id) return;
    setWorking(true);
    workingRef.current = true;
    setError('');
    try { setPublication(await requestPublication(id, 'unpublish')); toast.success('Website unpublished'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to unpublish.'); }
    finally { workingRef.current = false; setWorking(false); }
  }
  const url = publication?.url ?? (publication?.path ? `${origin}${publication.path}` : '');
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
        {baseDomain && <div className="space-y-2">
          <label htmlFor="website-subdomain" className="text-sm font-medium">Choose your website address</label>
          <div className="flex flex-wrap items-center gap-2">
            <input id="website-subdomain" value={subdomain} maxLength={63} autoComplete="off" spellCheck={false}
              disabled={busy || working} onChange={event => { setSubdomain(event.target.value.toLowerCase()); setAddressState('checking'); setError(''); }}
              placeholder="your-name" className="min-w-0 flex-1 rounded border p-2 text-sm" />
            <span className="text-sm text-gray-600">.{baseDomain}</span>
          </div>
          <p role="status" className={`text-sm ${addressState === 'available' ? 'text-green-700' : 'text-gray-600'}`}>
            {addressState === 'checking' ? 'Checking availability…' : addressMessage || 'Choose a memorable name for your public link.'}
          </p>
          {publication?.domain && `${subdomain}.${baseDomain}` !== publication.domain && <p className="text-xs text-gray-500">Your previous public link will keep working after you change this address.</p>}
        </div>}
        {publication?.published && <div className="space-y-3">
          <p className="font-medium text-green-700">Your website is live</p>
          <input aria-label="Public website URL" readOnly value={url} className="w-full rounded border p-2 text-sm" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(url).then(() => toast.success('Link copied')).catch(() => toast.error('Select and copy the link above.')); }}><Copy className="mr-2 w-4 h-4" />Copy link</Button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-700"><ExternalLink className="w-4 h-4" />Open website</a>
          </div>
        </div>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={busy || working || loading || Boolean(error) || Boolean(baseDomain && addressState !== 'available')} onClick={() => void publish()}>
            {(busy || working) && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            {publication?.published ? 'Save and update live website' : 'Save and publish'}
          </Button>
          {publication?.published && <Button variant="outline" disabled={busy || working || loading} onClick={() => void unpublish()}>Unpublish</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
