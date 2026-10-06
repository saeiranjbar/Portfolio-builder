import { z } from 'zod';
import { CloudSaveError, type CloudPortfolioReference } from './cloud-save';
import type { EditorPage } from './store';
import type { PortfolioData } from './types';
import { portfolioToSiteData } from './migrate-portfolio';
import { SiteDataSchema } from './site-types';

const recordSchema = z.object({
  id: z.string().uuid(), title: z.string(), updatedAt: z.string().datetime(), data: z.string(),
});
export type SavedWebsite = z.infer<typeof recordSchema>;
export interface LoadedWebsite {
  portfolio: PortfolioData;
  pages: EditorPage[];
  currentPageId: string;
  reference: CloudPortfolioReference;
}

export async function listSavedWebsites(signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<SavedWebsite[]> {
  const response = await fetcher('/api/portfolio', {
    credentials: 'same-origin', cache: 'no-store', signal,
  });
  if (!response.ok) {
    throw new CloudSaveError(response.status === 401
      ? 'Please sign in to see your saved websites.'
      : 'Unable to load saved websites. Please try again.', response.status);
  }
  const result = z.object({ portfolios: z.array(recordSchema) }).safeParse(await response.json());
  if (!result.success) throw new Error('The server returned an invalid website list. Please try again.');
  return result.data.portfolios;
}

export function parseSavedWebsite(record: SavedWebsite, ownerEmail: string): LoadedWebsite {
  recordSchema.parse(record);
  const raw: unknown = JSON.parse(record.data);
  const base = z.object({
    id: z.string(), name: z.string(), createdAt: z.string(), updatedAt: z.string(),
    sections: z.array(z.record(z.unknown())), theme: z.record(z.unknown()),
    metadata: z.object({ title: z.string(), description: z.string() }).passthrough(),
    pages: z.array(z.object({
      id: z.string().min(1), slug: z.string(), title: z.string(),
      themeMode: z.enum(['inherit', 'custom']).default('inherit'),
      sections: z.array(z.record(z.unknown())),
    }).passthrough()).min(1).optional(),
    currentPageId: z.string().optional(),
  }).passthrough().parse(raw);
  // Validate using the shared schemas, but keep the original content so newer
  // optional editor fields are not stripped by an older schema.
  const portfolio = base as unknown as PortfolioData;
  const site = portfolioToSiteData(portfolio);
  const pages = base.pages ?? [{ id: 'home', slug: '', title: 'Home', themeMode: 'inherit' as const, sections: base.sections }];
  const currentPageId = base.currentPageId ?? pages[0].id;
  if (new Set(pages.map(page => page.id)).size !== pages.length) throw new Error('Duplicate saved page IDs');
  const current = pages.find(page => page.id === currentPageId);
  if (!current) throw new Error('The saved current page is missing');
  // Top-level sections hold the most recent edits of the active page.
  const syncedPages = pages.map(page => page.id === currentPageId ? { ...page, sections: base.sections } : page);
  SiteDataSchema.parse({ ...site, pages: syncedPages });
  return {
    portfolio: { ...portfolio, updatedAt: record.updatedAt },
    pages: syncedPages as unknown as EditorPage[], currentPageId,
    reference: { id: record.id, ownerEmail },
  };
}
