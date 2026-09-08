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
  await requireAdmin();
  const admin=createAdminSupabaseClient();
  const id=String(formData.get('ad_id')||'');
  const title=String(formData.get('title')||'').trim();
  const body=String(formData.get('body')||'').trim();
  const eyebrow=String(formData.get('eyebrow')||'UMUNOTA PARTNER').trim();
  const cta_label=String(formData.get('cta_label')||'').trim()||null;
  const cta_url=String(formData.get('cta_url')||'').trim()||null;
  const is_active=formData.get('is_active')==='on';
  if(!id||title.length<3||body.length<5)throw new Error('Banner title and body are required.');
  const {error}=await admin.from('dashboard_ads').update({title,body,eyebrow,cta_label,cta_url,is_active,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)throw new Error(error.message);
  revalidatePath('/admin');revalidatePath('/dashboard');
}
