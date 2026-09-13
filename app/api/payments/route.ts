import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isPaypackConfigured,paypackCashIn,paypackCashOut,paypackFindTransaction} from '@/lib/paypack';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const phoneSchema=z.string().regex(/^07\d{8}$/,'Use a Rwanda mobile number like 078xxxxxxx');
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('cashin'),taskId:z.string().uuid(),phone:phoneSchema}),
 z.object({action:z.literal('cashout'),taskId:z.string().uuid(),phone:phoneSchema}),
 z.object({action:z.literal('find'),ref:z.string().min(6)})
]);

export async function POST(req:Request){
 const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:'Invalid payment request',details:parsed.error.flatten()},{status:400});
 if(!isPaypackConfigured())return NextResponse.json({error:'Mobile Money payments are temporarily unavailable. Please try again later.'},{status:503});
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data:profile}=await supabase.from('profiles').select('kyc_status').eq('id',user.id).single();if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Identity verification required',code:'KYC_REQUIRED'},{status:403});
 const admin=createAdminSupabaseClient();
 try{
  if(parsed.data.action==='find'){
    const {data:payment}=await supabase.from('payments').select('provider_reference,customer_id,runner_id').eq('provider_reference',parsed.data.ref).single();
    if(!payment||![payment.customer_id,payment.runner_id].includes(user.id))return NextResponse.json({error:'Payment not found'},{status:404});
    return NextResponse.json({ok:true,provider:'mobile_money',transaction:await paypackFindTransaction(parsed.data.ref)});
  }
  const {data:task}=await supabase.from('tasks').select('id,customer_id,runner_id,status,budget_rwf').eq('id',parsed.data.taskId).single();if(!task)return NextResponse.json({error:'Task not found'},{status:404});
  const action=parsed.data.action;
  if(action==='cashin'&&(task.customer_id!==user.id||task.status!=='posted'))return NextResponse.json({error:'Only the customer can fund an open task'},{status:403});
  if(action==='cashout'&&(task.runner_id!==user.id||task.status!=='approved'))return NextResponse.json({error:'Payout is available only to the assigned runner after customer approval'},{status:403});
  const idempotencyKey=`${task.id.replace(/-/g,'').slice(0,20)}${action}`.slice(0,32);
  const transaction=action==='cashin'?await paypackCashIn({amount:task.budget_rwf,phone:parsed.data.phone,idempotencyKey}):await paypackCashOut({amount:task.budget_rwf,phone:parsed.data.phone,idempotencyKey});
  if(action==='cashin'){
    const {error}=await admin.from('payments').upsert({task_id:task.id,customer_id:task.customer_id,runner_id:task.runner_id,amount_rwf:task.budget_rwf,status:transaction.status==='successful'?'authorized':'pending',provider:'paypack',provider_reference:transaction.ref},{onConflict:'task_id'});if(error)return NextResponse.json({error:error.message},{status:400});
    if(transaction.status==='successful'){await admin.from('tasks').update({status:'funded'}).eq('id',task.id);await admin.from('task_events').insert({task_id:task.id,actor_id:user.id,event_type:'task_funded',message:'Customer funding confirmed through Mobile Money'});}
  }else{
    const {error}=await admin.from('payments').update({runner_id:task.runner_id,status:transaction.status==='successful'?'released':'requested',provider:'paypack',provider_reference:transaction.ref,updated_at:new Date().toISOString()}).eq('task_id',task.id);if(error)return NextResponse.json({error:error.message},{status:400});
    if(transaction.status==='successful'){await admin.from('tasks').update({status:'paid'}).eq('id',task.id);await admin.from('task_events').insert({task_id:task.id,actor_id:user.id,event_type:'payment_released',message:'Runner payout confirmed through Mobile Money'});}
  }
  return NextResponse.json({ok:true,provider:'mobile_money',mobileNetwork:transaction.provider??'mobile_money',transaction});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Mobile Money request failed'},{status:502})}
}
