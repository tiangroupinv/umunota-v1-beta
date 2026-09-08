import { NextResponse } from 'next/server';
import { createDiditSession } from '@/lib/didit';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone,kyc_status')
    .eq('id', userId)
    .single();

  if (profile?.kyc_status === 'verified') {
    return NextResponse.json({ ok: true, verified: true, redirect: '/kyc' });
  }

  const origin = new URL(req.url).origin;
  const email = typeof claimsData?.claims?.email === 'string' ? claimsData.claims.email : null;

  try {
    const session = await createDiditSession({
      userId,
      email,
      phone: profile?.phone || null,
      callbackUrl: `${origin}/kyc?returned=1`,
    });

    await supabase
      .from('profiles')
      .update({ kyc_status: 'pending', kyc_provider: 'didit', kyc_session_id: session.session_id })
      .eq('id', userId);

    return NextResponse.json({ ok: true, url: session.url, status: session.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'KYC provider unavailable' }, { status: 503 });
  }
}
