import { z } from 'zod';
import type { EditorPage } from './store';
import type { PortfolioData } from './types';

export interface CloudPortfolioReference {
  id: string;
  ownerEmail: string;
}

export interface PortfolioSaveSnapshot {
  portfolio: PortfolioData;
  pages: EditorPage[];
  currentPageId: string;
  draftVersion: number;
}

export class CloudSaveError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CloudSaveError';
  }
}

const responseSchema = z.object({
  portfolio: z.object({ id: z.string().uuid() }),
});

const errorSchema = z.object({ error: z.string().min(1).max(300) });

export async function savePortfolioToCloud(
  snapshot: PortfolioSaveSnapshot,
  reference: CloudPortfolioReference | null,
  ownerEmail: string,
  fetcher: typeof fetch = fetch,
): Promise<CloudPortfolioReference> {
  const { portfolio, pages, currentPageId } = snapshot;
  const title = portfolio.metadata.title.trim() || portfolio.name.trim() || 'Untitled Portfolio';
  const response = await fetcher('/api/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      ...(reference?.ownerEmail === ownerEmail ? { id: reference.id } : {}),
      title,
      description: portfolio.metadata.description,
      data: {
        ...portfolio,
        pages: pages.map((page) => page.id === currentPageId
          ? { ...page, sections: portfolio.sections }
          : page),
        currentPageId,
      },
    }),
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = errorSchema.safeParse(body);
    throw new CloudSaveError(
      error.success ? error.data.error : 'Unable to save portfolio. Please try again.',
      response.status,
    );
  }

  const result = responseSchema.safeParse(body);
  if (!result.success) {
    throw new CloudSaveError('The server did not confirm the save. Please try again.', response.status);
  }

  return { id: result.data.portfolio.id, ownerEmail };
}
