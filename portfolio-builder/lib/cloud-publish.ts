import { z } from 'zod';
import { CloudSaveError } from './cloud-save';

const resultSchema = z.object({
  published: z.boolean(), path: z.string().regex(/^\/sites\/[a-z0-9-]+$/).nullable(),
}).refine(result => !result.published || result.path !== null);
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
