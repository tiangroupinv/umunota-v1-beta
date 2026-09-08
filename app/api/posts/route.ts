import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createServerSupabaseClient} from '@/lib/supabase-server';
const schema=z.object({body:z.string().min(3).max(3000),taskId:z.string().uuid().nullable().optional(),rating:z.number().int().min(1).max(5).nullable().optional()});
export async function POST(req:Request){
 const p=schema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Invalid post'},{status:400});
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required'},{status:401});
 if(p.data.taskId){const {data:task}=await supabase.from('tasks').select('id,customer_id,runner_id,status').eq('id',p.data.taskId).single();if(!task||![task.customer_id,task.runner_id].includes(user.id)||!['approved','paid'].includes(task.status))return NextResponse.json({error:'Only participants can publish an experience from an approved or paid task'},{status:403});}
 const {data,error}=await supabase.from('posts').insert({author_id:user.id,task_id:p.data.taskId||null,body:p.data.body,rating:p.data.rating||null}).select('id,author_id,task_id,body,rating,helpful_count,created_at').single();
 if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json({ok:true,post:data},{status:201});
}
