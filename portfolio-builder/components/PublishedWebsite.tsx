'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PortfolioPreview } from '@/components/builder/PortfolioPreview';
import { PortfolioStoreProvider, createPublishedPortfolioStore, type EditorPage } from '@/lib/store';
import type { PortfolioData } from '@/lib/types';

export function PublishedWebsite({ portfolio, pages, page, basePath }: {
  portfolio: PortfolioData; pages: EditorPage[]; page: EditorPage; basePath: string;
}) {
  const [store] = useState(() => createPublishedPortfolioStore({
    ...portfolio, sections: page.sections,
    theme: page.themeMode === 'custom' && page.themeOverride ? page.themeOverride : portfolio.theme,
  }, pages, page.id));
  return <PortfolioStoreProvider store={store}>
    {pages.length > 1 && <nav aria-label="Website pages" className="flex flex-wrap justify-center gap-6 px-4 py-3"
      style={{ backgroundColor: portfolio.theme.colors.background, color: portfolio.theme.colors.text }}>
      {pages.map(item => <Link key={item.id} href={`${basePath}${item.slug ? `/${item.slug}` : ''}`}
        aria-current={item.id === page.id ? 'page' : undefined}
        className={item.id === page.id ? 'font-semibold underline underline-offset-4' : 'hover:underline'}>{item.title}</Link>)}
    </nav>}
    <PortfolioPreview viewMode="desktop" />
  </PortfolioStoreProvider>;
}
