import { NextResponse } from 'next/server';
import { verifyDiditWebhook } from '@/lib/didit';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const raw = await req.text();
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const signature = req.headers.get('x-signature-v2');
  const timestamp = req.headers.get('x-timestamp');
  if (!verifyDiditWebhook(body, signature, timestamp)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const userId = typeof body.vendor_data === 'string' ? body.vendor_data : null;
  const sessionId = typeof body.session_id === 'string' ? body.session_id : null;
  const status = typeof body.status === 'string' ? body.status : '';
  if (!userId || !sessionId) return NextResponse.json({ ok: true });

  const normalized = status.toLowerCase();
  const kycStatus = normalized === 'approved' ? 'verified' : normalized === 'declined' ? 'rejected' : 'pending';
  const admin = createAdminSupabaseClient();

  await admin.from('profiles').update({
    kyc_status: kycStatus,
    kyc_provider: 'didit',
    kyc_session_id: sessionId,
    kyc_verified_at: kycStatus === 'verified' ? new Date().toISOString() : null,
  }).eq('id', userId);

  return NextResponse.json({ ok: true });
}
