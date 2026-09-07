import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from './supabase-server';

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) redirect('/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,full_name,role,kyc_status')
    .eq('id', userId)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  return { supabase, profile };
}
