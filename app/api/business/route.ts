import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const createSchema=z.object({businessName:z.string().min(2).max(120),industry:z.string().max(120).optional(),location:z.string().max(160).optional(),contactName:z.string().max(120).optional(),contactEmail:z.string().email().optional().or(z.literal('')),contactPhone:z.string().max(40).optional()});
const updateSchema=createSchema.partial().extend({businessId:z.string().uuid()});

export async function GET(){
 try{
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();const userId=user?.id;
  if(!userId)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:memberships,error:membershipError}=await supabase.from('business_members').select('business_id,role').eq('user_id',userId).limit(10);
  if(membershipError)return NextResponse.json({error:'Unable to load business memberships.'},{status:500});
  const ids=(memberships||[]).map(m=>m.business_id);
  const {data:businesses,error:businessError}=ids.length?await supabase.from('business_plans').select('*').in('id',ids):{data:[],error:null};
  if(businessError)return NextResponse.json({error:'Unable to load business workspaces.'},{status:500});
  const admin=createAdminSupabaseClient();
  const [{data:settings},{data:subscriptions}]=await Promise.all([
   admin.from('revenue_settings').select('business_enabled,business_monthly_price_rwf').eq('id',1).single(),
   ids.length?admin.from('business_subscriptions').select('*').in('business_id',ids):Promise.resolve({data:[] as any[]})
  ]);
  return NextResponse.json({businesses:businesses||[],memberships:memberships||[],subscriptions:subscriptions||[],settings:settings||null});
 }catch(error){console.error('Business GET failed',error);return NextResponse.json({error:'Business service is temporarily unavailable.'},{status:500})}
}

export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>null);const parsed=createSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Invalid business details',details:parsed.error.flatten()},{status:400});
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();const userId=user?.id;
  if(!userId)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:profile}=await supabase.from('profiles').select('kyc_status,full_name').eq('id',userId).single();if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before creating a business workspace.',code:'KYC_REQUIRED'},{status:403});
  const admin=createAdminSupabaseClient();
  const {data:existing}=await admin.from('business_plans').select('id,status,business_name').eq('owner_user_id',userId).neq('status','cancelled').maybeSingle();if(existing)return NextResponse.json({error:'You already have an UMUNOTA Business workspace.',business:existing},{status:409});
  const {data:settings}=await admin.from('revenue_settings').select('business_enabled,business_monthly_price_rwf').eq('id',1).single();if(!settings?.business_enabled)return NextResponse.json({error:'UMUNOTA Business onboarding is currently paused.'},{status:503});
  const input=parsed.data;const {data:business,error}=await admin.from('business_plans').insert({owner_user_id:userId,business_name:input.businessName,industry:input.industry||null,location_text:input.location||null,contact_name:input.contactName||profile.full_name||null,contact_email:input.contactEmail||null,contact_phone:input.contactPhone||null,monthly_price_rwf:settings.business_monthly_price_rwf,status:'lead'}).select('*').single();
  if(error||!business)return NextResponse.json({error:error?.message||'Unable to create business workspace.'},{status:400});
  const {error:memberError}=await admin.from('business_members').insert({business_id:business.id,user_id:userId,role:'owner'});
  if(memberError){await admin.from('business_plans').delete().eq('id',business.id);return NextResponse.json({error:'Workspace could not be linked to your account. Nothing was created.'},{status:500})}
  const {error:subscriptionError}=await admin.from('business_subscriptions').insert({business_id:business.id,owner_user_id:userId,amount_rwf:settings.business_monthly_price_rwf,payment_status:'pending',approval_status:'pending'});
  if(subscriptionError){await admin.from('business_members').delete().eq('business_id',business.id);await admin.from('business_plans').delete().eq('id',business.id);return NextResponse.json({error:'Workspace subscription could not be prepared. Nothing was created.'},{status:500})}
  return NextResponse.json({ok:true,business},{status:201});
 }catch(error){console.error('Business POST failed',error);return NextResponse.json({error:'Unable to create the business workspace right now.'},{status:500})}
}

export async function PATCH(req:Request){
 try{
  const parsed=updateSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid workspace update',details:parsed.error.flatten()},{status:400});
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:membership}=await supabase.from('business_members').select('role').eq('business_id',parsed.data.businessId).eq('user_id',user.id).maybeSingle();
  if(!membership||!['owner','manager'].includes(membership.role))return NextResponse.json({error:'Only workspace owners and managers can edit business details.'},{status:403});
  const input=parsed.data;const patch:Record<string,unknown>={updated_at:new Date().toISOString()};
  if(input.businessName!==undefined)patch.business_name=input.businessName;if(input.industry!==undefined)patch.industry=input.industry||null;if(input.location!==undefined)patch.location_text=input.location||null;if(input.contactName!==undefined)patch.contact_name=input.contactName||null;if(input.contactEmail!==undefined)patch.contact_email=input.contactEmail||null;if(input.contactPhone!==undefined)patch.contact_phone=input.contactPhone||null;
  const admin=createAdminSupabaseClient();const {data,error}=await admin.from('business_plans').update(patch).eq('id',input.businessId).select('*').single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,business:data});
 }catch(error){console.error('Business PATCH failed',error);return NextResponse.json({error:'Unable to update business workspace.'},{status:500})}
}

export async function DELETE(req:Request){
 try{
  const body=await req.json().catch(()=>null);const businessId=String(body?.businessId||'');if(!businessId)return NextResponse.json({error:'Business id required'},{status:400});
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:membership}=await supabase.from('business_members').select('role').eq('business_id',businessId).eq('user_id',user.id).maybeSingle();if(membership?.role!=='owner')return NextResponse.json({error:'Only the workspace owner can cancel this workspace.'},{status:403});
  const admin=createAdminSupabaseClient();const {count}=await admin.from('tasks').select('id',{head:true,count:'exact'}).eq('business_id',businessId).not('status','in','("paid","cancelled")');if((count||0)>0)return NextResponse.json({error:'Complete or cancel active business tasks before cancelling the workspace.'},{status:409});
  await admin.from('business_plans').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',businessId);return NextResponse.json({ok:true});
 }catch(error){console.error('Business DELETE failed',error);return NextResponse.json({error:'Unable to cancel business workspace.'},{status:500})}
}
