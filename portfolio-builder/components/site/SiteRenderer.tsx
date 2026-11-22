'use client';

import { useState } from 'react';
import { PortfolioPreview } from '@/components/builder/PortfolioPreview';
import { PortfolioStoreProvider, createPublishedPortfolioStore, type EditorPage } from '@/lib/store';
import type { PortfolioData } from '@/lib/types';

/**
 * Read-only site renderer: the single entry point for every surface that shows
 * a site without editing it (published pages, template previews).
 *
 * It renders into its own non-persisted store with every editing action
 * replaced by a no-op, so it can never read or change the editor's draft. In
 * this mode the page renderer uses the static grid and does not load the drag
 * engine, rulers or other editor controls.
 */
export function SiteRenderer({ portfolio, pages, pageId, viewMode = 'desktop' }: {
  portfolio: PortfolioData;
  pages: EditorPage[];
  pageId: string;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}) {
  const [store] = useState(() => createPublishedPortfolioStore(portfolio, pages, pageId));
  return (
    <PortfolioStoreProvider store={store}>
      <PortfolioPreview viewMode={viewMode} />
    </PortfolioStoreProvider>
  );
}
