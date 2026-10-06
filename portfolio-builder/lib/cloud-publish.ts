import { z } from 'zod';
import { CloudSaveError } from './cloud-save';

const resultSchema = z.object({
  published: z.boolean(), path: z.string().regex(/^\/sites\/[a-z0-9-]+$/).nullable(),
  url: z.string().url().nullable().optional(),
  domain: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:[a-z0-9-]+\.)+[a-z0-9-]+$/).nullable().optional(),
}).refine(result => !result.published || result.path !== null).refine(result => {
  if (!result.url) return true;
  try {
    const url = new URL(result.url);
    return (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) &&
      !url.username && !url.password && !url.search && !url.hash &&
      (url.pathname === result.path || (url.protocol === 'https:' && url.pathname === '/' && url.hostname === result.domain));
  } catch { return false; }
});
export type Publication = z.infer<typeof resultSchema>;

export async function requestPublication(id: string, action: 'status' | 'publish' | 'unpublish', signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<Publication> {
  const response = await fetcher(action === 'publish' ? '/api/publish' : `/api/publish?id=${encodeURIComponent(id)}`, {
    method: action === 'status' ? 'GET' : action === 'publish' ? 'POST' : 'DELETE',
    credentials: 'same-origin', cache: 'no-store', signal,
    ...(action === 'publish' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) } : {}),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new CloudSaveError(typeof body?.error === 'string' ? body.error : 'Unable to publish. Please try again.', response.status);
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) throw new Error('The server returned an invalid publication. Please try again.');
  return parsed.data;
}
