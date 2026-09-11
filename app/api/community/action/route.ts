import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {notifyUser} from '@/lib/notifications';

const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('like'),postId:z.string().uuid()}),z.object({action:z.literal('unlike'),postId:z.string().uuid()}),z.object({action:z.literal('comment'),postId:z.string().uuid(),body:z.string().trim().min(1).max(1000)}),z.object({action:z.literal('share'),postId:z.string().uuid(),channel:z.enum(['native_share','copy_link']).default('copy_link')}),z.object({action:z.literal('follow'),targetUserId:z.string().uuid()}),z.object({action:z.literal('unfollow'),targetUserId:z.string().uuid()})
]);

export async function POST(req:Request){
 const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:'Invalid community action'},{status:400});
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});const a=parsed.data;
 if(a.action==='follow'||a.action==='unfollow'){
  if(a.targetUserId===user.id)return NextResponse.json({error:'You cannot follow yourself'},{status:400});
  if(a.action==='follow'){const {error}=await supabase.from('profile_follows').upsert({follower_id:user.id,following_id:a.targetUserId},{onConflict:'follower_id,following_id'});if(error)return NextResponse.json({error:error.message},{status:400});await notifyUser(a.targetUserId,{type:'new_follower',title:'You have a new follower',body:'Someone followed your UMUNOTA profile.',href:'/profile',category:'community'}).catch(()=>undefined);}else{const {error}=await supabase.from('profile_follows').delete().eq('follower_id',user.id).eq('following_id',a.targetUserId);if(error)return NextResponse.json({error:error.message},{status:400});}
  return NextResponse.json({ok:true});
 }
 const {data:post,error:postError}=await supabase.from('posts').select('id,author_id,body').eq('id',a.postId).single();if(postError||!post)return NextResponse.json({error:'Post not found'},{status:404});const own=post.author_id===user.id;const href=`/community/${post.id}`;
 if(a.action==='like'){const {error}=await supabase.from('post_likes').upsert({post_id:post.id,user_id:user.id},{onConflict:'post_id,user_id'});if(error)return NextResponse.json({error:error.message},{status:400});if(!own)await notifyUser(post.author_id,{type:'post_liked',title:'Someone liked your post',body:'Your UMUNOTA community post received a like.',href,category:'community'}).catch(()=>undefined);}
 if(a.action==='unlike'){const {error}=await supabase.from('post_likes').delete().eq('post_id',post.id).eq('user_id',user.id);if(error)return NextResponse.json({error:error.message},{status:400});}
 if(a.action==='comment'){const {error}=await supabase.from('comments').insert({post_id:post.id,author_id:user.id,body:a.body});if(error)return NextResponse.json({error:error.message},{status:400});if(!own)await notifyUser(post.author_id,{type:'post_commented',title:'New comment on your post',body:a.body.length>120?a.body.slice(0,117)+'...':a.body,href,category:'community'}).catch(()=>undefined);}
 if(a.action==='share'){const {error}=await supabase.from('post_shares').insert({post_id:post.id,user_id:user.id,channel:a.channel});if(error)return NextResponse.json({error:error.message},{status:400});if(!own)await notifyUser(post.author_id,{type:'post_shared',title:'Your post was shared',body:'Someone shared your UMUNOTA community post.',href,category:'community'}).catch(()=>undefined);}
 return NextResponse.json({ok:true});
}
