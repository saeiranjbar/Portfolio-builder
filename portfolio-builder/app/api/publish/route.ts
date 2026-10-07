import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PublishError, publicationId, publicationStatus, publishWebsite, subdomainAvailability, unpublishWebsite } from '@/lib/publishing';
import { publicationUrl } from '@/lib/publication-url';
import { configuredSiteDomain } from '@/lib/tenant-domains';

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
    const body = action === 'publish' ? await req.json().catch(() => null) : null;
    const rawId = action === 'publish' ? body?.id : req.nextUrl.searchParams.get('id');
    if (action === 'status' && !rawId && !req.nextUrl.searchParams.has('subdomain')) {
      return NextResponse.json({ published: false, path: null, domain: null,
        baseDomain: process.env.VERCEL_ENV === 'production' ? configuredSiteDomain() : null },
        { headers: { 'Cache-Control': 'private, no-store' } });
    }
    if (action === 'status' && req.nextUrl.searchParams.has('subdomain')) {
      let ownedId: string | undefined;
      if (rawId) {
        const parsed = publicationId.safeParse(rawId);
        if (!parsed.success) throw new PublishError('Choose a saved website first.');
        await publicationStatus(prisma, parsed.data, owner);
        ownedId = parsed.data;
      }
      return NextResponse.json(await subdomainAvailability(prisma, req.nextUrl.searchParams.get('subdomain'), ownedId),
        { headers: { 'Cache-Control': 'private, no-store' } });
    }
    const id = publicationId.safeParse(rawId);
    if (!id.success) throw new PublishError('Choose a saved website first.');
    const result = action === 'status' ? await publicationStatus(prisma, id.data, owner)
      : action === 'publish' ? await publishWebsite(prisma, id.data, owner, body?.subdomain)
        : await unpublishWebsite(prisma, id.data, owner);
    return NextResponse.json({ ...result, baseDomain: process.env.VERCEL_ENV === 'production' ? configuredSiteDomain() : null,
      url: result.published ? publicationUrl(result.path, req.nextUrl.origin, undefined, result.domain) : null },
      { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const conflict = (error as { code?: string })?.code === 'P2002';
    return NextResponse.json({ error: error instanceof PublishError ? error.message : conflict
      ? 'That website address is already taken. Choose another name.' : 'Unable to publish. Please try again.' },
      { status: error instanceof PublishError ? error.status : conflict ? 409 : 500 });
  }
}

export const GET = (req: NextRequest) => handle(req, 'status');
export const POST = (req: NextRequest) => handle(req, 'publish');
export const DELETE = (req: NextRequest) => handle(req, 'unpublish');
