import { NextResponse } from 'next/server';import { z } from 'zod';
const schema=z.object({body:z.string().min(3).max(3000),taskId:z.string().uuid().optional(),rating:z.number().int().min(1).max(5).optional()});
export async function POST(req:Request){const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Invalid post'},{status:400});return NextResponse.json({ok:true,post:{id:crypto.randomUUID(),verifiedTask:false,...p.data}},{status:201})}
