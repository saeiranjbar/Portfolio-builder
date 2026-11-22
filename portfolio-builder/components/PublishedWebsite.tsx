'use client';

import Link from 'next/link';
import { SiteRenderer } from '@/components/site/SiteRenderer';
import type { EditorPage } from '@/lib/store';
import type { PortfolioData } from '@/lib/types';

export function PublishedWebsite({ portfolio, pages, page, basePath }: {
  portfolio: PortfolioData; pages: EditorPage[]; page: EditorPage; basePath: string;
}) {
  const pagePortfolio: PortfolioData = {
    ...portfolio, sections: page.sections,
    theme: page.themeMode === 'custom' && page.themeOverride ? page.themeOverride : portfolio.theme,
  };
  return <>
    {pages.length > 1 && <nav aria-label="Website pages" className="flex flex-wrap justify-center gap-6 px-4 py-3"
      style={{ backgroundColor: portfolio.theme.colors.background, color: portfolio.theme.colors.text }}>
      {pages.map(item => <Link key={item.id} href={item.slug ? `${basePath === '/' ? '' : basePath}/${item.slug}` : basePath}
        aria-current={item.id === page.id ? 'page' : undefined}
        className={item.id === page.id ? 'font-semibold underline underline-offset-4' : 'hover:underline'}>{item.title}</Link>)}
    </nav>}
    <SiteRenderer portfolio={pagePortfolio} pages={pages} pageId={page.id} />
  </>;
}
