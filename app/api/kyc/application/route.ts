import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

const CONTRACT_VERSION='2026-09-10';
function value(body:Record<string,unknown>,key:string){return String(body[key]??'').trim()}
function yes(body:Record<string,unknown>,key:string){return body[key]===true||body[key]==='true'||body[key]==='on'}

export async function POST(req:Request){
 try{
  const supabase=await createServerSupabaseClient();
  const {data:claims,error:claimsError}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(claimsError||!userId)return NextResponse.json({error:'Sign in required.'},{status:401});

  const body=await req.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body)return NextResponse.json({error:'Invalid verification submission.'},{status:400});
  const required=['full_name','username','phone','dob','nationality','district','identity_type','identity_number','marketplace_role','task_experience','work_expectations','safety_answer','id_front_path','id_back_path'];
  for(const key of required){if(!value(body,key))return NextResponse.json({error:`Complete the ${key.replaceAll('_',' ')} field.`},{status:400})}
  if(!yes(body,'revenue_acknowledged')||!yes(body,'payment_acknowledged')||!yes(body,'terms_accepted')||!yes(body,'privacy_accepted')||!yes(body,'safety_accepted'))return NextResponse.json({error:'Accept every required agreement before submitting.'},{status:400});

  const frontPath=value(body,'id_front_path');const backPath=value(body,'id_back_path');const prefix=`${userId}/`;
  if(!frontPath.startsWith(prefix)||!backPath.startsWith(prefix))return NextResponse.json({error:'Identity-document paths are invalid.'},{status:400});

  const [{error:frontCheck},{error:backCheck}]=await Promise.all([
   supabase.storage.from('kyc-documents').createSignedUrl(frontPath,60),
   supabase.storage.from('kyc-documents').createSignedUrl(backPath,60)
  ]);
  if(frontCheck||backCheck)return NextResponse.json({error:'One or both identity documents could not be verified. Upload them again.'},{status:400});

  const {data:profile,error:profileError}=await supabase.from('profiles').select('kyc_status').eq('id',userId).single();
  if(profileError||!profile)return NextResponse.json({error:'Profile not found. Sign out and sign in again.'},{status:404});
  if(profile.kyc_status==='verified')return NextResponse.json({error:'This account is already verified.',verified:true},{status:409});
  if(profile.kyc_status==='pending')return NextResponse.json({error:'Your verification application is already under review.',pending:true},{status:409});

  const row={user_id:userId,full_legal_name:value(body,'full_name'),username:value(body,'username')||null,phone:value(body,'phone'),date_of_birth:value(body,'dob'),nationality:value(body,'nationality'),district:value(body,'district'),address:value(body,'address')||null,identity_type:value(body,'identity_type'),identity_number:value(body,'identity_number'),id_front_path:frontPath,id_back_path:backPath,marketplace_role:value(body,'marketplace_role'),task_experience:value(body,'task_experience')||null,work_expectations:value(body,'work_expectations')||null,safety_answer:value(body,'safety_answer'),revenue_acknowledged:true,payment_acknowledged:true,terms_accepted:true,privacy_accepted:true,safety_accepted:true,contract_version:CONTRACT_VERSION,status:'pending',submitted_at:new Date().toISOString(),reviewed_at:null,reviewed_by:null,admin_notes:null};
  const {error:applicationError}=await supabase.from('kyc_applications').upsert(row,{onConflict:'user_id'});
  if(applicationError)return NextResponse.json({error:`Unable to save your verification application: ${applicationError.message}`},{status:400});

  const {data:status,error:statusError}=await supabase.rpc('request_manual_verification');
  if(statusError)return NextResponse.json({error:'Application was saved, but the review status could not be updated. Please contact support.'},{status:500});
  return NextResponse.json({ok:true,status:status||'pending'});
 }catch(error){
  console.error('KYC application route failed',error);
  return NextResponse.json({error:'Verification service is temporarily unavailable. Please try again.'},{status:500});
 }
}
