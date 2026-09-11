import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export async function POST(req:Request){
 const supabase=await createServerSupabaseClient();
 const {data:claims,error:claimsError}=await supabase.auth.getClaims();
 const userId=claims?.claims?.sub;
 if(claimsError||!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const body=await req.json().catch(()=>({}));const enabled=body?.enabled===true;
 const {data:profile}=await supabase.from('profiles').select('kyc_status').eq('id',userId).single();
 if(enabled&&profile?.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before enabling runner mode.',code:'KYC_REQUIRED'},{status:403});
 const {error}=await supabase.from('profiles').update({runner_mode_enabled:enabled,role:enabled?'runner':'customer',show_in_runner_directory:enabled,updated_at:new Date().toISOString()}).eq('id',userId);
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true,enabled,role:enabled?'runner':'customer'});
}
