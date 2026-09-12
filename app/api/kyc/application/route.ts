import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

const MAX_FILE_SIZE=8*1024*1024;
const ALLOWED_TYPES=new Set(['image/jpeg','image/png','image/webp','application/pdf']);
const CONTRACT_VERSION='2026-09-10';

function text(form:FormData,key:string){return String(form.get(key)||'').trim()}
function yes(form:FormData,key:string){return form.get(key)==='on'||form.get(key)==='true'}
function safeName(name:string){return name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-120)}

export async function POST(req:Request){
  const supabase=await createServerSupabaseClient();
  const {data:claims,error:claimsError}=await supabase.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(claimsError||!userId)return NextResponse.json({error:'Sign in required.'},{status:401});

  const form=await req.formData().catch(()=>null);
  if(!form)return NextResponse.json({error:'Invalid verification form.'},{status:400});

  const required=['full_name','username','phone','dob','nationality','district','identity_type','identity_number','marketplace_role','task_experience','work_expectations','safety_answer'];
  for(const key of required){if(!text(form,key))return NextResponse.json({error:`Complete the ${key.replaceAll('_',' ')} field.`},{status:400})}
  if(!yes(form,'revenue_acknowledged')||!yes(form,'payment_acknowledged')||!yes(form,'terms_accepted')||!yes(form,'privacy_accepted')||!yes(form,'safety_accepted'))return NextResponse.json({error:'Accept every required agreement before submitting.'},{status:400});

  const front=form.get('id_front');const back=form.get('id_back');
  if(!(front instanceof File)||!(back instanceof File)||!front.size||!back.size)return NextResponse.json({error:'Upload both the front and back of your identity document.'},{status:400});
  for(const file of [front,back]){
    if(file.size>MAX_FILE_SIZE)return NextResponse.json({error:'Each identity document file must be 8 MB or smaller.'},{status:400});
    if(!ALLOWED_TYPES.has(file.type))return NextResponse.json({error:'Identity documents must be JPG, PNG, WebP or PDF.'},{status:400});
  }

  const admin=createAdminSupabaseClient();
  const {data:profile,error:profileError}=await admin.from('profiles').select('kyc_status').eq('id',userId).single();
  if(profileError||!profile)return NextResponse.json({error:'Profile not found. Sign out and sign in again.'},{status:404});
  if(profile.kyc_status==='verified')return NextResponse.json({error:'This account is already verified.',verified:true},{status:409});
  if(profile.kyc_status==='pending')return NextResponse.json({error:'Your verification application is already under review.',pending:true},{status:409});

  const stamp=Date.now();
  const frontPath=`${userId}/${stamp}-front-${safeName(front.name)}`;
  const backPath=`${userId}/${stamp}-back-${safeName(back.name)}`;
  const frontBytes=new Uint8Array(await front.arrayBuffer());
  const backBytes=new Uint8Array(await back.arrayBuffer());
  const frontUpload=await admin.storage.from('kyc-documents').upload(frontPath,frontBytes,{contentType:front.type,upsert:false});
  if(frontUpload.error)return NextResponse.json({error:'Unable to upload the front identity document. Please try again.'},{status:500});
  const backUpload=await admin.storage.from('kyc-documents').upload(backPath,backBytes,{contentType:back.type,upsert:false});
  if(backUpload.error){await admin.storage.from('kyc-documents').remove([frontPath]);return NextResponse.json({error:'Unable to upload the back identity document. Please try again.'},{status:500})}

  const row={
    user_id:userId,full_legal_name:text(form,'full_name'),username:text(form,'username')||null,phone:text(form,'phone'),date_of_birth:text(form,'dob'),nationality:text(form,'nationality'),district:text(form,'district'),address:text(form,'address')||null,identity_type:text(form,'identity_type'),identity_number:text(form,'identity_number'),id_front_path:frontPath,id_back_path:backPath,marketplace_role:text(form,'marketplace_role'),task_experience:text(form,'task_experience')||null,work_expectations:text(form,'work_expectations')||null,safety_answer:text(form,'safety_answer'),revenue_acknowledged:true,payment_acknowledged:true,terms_accepted:true,privacy_accepted:true,safety_accepted:true,contract_version:CONTRACT_VERSION,status:'pending',submitted_at:new Date().toISOString(),reviewed_at:null,reviewed_by:null,admin_notes:null
  };
  const {error:applicationError}=await admin.from('kyc_applications').upsert(row,{onConflict:'user_id'});
  if(applicationError){await admin.storage.from('kyc-documents').remove([frontPath,backPath]);return NextResponse.json({error:'Unable to save your verification application. Please try again.'},{status:500})}

  const {error:profileUpdateError}=await admin.from('profiles').update({kyc_status:'pending',kyc_provider:'manual',kyc_session_id:null,updated_at:new Date().toISOString()}).eq('id',userId);
  if(profileUpdateError)return NextResponse.json({error:'Application saved, but review status could not be updated. Contact support before resubmitting.'},{status:500});

  return NextResponse.json({ok:true,status:'pending'});
}
