'use server';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/admin';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';
import {isPaypackConfigured,paypackCashOut} from '@/lib/paypack';

export async function approvePayoutRequest(formData:FormData){
 const{profile}=await requireAdmin();
 const id=String(formData.get('payout_request_id')||'');
 if(!id)throw new Error('Withdrawal request is required.');
 if(!isPaypackConfigured())throw new Error('Mobile Money payout is not configured.');
 const admin=createAdminSupabaseClient();
 const{data:req,error:reqError}=await admin.from('payout_requests').select('id,payment_id,task_id,runner_id,amount_rwf,phone,status').eq('id',id).single();
 if(reqError||!req)throw new Error('Withdrawal request not found.');
 if(req.status!=='requested')throw new Error('This withdrawal request is no longer waiting for approval.');
 const[{data:task},{data:payment}]=await Promise.all([admin.from('tasks').select('id,status,runner_id').eq('id',req.task_id).single(),admin.from('payments').select('id,status,runner_id').eq('id',req.payment_id).single()]);
 if(!task||task.status!=='approved'||task.runner_id!==req.runner_id)throw new Error('Task is not eligible for payout.');
 if(!payment||!['authorized','requested'].includes(payment.status))throw new Error('Task funding is not available for payout.');
 const key=`${req.id.replace(/-/g,'').slice(0,24)}wd`.slice(0,32);
 try{
  const transaction=await paypackCashOut({amount:req.amount_rwf,phone:req.phone,idempotencyKey:key});
  const paid=transaction.status==='successful';
  await admin.from('payout_requests').update({status:paid?'paid':'processing',provider_reference:transaction.ref,reviewed_by:profile.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',req.id);
  await admin.from('payments').update({runner_id:req.runner_id,status:paid?'released':'requested',provider:'paypack',provider_reference:transaction.ref,updated_at:new Date().toISOString()}).eq('id',req.payment_id);
  if(paid){await admin.from('tasks').update({status:'paid',updated_at:new Date().toISOString()}).eq('id',req.task_id);await admin.from('task_events').insert({task_id:req.task_id,actor_id:profile.id,event_type:'payment_released',message:'Approved runner payout was confirmed through Mobile Money.'});}
 }catch(e){await admin.from('payout_requests').update({status:'failed',reviewed_by:profile.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',req.id);throw e}
 revalidatePath('/admin/payments');revalidatePath('/payments');revalidatePath(`/tasks/${req.task_id}`);
}

export async function rejectPayoutRequest(formData:FormData){
 const{profile}=await requireAdmin();const id=String(formData.get('payout_request_id')||'');const admin=createAdminSupabaseClient();const{data:req}=await admin.from('payout_requests').select('id,payment_id,status').eq('id',id).single();if(!req||req.status!=='requested')throw new Error('Withdrawal request is not waiting for review.');await admin.from('payout_requests').update({status:'rejected',reviewed_by:profile.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id);await admin.from('payments').update({status:'authorized',updated_at:new Date().toISOString()}).eq('id',req.payment_id).eq('status','requested');revalidatePath('/admin/payments');
}
