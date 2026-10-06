'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FolderOpen, Loader2 } from 'lucide-react';
import { listSavedWebsites, parseSavedWebsite, type SavedWebsite } from '@/lib/cloud-load';
import { usePortfolioStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Props { onOpened?: () => void; dark?: boolean; disabled?: boolean }

export function SavedWebsites(props: Props) {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  if (!session?.user?.email) return (
    <Link href="/login" className={props.dark ? 'text-sm text-blue-200 underline' : 'text-sm text-blue-700 underline'}>
      Sign in to open saved websites
    </Link>
  );
  // Account changes unmount the old list and abort its pending request.
  return <AccountWebsites key={session.user.email} ownerEmail={session.user.email} {...props} />;
}

function AccountWebsites({ ownerEmail, onOpened, dark, disabled }: Props & { ownerEmail: string }) {
  const [open, setOpen] = useState(false);
  const [websites, setWebsites] = useState<SavedWebsite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [pending, setPending] = useState<SavedWebsite | null>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let active = true;
    listSavedWebsites(controller.signal).then(items => {
      if (active) setWebsites(items);
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load saved websites.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [open, ownerEmail, retry]);

  function startLoading() {
    setLoading(true);
    setError('');
    setPending(null);
  }

  function load(record: SavedWebsite, discard = false) {
    if (!discard && usePortfolioStore.getState().isDirty) {
      setPending(record);
      return;
    }
    try {
      const website = parseSavedWebsite(record, ownerEmail);
      usePortfolioStore.getState().loadCloudPortfolio(website);
      setOpen(false);
      onOpened?.();
    } catch {
      setPending(null);
      setError('This website could not be opened because its saved content is invalid. Your current draft is unchanged.');
    }
  }

  return <>
    <Button variant="outline" disabled={disabled} onClick={() => { startLoading(); setOpen(true); }}
      className={dark ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white' : undefined}>
      <FolderOpen className="mr-2 h-4 w-4" />Saved websites
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent role="dialog" aria-modal="true" aria-labelledby="saved-websites-title" className="max-h-[85vh] overflow-y-auto">
        <DialogTitle id="saved-websites-title">Saved websites</DialogTitle>
        <DialogDescription>Open a website saved to your account and continue editing.</DialogDescription>
        {loading ? <p role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading websites…</p>
          : error ? <div role="alert"><p className="mb-3 text-sm text-red-700">{error}</p><Button variant="outline" onClick={() => { startLoading(); setRetry(value => value + 1); }}>Try again</Button></div>
          : pending ? <div>
            <p className="mb-4 text-sm">You have unsaved changes. Opening “{pending.title}” will replace your current draft.</p>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setPending(null)}>Keep editing</Button>
              <Button onClick={() => load(pending, true)}>Discard changes and open</Button></div>
          </div>
          : websites.length === 0 ? <p className="text-sm text-gray-600">No saved websites yet. Create a website and click Save to see it here.</p>
          : <ul className="space-y-2">{websites.map(website => <li key={website.id}>
            <button onClick={() => load(website)} className="w-full rounded-lg border p-3 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-500">
              <span className="block font-medium text-gray-900">{website.title}</span>
              <span className="text-xs text-gray-500">Saved {new Date(website.updatedAt).toLocaleString()}</span>
            </button>
          </li>)}</ul>}
      </DialogContent>
    </Dialog>
  </>;
}
