import { NextResponse } from 'next/server';

function unavailable() {
  return NextResponse.json(
    { error: 'This endpoint is retired. Use /api/portfolio.' },
    { status: 410 }
  );
}

export const GET = unavailable;
export const POST = unavailable;
export const PUT = unavailable;
export const DELETE = unavailable;
