import { NextRequest, NextResponse } from 'next/server';
import { AccountError, completeAccount, completeAccountSchema, requestAccountCode, requestCodeSchema } from '@/lib/account-security';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('origin') !== req.nextUrl.origin) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }
    const text = await req.text();
    if (text.length > 10000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const clientIp = req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()
      || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (body.action === 'request-code') {
      const input = requestCodeSchema.safeParse(body);
      if (!input.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
      await requestAccountCode(input.data, clientIp);
      return NextResponse.json({ message: 'If this email is eligible, a verification code has been sent. Check your inbox and spam folder.' });
    }
    if (body.action === 'complete') {
      const input = completeAccountSchema.safeParse(body);
      if (!input.success) return NextResponse.json({ error: 'Enter the eight-digit code and a password of 12–128 characters.' }, { status: 400 });
      await completeAccount(input.data, clientIp);
      return NextResponse.json({ message: 'Your password is set. You can now sign in.' });
    }
    return NextResponse.json({ error: 'Invalid account request' }, { status: 400 });
  } catch (error) {
    if (error instanceof AccountError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    console.error('[account] Request failed', { name: error instanceof Error ? error.name : 'UnknownError' });
    return NextResponse.json({ error: 'Unable to complete the account request. Please try again later.' }, { status: 500 });
  }
}
