import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

export async function POST(){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});

  const {data:profile,error}=await supabase
    .from('profiles')
    .select('id,role,kyc_status')
    .eq('id',user.id)
    .single();
  if(error||!profile)return NextResponse.json({error:'Profile not found'},{status:404});
  if(profile.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before becoming a runner',code:'KYC_REQUIRED'},{status:403});
  if(profile.role==='admin'||profile.role==='runner')return NextResponse.json({ok:true,role:profile.role});

  const admin=createAdminSupabaseClient();
  const {data,error:updateError}=await admin
    .from('profiles')
    .update({role:'runner',updated_at:new Date().toISOString()})
    .eq('id',user.id)
    .select('role')
    .single();
  if(updateError)return NextResponse.json({error:'Unable to enable runner mode'},{status:500});
  return NextResponse.json({ok:true,role:data.role});
}
