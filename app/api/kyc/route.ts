import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export async function POST(){
 try{
  const supabase=await createServerSupabaseClient();
  const {data:claims,error:claimsError}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(claimsError||!userId)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:profile,error:profileError}=await supabase.from('profiles').select('kyc_status').eq('id',userId).single();
  if(profileError||!profile)return NextResponse.json({error:'Profile not found'},{status:404});
  if(profile.kyc_status==='verified')return NextResponse.json({ok:true,status:'verified'});
  if(profile.kyc_status==='pending')return NextResponse.json({ok:true,status:'pending'});
  const {data:status,error}=await supabase.rpc('request_manual_verification');
  if(error)return NextResponse.json({error:'Unable to submit verification request.'},{status:500});
  return NextResponse.json({ok:true,status:status||'pending'},{status:202});
 }catch(error){
  console.error('KYC request failed',error);
  return NextResponse.json({error:'Verification service is temporarily unavailable.'},{status:500});
 }
}
