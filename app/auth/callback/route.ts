import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

const allowedLanguages=new Set(['en','rw','fr','sw']);

export async function GET(request:Request){
  const url=new URL(request.url);
  const code=url.searchParams.get('code');
  const requestedNext=url.searchParams.get('next')||'/dashboard';
  const next=requestedNext.startsWith('/')&&!requestedNext.startsWith('//')?requestedNext:'/dashboard';
  const legalVersion=url.searchParams.get('legal');
  const requestedLanguage=url.searchParams.get('language')||'en';
  const language=allowedLanguages.has(requestedLanguage)?requestedLanguage:'en';
  if(code){
    const supabase=await createServerSupabaseClient();
    const {error}=await supabase.auth.exchangeCodeForSession(code);
    if(!error){
      const {data:{user}}=await supabase.auth.getUser();
      if(user&&legalVersion){
        await supabase.auth.updateUser({data:{...user.user_metadata,legal_acceptance_version:legalVersion,language}});
        await supabase.from('legal_acceptances').upsert({
          user_id:user.id,
          terms_version:legalVersion,
          privacy_version:legalVersion,
          safety_version:legalVersion,
          language,
          user_agent:request.headers.get('user-agent')?.slice(0,500)||null,
        },{onConflict:'user_id,terms_version,privacy_version,safety_version'});
        await supabase.from('user_preferences').upsert({user_id:user.id,preferred_language:language,updated_at:new Date().toISOString()},{onConflict:'user_id'});
      }
      return NextResponse.redirect(new URL(next,url.origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=oauth',url.origin));
}
