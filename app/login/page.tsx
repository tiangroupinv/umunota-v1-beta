'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {createClient} from '@/lib/supabase';
import {Chrome, Clock3, Github} from 'lucide-react';

export default function Login(){
  const router=useRouter();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);
  const [oauthBusy,setOauthBusy]=useState<'google'|'github'|null>(null);
  async function oauth(provider:'google'|'github'){setErr('');setOauthBusy(provider);try{const supabase=createClient();const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:`${location.origin}/auth/callback?next=/dashboard`}});if(error){setErr(error.message);setOauthBusy(null)}}catch(e){setErr(e instanceof Error?e.message:'Authentication is unavailable.');setOauthBusy(null)}}
  async function submit(e:React.FormEvent){e.preventDefault();setErr('');if(!email.includes('@')||password.length<8){setErr('Enter a valid email and a password with at least 8 characters.');return}setBusy(true);try{const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email,password});if(error){setErr(error.message);return}router.replace('/dashboard');router.refresh()}catch(e){setErr(e instanceof Error?e.message:'Unable to sign in.')}finally{setBusy(false)}}
  return <main className="authPage"><div className="authBrand officialAuthBrand"><img src="/umunota-logo-dark.svg" alt="UMUNOTA — Tasks. People. A Better Tomorrow."/></div><form className="authCard" onSubmit={submit}><span className="eyebrow">SECURE ACCESS</span><h1>Sign in to UMUNOTA</h1><p>Access your verified profile, tasks, payments and community.</p><div className="oauthGrid"><button disabled={Boolean(oauthBusy)} type="button" className="oauthBtn asyncBtn" onClick={()=>oauth('google')}>{oauthBusy==='google'?<><Clock3 size={18} className="spinIcon"/> Connecting...</>:<><Chrome size={18}/> Continue with Google</>}</button><button disabled={Boolean(oauthBusy)} type="button" className="oauthBtn asyncBtn" onClick={()=>oauth('github')}>{oauthBusy==='github'?<><Clock3 size={18} className="spinIcon"/> Connecting...</>:<><Github size={18}/> Continue with GitHub</>}</button></div><div className="authDivider"><span>or use email</span></div><div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required/></div><div className="field"><label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required/></div>{err&&<div className="errorBox">{err}</div>}<button disabled={busy||Boolean(oauthBusy)} className="btn btn-gold btn-wide asyncBtn" aria-busy={busy}>{busy?<><Clock3 size={18} className="spinIcon"/> Signing in...</>:<><Clock3 size={18}/> Sign in</>}</button><div className="authFoot"><span>New to UMUNOTA?</span><Link href="/signup">Create account</Link></div></form></main>;
}
