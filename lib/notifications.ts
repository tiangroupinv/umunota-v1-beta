import * as webpush from 'web-push';
import {createAdminSupabaseClient} from './supabase-admin';

type Category='task'|'community'|'general';

function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]||c))}

async function sendOperationalEmail(admin:ReturnType<typeof createAdminSupabaseClient>,userId:string,{title,body,href}:{title:string;body:string;href?:string}){
 const apiKey=process.env.RESEND_API_KEY;const from=process.env.NOTIFICATION_FROM_EMAIL||process.env.NEWSLETTER_FROM_EMAIL;const appUrl=process.env.NEXT_PUBLIC_APP_URL||process.env.PUBLIC_APP_URL;
 if(!apiKey||!from||!appUrl)return;
 const {data}=await admin.auth.admin.getUserById(userId);const email=data.user?.email;if(!email)return;
 const destination=href?`${appUrl.replace(/\/$/,'')}${href.startsWith('/')?href:`/${href}`}`:appUrl;
 const html=`<!doctype html><html><body style="margin:0;background:#08090a;color:#f7f5ef;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08090a;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#111315;border:1px solid #2b2d31;border-radius:18px;padding:26px"><tr><td><img src="${escapeHtml(appUrl.replace(/\/$/,'')+'/umunota-logo-official.png')}" alt="UMUNOTA" style="display:block;max-width:220px;width:100%;height:auto;margin-bottom:24px"><div style="font-size:11px;letter-spacing:.16em;color:#d9aa32;font-weight:700;margin-bottom:8px">UMUNOTA ACTIVITY</div><h1 style="font-size:26px;line-height:1.2;margin:0 0 12px;color:#ffffff">${escapeHtml(title)}</h1><p style="font-size:15px;line-height:1.65;color:#c7c9cc;margin:0 0 22px">${escapeHtml(body)}</p><a href="${escapeHtml(destination)}" style="display:inline-block;background:#e4b247;color:#0a0a0a;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">Open in UMUNOTA</a><p style="font-size:11px;line-height:1.6;color:#777d84;margin:28px 0 0">UMUNOTA · Tasks. People. A Better Tomorrow.<br>A Tian Group Innovation Ltd project.</p></td></tr></table></td></tr></table></body></html>`;
 await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],subject:`UMUNOTA — ${title}`,html})}).catch(()=>undefined);
}

export async function notifyUser(userId:string,{type='general',title,body,href,category='general'}:{type?:string;title:string;body:string;href?:string;category?:Category}){
 const admin=createAdminSupabaseClient();
 const {data:pref}=await admin.from('user_preferences').select('push_notifications_enabled,task_notifications_enabled,community_notifications_enabled').eq('user_id',userId).maybeSingle();
 const categoryEnabled=category==='task'?pref?.task_notifications_enabled!==false:category==='community'?pref?.community_notifications_enabled!==false:true;
 await admin.from('notifications').insert({user_id:userId,type,title,body,href:href||null});
 if(!categoryEnabled)return;
 await sendOperationalEmail(admin,userId,{title,body,href}).catch(()=>undefined);
 if(!pref?.push_notifications_enabled)return;
 const publicKey=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,privateKey=process.env.VAPID_PRIVATE_KEY,subject=process.env.VAPID_SUBJECT;
 if(!publicKey||!privateKey||!subject)return;
 webpush.setVapidDetails(subject,publicKey,privateKey);
 const {data:subs}=await admin.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id',userId);
 const payload=JSON.stringify({title,body,href:href||'/dashboard',icon:'/umunota-icon.svg',badge:'/umunota-icon.svg'});
 await Promise.all((subs||[]).map(async sub=>{try{await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},payload)}catch(e:any){if(e?.statusCode===404||e?.statusCode===410)await admin.from('push_subscriptions').delete().eq('id',sub.id)}}));
}
