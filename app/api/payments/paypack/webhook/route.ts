import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: Request) {
  const secret = process.env.PAYPACK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-paypack-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Paypack signature' }, { status: 401 });
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  const valid = expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid Paypack signature' }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // TODO: once payment persistence is fully connected, map event.data.ref to public.payments.provider_reference
  // and update status only from this verified server callback.
  return NextResponse.json({ ok: true, received: event });
}
