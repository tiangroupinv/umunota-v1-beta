import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const schema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(10).max(4000),
  budgetRwf: z.number().int().min(500),
  location: z.string().min(2).max(160),
  category: z.string().min(2).max(80),
  dueAt: z.string().datetime(),
  proofRequirement: z.string().min(2).max(120),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid task', details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', userId)
    .single();

  if (profile?.kyc_status !== 'verified') {
    return NextResponse.json({ error: 'Complete identity verification before posting a task', code: 'KYC_REQUIRED' }, { status: 403 });
  }

  const input = parsed.data;
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      customer_id: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      location_text: input.location,
      budget_rwf: input.budgetRwf,
      due_at: input.dueAt,
      status: 'posted',
    })
    .select('id,title,status,budget_rwf,location_text,due_at,created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from('task_events').insert({
    task_id: task.id,
    actor_id: userId,
    event_type: 'task_posted',
    message: `Task posted. Completion proof: ${input.proofRequirement}`,
  });

  return NextResponse.json({ ok: true, task }, { status: 201 });
}
