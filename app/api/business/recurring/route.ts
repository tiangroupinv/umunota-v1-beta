import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const schema=z.object({businessId:z.string().uuid(),title:z.string().min(5).max(160),description:z.string().min(10).max(4000),category:z.string().min(2).max(80),location:z.string().min(2).max(160),budgetRwf:z.number().int().min(500),cadence:z.enum(['daily','weekly','biweekly','monthly','custom']),proofRequirement:z.string().min(2).max(120)});

export async function POST(req:Request){
 const parsed=schema.safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:'Invalid recurring task',details:parsed.error.flatten()},{status:400});
 const supabase=await createServerSupabaseClient();const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;
 if(!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data:business}=await supabase.from('business_plans').select('id,status,recurring_task_limit').eq('id',parsed.data.businessId).single();
 if(!business)return NextResponse.json({error:'Business workspace not found or access denied.'},{status:403});
 if(business.status!=='active')return NextResponse.json({error:'Activate UMUNOTA Business before saving recurring tasks.'},{status:403});
 const admin=createAdminSupabaseClient();
 const {count}=await admin.from('business_recurring_tasks').select('id',{count:'exact',head:true}).eq('business_id',business.id).eq('is_active',true);
 if((count||0)>=business.recurring_task_limit)return NextResponse.json({error:'Recurring task limit reached for this plan.'},{status:409});
 const i=parsed.data;const {data,error}=await admin.from('business_recurring_tasks').insert({business_id:business.id,created_by:userId,title:i.title,description:i.description,category:i.category,location_text:i.location,budget_rwf:i.budgetRwf,cadence:i.cadence,proof_requirement:i.proofRequirement,is_active:true}).select('*').single();
 if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,template:data},{status:201});
}

export async function DELETE(req:Request){
 const body=await req.json().catch(()=>null);const id=String(body?.id||'');if(!id)return NextResponse.json({error:'Template id required'},{status:400});
 const supabase=await createServerSupabaseClient();const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;if(!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data:template}=await supabase.from('business_recurring_tasks').select('id,business_id').eq('id',id).single();if(!template)return NextResponse.json({error:'Template not found or access denied.'},{status:404});
 const admin=createAdminSupabaseClient();const {error}=await admin.from('business_recurring_tasks').update({is_active:false,updated_at:new Date().toISOString()}).eq('id',id);if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true});
}
