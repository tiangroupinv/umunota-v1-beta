import {createHmac,timingSafeEqual} from 'crypto';
import {NextResponse} from 'next/server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

export async function HEAD(){return new NextResponse(null,{status:200})}

export async function POST(req:Request){
 const secret=process.env.PAYPACK_WEBHOOK_SECRET;
 if(!secret)return NextResponse.json({error:'Webhook secret is not configured'},{status:503});

 const rawBody=await req.text();
 const signature=req.headers.get('x-paypack-signature');
 if(!signature)return NextResponse.json({error:'Missing Paypack signature'},{status:401});

 const expected=createHmac('sha256',secret).update(rawBody).digest('base64');
 const a=Buffer.from(expected);const b=Buffer.from(signature);
 if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:'Invalid Paypack signature'},{status:401});

 let event:Record<string,unknown>;
 try{event=JSON.parse(rawBody)}catch{return NextResponse.json({error:'Invalid JSON payload'},{status:400})}

 const eventKind=typeof event.event_kind==='string'?event.event_kind:'';
 if(eventKind&&eventKind!=='transaction:processed')return NextResponse.json({ok:true,ignored:true});

 const candidate=(event.data&&typeof event.data==='object'?event.data:event) as Record<string,unknown>;
 const ref=typeof candidate.ref==='string'?candidate.ref:null;
 const status=typeof candidate.status==='string'?candidate.status.toLowerCase():'';
 const kind=typeof candidate.kind==='string'?candidate.kind.toUpperCase():'';
 const amount=Number(candidate.amount);
 const eventId=typeof event.event_id==='string'?event.event_id:null;
 if(!ref)return NextResponse.json({ok:true,ignored:true});

 const admin=createAdminSupabaseClient();
 if(eventId){
  const {error:eventError}=await admin.from('provider_webhook_events').insert({provider:'paypack',event_id:eventId,event_type:eventKind||'transaction:processed'});
  if(eventError?.code==='23505')return NextResponse.json({ok:true,duplicate:true});
  if(eventError)return NextResponse.json({error:'Unable to record webhook event'},{status:500});
 }

 const {data:payment}=await admin.from('payments').select('id,task_id,status,amount_rwf').eq('provider_reference',ref).maybeSingle();
 if(!payment)return NextResponse.json({ok:true,ignored:true});
 if(Number.isFinite(amount)&&amount!==Number(payment.amount_rwf))return NextResponse.json({error:'Payment amount mismatch'},{status:409});
 if(!['CASHIN','CASHOUT'].includes(kind))return NextResponse.json({ok:true,ignored:true});

 if(status==='successful'){
  if(kind==='CASHOUT'){
   await admin.from('payments').update({status:'released',updated_at:new Date().toISOString()}).eq('id',payment.id).neq('status','released');
   const {data:updatedTask}=await admin.from('tasks').update({status:'paid'}).eq('id',payment.task_id).eq('status','approved').select('id').maybeSingle();
   if(updatedTask)await admin.from('task_events').insert({task_id:payment.task_id,event_type:'payment_released',message:'Paypack confirmed runner payout'});
  }else{
   await admin.from('payments').update({status:'authorized',updated_at:new Date().toISOString()}).eq('id',payment.id).neq('status','authorized');
   const {data:updatedTask}=await admin.from('tasks').update({status:'funded'}).eq('id',payment.task_id).eq('status','posted').select('id').maybeSingle();
   if(updatedTask)await admin.from('task_events').insert({task_id:payment.task_id,event_type:'task_funded',message:'Paypack confirmed customer funding'});
  }
 }else if(status==='failed'){
  await admin.from('payments').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',payment.id);
 }

 return NextResponse.json({ok:true});
}
