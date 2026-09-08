import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const createSchema=z.object({businessName:z.string().min(2).max(120),industry:z.string().max(120).optional(),location:z.string().max(160).optional(),contactName:z.string().max(120).optional(),contactEmail:z.string().email().optional().or(z.literal('')),contactPhone:z.string().max(40).optional()});

export async function GET(){
 const supabase=await createServerSupabaseClient();const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;
 if(!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data:memberships}=await supabase.from('business_members').select('business_id,role').eq('user_id',userId).limit(10);
 const ids=(memberships||[]).map(m=>m.business_id);
 const {data:businesses}=ids.length?await supabase.from('business_plans').select('*').in('id',ids):{data:[]};
 const admin=createAdminSupabaseClient();const {data:settings}=await admin.from('revenue_settings').select('business_enabled,business_monthly_price_rwf').eq('id',1).single();
 return NextResponse.json({businesses:businesses||[],memberships:memberships||[],settings:settings||null});
}

export async function POST(req:Request){
 const parsed=createSchema.safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:'Invalid business details',details:parsed.error.flatten()},{status:400});
 const supabase=await createServerSupabaseClient();
 const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;
 if(!userId)return NextResponse.json({error:'Sign in required'},{status:401});
 const {data:profile}=await supabase.from('profiles').select('kyc_status,full_name').eq('id',userId).single();
 if(profile?.kyc_status!=='verified')return NextResponse.json({error:'Complete identity verification before creating a business workspace.',code:'KYC_REQUIRED'},{status:403});
 const {data:existing}=await supabase.from('business_plans').select('id,status,business_name').eq('owner_user_id',userId).neq('status','cancelled').maybeSingle();
 if(existing)return NextResponse.json({error:'You already have an UMUNOTA Business workspace.',business:existing},{status:409});
 const admin=createAdminSupabaseClient();
 const {data:settings}=await admin.from('revenue_settings').select('business_enabled,business_monthly_price_rwf').eq('id',1).single();
 if(!settings?.business_enabled)return NextResponse.json({error:'UMUNOTA Business onboarding is currently paused.'},{status:503});
 const input=parsed.data;
 const {data:business,error}=await admin.from('business_plans').insert({owner_user_id:userId,business_name:input.businessName,industry:input.industry||null,location_text:input.location||null,contact_name:input.contactName||profile.full_name||null,contact_email:input.contactEmail||null,contact_phone:input.contactPhone||null,monthly_price_rwf:settings.business_monthly_price_rwf,status:'lead'}).select('*').single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 await admin.from('business_members').insert({business_id:business.id,user_id:userId,role:'owner'});
 return NextResponse.json({ok:true,business},{status:201});
}
