import { NextResponse } from 'next/server';import { z } from 'zod';
const schema=z.object({taskId:z.string().uuid(),action:z.enum(['authorize','request_release','approve_release','open_dispute'])});
export async function POST(req:Request){const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Invalid payment transition'},{status:400});return NextResponse.json({ok:true,provider:'mock',...p.data,note:'Use a licensed payment provider for real fund holding/release.'})}
