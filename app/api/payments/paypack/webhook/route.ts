import {createHmac,timingSafeEqual} from 'crypto';
import {NextResponse} from 'next/server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

export async function HEAD(){return new NextResponse(null,{status:200})}
export async function POST(req:Request){
 const secret=process.env.PAYPACK_WEBHOOK_SECRET;if(!secret)return NextResponse.json({error:'Webhook secret is not configured'},{status:503});
 const rawBody=await req.text();const signature=req.headers.get('x-paypack-signature');if(!signature)return NextResponse.json({error:'Missing Paypack signature'},{status:401});
 const expected=createHmac('sha256',secret).update(rawBody).digest('base64');const a=Buffer.from(expected);const b=Buffer.from(signature);if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:'Invalid Paypack signature'},{status:401});
 let event:Record<string,unknown>;try{event=JSON.parse(rawBody)}catch{return NextResponse.json({error:'Invalid JSON payload'},{status:400})}
 const candidate=(event.data&&typeof event.data==='object'?event.data:event) as Record<string,unknown>;
 const ref=typeof candidate.ref==='string'?candidate.ref:null;const status=typeof candidate.status==='string'?candidate.status.toLowerCase():'';const kind=typeof candidate.kind==='string'?candidate.kind.toUpperCase():'';
 if(!ref)return NextResponse.json({ok:true,ignored:true});
 const admin=createAdminSupabaseClient();const {data:payment}=await admin.from('payments').select('id,task_id,status').eq('provider_reference',ref).maybeSingle();if(!payment)return NextResponse.json({ok:true,ignored:true});
 if(status==='successful'){
  if(kind==='CASHOUT'){await admin.from('payments').update({status:'released',updated_at:new Date().toISOString()}).eq('id',payment.id);await admin.from('tasks').update({status:'paid'}).eq('id',payment.task_id);await admin.from('task_events').insert({task_id:payment.task_id,event_type:'payment_released',message:'Paypack confirmed runner payout'});}
  else{await admin.from('payments').update({status:'authorized',updated_at:new Date().toISOString()}).eq('id',payment.id);await admin.from('tasks').update({status:'funded'}).eq('id',payment.task_id);await admin.from('task_events').insert({task_id:payment.task_id,event_type:'task_funded',message:'Paypack confirmed customer funding'});}
 }else if(status==='failed')await admin.from('payments').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',payment.id);
 return NextResponse.json({ok:true});
}
