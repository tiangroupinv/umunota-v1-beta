import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';

const bodySchema=z.object({action:z.enum(['accept','start','submit_completion','request_payment','approve','dispute','cancel'])});

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const parsed=bodySchema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:'Invalid task action'},{status:400});
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:profile}=await supabase.from('profiles').select('kyc_status').eq('id',user.id).single();
  if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Identity verification required',code:'KYC_REQUIRED'},{status:403});
  const {data:task,error:taskError}=await supabase.from('tasks').select('id,customer_id,runner_id,status').eq('id',id).single();
  if(taskError||!task)return NextResponse.json({error:'Task not found'},{status:404});

  const action=parsed.data.action;
  let patch:Record<string,unknown>={}; let eventType=''; let message='';
  if(action==='accept'){
    if(task.customer_id===user.id)return NextResponse.json({error:'You cannot accept your own task'},{status:400});
    if(task.status!=='funded'||task.runner_id)return NextResponse.json({error:'Task is not available for acceptance'},{status:409});
    patch={runner_id:user.id,status:'accepted'};eventType='runner_accepted';message='Verified runner accepted the task';
  }else if(action==='start'){
    if(task.runner_id!==user.id||task.status!=='accepted')return NextResponse.json({error:'Only the assigned runner can start this task'},{status:403});
    patch={status:'in_progress'};eventType='task_started';message='Runner started the task';
  }else if(action==='submit_completion'){
    if(task.runner_id!==user.id||task.status!=='in_progress')return NextResponse.json({error:'Only the assigned runner can submit completion'},{status:403});
    patch={status:'completion_submitted'};eventType='completion_submitted';message='Runner submitted completion for review';
  }else if(action==='request_payment'){
    if(task.runner_id!==user.id||task.status!=='completion_submitted')return NextResponse.json({error:'Completion must be submitted first'},{status:403});
    patch={status:'payment_requested'};eventType='payment_requested';message='Runner requested payment';
  }else if(action==='approve'){
    if(task.customer_id!==user.id||!['payment_requested','disputed'].includes(task.status))return NextResponse.json({error:'Only the customer can approve this task'},{status:403});
    patch={status:'approved'};eventType='work_approved';message='Customer approved the completed work';
  }else if(action==='dispute'){
    if(task.customer_id!==user.id||task.status!=='payment_requested')return NextResponse.json({error:'Only the customer can dispute a payment request'},{status:403});
    patch={status:'disputed'};eventType='dispute_opened';message='Customer opened a task dispute';
  }else{
    if(task.customer_id!==user.id||task.status!=='posted')return NextResponse.json({error:'Only an open task can be cancelled'},{status:403});
    patch={status:'cancelled'};eventType='task_cancelled';message='Customer cancelled the task';
  }

  const {data:updated,error}=await supabase.from('tasks').update(patch).eq('id',id).select('id,status,runner_id').single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  await supabase.from('task_events').insert({task_id:id,actor_id:user.id,event_type:eventType,message});
  return NextResponse.json({ok:true,task:updated});
}
