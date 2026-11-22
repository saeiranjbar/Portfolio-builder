import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isLocalUploadEnabled, saveLocalUpload } from '@/lib/local-uploads';

// Development-only video storage. Production videos go through /api/upload/video
// to Vercel Blob. This route does not exist for production traffic.
const VIDEO_EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
};
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

// Container signatures: MP4/MOV carry 'ftyp' at byte 4, WebM uses EBML, Ogg uses 'OggS'.
function validContainer(bytes: Uint8Array): boolean {
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  if (ascii(4, 4) === 'ftyp') return true;
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return true;
  return ascii(0, 4) === 'OggS';
}

export async function POST(request: NextRequest) {
  if (!isLocalUploadEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = VIDEO_EXTENSIONS[file.type];
    if (!ext) return NextResponse.json({ error: 'Invalid video type' }, { status: 400 });
    if (file.size > MAX_VIDEO_BYTES) return NextResponse.json({ error: 'Video too large (max 200MB)' }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validContainer(bytes.slice(0, 12))) {
      return NextResponse.json({ error: 'The file content does not match a video format.' }, { status: 400 });
    }

    const url = await saveLocalUpload(bytes, `${randomUUID()}.${ext}`);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Local video upload error:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}
