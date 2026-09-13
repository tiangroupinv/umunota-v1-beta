import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const base=z.object({businessId:z.string().uuid(),title:z.string().min(5).max(160),description:z.string().min(10).max(4000),category:z.string().min(2).max(80),location:z.string().min(2).max(160),budgetRwf:z.number().int().min(500),cadence:z.enum(['daily','weekly','biweekly','monthly','custom']),proofRequirement:z.string().min(2).max(120)});
const updateSchema=base.extend({id:z.string().uuid()});

async function authorize(businessId:string){
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:NextResponse.json({error:'Sign in required'},{status:401})};
 const {data:membership}=await supabase.from('business_members').select('role').eq('business_id',businessId).eq('user_id',user.id).maybeSingle();if(!membership||!['owner','manager'].includes(membership.role))return {error:NextResponse.json({error:'Only workspace owners and managers can manage templates.'},{status:403})};
 const admin=createAdminSupabaseClient();const {data:business}=await admin.from('business_plans').select('id,status,recurring_task_limit').eq('id',businessId).single();if(!business||business.status!=='active')return {error:NextResponse.json({error:'Business workspace must be active.'},{status:403})};return {user,admin,business};
}

export async function POST(req:Request){
 try{const parsed=base.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid recurring task',details:parsed.error.flatten()},{status:400});const c=await authorize(parsed.data.businessId);if(c.error)return c.error;
  const {count}=await c.admin!.from('business_recurring_tasks').select('id',{count:'exact',head:true}).eq('business_id',c.business!.id).eq('is_active',true);if((count||0)>=c.business!.recurring_task_limit)return NextResponse.json({error:'Recurring task limit reached for this workspace.'},{status:409});
  const i=parsed.data;const {data,error}=await c.admin!.from('business_recurring_tasks').insert({business_id:c.business!.id,created_by:c.user!.id,title:i.title,description:i.description,category:i.category,location_text:i.location,budget_rwf:i.budgetRwf,cadence:i.cadence,proof_requirement:i.proofRequirement,is_active:true}).select('*').single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,template:data},{status:201});
 }catch(error){console.error('Recurring create failed',error);return NextResponse.json({error:'Unable to save recurring template.'},{status:500})}}

export async function PATCH(req:Request){
 try{const parsed=updateSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid recurring task update',details:parsed.error.flatten()},{status:400});const c=await authorize(parsed.data.businessId);if(c.error)return c.error;
  const i=parsed.data;const {data,error}=await c.admin!.from('business_recurring_tasks').update({title:i.title,description:i.description,category:i.category,location_text:i.location,budget_rwf:i.budgetRwf,cadence:i.cadence,proof_requirement:i.proofRequirement,updated_at:new Date().toISOString()}).eq('id',i.id).eq('business_id',i.businessId).select('*').single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,template:data});
 }catch(error){console.error('Recurring update failed',error);return NextResponse.json({error:'Unable to update recurring template.'},{status:500})}}

export async function DELETE(req:Request){
 try{const body=await req.json().catch(()=>null);const id=String(body?.id||''),businessId=String(body?.businessId||'');if(!id||!businessId)return NextResponse.json({error:'Template and business id required'},{status:400});const c=await authorize(businessId);if(c.error)return c.error;
  const {error}=await c.admin!.from('business_recurring_tasks').update({is_active:false,updated_at:new Date().toISOString()}).eq('id',id).eq('business_id',businessId);if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true});
 }catch(error){console.error('Recurring delete failed',error);return NextResponse.json({error:'Unable to remove recurring template.'},{status:500})}}
