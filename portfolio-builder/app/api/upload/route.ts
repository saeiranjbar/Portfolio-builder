import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'node:crypto';
import { isLocalUploadEnabled, saveLocalUpload } from '@/lib/local-uploads';

// Images and PDFs go through this endpoint. Vercel limits request bodies to
// about 4.5MB, so large files (background videos) use /api/upload/video.
const MEDIA_EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf' };
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function validHeader(type: string, bytes: Uint8Array): boolean {
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
  if (type === 'image/gif') return ['GIF87a', 'GIF89a'].includes(ascii(0, 6));
  if (type === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
  if (type === 'application/pdf') return ascii(0, 5) === '%PDF-';
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Require a signed-in user in every environment (F13). Development storage
    // is still writable by anyone who can reach the dev server otherwise.
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!MEDIA_EXTENSIONS[file.type]) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    if (!validHeader(file.type, new Uint8Array(await file.slice(0, 12).arrayBuffer()))) {
      return NextResponse.json({ error: 'The file content does not match its type.' }, { status: 400 });
    }

    const ext = MEDIA_EXTENSIONS[file.type];

    // Development: keep files on disk under public/uploads (no Blob token or network needed)
    if (isLocalUploadEnabled()) {
      const url = await saveLocalUpload(new Uint8Array(await file.arrayBuffer()), `${randomUUID()}.${ext}`);
      return NextResponse.json({ url });
    }

    // Store in Vercel Blob so the file is available after deploy and to visitors
    const { url } = await put(`uploads/${randomUUID()}.${ext}`, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
