import { NextResponse } from 'next/server';
import { bestLucideIcon, lucideSvgUrl } from '@/lib/lucide-search';

// GET /api/lucide/search?q=years experience -> { name, url } | null
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });

  const name = bestLucideIcon(q);
  return NextResponse.json(name ? { name, url: lucideSvgUrl(name) } : null);
}
