'use server';

import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../lib/admin';
import {createAdminSupabaseClient} from '../../lib/supabase-admin';

export async function setUserRole(formData:FormData){const {supabase}=await requireAdmin();const targetUser=String(formData.get('user_id')||'');const role=String(formData.get('role')||'');const {error}=await supabase.from('profiles').update({role,updated_at:new Date().toISOString()}).eq('id',targetUser);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function setKycStatus(formData:FormData){const {supabase}=await requireAdmin();const targetUser=String(formData.get('user_id')||'');const kyc_status=String(formData.get('kyc_status')||'');const {error}=await supabase.from('profiles').update({kyc_status,updated_at:new Date().toISOString()}).eq('id',targetUser);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function setTaskStatus(formData:FormData){const {supabase}=await requireAdmin();const id=String(formData.get('task_id')||'');const status=String(formData.get('status')||'');const {error}=await supabase.from('tasks').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function setPaymentStatus(formData:FormData){await requireAdmin();const admin=createAdminSupabaseClient();const id=String(formData.get('payment_id')||'');const status=String(formData.get('status')||'');const {error}=await admin.from('payments').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function deletePost(formData:FormData){const {supabase}=await requireAdmin();const id=String(formData.get('post_id')||'');const {error}=await supabase.from('posts').delete().eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin')}

export async function updateDashboardAd(formData:FormData){
  await requireAdmin();const admin=createAdminSupabaseClient();const id=String(formData.get('ad_id')||'');
  const title=String(formData.get('title')||'').trim();const body=String(formData.get('body')||'').trim();const eyebrow=String(formData.get('eyebrow')||'UMUNOTA PARTNER').trim();const cta_label=String(formData.get('cta_label')||'').trim()||null;const cta_url=String(formData.get('cta_url')||'').trim()||null;const is_active=formData.get('is_active')==='on';
  const advertiser_name=String(formData.get('advertiser_name')||'').trim()||null;const campaign_price_rwf=Math.max(0,Number(formData.get('campaign_price_rwf')||0));const campaign_status=String(formData.get('campaign_status')||'house');const campaign_starts_at=String(formData.get('campaign_starts_at')||'')||null;const campaign_ends_at=String(formData.get('campaign_ends_at')||'')||null;
  if(!id||title.length<3||body.length<5)throw new Error('Banner title and body are required.');
  const {error}=await admin.from('dashboard_ads').update({title,body,eyebrow,cta_label,cta_url,is_active,advertiser_name,campaign_price_rwf,campaign_status,campaign_starts_at,campaign_ends_at,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);
  revalidatePath('/admin');revalidatePath('/dashboard');
}

export async function updateRevenueSettings(formData:FormData){
  await requireAdmin();const admin=createAdminSupabaseClient();
  const task_fee_percent=Math.min(30,Math.max(0,Number(formData.get('task_fee_percent')||0)));const business_monthly_price_rwf=Math.max(0,Number(formData.get('business_monthly_price_rwf')||0));
  const payload={task_fee_enabled:formData.get('task_fee_enabled')==='on',task_fee_percent,advertising_enabled:formData.get('advertising_enabled')==='on',business_enabled:formData.get('business_enabled')==='on',business_monthly_price_rwf,updated_at:new Date().toISOString()};
  const {error}=await admin.from('revenue_settings').update(payload).eq('id',1);if(error)throw new Error(error.message);revalidatePath('/admin');
}

export async function addRevenueEntry(formData:FormData){
  await requireAdmin();const admin=createAdminSupabaseClient();const source=String(formData.get('source')||'');const amount_rwf=Math.max(0,Number(formData.get('amount_rwf')||0));const description=String(formData.get('description')||'').trim();const reference=String(formData.get('reference')||'').trim()||null;
  if(!['task_fee','advertising','business_subscription'].includes(source)||!amount_rwf||description.length<3)throw new Error('Valid source, amount and description are required.');
  const {error}=await admin.from('revenue_entries').insert({source,amount_rwf,description,reference,status:'recorded'});if(error)throw new Error(error.message);revalidatePath('/admin');
}

export async function addBusinessPlan(formData:FormData){
  await requireAdmin();const admin=createAdminSupabaseClient();const business_name=String(formData.get('business_name')||'').trim();const monthly_price_rwf=Math.max(0,Number(formData.get('monthly_price_rwf')||0));if(business_name.length<2)throw new Error('Business name is required.');
  const {error}=await admin.from('business_plans').insert({business_name,contact_name:String(formData.get('contact_name')||'').trim()||null,contact_email:String(formData.get('contact_email')||'').trim()||null,contact_phone:String(formData.get('contact_phone')||'').trim()||null,monthly_price_rwf,status:String(formData.get('status')||'lead'),starts_at:String(formData.get('starts_at')||'')||null,renews_at:String(formData.get('renews_at')||'')||null,notes:String(formData.get('notes')||'').trim()||null});if(error)throw new Error(error.message);revalidatePath('/admin');
}

export async function updateBusinessPlan(formData:FormData){
  await requireAdmin();const admin=createAdminSupabaseClient();const id=String(formData.get('plan_id')||'');const {error}=await admin.from('business_plans').update({status:String(formData.get('status')||'lead'),monthly_price_rwf:Math.max(0,Number(formData.get('monthly_price_rwf')||0)),renews_at:String(formData.get('renews_at')||'')||null,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin');
}
