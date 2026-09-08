import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkTaskSafety } from '@/lib/task-safety';

const schema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(10).max(4000),
  budgetRwf: z.number().int().min(500),
  location: z.string().min(2).max(160),
  category: z.string().min(2).max(80),
  dueAt: z.string().datetime(),
  proofRequirement: z.string().min(2).max(120),
  businessId: z.string().uuid().nullable().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid task', details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const safety = checkTaskSafety(input.title, input.description);
  if (!safety.allowed) return NextResponse.json({ error: safety.reason, code: 'TASK_NOT_ALLOWED' }, { status: 422 });

  const dueAt = new Date(input.dueAt);
  if (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() <= Date.now()) return NextResponse.json({ error: 'Choose a future task deadline' }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('kyc_status').eq('id', userId).single();
  if (profile?.kyc_status !== 'verified') return NextResponse.json({ error: 'Complete identity verification before posting a task', code: 'KYC_REQUIRED' }, { status: 403 });

  let businessId:string|null=null;
  if(input.businessId){
    const {data:business}=await supabase.from('business_plans').select('id,status').eq('id',input.businessId).single();
    if(!business) return NextResponse.json({error:'Business workspace not found or access denied.'},{status:403});
    if(business.status!=='active') return NextResponse.json({error:'UMUNOTA Business subscription must be active before posting business tasks.',code:'BUSINESS_INACTIVE'},{status:403});
    businessId=business.id;
  }

  const { data: task, error } = await supabase.from('tasks').insert({
    customer_id: userId,
    business_id: businessId,
    title: input.title,
    description: input.description,
    category: input.category,
    location_text: input.location,
    budget_rwf: input.budgetRwf,
    due_at: input.dueAt,
    status: 'posted',
  }).select('id,title,status,budget_rwf,location_text,due_at,created_at,business_id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from('task_events').insert({task_id:task.id,actor_id:userId,event_type:'task_posted',message:`${businessId?'Business task. ':''}Completion proof: ${input.proofRequirement}`});
  return NextResponse.json({ ok: true, task }, { status: 201 });
}
