import {redirect} from 'next/navigation';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export default async function TaskDetailLayout({children,params}:{children:React.ReactNode;params:Promise<{id:string}>}){
 const {id}=await params;
 const supabase=await createServerSupabaseClient();
 const {data:task}=await supabase.from('tasks').select('task_mode').eq('id',id).maybeSingle();
 if(task?.task_mode==='business_multi')redirect(`/business/tasks/${id}`);
 return children;
}
