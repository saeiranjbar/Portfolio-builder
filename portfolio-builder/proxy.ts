import { NextRequest, NextResponse } from 'next/server';
import { configuredSiteDomain, normalizeHostname, tenantLabel } from '@/lib/tenant-domains';

const internalPrefix = '/published-domain';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // These routes are rewrite destinations, never public entry points.
  if (pathname === internalPrefix || pathname.startsWith(`${internalPrefix}/`)) {
    return new NextResponse('Not found', { status: 404 });
  }
  const baseDomain = configuredSiteDomain();
  const host = normalizeHostname(request.headers.get('host') ?? request.nextUrl.host);
  if (!baseDomain || host === baseDomain || host === `www.${baseDomain}` || !host.endsWith(`.${baseDomain}`)) {
    return NextResponse.next();
  }
  const label = tenantLabel(host, baseDomain);
  if (!label) return new NextResponse('Not found', { status: 404 });

  if (pathname === '/api/auth/session') return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store' } });
  // Visitor forms and media remain available. Editor/account APIs never run on
  // tenant domains, even if the browser sends an authentication cookie.
  if (pathname.startsWith('/api/')) {
    if (['/api/contact', '/api/send-email'].includes(pathname)) return NextResponse.next();
    return new NextResponse('Not found', { status: 404 });
  }
  if (pathname.startsWith('/.well-known/') || pathname.startsWith('/_next/') || pathname.startsWith('/uploads/') ||
    /^\/(?:favicon[^/]*|apple-touch-icon[^/]*|site\.webmanifest)$/.test(pathname)) return NextResponse.next();
  if (pathname === '/robots.txt') return new NextResponse('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /published-domain/\n',
    { headers: { 'Content-Type': 'text/plain' } });

  const destination = request.nextUrl.clone();
  destination.pathname = `${internalPrefix}/${host}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(destination);
}

export const config = { matcher: '/:path*' };
