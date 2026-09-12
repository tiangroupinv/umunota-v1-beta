import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';
import {notifyUser} from '@/lib/notifications';

export async function POST(req:Request){
 const supabase=await createServerSupabaseClient();
 const {data:claims,error:claimsError}=await supabase.auth.getClaims();
 const userId=claims?.claims?.sub;
 if(claimsError||!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const body=await req.json().catch(()=>({}));const enabled=body?.enabled===true;
 const {data:profile,error:profileError}=await supabase.from('profiles').select('kyc_status,role').eq('id',userId).single();
 if(profileError||!profile)return NextResponse.json({error:'Profile not found'},{status:404});
 if(profile.role==='admin')return NextResponse.json({error:'Administrator accounts cannot switch marketplace runner mode.'},{status:400});
 if(enabled&&profile.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before enabling runner mode.',code:'KYC_REQUIRED'},{status:403});
 const admin=createAdminSupabaseClient();
 if(enabled){
  const onboarding=body?.onboarding||{};const categories=Array.isArray(onboarding.categories)?onboarding.categories.filter((x:unknown)=>typeof x==='string').slice(0,12):[];
  const radius=Math.min(50,Math.max(1,Number(onboarding.service_radius_km||5)));
  if(!onboarding.transport_mode||!onboarding.availability||!onboarding.why_runner||!onboarding.fee_acknowledged||!onboarding.safety_acknowledged||categories.length===0)return NextResponse.json({error:'Complete the runner welcome questions and acknowledgements first.',code:'ONBOARDING_REQUIRED'},{status:400});
  const {error:onboardingError}=await admin.from('runner_onboarding').upsert({user_id:userId,transport_mode:String(onboarding.transport_mode),service_radius_km:radius,categories,availability:String(onboarding.availability),experience:String(onboarding.experience||''),why_runner:String(onboarding.why_runner).slice(0,1000),fee_acknowledged:true,safety_acknowledged:true,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(onboardingError)return NextResponse.json({error:onboardingError.message},{status:400});
 }
 const {error}=await admin.from('profiles').update({runner_mode_enabled:enabled,role:enabled?'runner':'customer',show_in_runner_directory:enabled,updated_at:new Date().toISOString()}).eq('id',userId);
 if(error)return NextResponse.json({error:'Unable to update runner mode.'},{status:400});
 const title=enabled?'Welcome to runner mode':'Runner mode disabled';
 const message=enabled?'You can now appear for eligible task opportunities. Build trust by communicating clearly, arriving on time and submitting honest completion proof.':'Your account is no longer available for new runner opportunities.';
 await notifyUser(userId,{type:enabled?'runner_mode_enabled':'runner_mode_disabled',title,body:message,href:'/profile',category:'general'}).catch(()=>undefined);
 return NextResponse.json({ok:true,enabled,role:enabled?'runner':'customer'});
}
