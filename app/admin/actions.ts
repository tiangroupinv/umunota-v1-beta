'use server';

import {revalidatePath} from 'next/cache';
import {requireAdmin} from '../../lib/admin';
import {createAdminSupabaseClient} from '../../lib/supabase-admin';

export async function setUserRole(formData:FormData){const {supabase}=await requireAdmin();const targetUser=String(formData.get('user_id')||'');const role=String(formData.get('role')||'');const {error}=await supabase.from('profiles').update({role,updated_at:new Date().toISOString()}).eq('id',targetUser);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function setKycStatus(formData:FormData){const {supabase}=await requireAdmin();const targetUser=String(formData.get('user_id')||'');const kyc_status=String(formData.get('kyc_status')||'');const {error}=await supabase.from('profiles').update({kyc_status,updated_at:new Date().toISOString()}).eq('id',targetUser);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function setTaskStatus(formData:FormData){const {supabase}=await requireAdmin();const id=String(formData.get('task_id')||'');const status=String(formData.get('status')||'');const {error}=await supabase.from('tasks').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function setPaymentStatus(formData:FormData){await requireAdmin();const admin=createAdminSupabaseClient();const id=String(formData.get('payment_id')||'');const status=String(formData.get('status')||'');const {error}=await admin.from('payments').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin')}
export async function deletePost(formData:FormData){const {supabase}=await requireAdmin();const id=String(formData.get('post_id')||'');const {error}=await supabase.from('posts').delete().eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin')}
