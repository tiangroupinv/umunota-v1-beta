import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {notifyUser} from '@/lib/notifications';

export async function POST(req:Request){
 const supabase=await createServerSupabaseClient();
 const {data:claims,error:claimsError}=await supabase.auth.getClaims();
 const userId=claims?.claims?.sub;
 if(claimsError||!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const body=await req.json().catch(()=>({}));const enabled=body?.enabled===true;
 const {data:profile}=await supabase.from('profiles').select('kyc_status,role').eq('id',userId).single();
 if(profile?.role==='admin')return NextResponse.json({error:'Administrator accounts cannot switch marketplace runner mode.'},{status:400});
 if(enabled&&profile?.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before enabling runner mode.',code:'KYC_REQUIRED'},{status:403});
 const {error}=await supabase.from('profiles').update({runner_mode_enabled:enabled,role:enabled?'runner':'customer',show_in_runner_directory:enabled,updated_at:new Date().toISOString()}).eq('id',userId);
 if(error)return NextResponse.json({error:error.message},{status:400});
 const title=enabled?'Runner mode enabled':'Runner mode disabled';
 const message=enabled?'You can now appear for eligible task opportunities and accept funded tasks.':'Your account is no longer available for new runner opportunities.';
 await notifyUser(userId,{type:enabled?'runner_mode_enabled':'runner_mode_disabled',title,body:message,href:'/profile',category:'general'}).catch(()=>undefined);
 return NextResponse.json({ok:true,enabled,role:enabled?'runner':'customer'});
}
