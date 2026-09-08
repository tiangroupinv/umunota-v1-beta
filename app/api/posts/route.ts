import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';

const mediaSchema=z.object({storagePath:z.string().min(3).max(500),mediaType:z.enum(['image','video']),mimeType:z.string().max(120).nullable().optional(),sizeBytes:z.number().int().nonnegative().max(20*1024*1024).nullable().optional()});
const schema=z.object({body:z.string().min(3).max(3000),taskId:z.string().uuid().nullable().optional(),rating:z.number().int().min(1).max(5).nullable().optional(),media:z.array(mediaSchema).max(4).optional().default([])});

export async function POST(req:Request){
 const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Invalid post',details:p.error.flatten()},{status:400});
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 if(p.data.taskId){const {data:task}=await supabase.from('tasks').select('id,customer_id,runner_id,status').eq('id',p.data.taskId).single();if(!task||![task.customer_id,task.runner_id].includes(user.id)||!['approved','paid'].includes(task.status))return NextResponse.json({error:'Only participants can publish an experience from an approved or paid task'},{status:403});}
 for(const m of p.data.media){if(!m.storagePath.startsWith(`${user.id}/`))return NextResponse.json({error:'Invalid media path'},{status:403});}
 const {data,error}=await supabase.from('posts').insert({author_id:user.id,task_id:p.data.taskId||null,body:p.data.body,rating:p.data.rating||null}).select('id,author_id,task_id,body,rating,helpful_count,created_at').single();
 if(error)return NextResponse.json({error:error.message},{status:400});
 if(p.data.media.length){const {error:me}=await supabase.from('post_media').insert(p.data.media.map(m=>({post_id:data.id,owner_id:user.id,media_type:m.mediaType,storage_path:m.storagePath,mime_type:m.mimeType||null,size_bytes:m.sizeBytes||null})));if(me){await supabase.from('posts').delete().eq('id',data.id);return NextResponse.json({error:'Unable to attach media to post.'},{status:400});}}
 return NextResponse.json({ok:true,post:data},{status:201});
}
