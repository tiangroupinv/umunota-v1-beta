import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';
import {isPaypackConfigured,paypackCashIn,paypackFindTransaction} from '@/lib/paypack';

const phoneSchema=z.string().regex(/^07\d{8}$/,'Use a Rwanda mobile number like 078xxxxxxx');
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('pay'),businessId:z.string().uuid(),phone:phoneSchema}),
 z.object({action:z.literal('refresh'),businessId:z.string().uuid()})
]);

export async function POST(req:Request){
 try{
  const parsed=schema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid subscription request',details:parsed.error.flatten()},{status:400});
  const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
  const {data:membership}=await supabase.from('business_members').select('business_id,role').eq('business_id',parsed.data.businessId).eq('user_id',user.id).maybeSingle();
  if(!membership||membership.role!=='owner')return NextResponse.json({error:'Only the workspace owner can manage the subscription.'},{status:403});
  const admin=createAdminSupabaseClient();
  const {data:business}=await admin.from('business_plans').select('id,monthly_price_rwf,status').eq('id',parsed.data.businessId).single();
  if(!business)return NextResponse.json({error:'Business workspace not found.'},{status:404});
  let {data:subscription}=await admin.from('business_subscriptions').select('*').eq('business_id',business.id).maybeSingle();
  if(!subscription){const created=await admin.from('business_subscriptions').insert({business_id:business.id,owner_user_id:user.id,amount_rwf:business.monthly_price_rwf}).select('*').single();if(created.error)return NextResponse.json({error:'Unable to prepare subscription.'},{status:400});subscription=created.data}
  if(parsed.data.action==='refresh'){
    if(!subscription?.provider_reference)return NextResponse.json({ok:true,subscription});
    if(!isPaypackConfigured())return NextResponse.json({error:'Mobile Money payments are temporarily unavailable.'},{status:503});
    const transaction=await paypackFindTransaction(subscription.provider_reference);
    const paymentStatus=transaction.status==='successful'?'paid':transaction.status==='failed'?'failed':'pending';
    const {data:updated,error}=await admin.from('business_subscriptions').update({payment_status:paymentStatus,paid_at:paymentStatus==='paid'?new Date().toISOString():subscription.paid_at,updated_at:new Date().toISOString()}).eq('id',subscription.id).select('*').single();
    if(error)return NextResponse.json({error:'Unable to refresh subscription payment.'},{status:400});
    return NextResponse.json({ok:true,subscription:updated});
  }
  if(subscription?.payment_status==='paid')return NextResponse.json({ok:true,subscription,alreadyPaid:true});
  if(!isPaypackConfigured())return NextResponse.json({error:'Mobile Money payments are temporarily unavailable.'},{status:503});
  const idempotencyKey=`business${business.id.replace(/-/g,'').slice(0,22)}`.slice(0,32);
  const transaction=await paypackCashIn({amount:business.monthly_price_rwf,phone:parsed.data.phone,idempotencyKey});
  const paymentStatus=transaction.status==='successful'?'paid':transaction.status==='failed'?'failed':'pending';
  const maskedPhone=`${parsed.data.phone.slice(0,3)}****${parsed.data.phone.slice(-3)}`;
  const {data:updated,error}=await admin.from('business_subscriptions').update({amount_rwf:business.monthly_price_rwf,payment_status:paymentStatus,approval_status:'pending',provider_reference:transaction.ref,masked_phone:maskedPhone,paid_at:paymentStatus==='paid'?new Date().toISOString():null,reviewed_by:null,reviewed_at:null,review_notes:null,updated_at:new Date().toISOString()}).eq('id',subscription.id).select('*').single();
  if(error)return NextResponse.json({error:'Unable to save subscription payment.'},{status:400});
  return NextResponse.json({ok:true,subscription:updated,message:paymentStatus==='paid'?'Payment confirmed. Your request is waiting for approval.':'Payment request sent. Confirm the Mobile Money prompt, then refresh the status.'});
 }catch(error){console.error('Business subscription failed',error);return NextResponse.json({error:error instanceof Error?error.message:'Unable to process subscription payment.'},{status:502})}
}
