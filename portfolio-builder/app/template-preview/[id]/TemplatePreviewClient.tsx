'use client';

import { useMemo } from 'react';
import { SiteRenderer } from '@/components/site/SiteRenderer';
import { templates } from '@/lib/templates';
import { makeTemplatePortfolio } from '@/lib/template-portfolio';
import type { EditorPage } from '@/lib/store';

export function TemplatePreviewClient({ templateId }: { templateId: string }) {
  const site = useMemo(() => {
    const template = templates.find(item => item.id === templateId);
    if (!template) return null;
    const portfolio = makeTemplatePortfolio(template, { stable: true });
    const pages: EditorPage[] = [{ id: 'home', slug: '', title: 'Home', themeMode: 'inherit', sections: portfolio.sections }];
    return { portfolio, pages };
  }, [templateId]);
  if (!site) return null;
  return <SiteRenderer portfolio={site.portfolio} pages={site.pages} pageId="home" />;
}
