import { NextResponse } from 'next/server';

// Projects are saved inside the authenticated portfolio document.
// Retire the unused standalone API, which previously accepted caller-supplied owners.
function retired() {
  return NextResponse.json({ error: 'Use the authenticated /api/portfolio endpoint' }, { status: 410 });
}

export const GET = retired;
export const POST = retired;
