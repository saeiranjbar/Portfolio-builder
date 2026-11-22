import { NextResponse } from 'next/server';

// This legacy endpoint accepted arbitrary recipients and was not used by the
// current form. Fail closed instead of providing an unauthenticated mail relay.
export async function POST() {
  return NextResponse.json({ error: 'This contact endpoint is no longer available.' }, { status: 410 });
}
