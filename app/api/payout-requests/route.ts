import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const schema=z.object({taskId:z.string().uuid(),phone:z.string().regex(/^07\d{8}$/,'Use a Rwanda mobile number like 078xxxxxxx')});

export async function GET(){
 const supabase=await createServerSupabaseClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data,error}=await supabase.from('payout_requests').select('id,payment_id,task_id,amount_rwf,phone,status,created_at,updated_at').eq('runner_id',user.id).order('created_at',{ascending:false});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({requests:data||[]});
}

export async function POST(req:Request){
 const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'Enter a valid task and Rwanda Mobile Money number.'},{status:400});
 const supabase=await createServerSupabaseClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data:profile}=await supabase.from('profiles').select('kyc_status').eq('id',user.id).single();
 if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Identity verification required',code:'KYC_REQUIRED'},{status:403});
 const {data:task}=await supabase.from('tasks').select('id,runner_id,status,budget_rwf').eq('id',parsed.data.taskId).single();
 if(!task)return NextResponse.json({error:'Task not found'},{status:404});
 if(task.runner_id!==user.id||task.status!=='approved')return NextResponse.json({error:'You can claim payment only after the customer approves your completed task.'},{status:403});
 const admin=createAdminSupabaseClient();
 const {data:payment}=await admin.from('payments').select('id,status,amount_rwf,customer_id,runner_id').eq('task_id',task.id).single();
 if(!payment||!['authorized','requested'].includes(payment.status))return NextResponse.json({error:'Confirmed task funding is required before a payout can be requested.'},{status:409});
 const {data:existing}=await admin.from('payout_requests').select('id,status').eq('payment_id',payment.id).eq('runner_id',user.id).maybeSingle();
 if(existing)return NextResponse.json({ok:true,request:existing,alreadyRequested:true});
 await admin.from('payments').update({runner_id:user.id,status:'requested',updated_at:new Date().toISOString()}).eq('id',payment.id);
 const {data:requestRow,error}=await admin.from('payout_requests').insert({payment_id:payment.id,task_id:task.id,runner_id:user.id,amount_rwf:payment.amount_rwf,phone:parsed.data.phone,status:'requested'}).select('id,status,amount_rwf,phone,created_at').single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 await admin.from('task_events').insert({task_id:task.id,actor_id:user.id,event_type:'payout_requested',message:'Runner claimed the approved task payment. Payout is waiting for review and Mobile Money processing.'});
 return NextResponse.json({ok:true,request:requestRow},{status:201});
}
