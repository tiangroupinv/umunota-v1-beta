import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';
import {checkTaskSafety} from '@/lib/task-safety';

const milestone=z.object({title:z.string().min(3).max(120),description:z.string().max(1000).optional().default(''),location:z.string().min(2).max(160),startAt:z.string().datetime(),dueAt:z.string().datetime(),payPerRunnerRwf:z.number().int().min(500)});
const schema=z.object({businessId:z.string().uuid(),title:z.string().min(5).max(160),description:z.string().min(10).max(4000),category:z.string().min(2).max(80),location:z.string().min(2).max(160),runnersNeeded:z.number().int().min(2).max(100),startAt:z.string().datetime(),dueAt:z.string().datetime(),latitude:z.number().min(-90).max(90).nullable().optional(),longitude:z.number().min(-180).max(180).nullable().optional(),locationAccuracyM:z.number().min(0).max(100000).nullable().optional(),milestones:z.array(milestone).min(1).max(24)}).refine(v=>(v.latitude==null&&v.longitude==null)||(v.latitude!=null&&v.longitude!=null),{message:'Latitude and longitude must be provided together'});

export async function POST(req:Request){
 try{
  const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Check the project details and timeline.',details:parsed.error.flatten()},{status:400});const i=parsed.data;
  const safety=checkTaskSafety(i.title,i.description);if(!safety.allowed)return NextResponse.json({error:safety.reason,code:'TASK_NOT_ALLOWED'},{status:422});
  const start=new Date(i.startAt),due=new Date(i.dueAt);if(start.getTime()<=Date.now()||due.getTime()<=start.getTime())return NextResponse.json({error:'Project dates are invalid.'},{status:400});
  for(const [n,m] of i.milestones.entries()){const ms=new Date(m.startAt),md=new Date(m.dueAt);if(ms<start||md>due||md<=ms)return NextResponse.json({error:`Timeline stage ${n+1} must stay inside the project dates.`},{status:400})}
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:profile}=await supabase.from('profiles').select('kyc_status').eq('id',user.id).single();if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before creating a Business project.',code:'KYC_REQUIRED'},{status:403});
  const {data:membership}=await supabase.from('business_members').select('role').eq('business_id',i.businessId).eq('user_id',user.id).maybeSingle();if(!membership||!['owner','manager'].includes(membership.role))return NextResponse.json({error:'Only Business owners and managers can create projects.'},{status:403});
  const {data:business}=await supabase.from('business_plans').select('id,status').eq('id',i.businessId).single();if(!business||business.status!=='active')return NextResponse.json({error:'Business workspace must be active.'},{status:403});
  const perRunner=i.milestones.reduce((s,m)=>s+m.payPerRunnerRwf,0),total=perRunner*i.runnersNeeded;const admin=createAdminSupabaseClient();
  const {data:task,error}=await admin.from('tasks').insert({customer_id:user.id,business_id:i.businessId,title:i.title,description:i.description,category:i.category,location_text:i.location,budget_rwf:total,start_at:i.startAt,due_at:i.dueAt,project_end_at:i.dueAt,status:'posted',task_mode:'business_multi',runners_needed:i.runnersNeeded,pay_per_runner_rwf:perRunner,business_project_status:'funding_pending'}).select('id,title,status,budget_rwf').single();if(error||!task)return NextResponse.json({error:error?.message||'Unable to create Business project.'},{status:400});
  const rows=i.milestones.map((m,index)=>({task_id:task.id,title:m.title,description:m.description||null,location_text:m.location,starts_at:m.startAt,due_at:m.dueAt,sequence_no:index+1,pay_per_runner_rwf:m.payPerRunnerRwf,created_by:user.id}));const {error:me}=await admin.from('business_task_milestones').insert(rows);if(me){await admin.from('tasks').delete().eq('id',task.id);return NextResponse.json({error:'Project timeline could not be created.'},{status:400})}
  if(i.latitude!=null&&i.longitude!=null)await admin.from('task_locations').insert({task_id:task.id,latitude:i.latitude,longitude:i.longitude,accuracy_m:i.locationAccuracyM??null});
  await admin.from('task_events').insert({task_id:task.id,actor_id:user.id,event_type:'business_project_created',message:`Business project created for ${i.runnersNeeded} runners with ${i.milestones.length} timeline stages. Funding is required before marketplace publication.`});
  return NextResponse.json({ok:true,task,totalBudgetRwf:total,perRunnerRwf:perRunner},{status:201});
 }catch(error){console.error('Business project creation failed',error);return NextResponse.json({error:'Unable to create the Business project right now.'},{status:500})}
}
