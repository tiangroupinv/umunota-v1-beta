import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const addSchema=z.object({businessId:z.string().uuid(),username:z.string().trim().min(2).max(80),role:z.enum(['manager','member']).default('member')});
const updateSchema=z.object({businessId:z.string().uuid(),membershipId:z.string().uuid(),role:z.enum(['manager','member'])});
const deleteSchema=z.object({businessId:z.string().uuid(),membershipId:z.string().uuid()});

async function context(businessId:string){
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:NextResponse.json({error:'Sign in required'},{status:401})};
 const {data:membership}=await supabase.from('business_members').select('id,role').eq('business_id',businessId).eq('user_id',user.id).maybeSingle();
 if(!membership)return {error:NextResponse.json({error:'Business workspace access denied.'},{status:403})};
 return {user,membership,supabase};
}

export async function GET(req:Request){
 try{const businessId=new URL(req.url).searchParams.get('businessId')||'';if(!businessId)return NextResponse.json({error:'Business id required'},{status:400});const c=await context(businessId);if(c.error)return c.error;const admin=createAdminSupabaseClient();const {data:members,error}=await admin.from('business_members').select('id,business_id,user_id,role,created_at').eq('business_id',businessId).order('created_at',{ascending:true});if(error)return NextResponse.json({error:'Unable to load team members.'},{status:400});const ids=(members||[]).map(m=>m.user_id);const {data:profiles}=ids.length?await admin.from('profiles').select('id,full_name,username,avatar_url,kyc_status').in('id',ids):{data:[]};return NextResponse.json({members:members||[],profiles:profiles||[],viewerRole:c.membership!.role});
 }catch(error){console.error('Business member list failed',error);return NextResponse.json({error:'Unable to load team members.'},{status:500})}}

export async function POST(req:Request){
 try{const parsed=addSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid member request'},{status:400});const c=await context(parsed.data.businessId);if(c.error)return c.error;
  if(!['owner','manager'].includes(c.membership!.role))return NextResponse.json({error:'Only owners and managers can add team members.'},{status:403});
  if(c.membership!.role==='manager'&&parsed.data.role==='manager')return NextResponse.json({error:'Only the owner can add another manager.'},{status:403});
  const admin=createAdminSupabaseClient();const {data:business}=await admin.from('business_plans').select('member_limit,status').eq('id',parsed.data.businessId).single();if(!business||business.status!=='active')return NextResponse.json({error:'Business workspace must be active.'},{status:403});
  const {count}=await admin.from('business_members').select('id',{head:true,count:'exact'}).eq('business_id',parsed.data.businessId);if((count||0)>=business.member_limit)return NextResponse.json({error:'This workspace has reached its seat limit.'},{status:409});
  const {data:profile}=await admin.from('profiles').select('id,full_name,username,kyc_status').ilike('username',parsed.data.username).maybeSingle();if(!profile)return NextResponse.json({error:'No UMUNOTA user was found with that username.'},{status:404});if(profile.kyc_status!=='verified')return NextResponse.json({error:'Only verified UMUNOTA users can join a business workspace.'},{status:409});
  const {data:existing}=await admin.from('business_members').select('id').eq('business_id',parsed.data.businessId).eq('user_id',profile.id).maybeSingle();if(existing)return NextResponse.json({error:'That user is already in this workspace.'},{status:409});
  const {data,error}=await admin.from('business_members').insert({business_id:parsed.data.businessId,user_id:profile.id,role:parsed.data.role}).select('*').single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,membership:data,profile});
 }catch(error){console.error('Business member add failed',error);return NextResponse.json({error:'Unable to add team member.'},{status:500})}}

export async function PATCH(req:Request){
 try{const parsed=updateSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid member update'},{status:400});const c=await context(parsed.data.businessId);if(c.error)return c.error;if(c.membership!.role!=='owner')return NextResponse.json({error:'Only the owner can change team roles.'},{status:403});
  const admin=createAdminSupabaseClient();const {data:target}=await admin.from('business_members').select('id,role').eq('id',parsed.data.membershipId).eq('business_id',parsed.data.businessId).single();if(!target)return NextResponse.json({error:'Team member not found.'},{status:404});if(target.role==='owner')return NextResponse.json({error:'The owner role cannot be changed here.'},{status:400});
  const {data,error}=await admin.from('business_members').update({role:parsed.data.role}).eq('id',target.id).select('*').single();if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,membership:data});
 }catch(error){console.error('Business member update failed',error);return NextResponse.json({error:'Unable to update team member.'},{status:500})}}

export async function DELETE(req:Request){
 try{const parsed=deleteSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Invalid member removal'},{status:400});const c=await context(parsed.data.businessId);if(c.error)return c.error;if(!['owner','manager'].includes(c.membership!.role))return NextResponse.json({error:'Only owners and managers can remove team members.'},{status:403});
  const admin=createAdminSupabaseClient();const {data:target}=await admin.from('business_members').select('id,role').eq('id',parsed.data.membershipId).eq('business_id',parsed.data.businessId).single();if(!target)return NextResponse.json({error:'Team member not found.'},{status:404});if(target.role==='owner')return NextResponse.json({error:'The workspace owner cannot be removed.'},{status:400});if(c.membership!.role==='manager'&&target.role==='manager')return NextResponse.json({error:'Managers cannot remove other managers.'},{status:403});
  const {error}=await admin.from('business_members').delete().eq('id',target.id);if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true});
 }catch(error){console.error('Business member removal failed',error);return NextResponse.json({error:'Unable to remove team member.'},{status:500})}}
