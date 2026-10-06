import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PublishError, publicationId, publicationStatus, publishWebsite, unpublishWebsite } from '@/lib/publishing';
import { publicationUrl } from '@/lib/publication-url';

export const dynamic = 'force-dynamic';

async function userId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new PublishError('Please sign in first.', 401);
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) throw new PublishError('Please sign in first.', 401);
  return user.id;
}

async function handle(req: NextRequest, action: 'status' | 'publish' | 'unpublish') {
  try {
    if (action !== 'status' && req.headers.get('origin') !== req.nextUrl.origin) {
      throw new PublishError('Please publish from this website.', 403);
    }
    const owner = await userId();
    const rawId = action === 'publish' ? (await req.json().catch(() => null))?.id : req.nextUrl.searchParams.get('id');
    const id = publicationId.safeParse(rawId);
    if (!id.success) throw new PublishError('Choose a saved website first.');
    const result = action === 'status' ? await publicationStatus(prisma, id.data, owner)
      : action === 'publish' ? await publishWebsite(prisma, id.data, owner)
        : await unpublishWebsite(prisma, id.data, owner);
    return NextResponse.json({ ...result, url: result.published ? publicationUrl(result.path, req.nextUrl.origin, undefined, result.domain) : null },
      { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof PublishError ? error.message : 'Unable to publish. Please try again.' },
      { status: error instanceof PublishError ? error.status : 500 });
  }
}

export const GET = (req: NextRequest) => handle(req, 'status');
export const POST = (req: NextRequest) => handle(req, 'publish');
export const DELETE = (req: NextRequest) => handle(req, 'unpublish');
