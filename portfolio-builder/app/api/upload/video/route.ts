import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Issues upload tokens so the browser can send large videos straight to Vercel
// Blob. The file never passes through this function, so the 4.5MB request
// limit does not apply.
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        if (!session && process.env.NODE_ENV === 'production') {
          throw new Error('Unauthorized');
        }
        return {
          allowedContentTypes: VIDEO_TYPES,
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'Failed to authorize video upload' }, { status: 400 });
  }
}
