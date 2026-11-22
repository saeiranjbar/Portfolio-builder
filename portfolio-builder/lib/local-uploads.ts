import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Development-only file storage. Production uploads go to Vercel Blob; in
// development files are written under public/uploads/ so the sweep and local
// work never depend on a Blob token or network access.
export function isLocalUploadEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

// `name` must be a generated file name (UUID plus allowlisted extension), never
// user input, so this cannot write outside public/uploads/.
export async function saveLocalUpload(bytes: Uint8Array, name: string): Promise<string> {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif|pdf|mp4|webm|ogv|mov)$/.test(name)) {
    throw new Error('Invalid generated upload name');
  }
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}
