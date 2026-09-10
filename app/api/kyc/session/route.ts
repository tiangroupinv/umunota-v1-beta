import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found. Sign out and sign in again.' }, { status: 404 });
  }

  if (profile.kyc_status === 'verified') {
    return NextResponse.json({ ok: true, verified: true, redirect: '/kyc' });
  }

  if (profile.kyc_status === 'pending') {
    return NextResponse.json({ ok: true, pending: true });
  }

  const { data: status, error } = await supabase.rpc('request_manual_verification');

  if (error) {
    console.error('Manual verification request failed:', error.message);
    return NextResponse.json({ error: 'Unable to submit verification request. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pending: status === 'pending', verified: status === 'verified' });
}
