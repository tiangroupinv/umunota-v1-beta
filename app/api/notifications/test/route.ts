import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';
import {notifyUser} from '@/lib/notifications';

export async function POST(){
 const supabase=await createServerSupabaseClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Sign in required.'},{status:401});
 await notifyUser(user.id,{type:'push_test',title:'UMUNOTA notifications are ready',body:'You will receive important task updates on this device.',href:'/settings',category:'general'});
 return NextResponse.json({ok:true});
}
