import { NextResponse } from 'next/server';

function retired() {
  return NextResponse.json({ error: 'Use the authenticated /api/portfolio endpoint' }, { status: 410 });
}

export const GET = retired;
export const PUT = retired;
export const DELETE = retired;
