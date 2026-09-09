import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', userId)
    .single();

  if (profile?.kyc_status === 'verified') {
    return NextResponse.json({ ok: true, verified: true, redirect: '/kyc' });
  }

  if (profile?.kyc_status === 'pending') {
    return NextResponse.json({ ok: true, pending: true });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      kyc_status: 'pending',
      kyc_provider: 'manual',
      kyc_session_id: null,
    })
    .eq('id', userId);

  if (error) return NextResponse.json({ error: 'Unable to submit verification request.' }, { status: 500 });

  return NextResponse.json({ ok: true, pending: true });
}
