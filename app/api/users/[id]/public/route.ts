import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {createAdminSupabaseClient} from '@/lib/supabase-admin';

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const supabase=await createServerSupabaseClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 const admin=createAdminSupabaseClient();
 const [{data:profile},{data:tasks},{data:posts},{count:followers},{count:following}]=await Promise.all([
  admin.from('profiles').select('id,full_name,username,avatar_url,role,kyc_status,rating,rating_count,created_at,runner_mode_enabled').eq('id',id).maybeSingle(),
  admin.from('tasks').select('id,title,category,budget_rwf,status,created_at,customer_id,runner_id').or(`customer_id.eq.${id},runner_id.eq.${id}`).in('status',['approved','paid']).order('created_at',{ascending:false}).limit(12),
  admin.from('posts').select('id,body,rating,created_at,task_id').eq('author_id',id).order('created_at',{ascending:false}).limit(12),
  admin.from('profile_follows').select('*',{count:'exact',head:true}).eq('following_id',id),
  admin.from('profile_follows').select('*',{count:'exact',head:true}).eq('follower_id',id)
 ]);
 if(!profile)return NextResponse.json({error:'User not found'},{status:404});
 return NextResponse.json({profile,completedTasks:tasks||[],posts:posts||[],followers:followers||0,following:following||0});
}
