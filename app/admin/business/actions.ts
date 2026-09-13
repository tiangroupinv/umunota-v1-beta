'use server';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/admin';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

export async function reviewBusinessRequest(formData:FormData){
 const {profile}=await requireAdmin();const admin=createAdminSupabaseClient();
 const businessId=String(formData.get('business_id')||'');const decision=String(formData.get('decision')||'');const notes=String(formData.get('notes')||'').trim()||null;
 if(!businessId||!['approved','rejected'].includes(decision))throw new Error('Invalid business review.');
 const {data:subscription}=await admin.from('business_subscriptions').select('id,payment_status,owner_user_id,amount_rwf').eq('business_id',businessId).single();
 if(!subscription)throw new Error('Business subscription request not found.');
 if(decision==='approved'&&subscription.payment_status!=='paid')throw new Error('Payment must be confirmed before approval.');
 const now=new Date();const businessPatch=decision==='approved'?{status:'active',starts_at:now.toISOString().slice(0,10),renews_at:new Date(now.getTime()+30*86400000).toISOString().slice(0,10),updated_at:now.toISOString()}:{status:'lead',updated_at:now.toISOString()};
 const {error:businessError}=await admin.from('business_plans').update(businessPatch).eq('id',businessId);if(businessError)throw new Error(businessError.message);
 const {error:subError}=await admin.from('business_subscriptions').update({approval_status:decision,reviewed_by:profile.id,reviewed_at:now.toISOString(),review_notes:notes,updated_at:now.toISOString()}).eq('id',subscription.id);if(subError)throw new Error(subError.message);
 if(decision==='approved')await admin.from('revenue_entries').insert({source:'business_subscription',amount_rwf:subscription.amount_rwf,description:'UMUNOTA Business subscription',reference:subscription.id,status:'recorded'});
 await admin.from('notifications').insert({user_id:subscription.owner_user_id,type:'business_review',title:decision==='approved'?'Business workspace approved':'Business request needs changes',body:decision==='approved'?'Your UMUNOTA Business workspace is active.':'Your Business request was not approved. Review the request status for details.',href:'/business',category:'general'}).catch(()=>undefined);
 revalidatePath('/admin/business');revalidatePath('/business');
}

export async function adminUpdateBusiness(formData:FormData){
 await requireAdmin();const admin=createAdminSupabaseClient();const id=String(formData.get('business_id')||'');if(!id)throw new Error('Business id required.');
 const status=String(formData.get('status')||'lead');if(!['lead','active','paused','cancelled'].includes(status))throw new Error('Invalid business status.');
 const payload={status,monthly_price_rwf:Math.max(0,Number(formData.get('monthly_price_rwf')||0)),member_limit:Math.min(100,Math.max(1,Number(formData.get('member_limit')||5))),recurring_task_limit:Math.min(500,Math.max(0,Number(formData.get('recurring_task_limit')||20))),renews_at:String(formData.get('renews_at')||'')||null,notes:String(formData.get('notes')||'').trim()||null,updated_at:new Date().toISOString()};
 const {error}=await admin.from('business_plans').update(payload).eq('id',id);if(error)throw new Error(error.message);revalidatePath('/admin/business');revalidatePath('/business');
}
