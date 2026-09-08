import {NextResponse} from 'next/server';

const names:Record<string,string>={rw:'Kinyarwanda',fr:'French',sw:'Swahili'};
export async function POST(req:Request){
 try{
  const {language,texts}=await req.json();if(!names[language]||!Array.isArray(texts)||texts.length>60)return NextResponse.json({error:'Invalid translation request.'},{status:400});
  const clean=texts.map((x:unknown)=>String(x||'').slice(0,1200));if(!clean.length)return NextResponse.json({translations:[]});
  const key=process.env.OPENAI_API_KEY;if(!key)return NextResponse.json({translations:clean});
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.TRANSLATION_MODEL||'gpt-4o-mini',temperature:0,messages:[{role:'system',content:`Translate UMUNOTA marketplace interface text into natural ${names[language]}. Preserve UMUNOTA, Tian Group Innovation Ltd, RWF, KYC, Paypack, MTN, Airtel, Google, URLs, numbers, names and technical identifiers. Do not add explanations. Return only a JSON array of translated strings in exactly the same order and count.`},{role:'user',content:JSON.stringify(clean)}]})});
  if(!response.ok)return NextResponse.json({translations:clean});const data=await response.json();const raw=data.choices?.[0]?.message?.content||'[]';const parsed=JSON.parse(raw.replace(/^```json\s*|\s*```$/g,''));return NextResponse.json({translations:Array.isArray(parsed)&&parsed.length===clean.length?parsed:clean});
 }catch{return NextResponse.json({error:'Translation unavailable.'},{status:500})}
}
