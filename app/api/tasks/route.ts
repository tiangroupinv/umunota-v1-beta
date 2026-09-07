import { NextResponse } from 'next/server';import { z } from 'zod';
const schema=z.object({title:z.string().min(5).max(120),description:z.string().min(10).max(4000),budgetRwf:z.number().int().positive(),location:z.string().min(2),proofRequirement:z.string().min(2)});
export async function POST(req:Request){const body=await req.json();const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Invalid task',details:parsed.error.flatten()},{status:400});return NextResponse.json({ok:true,task:{id:crypto.randomUUID(),status:'posted',...parsed.data}},{status:201})}
