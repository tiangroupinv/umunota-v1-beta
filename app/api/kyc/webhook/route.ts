import { NextResponse } from 'next/server';
import { verifyDiditWebhook } from '@/lib/didit';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const rawBody = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const valid = verifyDiditWebhook({
    rawBody,
    body,
    signatureV2: req.headers.get('x-signature-v2'),
    signatureRaw: req.headers.get('x-signature'),
    timestamp: req.headers.get('x-timestamp'),
  });
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  // Didit's console can send realistic signed test payloads. Never let them change a real account.
  if (req.headers.get('x-didit-test-webhook')?.toLowerCase() === 'true') {
    return NextResponse.json({ ok: true, test: true });
  }

  const webhookType = typeof body.webhook_type === 'string' ? body.webhook_type : '';
  if (!['status.updated', 'data.updated'].includes(webhookType)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const eventId = typeof body.event_id === 'string' ? body.event_id : null;
  const userId = typeof body.vendor_data === 'string' ? body.vendor_data : null;
  const sessionId = typeof body.session_id === 'string' ? body.session_id : null;
  const status = typeof body.status === 'string' ? body.status : '';
  if (!userId || !sessionId) return NextResponse.json({ ok: true, ignored: true });

  const admin = createAdminSupabaseClient();

  if (eventId) {
    const { error: eventError } = await admin.from('provider_webhook_events').insert({
      provider: 'didit',
      event_id: eventId,
      event_type: webhookType,
    });
    if (eventError?.code === '23505') return NextResponse.json({ ok: true, duplicate: true });
    if (eventError) return NextResponse.json({ error: 'Unable to record webhook event' }, { status: 500 });
  }

  const normalized = status.trim().toLowerCase();
  const kycStatus = normalized === 'approved'
    ? 'verified'
    : normalized === 'declined'
      ? 'rejected'
      : 'pending';

  const { error } = await admin.from('profiles').update({
    kyc_status: kycStatus,
    kyc_provider: 'didit',
    kyc_session_id: sessionId,
    kyc_verified_at: kycStatus === 'verified' ? new Date().toISOString() : null,
  }).eq('id', userId).eq('kyc_session_id', sessionId);

  if (error) return NextResponse.json({ error: 'Unable to update verification status' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
