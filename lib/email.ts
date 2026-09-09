import nodemailer from 'nodemailer';

type MailInput={to:string;subject:string;heading:string;body:string;actionLabel?:string;actionUrl?:string;preheader?:string};

const transporter=nodemailer.createTransport({
 host:process.env.SMTP_HOST,
 port:Number(process.env.SMTP_PORT||587),
 secure:process.env.SMTP_SECURE==='true',
 auth:process.env.SMTP_USER&&process.env.SMTP_PASS?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined,
 pool:true,
});

function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]!));}

export async function sendUmunotaEmail(input:MailInput){
 const from=process.env.EMAIL_FROM||process.env.SMTP_USER;
 if(!from||!process.env.SMTP_HOST) throw new Error('SMTP is not configured');
 const appUrl=(process.env.NEXT_PUBLIC_APP_URL||process.env.PUBLIC_APP_URL||'').replace(/\/$/,'');
 const logoUrl=`${appUrl}/umunota-logo-official.png`;
 const body=escapeHtml(input.body).replace(/\n/g,'<br/>');
 const action=input.actionLabel&&input.actionUrl?`<a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#d9a514;color:#090909;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:10px;margin-top:18px">${escapeHtml(input.actionLabel)}</a>`:'';
 const html=`<!doctype html><html><body style="margin:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#f5f5f5"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(input.preheader||input.heading)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:30px 14px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#111;border:1px solid #292929;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 30px 18px;border-bottom:1px solid #292929"><img src="${logoUrl}" alt="UMUNOTA" style="display:block;width:220px;max-width:72%;height:auto;object-fit:contain"/></td></tr><tr><td style="padding:34px 30px"><div style="font-size:12px;letter-spacing:1.6px;color:#d9a514;font-weight:800">UMUNOTA</div><h1 style="font-size:27px;line-height:1.2;margin:10px 0 16px;color:#fff">${escapeHtml(input.heading)}</h1><div style="font-size:16px;line-height:1.7;color:#c7c7c7">${body}</div>${action}</td></tr><tr><td style="padding:20px 30px;border-top:1px solid #292929;color:#777;font-size:12px;line-height:1.6">Tasks. People. A Better Tomorrow.<br/>A project of Tian Group Innovation Ltd.</td></tr></table></td></tr></table></body></html>`;
 return transporter.sendMail({from,to:input.to,subject:input.subject,text:`${input.heading}\n\n${input.body}${input.actionUrl?`\n\n${input.actionUrl}`:''}\n\nUMUNOTA — Tasks. People. A Better Tomorrow.`,html});
}

export async function verifyEmailTransport(){return transporter.verify();}
