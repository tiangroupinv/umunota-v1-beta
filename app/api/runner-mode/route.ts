import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';
import {notifyUser} from '@/lib/notifications';

export async function POST(req:Request){
 try{
  const supabase=await createServerSupabaseClient();
  let {data:{user}}=await supabase.auth.getUser();

  // Some browser/session combinations can reach the route before the SSR cookie
  // has refreshed. Accept the current Supabase access token as a secure fallback.
  if(!user){
   const auth=req.headers.get('authorization');
   const token=auth?.startsWith('Bearer ')?auth.slice(7).trim():'';
   if(token){
    const adminAuth=createAdminSupabaseClient();
    const {data}=await adminAuth.auth.getUser(token);
    user=data.user??null;
   }
  }
  if(!user)return NextResponse.json({error:'Your session could not be confirmed. Refresh the page and try again.',code:'SESSION_REQUIRED'},{status:401});

  const userId=user.id;
  const body=await req.json().catch(()=>({}));
  const enabled=body?.enabled===true;
  const admin=createAdminSupabaseClient();
  const {data:profile,error:profileError}=await admin.from('profiles').select('kyc_status,role,runner_mode_enabled').eq('id',userId).single();
  if(profileError||!profile)return NextResponse.json({error:'Your UMUNOTA profile could not be loaded.'},{status:404});
  if(profile.role==='admin')return NextResponse.json({error:'Administrator accounts cannot switch marketplace runner mode.'},{status:400});
  if(enabled&&profile.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before enabling runner mode.',code:'KYC_REQUIRED'},{status:403});

  if(enabled){
   const onboarding=body?.onboarding||{};
   const categories=Array.isArray(onboarding.categories)?onboarding.categories.filter((x:unknown)=>typeof x==='string').slice(0,12):[];
   const radius=Math.min(50,Math.max(1,Number(onboarding.service_radius_km||5)));
   if(!onboarding.transport_mode||!onboarding.availability||!onboarding.why_runner||!onboarding.fee_acknowledged||!onboarding.safety_acknowledged||categories.length===0){
    return NextResponse.json({error:'Complete the runner welcome questions and acknowledgements first.',code:'ONBOARDING_REQUIRED'},{status:400});
   }
   const {error:onboardingError}=await admin.from('runner_onboarding').upsert({user_id:userId,transport_mode:String(onboarding.transport_mode),service_radius_km:radius,categories,availability:String(onboarding.availability),experience:String(onboarding.experience||''),why_runner:String(onboarding.why_runner).slice(0,1000),fee_acknowledged:true,safety_acknowledged:true,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(onboardingError)return NextResponse.json({error:'Unable to save your runner setup. Please try again.'},{status:400});
  }

  const {error}=await admin.from('profiles').update({runner_mode_enabled:enabled,role:enabled?'runner':'customer',show_in_runner_directory:enabled,updated_at:new Date().toISOString()}).eq('id',userId);
  if(error)return NextResponse.json({error:'Unable to update runner mode. Please try again.'},{status:400});

  const title=enabled?'Welcome to runner mode':'Runner mode disabled';
  const message=enabled?'You can now request eligible tasks. Build trust by communicating clearly, arriving on time and submitting honest completion proof.':'Your account is no longer available for new runner opportunities.';
  await notifyUser(userId,{type:enabled?'runner_mode_enabled':'runner_mode_disabled',title,body:message,href:'/profile',category:'general'}).catch(()=>undefined);
  return NextResponse.json({ok:true,enabled,role:enabled?'runner':'customer'});
 }catch(error){
  console.error('runner-mode route error',error);
  return NextResponse.json({error:'Runner mode could not be updated right now. Please try again.'},{status:500});
 }
}
