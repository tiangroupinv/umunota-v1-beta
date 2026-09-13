import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {notifyUser} from '@/lib/notifications';

const bodySchema=z.object({
  action:z.enum(['request','accept_request','start','submit_completion','request_payment','approve','dispute','cancel']),
  requestId:z.string().uuid().optional()
});

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const parsed=bodySchema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:'Invalid task action'},{status:400});
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:profile}=await supabase.from('profiles').select('kyc_status,runner_mode_enabled').eq('id',user.id).single();
  if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Identity verification required',code:'KYC_REQUIRED'},{status:403});
  const {data:task,error:taskError}=await supabase.from('tasks').select('id,customer_id,runner_id,status,title').eq('id',id).single();
  if(taskError||!task)return NextResponse.json({error:'Task not found'},{status:404});

  const action=parsed.data.action;
  if(action==='request'){
    if(task.customer_id===user.id)return NextResponse.json({error:'You cannot request your own task'},{status:400});
    if(profile.runner_mode_enabled!==true)return NextResponse.json({error:'Enable runner mode before requesting tasks.'},{status:403});
    if(task.status!=='funded'||task.runner_id)return NextResponse.json({error:'This task is not available for requests.'},{status:409});
    const {data:existing}=await supabase.from('task_requests').select('id,status').eq('task_id',id).eq('runner_id',user.id).maybeSingle();
    if(existing?.status==='pending')return NextResponse.json({ok:true,request:existing,alreadyRequested:true});
    const {data:requestRow,error}=await supabase.from('task_requests').upsert({task_id:id,runner_id:user.id,status:'pending',updated_at:new Date().toISOString()},{onConflict:'task_id,runner_id'}).select('id,status').single();
    if(error)return NextResponse.json({error:error.message},{status:400});
    await supabase.from('task_events').insert({task_id:id,actor_id:user.id,event_type:'runner_request_submitted',message:'A verified runner requested to do this task. Waiting for customer approval.'});
    await notifyUser(task.customer_id,{type:'runner_request_submitted',title:'New runner request',body:`${task.title}: a verified runner requested to do this task.`,href:`/tasks/${id}`,category:'task'}).catch(()=>undefined);
    return NextResponse.json({ok:true,request:requestRow});
  }

  if(action==='accept_request'){
    if(task.customer_id!==user.id)return NextResponse.json({error:'Only the customer can choose the runner.'},{status:403});
    if(!parsed.data.requestId)return NextResponse.json({error:'Runner request is required.'},{status:400});
    const {data:requestRow,error:requestError}=await supabase.from('task_requests').select('id,runner_id,status').eq('id',parsed.data.requestId).eq('task_id',id).single();
    if(requestError||!requestRow)return NextResponse.json({error:'Runner request not found.'},{status:404});
    const {data:accepted,error}=await supabase.rpc('accept_task_runner_request',{p_request_id:parsed.data.requestId});
    if(error)return NextResponse.json({error:error.message},{status:409});
    await supabase.from('task_events').insert({task_id:id,actor_id:user.id,event_type:'runner_request_accepted',message:'Customer accepted one runner request. The task is now assigned and ready to start.'});
    await notifyUser(requestRow.runner_id,{type:'runner_request_accepted',title:'Your task request was accepted',body:`${task.title}: you can now open the task and start when ready.`,href:`/tasks/${id}`,category:'task'}).catch(()=>undefined);
    return NextResponse.json({ok:true,task:Array.isArray(accepted)?accepted[0]:accepted});
  }

  let patch:Record<string,unknown>={}; let eventType=''; let message=''; let recipient:string|null=null; let notificationTitle='Task updated';
  if(action==='start'){
    if(task.runner_id!==user.id||task.status!=='accepted')return NextResponse.json({error:'Only the customer-approved runner can start this task'},{status:403});
    patch={status:'in_progress'};eventType='task_started';message='Runner started the task';recipient=task.customer_id;notificationTitle='Your task has started';
  }else if(action==='submit_completion'){
    if(task.runner_id!==user.id||task.status!=='in_progress')return NextResponse.json({error:'Only the assigned runner can submit completion'},{status:403});
    patch={status:'completion_submitted'};eventType='completion_submitted';message='Runner submitted completion for review';recipient=task.customer_id;notificationTitle='Completion is ready for review';
  }else if(action==='request_payment'){
    if(task.runner_id!==user.id||task.status!=='completion_submitted')return NextResponse.json({error:'Completion must be submitted first'},{status:403});
    patch={status:'payment_requested'};eventType='payment_requested';message='Runner requested payment';recipient=task.customer_id;notificationTitle='Payment approval requested';
  }else if(action==='approve'){
    if(task.customer_id!==user.id||!['payment_requested','disputed'].includes(task.status))return NextResponse.json({error:'Only the customer can approve this task'},{status:403});
    patch={status:'approved'};eventType='work_approved';message='Customer approved the completed work';recipient=task.runner_id;notificationTitle='Your completed work was approved';
  }else if(action==='dispute'){
    if(task.customer_id!==user.id||task.status!=='payment_requested')return NextResponse.json({error:'Only the customer can dispute a payment request'},{status:403});
    patch={status:'disputed'};eventType='dispute_opened';message='Customer opened a task dispute';recipient=task.runner_id;notificationTitle='A task dispute was opened';
  }else{
    if(task.customer_id!==user.id||task.status!=='posted')return NextResponse.json({error:'Only an open task can be cancelled'},{status:403});
    patch={status:'cancelled'};eventType='task_cancelled';message='Customer cancelled the task';
  }

  const {data:updated,error}=await supabase.from('tasks').update(patch).eq('id',id).select('id,status,runner_id').single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  await supabase.from('task_events').insert({task_id:id,actor_id:user.id,event_type:eventType,message});
  if(recipient)await notifyUser(recipient,{type:eventType,title:notificationTitle,body:`${task.title}: ${message}.`,href:`/tasks/${id}`,category:'task'}).catch(()=>undefined);
  return NextResponse.json({ok:true,task:updated});
}
