import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Images and PDFs go through this endpoint. Vercel limits request bodies to
// about 4.5MB, so large files (background videos) use /api/upload/video.
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // In production, require authentication
    // For now, allow uploads in development
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Store in Vercel Blob so the file is available after deploy and to visitors
    const ext = file.name.split('.').pop() || 'jpg';
    const { url } = await put(`uploads/${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${ext}`, file, {
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
