import * as webpush from 'web-push';
import {createAdminSupabaseClient} from './supabase-admin';

type Category='task'|'community'|'general';
export async function notifyUser(userId:string,{type='general',title,body,href,category='general'}:{type?:string;title:string;body:string;href?:string;category?:Category}){
 const admin=createAdminSupabaseClient();
 const {data:pref}=await admin.from('user_preferences').select('push_notifications_enabled,task_notifications_enabled,community_notifications_enabled').eq('user_id',userId).maybeSingle();
 const categoryEnabled=category==='task'?pref?.task_notifications_enabled!==false:category==='community'?pref?.community_notifications_enabled!==false:true;
 if(!categoryEnabled)return;
 await admin.from('notifications').insert({user_id:userId,type,title,body,href:href||null});
 if(!pref?.push_notifications_enabled)return;
 const publicKey=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,privateKey=process.env.VAPID_PRIVATE_KEY,subject=process.env.VAPID_SUBJECT;
 if(!publicKey||!privateKey||!subject)return;
 webpush.setVapidDetails(subject,publicKey,privateKey);
 const {data:subs}=await admin.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id',userId);
 const payload=JSON.stringify({title,body,href:href||'/dashboard',icon:'/umunota-icon.svg',badge:'/umunota-icon.svg'});
 await Promise.all((subs||[]).map(async sub=>{try{await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},payload)}catch(e:any){if(e?.statusCode===404||e?.statusCode===410)await admin.from('push_subscriptions').delete().eq('id',sub.id)}}));
}
